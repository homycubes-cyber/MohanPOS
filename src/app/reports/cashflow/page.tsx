'use client';

import React, { useState, useEffect } from 'react';
import styles from '../../sales/page.module.css';
import { Button } from '@/components/ui/Button/Button';

export default function CashFlowPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        const date = new Date();
        // Default to last 30 days
        const start = new Date(date);
        start.setDate(date.getDate() - 30);
        setFilters(prev => ({ ...prev, startDate: start.toISOString().split('T')[0] }));
    }, []);

    useEffect(() => {
        fetchReport();
    }, [filters.startDate, filters.endDate]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                start: filters.startDate,
                end: filters.endDate
            });
            const res = await fetch(`/api/reports/cashflow?${params}`);
            const json = await res.json();
            setData(json);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

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
                    <Button variant="secondary" onClick={fetchReport}>Apply</Button>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>Cash Flow Statement</div>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Cash In</th>
                                <th>Cash Out</th>
                                <th>Net Cash</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} style={{ textAlign: 'center' }}>Loading...</td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan={4} style={{ textAlign: 'center' }}>No data found</td></tr>
                            ) : (
                                data.map((row, idx) => (
                                    <tr key={idx}>
                                        <td>{new Date(row.date).toLocaleDateString()}</td>
                                        <td style={{ color: '#16a34a' }}>₹ {row.in.toFixed(2)}</td>
                                        <td style={{ color: '#dc2626' }}>₹ {row.out.toFixed(2)}</td>
                                        <td style={{ fontWeight: 600 }}>₹ {(row.in - row.out).toFixed(2)}</td>
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
