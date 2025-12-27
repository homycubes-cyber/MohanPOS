'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import styles from './page.module.css';

interface Vendor {
    id: string;
    name: string;
    contact: string;
    gstin: string;
}

export default function VendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', contact: '', email: '', address: '', gstin: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        const res = await fetch('/api/vendors');
        const data = await res.json();
        setVendors(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/vendors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                fetchVendors();
                setIsModalOpen(false);
                setFormData({ name: '', contact: '', email: '', address: '', gstin: '' });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const deleteVendor = async (id: string) => {
        if (!confirm('Delete this vendor?')) return;
        await fetch(`/api/vendors/${id}`, { method: 'DELETE' });
        fetchVendors();
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Vendors</h1>
                <Button onClick={() => setIsModalOpen(true)}>+ Add Vendor</Button>
            </div>

            <Card>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Contact</th>
                            <th>GSTIN</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vendors.map(vendor => (
                            <tr key={vendor.id}>
                                <td>{vendor.name}</td>
                                <td>{vendor.contact}</td>
                                <td>{vendor.gstin || '-'}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <a href={`/inventory/vendors/${vendor.id}`} style={{ textDecoration: 'none' }}>
                                            <Button size="sm" variant="outline">View</Button>
                                        </a>
                                        <Button variant="danger" size="sm" onClick={() => deleteVendor(vendor.id)}>Delete</Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <Card className={styles.modal}>
                        <h3>Add New Vendor</h3>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <Input label="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            <Input label="Contact No" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} />
                            <Input label="GSTIN" value={formData.gstin} onChange={e => setFormData({ ...formData, gstin: e.target.value })} />
                            <Input label="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />

                            <div className={styles.actions}>
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={loading}>Save Vendor</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
