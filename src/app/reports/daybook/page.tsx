'use client';

import React, { useState, useEffect } from 'react';
import styles from '../sales/page.module.css'; // Reuse styles
import { Button } from '@/components/ui/Button/Button';

export default function DayBookPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchDayBook();
    }, [date]);

    const fetchDayBook = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reports/daybook?date=${date}`);
            const data = await res.json();
            setTransactions(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const totalIn = transactions.reduce((sum, tx) => tx.type === 'IN' ? sum + tx.amount : sum, 0);
    const totalOut = transactions.reduce((sum, tx) => tx.type === 'OUT' ? sum + tx.amount : sum, 0);

    return (
        <div className={styles.container}>
            <div className={styles.filters}>
                <div className={styles.filterGroup}>
                    <label>Date:</label>
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        style={{ padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <div className={styles.summarySection} style={{ borderColor: '#bbf7d0', background: '#f0fdf4' }}>
                    <div className={styles.summaryLabel}>Total Money In</div>
                    <div className={styles.summaryValue} style={{ color: '#16a34a' }}>₹ {totalIn.toFixed(2)}</div>
                </div>
                <div className={styles.summarySection} style={{ borderColor: '#fecaca', background: '#fef2f2' }}>
                    <div className={styles.summaryLabel}>Total Money Out</div>
                    <div className={styles.summaryValue} style={{ color: '#dc2626' }}>₹ {totalOut.toFixed(2)}</div>
                </div>
                <div className={styles.summarySection}>
                    <div className={styles.summaryLabel}>Net Change</div>
                    <div className={styles.summaryValue}>₹ {(totalIn - totalOut).toFixed(2)}</div>
                </div>
            </div>

            <div className={styles.tableContainer} style={{ marginTop: '1rem' }}>
                <div className={styles.tableHeader}>Day Book Transactions</div>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Name / Particulars</th>
                                <th>Ref No.</th>
                                <th>Type</th>
                                <th>Mode</th>
                                <th>Money In</th>
                                <th>Money Out</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center' }}>Loading...</td></tr>
                            ) : transactions.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center' }}>No transactions for this date</td></tr>
                            ) : (
                                transactions.map(tx => (
                                    <tr key={tx.id}>
                                        <td>{new Date(tx.date).toLocaleTimeString()}</td>
                                        <td>{tx.name}</td>
                                        <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{tx.refNo}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${tx.category === 'SALE' ? styles.completed : styles.pending}`}>
                                                {tx.category}
                                            </span>
                                        </td>
                                        <td>{tx.mode}</td>
                                        <td style={{ fontWeight: 600, color: '#16a34a' }}>
                                            {tx.type === 'IN' ? `₹ ${tx.amount.toFixed(2)}` : '-'}
                                        </td>
                                        <td style={{ fontWeight: 600, color: '#dc2626' }}>
                                            {tx.type === 'OUT' ? `₹ ${tx.amount.toFixed(2)}` : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
