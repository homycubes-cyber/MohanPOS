'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import styles from '../../purchase/bills/[id]/page.module.css'; // Reusing styles

export default function VendorDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [vendor, setVendor] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchVendor();
    }, [id]);

    const fetchVendor = async () => {
        try {
            const res = await fetch(`/api/inventory/vendors/${id}`);
            if (res.ok) {
                const data = await res.json();
                setVendor(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
    if (!vendor) return <div style={{ padding: '2rem' }}>Vendor not found</div>;

    const totalPurchased = vendor.purchases.reduce((sum: number, p: any) => sum + p.totalAmount, 0);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <Button variant="outline" size="sm" onClick={() => router.back()}>← Back</Button>
                    <h1 className={styles.title}>{vendor.name}</h1>
                    <span style={{ color: '#64748b' }}>Vendor Profile</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button>Edit Profile</Button>
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.card}>
                    <h3>Contact Information</h3>
                    <div className={styles.row}>
                        <label>Contact Person</label>
                        <span>{vendor.contact || '-'}</span>
                    </div>
                    <div className={styles.row}>
                        <label>Email</label>
                        <span>{vendor.email || '-'}</span>
                    </div>
                    <div className={styles.row}>
                        <label>GSTIN</label>
                        <span>{vendor.gstin || '-'}</span>
                    </div>
                    <div className={styles.row}>
                        <label>Address</label>
                        <span>{vendor.address || '-'}</span>
                    </div>
                </div>

                <div className={styles.card}>
                    <h3>Statistics</h3>
                    <div className={styles.row}>
                        <label>Total Orders</label>
                        <span>{vendor.purchases.length}</span>
                    </div>
                    <div className={styles.row}>
                        <label>Total Purchase Value</label>
                        <span style={{ color: '#16a34a', fontWeight: 'bold' }}>₹ {totalPurchased.toFixed(2)}</span>
                    </div>
                    <div className={styles.row}>
                        <label>Member Since</label>
                        <span>{new Date(vendor.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <div className={styles.itemsSection}>
                <h3>Purchase History</h3>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>PO Number</th>
                            <th>Vendor Ref</th>
                            <th>Status</th>
                            <th>Amount</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vendor.purchases.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center' }}>No purchases yet</td></tr>
                        ) : vendor.purchases.map((po: any) => (
                            <tr key={po.id}>
                                <td>{new Date(po.createdAt).toLocaleDateString()}</td>
                                <td>{po.poNumber}</td>
                                <td>{po.vendorInvoiceNo || '-'}</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${styles[po.status.toLowerCase()]}`}>{po.status}</span>
                                </td>
                                <td style={{ fontWeight: 600 }}>₹ {po.totalAmount.toFixed(2)}</td>
                                <td>
                                    <a href={`/purchase/bills/${po.id}`} style={{ textDecoration: 'none', color: 'blue' }}>View</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
