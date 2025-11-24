// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'MeetingNote AI',
    description: '실시간 회의 기록 및 요약 플랫폼',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='ko'>
            <body className='bg-gray-50 text-gray-900'>{children}</body>
        </html>
    );
}
