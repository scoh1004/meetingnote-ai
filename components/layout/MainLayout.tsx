// components/layout/MainLayout.tsx
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className='min-h-screen flex'>
            <Sidebar />
            <div className='flex-1 flex flex-col'>
                <Topbar />
                <main className='flex-1 p-4 bg-gray-50 overflow-auto'>{children}</main>
            </div>
        </div>
    );
}
