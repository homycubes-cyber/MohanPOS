'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card/Card';
import styles from './page.module.css';

export default function SettingsPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Settings</h1>

            <Link href="/settings/store" style={{ textDecoration: 'none' }}>
                <Card className={styles.section} style={{ height: '100%', cursor: 'pointer' }}>
                    <h2 style={{ color: '#1e293b' }}>Store Profile</h2>
                    <p className={styles.desc}>Manage store name, address, and contact details.</p>
                </Card>
            </Link>

            <Link href="/settings/users" style={{ textDecoration: 'none' }}>
                <Card className={styles.section} style={{ height: '100%', cursor: 'pointer' }}>
                    <h2 style={{ color: '#1e293b' }}>User Management</h2>
                    <p className={styles.desc}>Add or remove users (Cashiers, Managers).</p>
                </Card>
            </Link>

            <Link href="/settings/backup" style={{ textDecoration: 'none' }}>
                <Card className={styles.section} style={{ height: '100%', cursor: 'pointer' }}>
                    <h2 style={{ color: '#1e293b' }}>Backup & Data</h2>
                    <p className={styles.desc}>Export data and manage backups.</p>
                </Card>
            </Link>

            <Link href="/settings/printer" style={{ textDecoration: 'none' }}>
                <Card className={styles.section} style={{ height: '100%', cursor: 'pointer' }}>
                    <h2 style={{ color: '#1e293b' }}>Printer Configuration</h2>
                    <p className={styles.desc}>Setup thermal printer settings.</p>
                </Card>
            </Link>
        </div>

    );
}
