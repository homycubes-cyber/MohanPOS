'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './reports.module.css';
import { Button } from '@/components/ui/Button/Button';

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const reportLinks = [
        { name: 'Sale', href: '/reports/sales' },
        { name: 'Purchase', href: '/reports/purchase' },
        { name: 'Day Book', href: '/reports/daybook' },
        { name: 'All Transactions', href: '/reports/transactions' },
        { name: 'Profit & Loss', href: '/reports/pnl' },
        { name: 'Bill Wise Profit', href: '/reports/bill-profit' },
        { name: 'Cash Flow', href: '/reports/cashflow' },
        { name: 'Stock Detail', href: '/reports/stock' },
        { name: 'Item Report', href: '/reports/item' },
        { name: 'Party Statement', href: '/reports/party' },
        { name: 'Dead Stock / Clearance', href: '/reports/dead-stock' },
        { name: 'GST Reports (GSTR-1)', href: '/reports/gst/gstr1' },
    ];

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>Transaction Reports</div>
                {reportLinks.map(link => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`${styles.navItem} ${pathname === link.href ? styles.active : ''}`}
                    >
                        {link.name}
                    </Link>
                ))}
            </aside>
            <main className={styles.content}>
                {children}
            </main>
        </div>
    );
}
