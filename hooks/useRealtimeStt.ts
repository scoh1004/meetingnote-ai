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
    provider?: string; // assemblyai, deepgram 등
    language?: string; // ko, en, ...
};

export function useRealtimeStt(options?: UseRealtimeSttOptions) {
    const backendUrl = options?.backendUrl ?? 'ws://localhost:8000';
    const provider = options?.provider ?? 'assemblyai';
    const language = options?.language ?? 'ko';

    const [connected, setConnected] = useState(false);
    const [segments, setSegments] = useState<TranscriptSegment[]>([]);
    const [error, setError] = useState<string | null>(null);

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

        try {
            // 1) WebSocket 연결
            const wsUrl = `${backendUrl}/ws/meetings/${meetingId}/realtime?provider=${finalProvider}&language=${finalLang}`;
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                setConnected(true);
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

            // 2) 마이크 권한 요청 + AudioContext 구성
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            });
            mediaStreamRef.current = stream;

            const audioContext = new AudioContext({
                sampleRate: 16000,
            });
            audioContextRef.current = audioContext;

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
                const pcmBuffer = floatTo16BitPCM(channelData);
                wsRef.current.send(pcmBuffer);
            };

            source.connect(scriptNode);
            scriptNode.connect(audioContext.destination);
        } catch (err: unknown) {
            console.error(err);

            const message =
                err instanceof Error ? err.message : '실시간 연결 중 오류가 발생했습니다.';

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
        start,
        stop,
    };
}
