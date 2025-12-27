'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card/Card';
import { Input } from '@/components/ui/Input/Input';
import { StatsCard } from '@/components/ui/StatsCard';
import { FilterBar } from '@/components/ui/FilterBar';
import styles from '../cheques/page.module.css';

export default function LoansPage() {
    const [loans, setLoans] = useState<any[]>([]);
    const [filteredLoans, setFilteredLoans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        partyName: '', principal: '', interestRate: '', startDate: '', type: 'TAKEN'
    });

    useEffect(() => {
        fetchLoans();
    }, []);

    useEffect(() => {
        let res = loans;
        if (filterType !== 'ALL') {
            res = res.filter(l => l.type === filterType);
        }
        setFilteredLoans(res);
    }, [loans, filterType]);

    const fetchLoans = async () => {
        const res = await fetch('/api/finance/loans');
        if (res.ok) {
            const data = await res.json();
            setLoans(data);
            setFilteredLoans(data);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/finance/loans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                fetchLoans();
                setIsModalOpen(false);
                setFormData({ partyName: '', principal: '', interestRate: '', startDate: '', type: 'TAKEN' });
            }
        } catch (error) { console.error(error); }
    };

    // Calculate KPIs
    const totalAssets = loans.filter(l => l.type === 'GIVEN').reduce((s, l) => s + l.principal, 0);
    const totalLiabilities = loans.filter(l => l.type === 'TAKEN').reduce((s, l) => s + l.principal, 0);


    return (
        <div className={styles.container}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 className={styles.title} style={{ marginBottom: '1rem' }}>Loan Accounts</h1>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <StatsCard title="Total Assets (Lent)" value={`₹ ${totalAssets.toFixed(2)}`} color="green" />
                    <StatsCard title="Total Liabilities (Borrowed)" value={`₹ ${totalLiabilities.toFixed(2)}`} color="red" />
                </div>

                <FilterBar
                    filters={[
                        {
                            label: 'Type',
                            value: filterType,
                            options: [
                                { label: 'All Accounts', value: 'ALL' },
                                { label: 'Assets (Given)', value: 'GIVEN' },
                                { label: 'Liabilities (Taken)', value: 'TAKEN' },
                            ],
                            onChange: setFilterType
                        }
                    ]}
                >
                    <Button onClick={() => setIsModalOpen(true)}>+ New Loan</Button>
                </FilterBar>
            </div>

            <Card>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Party Name</th>
                            <th>Type</th>
                            <th>Principal</th>
                            <th>Interest Rate</th>
                            <th>Start Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan={7}>Loading...</td></tr> : filteredLoans.map((l: any) => (
                            <tr key={l.id}>
                                <td style={{ fontWeight: 500 }}>{l.partyName}</td>
                                <td>
                                    <span style={{
                                        color: l.type === 'GIVEN' ? '#16a34a' : '#ea580c',
                                        fontWeight: 600,
                                        background: l.type === 'GIVEN' ? '#dcfce7' : '#ffedd5',
                                        padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem'
                                    }}>
                                        {l.type === 'GIVEN' ? 'ASSET (Given)' : 'LIABILITY (Taken)'}
                                    </span>
                                </td>
                                <td style={{ fontWeight: 600 }}>₹ {l.principal.toFixed(2)}</td>
                                <td>{l.interestRate}%</td>
                                <td>{new Date(l.startDate).toLocaleDateString()}</td>
                                <td>{l.status}</td>
                                <td>
                                    <Button size="sm" variant="outline">Details</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <Card className={styles.modal}>
                        <h3>New Loan Account</h3>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.row}>
                                <label>Loan Type</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
                                >
                                    <option value="TAKEN">Liability (I borrowed money)</option>
                                    <option value="GIVEN">Asset (I lent money)</option>
                                </select>
                            </div>
                            <Input label="Party Name (Lender/Borrower)" value={formData.partyName} onChange={e => setFormData({ ...formData, partyName: e.target.value })} required />
                            <Input label="Principal Amount" type="number" value={formData.principal} onChange={e => setFormData({ ...formData, principal: e.target.value })} required />
                            <Input label="Interest Rate (%)" type="number" value={formData.interestRate} onChange={e => setFormData({ ...formData, interestRate: e.target.value })} />
                            <Input label="Start Date" type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} required />

                            <div className={styles.actions}>
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Create Account</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
