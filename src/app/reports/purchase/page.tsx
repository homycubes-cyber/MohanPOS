'use client';

import React, { useState, useEffect } from 'react';
import styles from '../sales/page.module.css';
import { Button } from '@/components/ui/Button/Button';

export default function PurchaseReportPage() {
    const [purchases, setPurchases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
        setFilters(prev => ({ ...prev, startDate: firstDay }));
    }, []);

    useEffect(() => {
        fetchPurchases();
    }, [filters.startDate, filters.endDate]);

    const fetchPurchases = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                start: filters.startDate,
                end: filters.endDate
            });
            const res = await fetch(`/api/reports/purchase?${params}`);
            const data = await res.json();
            setPurchases(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

    return (
        <div className={styles.container}>
            <div className={styles.filters}>
                <div className={styles.filterGroup}>
                    <label>From:</label>
                    <input type="date" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} className={styles.dateInput} style={{ padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                <div className={styles.filterGroup}>
                    <label>To:</label>
                    <input type="date" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} className={styles.dateInput} style={{ padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
            </div>

            <div className={styles.summarySection} style={{ borderColor: '#e0e7ff', background: '#eef2ff' }}>
                <div className={styles.summaryLabel}>Total Purchase Amount</div>
                <div className={styles.summaryValue} style={{ color: '#4f46e5' }}>₹ {totalAmount.toFixed(2)}</div>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>Purchase Transactions</div>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>PO Number</th>
                                <th>Vendor Name</th>
                                <th>Vendor Inv No</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center' }}>Loading...</td></tr>
                            ) : purchases.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center' }}>No purchases found</td></tr>
                            ) : (
                                purchases.map(p => (
                                    <tr key={p.id}>
                                        <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                                        <td>{p.poNumber}</td>
                                        <td style={{ fontWeight: 500 }}>{p.vendor?.name}</td>
                                        <td>{p.vendorInvoiceNo || '-'}</td>
                                        <td style={{ fontWeight: 600 }}>₹ {p.totalAmount.toFixed(2)}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${p.status === 'RECEIVED' ? styles.completed : styles.pending}`}>
                                                {p.status}
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
