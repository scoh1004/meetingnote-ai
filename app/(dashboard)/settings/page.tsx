// app/(dashboard)/settings/page.tsx
'use client';

import MainLayout from '@/components/layout/MainLayout';
import { useState } from 'react';

type Provider = {
    id: number;
    code: string;
    name: string;
    type: 'stt' | 'llm' | 'both';
};

const dummyProviders: Provider[] = [
    { id: 1, code: 'openai', name: 'OpenAI', type: 'llm' },
    { id: 2, code: 'gemini', name: 'Google Gemini', type: 'llm' },
    { id: 3, code: 'deepgram', name: 'Deepgram', type: 'stt' },
    { id: 4, code: 'assemblyai', name: 'AssemblyAI', type: 'stt' },
];

export default function SettingsPage() {
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(dummyProviders[0]);
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);

    function handleSaveKey() {
        // TODO: Python 백엔드 /ai/keys POST 호출
        alert(`${selectedProvider?.name} API 키가 저장되었다고 가정합니다. (실제 로직 필요)`);
    }

    return (
        <MainLayout>
            <div className='max-w-5xl mx-auto'>
                <h1 className='text-lg font-semibold mb-4'>설정</h1>

                <div className='grid grid-cols-3 gap-4'>
                    {/* 왼쪽: AI 제공사 리스트 */}
                    <div className='col-span-1 bg-white rounded-xl shadow-sm p-4'>
                        <h2 className='text-sm font-medium mb-3'>AI 제공사 선택</h2>
                        <div className='space-y-2 text-sm'>
                            {dummyProviders.map((p) => {
                                const active = selectedProvider?.id === p.id;
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => setSelectedProvider(p)}
                                        className={`w-full text-left px-3 py-2 rounded-md border ${
                                            active
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className='font-medium'>{p.name}</div>
                                        <div className='text-[11px] text-gray-500'>
                                            {p.type === 'llm'
                                                ? '요약용 LLM'
                                                : p.type === 'stt'
                                                ? 'STT 엔진'
                                                : 'STT + LLM'}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 오른쪽: API 키 입력 폼 */}
                    <div className='col-span-2 bg-white rounded-xl shadow-sm p-4'>
                        <h2 className='text-sm font-medium mb-3'>
                            {selectedProvider?.name} API 키 설정
                        </h2>

                        <p className='text-xs text-gray-500 mb-4'>
                            해당 제공사에서 발급받은 개인 API 키를 입력해주세요. 키는 암호화되어
                            안전하게 저장됩니다.
                        </p>

                        <div className='space-y-3 text-sm'>
                            <div>
                                <label className='block text-xs font-medium text-gray-600 mb-1'>
                                    API 키
                                </label>
                                <div className='flex items-center gap-2'>
                                    <input
                                        type={showKey ? 'text' : 'password'}
                                        className='flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm'
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder='sk-...'
                                    />
                                    <button
                                        type='button'
                                        onClick={() => setShowKey((v) => !v)}
                                        className='text-xs border border-gray-300 rounded-md px-2 py-1 hover:bg-gray-50'
                                    >
                                        {showKey ? '숨기기' : '보기'}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleSaveKey}
                                className='px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700'
                            >
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
