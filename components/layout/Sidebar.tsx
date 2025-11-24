// components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
    { href: '/realtime', label: '실시간 회의' },
    { href: '/meetings', label: '회의 기록' },
    { href: '/settings', label: '설정' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className='w-60 bg-white border-r border-gray-200 flex flex-col'>
            <div className='px-4 py-4 border-b border-gray-200'>
                <div className='font-bold text-lg'>MeetingNote AI</div>
                <div className='text-xs text-gray-500 mt-1'>실시간 회의 기록 & 요약</div>
            </div>
            <nav className='flex-1 px-2 py-4 space-y-1'>
                {navItems.map((item) => {
                    const active = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`block px-3 py-2 rounded-md text-sm font-medium ${
                                active
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
