'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import styles from './page.module.css';

export default function PurchaseBillsPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/inventory/purchase-order');
                const data = await res.json();
                setOrders(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Purchase Bills</h1>
                <Link href="/inventory/purchase">
                    {/* Linking to the Create Page (I should move that page code here later, but for now linking to existing) */}
                    <Button>+ New Purchase Bill</Button>
                </Link>
            </div>

            <Card className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>PO Number</th>
                            <th>Vendor</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((po) => (
                            <tr key={po.id}>
                                <td>{new Date(po.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <div>{po.poNumber}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{po.vendorInvoiceNo || '-'}</div>
                                </td>
                                <td>{po.vendor?.name}</td>
                                <td>₹{po.totalAmount.toFixed(2)}</td>
                                <td>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        backgroundColor: po.status === 'RECEIVED' ? '#dcfce7' : '#fef9c3',
                                        color: po.status === 'RECEIVED' ? '#166534' : '#854d0e',
                                        fontSize: '0.8rem', fontWeight: 600
                                    }}>
                                        {po.status}
                                    </span>
                                </td>
                                <td>
                                    <Button size="sm" variant="outline">View</Button>
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && !loading && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                    No purchase bills found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
