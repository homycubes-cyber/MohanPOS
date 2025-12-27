'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

// Define menu structure with potential submenus
const menuStructure = [
    { label: 'Dashboard', href: '/', icon: '📊', permission: 'DASHBOARD' },
    { label: 'POS Billing', href: '/pos', icon: '🛒', permission: 'POS' },
    { label: 'Products', href: '/products', icon: '📦', permission: 'INVENTORY' },
    { label: 'Customers', href: '/customers', icon: '👥', permission: 'POS' }, // Customers usually linked to POS
    {
        label: 'Purchase & Expense',
        icon: '📝',
        permission: 'PURCHASE',
        href: '#',
        submenu: [
            { label: 'Purchase Bills', href: '/purchase/bills' },
            { label: 'Purchase Order', href: '/purchase/orders' },
            { label: 'Expenses', href: '/purchase/expenses' },
            { label: 'Vendors', href: '/inventory/vendors' },
        ]
    },
    {
        label: 'Cash & Bank',
        icon: '🏦',
        permission: 'FINANCE',
        href: '#',
        submenu: [
            { label: 'Bank Accounts', href: '/finance/bank' },
            { label: 'Cash In Hand', href: '/finance/cash' },
            { label: 'Cheques', href: '/finance/cheques' },
            { label: 'Loan Accounts', href: '/finance/loans' },
        ]
    },

    { label: 'Reports', href: '/reports/profit', icon: '📈', permission: 'REPORTS' },
    { label: 'Settings', href: '/settings', icon: '⚙️', permission: 'SETTINGS' },
];

export const Sidebar = () => {
    const { data: session } = useSession();
    const pathname = usePathname();
    const userRole = (session?.user as any)?.role || 'CASHIER';
    const userPermissions = (session?.user as any)?.permissions || [];

    // State to toggle specific sections, default 'Purchase & Expense' to open for visibility
    const [openSections, setOpenSections] = React.useState<string[]>(['Purchase & Expense']);

    const toggleSection = (label: string) => {
        setOpenSections(prev =>
            prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
        );
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <span style={{ color: 'var(--primary)' }}>✦</span> Mohan POS
            </div>

            <nav className={styles.nav}>
                {menuStructure.map((item) => {
                    // Owner has full access. Others check permissions.
                    const allowed = userRole === 'OWNER' || userPermissions.includes(item.permission);

                    if (!allowed) return null;

                    const isActive = item.href === pathname;
                    const hasSubmenu = item.submenu && item.submenu.length > 0;
                    const isOpen = openSections.includes(item.label);

                    if (hasSubmenu) {
                        return (
                            <div key={item.label} className={styles.group}>
                                <div
                                    className={`${styles.link} ${isOpen ? styles.groupActive : ''}`}
                                    onClick={() => toggleSection(item.label)}
                                    style={{ justifyContent: 'space-between', cursor: 'pointer' }}
                                >
                                    <span style={{ display: 'flex', gap: '0.5rem' }}>{item.icon} {item.label}</span>
                                    <span>{isOpen ? '▲' : '▼'}</span>
                                </div>
                                {isOpen && (
                                    <div className={styles.submenu}>
                                        {item.submenu.map(sub => (
                                            <Link
                                                key={sub.href}
                                                href={sub.href}
                                                className={`${styles.subLink} ${pathname === sub.href ? styles.activeSub : ''}`}
                                            >
                                                {sub.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.link} ${isActive ? styles.active : ''}`}
                        >
                            <span style={{ marginRight: '0.5rem' }}>{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className={styles.footer}>
                <div className={styles.user}>{session?.user?.name || 'User'}</div>
                <div className={styles.role}>{userRole}</div>
            </div>
        </aside>
    );
};
