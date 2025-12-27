'use client';

import React, { useState, useEffect } from 'react';
import styles from '../sales/page.module.css'; // Reuse common report styles
import { Button } from '@/components/ui/Button/Button';

export default function StockReportPage() {
    const [stockData, setStockData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });

    // Default to current month
    useEffect(() => {
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
        setFilters(prev => ({ ...prev, startDate: firstDay }));
    }, []);

    useEffect(() => {
        fetchStock();
    }, [filters.startDate, filters.endDate]);

    const fetchStock = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                start: filters.startDate,
                end: filters.endDate
            });
            const res = await fetch(`/api/reports/stock?${params}`);
            const data = await res.json();
            setStockData(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

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
                    <Button variant="secondary" onClick={fetchStock}>Apply</Button>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>
                    <span>Stock Detail</span>
                    <Button size="sm" variant="outline" onClick={() => window.print()}>Print</Button>
                </div>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Opening Qty</th>
                                <th>In Qty</th>
                                <th>Out Qty</th>
                                <th>Closing Qty</th>
                                <th>Unit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center' }}>Loading...</td></tr>
                            ) : stockData.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No stock data found</td></tr>
                            ) : (
                                stockData.map((item, idx) => (
                                    <tr key={idx}>
                                        <td style={{ fontWeight: 500 }}>{item.name}</td>
                                        <td style={{ color: '#64748b' }}>{item.opening}</td>
                                        <td style={{ color: '#16a34a', fontWeight: 600 }}>{item.in}</td>
                                        <td style={{ color: '#dc2626', fontWeight: 600 }}>{item.out}</td>
                                        <td style={{ fontWeight: 700 }}>{item.closing}</td>
                                        <td>PCS</td>
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
