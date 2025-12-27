'use client';

import React, { useState, useEffect } from 'react';
import styles from '../sales/page.module.css';
import { Button } from '@/components/ui/Button/Button';

export default function PnLPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: new Date().getFullYear() + '-01-01', // Start of year
        endDate: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        fetchPnL();
    }, [filters.startDate, filters.endDate]);

    const fetchPnL = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                start: filters.startDate,
                end: filters.endDate
            });
            const res = await fetch(`/api/reports/pnl?${params}`);
            const json = await res.json();
            setData(json);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    if (!data && !loading) return <div>Error loading data</div>;
    if (loading) return <div className={styles.container}>Loading P&L...</div>;

    const netProfit = data.totalRevenue - data.totalExpenses;
    const isProfit = netProfit >= 0;

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
                    <Button variant="secondary" onClick={fetchPnL}>Apply</Button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                <div style={{ flex: 1, background: 'white', padding: '2rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ color: '#64748b', marginBottom: '1rem' }}>Net Profit</h3>
                    <div style={{ fontSize: '3rem', fontWeight: 800, color: isProfit ? '#16a34a' : '#dc2626' }}>
                        {isProfit ? '+' : '-'} ₹ {Math.abs(netProfit).toFixed(2)}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Revenue Section */}
                <div className={styles.tableContainer}>
                    <div className={styles.tableHeader} style={{ background: '#f0fdf4', color: '#166534' }}>
                        Income Details
                        <span style={{ fontWeight: 700 }}>Total: ₹ {data.totalRevenue.toFixed(2)}</span>
                    </div>
                    <table className={styles.table}>
                        <tbody>
                            <tr>
                                <td>Sales Revenue</td>
                                <td style={{ fontWeight: 600, textAlign: 'right' }}>₹ {data.salesRevenue.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>Other Income</td>
                                <td style={{ fontWeight: 600, textAlign: 'right' }}>₹ 0.00</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Expense Section */}
                <div className={styles.tableContainer}>
                    <div className={styles.tableHeader} style={{ background: '#fef2f2', color: '#991b1b' }}>
                        Expense Details
                        <span style={{ fontWeight: 700 }}>Total: ₹ {data.totalExpenses.toFixed(2)}</span>
                    </div>
                    <table className={styles.table}>
                        <tbody>
                            <tr>
                                <td>Cost of Goods Sold (Purchase)</td>
                                <td style={{ fontWeight: 600, textAlign: 'right' }}>₹ {data.purchaseCost.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>Direct Expenses</td>
                                <td style={{ fontWeight: 600, textAlign: 'right' }}>₹ {data.directExpenses.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
