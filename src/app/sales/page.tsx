'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import styles from './page.module.css';

interface Invoice {
    id: string;
    invoiceNo: string;
    totalAmount: number;
    createdAt: string;
    items: any[];
    status: string;
}

export default function SalesHistoryPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const res = await fetch('/api/invoices');
            const data = await res.json();
            setInvoices(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Sales History</h1>
            <Card>
                {loading ? <div className={styles.loading}>Loading...</div> : (
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Invoice No</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map(inv => (
                                <tr key={inv.id}>
                                    <td>{new Date(inv.createdAt).toLocaleDateString()} {new Date(inv.createdAt).toLocaleTimeString()}</td>
                                    <td>{inv.invoiceNo}</td>
                                    <td>{inv.items.length} items</td>
                                    <td>₹{inv.totalAmount.toFixed(2)}</td>
                                    <td>{inv.status}</td>
                                    <td>
                                        <Button size="sm" variant="secondary">View</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Card>
        </div>
    )
}
