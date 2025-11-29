// hooks/useRealtimeStt.ts
'use client';

import { useEffect, useRef, useState } from 'react';

type TranscriptSegment = {
    id: string;
    text: string;
    speakerLabel?: string;
    isFinal?: boolean;
    timestamp?: string;
};

type UseRealtimeSttOptions = {
    backendUrl?: string; // ws://localhost:8000 기본값
    provider?: string; // google, speechmatics, assemblyai, deepgram 등
    language?: string; // ko, en, ...
};

// 간단한 다운샘플러(모노) - ScriptProcessor 콜백에서 바로 사용
function downsampleTo16k(input: Float32Array, inputSampleRate: number) {
    const targetRate = 16000;
    if (inputSampleRate === targetRate) return input;
    if (inputSampleRate < targetRate) {
        // 업샘플링은 지원하지 않음
        return input;
    }

    const ratio = inputSampleRate / targetRate;
    const outputLength = Math.floor(input.length / ratio);
    const result = new Float32Array(outputLength);

    for (let i = 0; i < outputLength; i++) {
        const sourceIndex = Math.floor(i * ratio);
        result[i] = input[sourceIndex];
    }
    return result;
}

export function useRealtimeStt(options?: UseRealtimeSttOptions) {
    const backendUrl = options?.backendUrl ?? 'ws://localhost:8000';
    const provider = options?.provider ?? 'deepgram';
    const language = options?.language ?? 'ko';

    const [connected, setConnected] = useState(false);
    const [segments, setSegments] = useState<TranscriptSegment[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [wsUrl, setWsUrl] = useState<string | null>(null);
    const [actualSampleRate, setActualSampleRate] = useState<number | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);

    // Float32(-1~1)을 Int16 PCM으로 변환
    function floatTo16BitPCM(input: Float32Array): ArrayBuffer {
        const buffer = new ArrayBuffer(input.length * 2);
        const view = new DataView(buffer);
        let offset = 0;
        for (let i = 0; i < input.length; i++, offset += 2) {
            const s = Math.max(-1, Math.min(1, input[i]));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true); // little-endian
        }
        return buffer;
    }

    async function start(meetingId: string, providerCode?: string, lang?: string) {
        setError(null);
        setSegments([]);

        const finalProvider = providerCode ?? provider;
        const finalLang = lang ?? language;

        // 이전 자원 정리
        stop();

        try {
            // 1) WebSocket 연결
            const socketUrl = `${backendUrl}/ws/meetings/${meetingId}/realtime?provider=${finalProvider}&language=${finalLang}`;
            setWsUrl(socketUrl);
            const ws = new WebSocket(socketUrl);
            console.log('[realtime] connecting to', socketUrl);

            ws.onopen = () => {
                setConnected(true);
                console.log('[realtime] websocket open');
            };

            ws.onerror = (ev) => {
                console.error('WS error', ev);
                setError('WebSocket 연결 오류가 발생했습니다.');
                setConnected(false);
            };

            ws.onclose = () => {
                setConnected(false);
            };

            ws.onmessage = (event) => {
                console.debug('[realtime] received message', event.data);
                try {
                    const data = JSON.parse(event.data as string);
                    if (data.error) {
                        console.error('Server error:', data.error);
                        setError(data.error as string);
                        return;
                    }
                    if (!data.text) return;

                    setSegments((prev) => [
                        ...prev,
                        {
                            id: crypto.randomUUID(),
                            text: data.text as string,
                            isFinal: Boolean(data.is_final),
                            timestamp: data.timestamp as string | undefined,
                        },
                    ]);
                } catch (e) {
                    console.error('Invalid WS message', e);
                }
            };

            wsRef.current = ws;

            // 2) 마이크 오디오만 캡처 후 AudioContext 구성
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: false,
                    sampleRate: 48000, // 지원 시 48kHz로 캡처 후 16k로 다운샘플
                },
            });
            mediaStreamRef.current = stream;

            const audioContext = new AudioContext({
                sampleRate: 16000,
            });
            audioContextRef.current = audioContext;
            setActualSampleRate(audioContext.sampleRate);
            console.log('[realtime] AudioContext sampleRate', audioContext.sampleRate);

            const source = audioContext.createMediaStreamSource(stream);

            const bufferSize = 4096;
            const scriptNode = audioContext.createScriptProcessor(bufferSize, 1, 1);
            scriptNodeRef.current = scriptNode;

            scriptNode.onaudioprocess = (audioProcessingEvent) => {
                if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
                    return;
                }
                const inputBuffer = audioProcessingEvent.inputBuffer;
                const channelData = inputBuffer.getChannelData(0); // Float32Array
                const actualRate = inputBuffer.sampleRate || audioContext.sampleRate;
                const downsampled = downsampleTo16k(channelData, actualRate);
                const pcmBuffer = floatTo16BitPCM(downsampled);
                wsRef.current.send(pcmBuffer);
            };

            source.connect(scriptNode);
            scriptNode.connect(audioContext.destination);
        } catch (err: unknown) {
            console.error(err);

            const message =
                err instanceof Error ? err.message : '음성 연결 중 오류가 발생했습니다.';

            setError(message);
            stop(); // 실패 시 정리
        }
    }

    function stop() {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setConnected(false);

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((t) => t.stop());
            mediaStreamRef.current = null;
        }

        if (scriptNodeRef.current) {
            scriptNodeRef.current.disconnect();
            scriptNodeRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    }

    useEffect(() => {
        return () => {
            stop();
        };
    }, []);

    return {
        connected,
        segments,
        error,
        wsUrl,
        sampleRate: actualSampleRate,
        start,
        stop,
    };
}
