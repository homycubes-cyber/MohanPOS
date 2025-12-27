'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { Button } from '@/components/ui/Button/Button';

export default function SalesReportPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: new Date().toISOString().split('T')[0], // Default today? Or first of month
        endDate: new Date().toISOString().split('T')[0],
        search: ''
    });

    // Default to current month
    useEffect(() => {
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
        setFilters(prev => ({ ...prev, startDate: firstDay, endDate: lastDay }));
    }, []);

    useEffect(() => {
        fetchSales();
    }, [filters.startDate, filters.endDate]);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                start: filters.startDate,
                end: filters.endDate
            });
            const res = await fetch(`/api/reports/sales?${params}`);
            const data = await res.json();
            setInvoices(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalBalance = invoices.reduce((sum, inv) => sum + (inv.balance || 0), 0);

    return (
        <div className={styles.container}>
            <div className={styles.filters}>
                <div className={styles.filterGroup}>
                    <label>From:</label>
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                        style={{ padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                </div>
                <div className={styles.filterGroup}>
                    <label>To:</label>
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                        style={{ padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                </div>
                <div className={styles.filterGroup}>
                    <Button variant="secondary" onClick={fetchSales}>Apply</Button>
                </div>
            </div>

            <div className={styles.summarySection}>
                <div className={styles.summaryLabel}>Total Sales Amount</div>
                <div className={styles.summaryValue}>₹ {totalAmount.toFixed(2)}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                    Received: ₹ {(totalAmount - totalBalance).toFixed(2)} | Balance: ₹ {totalBalance.toFixed(2)}
                </div>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>
                    <span>Transactions</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button size="sm" variant="outline">Print</Button>
                        <Button size="sm" variant="outline">Excel</Button>
                    </div>
                </div>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Invoice No</th>
                                <th>Party Name</th>
                                <th>Payment Type</th>
                                <th>Amount</th>
                                <th>Balance</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center' }}>Loading...</td></tr>
                            ) : invoices.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>No transactions found</td></tr>
                            ) : (
                                invoices.map(inv => (
                                    <tr key={inv.id}>
                                        <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                                        <td>{inv.invoiceNo}</td>
                                        <td style={{ fontWeight: 500 }}>{inv.customer?.name || 'Cash Sale'}</td>
                                        <td>{inv.payments?.[0]?.mode || 'CASH'}</td>
                                        <td style={{ fontWeight: 600 }}>₹ {inv.totalAmount.toFixed(2)}</td>
                                        <td style={{ color: inv.balance > 0 ? '#ef4444' : '#64748b' }}>
                                            ₹ {(inv.balance || 0).toFixed(2)}
                                        </td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${styles[inv.status.toLowerCase()] || ''}`}>
                                                {inv.status}
                                            </span>
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
