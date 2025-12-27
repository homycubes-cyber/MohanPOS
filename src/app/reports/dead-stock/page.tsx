'use client';

import React, { useState, useEffect } from 'react';
import styles from '../sales/page.module.css';
import { Button } from '@/components/ui/Button/Button';

export default function DeadStockPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState('90'); // Default 3 months

    useEffect(() => {
        fetchReport();
    }, [days]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ days });
            const res = await fetch(`/api/reports/dead-stock?${params}`);
            const json = await res.json();
            if (Array.isArray(json)) {
                setData(json);
            } else {
                setData([]);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const totalBlockedValue = data.reduce((sum, item) => sum + (item.stock * item.costPrice), 0);

    return (
        <div className={styles.container}>
            <div className={styles.filters}>
                <div className={styles.filterGroup}>
                    <label>Inactivity Threshold (Days):</label>
                    <select
                        value={days}
                        onChange={e => setDays(e.target.value)}
                        style={{ padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px', minWidth: '150px' }}
                    >
                        <option value="30">30 Days</option>
                        <option value="60">60 Days</option>
                        <option value="90">90 Days (3 Months)</option>
                        <option value="180">180 Days (6 Months)</option>
                        <option value="365">1 Year</option>
                    </select>
                </div>
                <div className={styles.filterGroup}>
                    <Button variant="secondary" onClick={fetchReport}>Refresh</Button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div className={styles.summarySection} style={{ borderColor: '#fecaca', background: '#fef2f2' }}>
                    <div className={styles.summaryLabel}>Dead Stock Count</div>
                    <div className={styles.summaryValue} style={{ color: '#dc2626' }}>{data.length} Items</div>
                </div>
                <div className={styles.summarySection}>
                    <div className={styles.summaryLabel}>Blocked Capital (Cost)</div>
                    <div className={styles.summaryValue}>₹ {totalBlockedValue.toFixed(2)}</div>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader} style={{ background: '#475569', color: 'white' }}>
                    Clearance Candidates
                    <span style={{ fontSize: '0.8rem', fontWeight: 400, opacity: 0.9 }}>Suggest discounts for these items</span>
                </div>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>SKU</th>
                                <th>Category</th>
                                <th>Stock Qty</th>
                                <th>Last Sale</th>
                                <th>Days Inactive</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center' }}>Loading...</td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center' }}>Great job! No dead stock found.</td></tr>
                            ) : (
                                data.map(row => (
                                    <tr key={row.id}>
                                        <td style={{ fontWeight: 500 }}>{row.name}</td>
                                        <td style={{ color: '#64748b', fontSize: '0.9em' }}>{row.sku}</td>
                                        <td>{row.category}</td>
                                        <td style={{ fontWeight: 600 }}>{row.stock}</td>
                                        <td>{row.lastSaleDate ? new Date(row.lastSaleDate).toLocaleDateString() : 'Never'}</td>
                                        <td style={{ color: '#dc2626', fontWeight: 600 }}>{row.daysInactive} days</td>
                                        <td>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.8rem',
                                                background: row.status === 'Non-Moving' ? '#fee2e2' : '#ffedd5',
                                                color: row.status === 'Non-Moving' ? '#991b1b' : '#9a3412'
                                            }}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td>
                                            <Button size="sm" variant="outline" style={{ fontSize: '0.75rem' }}>Add Discount</Button>
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
