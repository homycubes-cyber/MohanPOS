'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card/Card';
import { Input } from '@/components/ui/Input/Input';
import { StatsCard } from '@/components/ui/StatsCard';
import { FilterBar } from '@/components/ui/FilterBar';
import styles from './page.module.css';

export default function ChequesPage() {
    const [cheques, setCheques] = useState<any[]>([]);
    const [filteredCheques, setFilteredCheques] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        checkNo: '', bankName: '', amount: '', date: '', type: 'IN', partyName: ''
    });

    useEffect(() => {
        fetchCheques();
    }, []);

    useEffect(() => {
        let res = cheques;
        if (filterStatus !== 'ALL') {
            res = res.filter(c => c.status === filterStatus);
        }
        setFilteredCheques(res);
    }, [cheques, filterStatus]);

    const fetchCheques = async () => {
        const res = await fetch('/api/finance/cheques');
        if (res.ok) {
            const data = await res.json();
            setCheques(data);
            setFilteredCheques(data);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/finance/cheques', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                fetchCheques();
                setIsModalOpen(false);
                setFormData({ checkNo: '', bankName: '', amount: '', date: '', type: 'IN', partyName: '' });
            }
        } catch (error) { console.error(error); }
    };

    const updateStatus = async (id: string, status: string) => {
        if (!confirm(`Mark this cheque as ${status}?`)) return;
        await fetch('/api/finance/cheques', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        });
        fetchCheques();
    };

    // Calculate KPIs
    const pendingIn = cheques.filter(c => c.type === 'IN' && c.status === 'PENDING').reduce((s, c) => s + c.amount, 0);
    const pendingOut = cheques.filter(c => c.type === 'OUT' && c.status === 'PENDING').reduce((s, c) => s + c.amount, 0);

    return (
        <div className={styles.container}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 className={styles.title} style={{ marginBottom: '1rem' }}>Cheque Management</h1>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <StatsCard title="Pending Receivables" value={`₹ ${pendingIn.toFixed(2)}`} color="green" subtext="Money coming in" />
                    <StatsCard title="Pending Payables" value={`₹ ${pendingOut.toFixed(2)}`} color="orange" subtext="Money going out" />
                </div>

                <FilterBar
                    filters={[
                        {
                            label: 'Status',
                            value: filterStatus,
                            options: [
                                { label: 'All Cheques', value: 'ALL' },
                                { label: 'Pending', value: 'PENDING' },
                                { label: 'Cleared', value: 'CLEARED' },
                                { label: 'Bounced', value: 'BOUNCED' },
                            ],
                            onChange: setFilterStatus
                        }
                    ]}
                >
                    <Button onClick={() => setIsModalOpen(true)}>+ New Cheque</Button>
                </FilterBar>
            </div>

            <Card>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Cheque No</th>
                            <th>Bank</th>
                            <th>Party</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan={8}>Loading...</td></tr> : filteredCheques.map((c: any) => (
                            <tr key={c.id}>
                                <td>{new Date(c.date).toLocaleDateString()}</td>
                                <td>{c.checkNo}</td>
                                <td>{c.bankName}</td>
                                <td>{c.partyName || '-'}</td>
                                <td>
                                    <span style={{
                                        color: c.type === 'IN' ? '#16a34a' : '#dc2626',
                                        fontWeight: 600
                                    }}>
                                        {c.type === 'IN' ? 'RECEIVED' : 'ISSUED'}
                                    </span>
                                </td>
                                <td style={{ fontWeight: 600 }}>₹ {c.amount.toFixed(2)}</td>
                                <td>
                                    <span className={`${styles.status} ${styles[c.status.toLowerCase()]}`}>
                                        {c.status}
                                    </span>
                                </td>
                                <td>
                                    {c.status === 'PENDING' && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Button size="sm" variant="secondary" style={{ color: '#16a34a' }} onClick={() => updateStatus(c.id, 'CLEARED')}>Clear</Button>
                                            <Button size="sm" variant="danger" onClick={() => updateStatus(c.id, 'BOUNCED')}>Bounce</Button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <Card className={styles.modal}>
                        <h3>Record Cheque</h3>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.row}>
                                <label>Type</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
                                >
                                    <option value="IN">Received (Money In)</option>
                                    <option value="OUT">Issued (Money Out)</option>
                                </select>
                            </div>
                            <Input label="Cheque No" value={formData.checkNo} onChange={e => setFormData({ ...formData, checkNo: e.target.value })} required />
                            <Input label="Bank Name" value={formData.bankName} onChange={e => setFormData({ ...formData, bankName: e.target.value })} required />
                            <Input label="Party Name" value={formData.partyName} onChange={e => setFormData({ ...formData, partyName: e.target.value })} />
                            <Input label="Amount" type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required />
                            <Input label="Cheque Date" type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />

                            <div className={styles.actions}>
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Save</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
