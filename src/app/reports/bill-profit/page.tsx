'use client';

import React, { useState, useEffect } from 'react';
import styles from '../sales/page.module.css';
import { Button } from '@/components/ui/Button/Button';

export default function BillProfitPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: new Date().getFullYear() + '-01-01',
        endDate: new Date().toISOString().split('T')[0],
    });

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
            const res = await fetch(`/api/reports/bill-profit?${params}`);
            const json = await res.json();
            if (Array.isArray(json)) {
                setData(json);
            } else {
                setData([]);
                console.error("API Error", json);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const totalProfit = data.reduce((sum, item) => sum + item.profit, 0);
    const totalSales = data.reduce((sum, item) => sum + item.salesAmount, 0);

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

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div className={styles.summarySection}>
                    <div className={styles.summaryLabel}>Total Sales (Ex. Tax)</div>
                    <div className={styles.summaryValue}>₹ {totalSales.toFixed(2)}</div>
                </div>
                <div className={styles.summarySection} style={{ borderColor: '#bbf7d0', background: '#f0fdf4' }}>
                    <div className={styles.summaryLabel}>Total Profit</div>
                    <div className={styles.summaryValue} style={{ color: '#16a34a' }}>₹ {totalProfit.toFixed(2)}</div>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>Bill Wise Profit</div>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Invoice No</th>
                                <th>Customer</th>
                                <th>Sales Value</th>
                                <th>Cost Value</th>
                                <th>Profit</th>
                                <th>Margin %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center' }}>Loading...</td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center' }}>No data found</td></tr>
                            ) : (
                                data.map(row => (
                                    <tr key={row.id}>
                                        <td>{new Date(row.date).toLocaleDateString()}</td>
                                        <td>{row.invoiceNo}</td>
                                        <td>{row.customerName}</td>
                                        <td>₹ {row.salesAmount.toFixed(2)}</td>
                                        <td style={{ color: '#64748b' }}>₹ {row.costAmount.toFixed(2)}</td>
                                        <td style={{ fontWeight: 600, color: row.profit >= 0 ? '#16a34a' : '#dc2626' }}>
                                            ₹ {row.profit.toFixed(2)}
                                        </td>
                                        <td>{row.margin}%</td>
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
