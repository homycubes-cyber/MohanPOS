'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import styles from './page.module.css';

export default function ProfitReportPage() {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const generateReport = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reports/profit?from=${from}&to=${to}`);
            const result = await res.json();
            setData(result);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Profit & Loss Statement</h1>

            <Card className={styles.controls}>
                <div className={styles.dates}>
                    <Input label="From Date" type="date" value={from} onChange={e => setFrom(e.target.value)} />
                    <Input label="To Date" type="date" value={to} onChange={e => setTo(e.target.value)} />
                </div>
                <div className={styles.actions}>
                    <Button onClick={generateReport} disabled={loading}>Generate P&L</Button>
                </div>
            </Card>

            {data && (
                <div className={styles.reportGrid}>
                    <Card className={styles.summaryCard}>
                        <h3>Net Sales</h3>
                        <div className={styles.amount}>₹{data.revenue.toFixed(2)}</div>
                        <p className={styles.subtext}>{data.salesCount} Transactions</p>
                    </Card>

                    <Card className={styles.summaryCard}>
                        <h3>COGS (Cost of Goods)</h3>
                        <div className={styles.amount} style={{ color: '#ef4444' }}>- ₹{data.cogs.toFixed(2)}</div>
                    </Card>

                    <Card className={`${styles.summaryCard} ${styles.highlight}`}>
                        <h3>Gross Profit</h3>
                        <div className={styles.amount} style={{ color: '#22c55e' }}>₹{data.grossProfit.toFixed(2)}</div>
                    </Card>

                    <Card className={styles.summaryCard}>
                        <h3>Operating Expenses</h3>
                        <div className={styles.amount} style={{ color: '#ef4444' }}>- ₹{data.expenses.toFixed(2)}</div>
                        <p className={styles.subtext}>{data.expenseCount} Records</p>
                    </Card>

                    <Card className={`${styles.summaryCard} ${styles.highlightMajor}`}>
                        <h3>Net Profit</h3>
                        <div className={styles.amount} style={{ color: data.netProfit >= 0 ? '#22c55e' : '#ef4444' }}>
                            ₹{data.netProfit.toFixed(2)}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
