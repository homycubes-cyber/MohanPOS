'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import styles from './page.module.css';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });

    useEffect(() => {
        fetchCustomers();
    }, [search]);

    const fetchCustomers = async () => {
        try {
            const res = await fetch(`/api/customers?search=${search}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setCustomers(data);
            } else {
                console.error('API Error:', data);
                setCustomers([]);
            }
        } catch (e) {
            console.error(e);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                setIsModalOpen(false);
                setForm({ name: '', phone: '', email: '', address: '' });
                fetchCustomers();
            } else {
                alert('Failed. Phone number might exist.');
            }
        } catch (e) { alert('Error creating customer'); }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Customers</h1>
                <Button onClick={() => setIsModalOpen(true)}>+ Add Customer</Button>
            </div>

            <Card className={styles.toolbar}>
                <Input
                    placeholder="Search by Name or Phone..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={styles.search}
                />
            </Card>

            <div className={styles.grid}>
                {customers.map(customer => (
                    <Card key={customer.id} className={styles.customerCard}>
                        <div className={styles.cardHeader}>
                            <div className={styles.name}>{customer.name}</div>
                            <div className={styles.badge}>{customer.phone}</div>
                        </div>
                        <div className={styles.details}>
                            <div>Balance: <span style={{ color: customer.creditBalance > 0 ? 'red' : 'green' }}>₹{customer.creditBalance?.toFixed(2) || '0.00'}</span></div>
                            {customer.email && <div>{customer.email}</div>}
                        </div>
                    </Card>
                ))}
                {customers.length === 0 && !loading && <div className={styles.empty}>No customers found.</div>}
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <Card className={styles.modal}>
                        <h2>New Customer</h2>
                        <form onSubmit={handleCreate} className={styles.form}>
                            <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                            <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                            <Input label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                            <Input label="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                            <div className={styles.actions}>
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="button" onClick={handleCreate}>Save</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
