// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('sc.oh@softment.co.kr');
    const [password, setPassword] = useState('1234');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // TODO: 여기서 Python 백엔드 /auth/login 호출하면 됨
            if (email && password) {
                // 예시: localStorage.setItem("token", "dummy");
                router.push('/realtime');
            } else {
                setError('이메일과 비밀번호를 입력해주세요.');
            }
        } catch (err) {
            console.error(err);
            setError('로그인에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50'>
            <div className='w-full max-w-md bg-white rounded-xl shadow-md p-8'>
                <h1 className='text-2xl font-bold text-gray-900 text-center mb-2'>
                    MeetingNote AI
                </h1>
                <p className='text-sm text-gray-500 text-center mb-6'>
                    회의 내용을 자동으로 기록하고 요약해주는 플랫폼
                </p>

                <form onSubmit={handleLogin} className='space-y-4'>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                            이메일
                        </label>
                        <input
                            type='email'
                            className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder='you@example.com'
                        />
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                            비밀번호
                        </label>
                        <input
                            type='password'
                            className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder='••••••••'
                        />
                    </div>

                    {error && <div className='text-sm text-red-500'>{error}</div>}

                    <button
                        type='submit'
                        disabled={loading}
                        className='w-full bg-blue-600 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300 transition'
                    >
                        {loading ? '로그인 중...' : '로그인'}
                    </button>
                </form>
            </div>
        </div>
    );
}
