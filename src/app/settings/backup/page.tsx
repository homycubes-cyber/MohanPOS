'use client';

import React from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card/Card';
import styles from '../page.module.css';

export default function BackupPage() {
    const handleDownload = async () => {
        const res = await fetch('/api/settings/backup');
        const data = await res.json();

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Backup & Data</h1>
            <Card>
                <h3>Export Database</h3>
                <p style={{ color: '#64748b', margin: '0.5rem 0 1.5rem' }}>
                    Download a full JSON backup of your products, sales, customers, and expenses.
                    Keep this file safe.
                </p>
                <Button onClick={handleDownload}>Download Backup</Button>
            </Card>

            <Card style={{ marginTop: '2rem', opacity: 0.7 }}>
                <h3>Import Database</h3>
                <p style={{ color: '#64748b', margin: '0.5rem 0 1.5rem' }}>
                    Restore data from a previously exported JSON file.
                    (Feature currently disabled for safety).
                </p>
                <Button disabled variant="secondary">Select File to Restore</Button>
            </Card>
        </div>
    );
}
