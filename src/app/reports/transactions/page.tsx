'use client';

import React, { useState, useEffect } from 'react';
import styles from '../sales/page.module.css';
import { Button } from '@/components/ui/Button/Button';

export default function AllTransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        type: 'ALL' // ALL, SALE, PURCHASE, EXPENSE
    });

    useEffect(() => {
        fetchTransactions();
    }, [filters.startDate, filters.endDate, filters.type]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                start: filters.startDate,
                end: filters.endDate,
                type: filters.type
            });
            const res = await fetch(`/api/reports/transactions?${params}`);
            const data = await res.json();
            setTransactions(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const totalIn = transactions.filter(t => t.type === 'IN').reduce((sum, t) => sum + t.amount, 0);
    const totalOut = transactions.filter(t => t.type === 'OUT').reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className={styles.container}>
            <div className={styles.filters}>
                <div className={styles.filterGroup}>
                    <label>From:</label>
                    <input type="date" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} style={{ padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                <div className={styles.filterGroup}>
                    <label>To:</label>
                    <input type="date" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} style={{ padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                <div className={styles.filterGroup}>
                    <label>Type:</label>
                    <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })} style={{ padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px' }}>
                        <option value="ALL">All Transactions</option>
                        <option value="SALE">Sales</option>
                        <option value="PURCHASE">Purchases</option>
                        <option value="EXPENSE">Expenses</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div className={styles.summarySection} style={{ borderColor: '#bbf7d0', background: '#f0fdf4' }}>
                    <div className={styles.summaryLabel}>Total In</div>
                    <div className={styles.summaryValue} style={{ color: '#16a34a' }}>₹ {totalIn.toFixed(2)}</div>
                </div>
                <div className={styles.summarySection} style={{ borderColor: '#fecaca', background: '#fef2f2' }}>
                    <div className={styles.summaryLabel}>Total Out</div>
                    <div className={styles.summaryValue} style={{ color: '#dc2626' }}>₹ {totalOut.toFixed(2)}</div>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>All Transactions</div>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Name / Particulars</th>
                                <th>Ref No.</th>
                                <th>Payment Mode</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center' }}>Loading...</td></tr>
                            ) : transactions.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center' }}>No transactions found</td></tr>
                            ) : (
                                transactions.map(tx => (
                                    <tr key={tx.id}>
                                        <td>{new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${tx.category === 'SALE' ? styles.completed : tx.category === 'EXPENSE' ? styles.cancelled : styles.pending}`}>
                                                {tx.category}
                                            </span>
                                        </td>
                                        <td>{tx.name}</td>
                                        <td style={{ color: '#64748b' }}>{tx.refNo}</td>
                                        <td>{tx.mode}</td>
                                        <td style={{ fontWeight: 600, color: tx.type === 'IN' ? '#16a34a' : '#dc2626' }}>
                                            {tx.type === 'IN' ? '+' : '-'} ₹ {tx.amount.toFixed(2)}
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
