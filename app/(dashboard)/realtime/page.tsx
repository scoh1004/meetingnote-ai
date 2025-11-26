// app/(dashboard)/realtime/page.tsx
'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useRealtimeStt } from '@/hooks/useRealtimeStt';

export default function RealtimePage() {
    const [meetingTitle, setMeetingTitle] = useState('새 회의');
    const [language, setLanguage] = useState('ko');
    const [sttProvider, setSttProvider] = useState('google');
    const [meetingId, setMeetingId] = useState<string | null>(null);

    const { connected, segments, error, wsUrl, sampleRate, start, stop } = useRealtimeStt({
        backendUrl: 'ws://localhost:8000', // FastAPI 주소
    });

    async function handleStart() {
        // TODO: 실제로는 Python 백엔드에 /meetings POST 해서 meetingId 받아오는게 좋음
        const newMeetingId = meetingId ?? 'dummy-' + Date.now();
        setMeetingId(newMeetingId);

        await start(newMeetingId, sttProvider, language);
    }

    function handleStop() {
        stop();
        // TODO: 회의 종료 & 요약 요청 API 호출
    }

    return (
        <MainLayout>
            <div className='flex gap-4 h-[calc(100vh-72px)]'>
                {/* 왼쪽 패널: 회의 정보 / 설정 */}
                <div className='w-72 bg-white rounded-xl shadow-sm p-4 flex flex-col'>
                    <h1 className='text-lg font-semibold mb-4'>실시간 회의</h1>

                    <div className='space-y-3 text-sm'>
                        <div>
                            <label className='block text-xs font-medium text-gray-600 mb-1'>
                                회의 제목
                            </label>
                            <input
                                className='w-full border border-gray-300 rounded-md px-2 py-1 text-sm'
                                value={meetingTitle}
                                onChange={(e) => setMeetingTitle(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className='block text-xs font-medium text-gray-600 mb-1'>
                                언어
                            </label>
                            <select
                                className='w-full border border-gray-300 rounded-md px-2 py-1 text-sm'
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                            >
                                <option value='ko'>한국어</option>
                                <option value='en'>영어</option>
                                <option value='ja'>일본어</option>
                            </select>
                        </div>

                        <div>
                            <label className='block text-xs font-medium text-gray-600 mb-1'>
                                STT 엔진
                            </label>
                            <select
                                className='w-full border border-gray-300 rounded-md px-2 py-1 text-sm'
                                value={sttProvider}
                                onChange={(e) => setSttProvider(e.target.value)}
                            >
                                <option value='google'>Google</option>
                                <option value='deepgram'>Deepgram</option>
                                <option value='speechmatics'>Speechmatics</option>
                                <option value='assemblyai'>AssemblyAI</option>
                                {/* <option value='openai'>OpenAI Realtime</option> */}
                            </select>
                        </div>
                    </div>

                    <div className='mt-6 space-y-2'>
                        <button
                            onClick={connected ? handleStop : handleStart}
                            className={`w-full py-2 rounded-md text-sm font-medium ${
                                connected
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {connected ? '회의 종료' : '회의 시작'}
                        </button>

                        <div className='text-xs text-gray-500'>
                            상태:{' '}
                            <span
                                className={
                                    connected ? 'text-green-600 font-semibold' : 'text-red-500'
                                }
                            >
                                {connected ? '실시간 전사 중' : '대기'}
                            </span>
                        </div>

                        {error && (
                            <div className='text-xs text-red-500 mt-1 whitespace-pre-line'>
                                {error}
                            </div>
                        )}

                        <div className='mt-2 text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-md p-2 space-y-1'>
                            <div>
                                WS URL:{' '}
                                <span className='break-all'>{wsUrl ?? '연결되지 않음'}</span>
                            </div>
                            <div>Audio sample rate: {sampleRate ? `${sampleRate} Hz` : '-'}</div>
                            <div>Segments received: {segments.length}</div>
                        </div>
                    </div>
                </div>

                {/* 오른쪽 패널: 실시간 텍스트 */}
                <div className='flex-1 bg-white rounded-xl shadow-sm p-4 flex flex-col'>
                    <div className='flex items-center justify-between mb-3'>
                        <h2 className='font-semibold text-base'>실시간 텍스트</h2>
                        <button
                            className='text-xs border border-gray-300 rounded-md px-2 py-1 hover:bg-gray-50'
                            onClick={() => {
                                const all = segments.map((s) => s.text).join('\n');
                                navigator.clipboard.writeText(all).catch(() => {});
                            }}
                        >
                            전체 복사
                        </button>
                    </div>

                    <div className='flex-1 border border-gray-200 rounded-md p-3 overflow-auto bg-gray-50 text-sm'>
                        {segments.length === 0 && (
                            <div className='text-gray-400 text-sm'>
                                회의를 시작하면 이곳에 실시간으로 텍스트가 표시됩니다.
                            </div>
                        )}
                        {segments.map((seg) => (
                            <div key={seg.id} className='mb-2'>
                                <div className='text-[11px] text-gray-500'>
                                    {seg.timestamp ?? ''}{' '}
                                    {seg.speakerLabel && (
                                        <span className='font-medium'>{seg.speakerLabel}</span>
                                    )}
                                </div>
                                <div
                                    className={
                                        seg.isFinal ? 'text-gray-900' : 'text-gray-500 italic'
                                    }
                                >
                                    {seg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className='mt-3 flex justify-end gap-2'>
                        <button className='text-xs border border-gray-300 rounded-md px-3 py-1 hover:bg-gray-50'>
                            요약 생성
                        </button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
