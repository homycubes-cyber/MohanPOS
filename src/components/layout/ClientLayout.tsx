'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const isFullScreen = pathname === '/pos/billing';

    if (isFullScreen) {
        return (
            <main style={{ height: '100vh', overflow: 'hidden', background: '#f8fafc' }}>
                {children}
            </main>
        );
    }

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Sidebar />
            <main style={{ flex: 1, overflowY: 'auto', background: '#f1f5f9' }}>
                {children}
            </main>
        </div>
    );
};
