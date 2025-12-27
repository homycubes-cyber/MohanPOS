'use client';

import React, { useState, useEffect } from 'react';
import styles from '../sales/page.module.css';
import { Button } from '@/components/ui/Button/Button';

export default function ItemReportPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [filters, setFilters] = useState({
        startDate: new Date().getFullYear() + '-01-01',
        endDate: new Date().toISOString().split('T')[0],
        productId: ''
    });

    useEffect(() => {
        // Fetch products for dropdown
        fetch('/api/products').then(res => res.json()).then(setProducts);
    }, []);

    useEffect(() => {
        if (filters.productId) {
            fetchReport();
        }
    }, [filters.startDate, filters.endDate, filters.productId]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                start: filters.startDate,
                end: filters.endDate,
                productId: filters.productId
            });
            const res = await fetch(`/api/reports/item?${params}`);
            const json = await res.json();
            setData(json);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const totalQty = data.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = data.reduce((sum, item) => sum + item.total, 0);

    return (
        <div className={styles.container}>
            <div className={styles.filters}>
                <div className={styles.filterGroup}>
                    <label>Product:</label>
                    <select
                        value={filters.productId}
                        onChange={e => setFilters({ ...filters, productId: e.target.value })}
                        style={{ padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px', minWidth: '200px' }}
                    >
                        <option value="">Select Item</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div className={styles.filterGroup}>
                    <label>From:</label>
                    <input type="date" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} style={{ padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                <div className={styles.filterGroup}>
                    <label>To:</label>
                    <input type="date" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} style={{ padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div className={styles.summarySection}>
                    <div className={styles.summaryLabel}>Total Sold Qty</div>
                    <div className={styles.summaryValue}>{totalQty}</div>
                </div>
                <div className={styles.summarySection}>
                    <div className={styles.summaryLabel}>Total Revenue</div>
                    <div className={styles.summaryValue}>₹ {totalAmount.toFixed(2)}</div>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>Sales History</div>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Invoice No</th>
                                <th>Party</th>
                                <th>Sold Qty</th>
                                <th>Sale Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center' }}>Loading...</td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center' }}>No sales found for this item</td></tr>
                            ) : (
                                data.map(row => (
                                    <tr key={row.id}>
                                        <td>{new Date(row.date).toLocaleDateString()}</td>
                                        <td>{row.invoiceNo}</td>
                                        <td>{row.partyName}</td>
                                        <td style={{ fontWeight: 600 }}>{row.quantity}</td>
                                        <td>₹ {row.price}</td>
                                        <td style={{ fontWeight: 600 }}>₹ {row.total.toFixed(2)}</td>
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
