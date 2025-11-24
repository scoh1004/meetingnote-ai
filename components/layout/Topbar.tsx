// components/layout/Topbar.tsx
'use client';

export function Topbar() {
    return (
        <header className='h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4'>
            <div className='font-medium text-sm text-gray-600'>
                회의/미팅을 실시간으로 기록하고 요약합니다.
            </div>
            <div className='flex items-center gap-3'>
                <span className='text-sm text-gray-700'>오승철 님</span>
                <button className='text-xs text-gray-500 hover:text-gray-700'>로그아웃</button>
            </div>
        </header>
    );
}
