'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import styles from './page.module.css';

export default function PurchaseBillDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [po, setPo] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchPO();
    }, [id]);

    const fetchPO = async () => {
        try {
            const res = await fetch(`/api/purchase/bills/${id}`);
            if (res.ok) {
                const data = await res.json();
                setPo(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
    if (!po) return <div style={{ padding: '2rem' }}>Purchase Order not found</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <Button variant="outline" size="sm" onClick={() => router.back()}>← Back</Button>
                    <h1 className={styles.title}>Purchase Order #{po.poNumber}</h1>
                    <span className={`${styles.statusBadge} ${styles[po.status.toLowerCase()]}`}>{po.status}</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button variant="secondary" onClick={() => window.print()}>Print</Button>
                    <Button>Edit</Button>
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.card}>
                    <h3>Vendor Details</h3>
                    <div className={styles.row}>
                        <label>Name</label>
                        <span>{po.vendor.name}</span>
                    </div>
                    <div className={styles.row}>
                        <label>Contact</label>
                        <span>{po.vendor.contact || '-'}</span>
                    </div>
                    <div className={styles.row}>
                        <label>Email</label>
                        <span>{po.vendor.email || '-'}</span>
                    </div>
                    <div className={styles.row}>
                        <label>GSTIN</label>
                        <span>{po.vendor.gstin || '-'}</span>
                    </div>
                    <div className={styles.row}>
                        <label>Address</label>
                        <span>{po.vendor.address || '-'}</span>
                    </div>
                </div>

                <div className={styles.card}>
                    <h3>Order Info</h3>
                    <div className={styles.row}>
                        <label>Date</label>
                        <span>{new Date(po.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className={styles.row}>
                        <label>Vendor Invoice No</label>
                        <span>{po.vendorInvoiceNo || '-'}</span>
                    </div>
                    {po.invoiceUrl && (
                        <div className={styles.row}>
                            <label>Attachment</label>
                            <a href={po.invoiceUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'blue' }}>View Bill</a>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.itemsSection}>
                <h3>Items</h3>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>SKU</th>
                            <th>Quantity</th>
                            <th>Cost Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {po.items.map((item: any) => (
                            <tr key={item.id}>
                                <td>{item.product.name}</td>
                                <td>{item.product.sku}</td>
                                <td>{item.quantity}</td>
                                <td>₹ {item.costPrice}</td>
                                <td>₹ {item.total}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={4} style={{ textAlign: 'right', fontWeight: 'bold' }}>Total</td>
                            <td style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>₹ {po.totalAmount.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
