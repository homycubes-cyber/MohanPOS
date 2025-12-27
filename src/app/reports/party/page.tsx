'use client';

import React, { useState, useEffect } from 'react';
import styles from '../sales/page.module.css';
import { Button } from '@/components/ui/Button/Button';

export default function PartyReportPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [filters, setFilters] = useState({
        startDate: new Date().getFullYear() + '-01-01',
        endDate: new Date().toISOString().split('T')[0],
        partyId: ''
    });

    useEffect(() => {
        fetch('/api/customers')
            .then(res => res.json())
            .then(json => {
                if (Array.isArray(json)) {
                    setCustomers(json);
                } else {
                    console.error("Failed to load customers", json);
                    setCustomers([]);
                }
            })
            .catch(err => {
                console.error(err);
                setCustomers([]);
            });
    }, []);

    useEffect(() => {
        if (filters.partyId) fetchReport();
    }, [filters.startDate, filters.endDate, filters.partyId]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                start: filters.startDate,
                end: filters.endDate,
                partyId: filters.partyId
            });
            const res = await fetch(`/api/reports/party?${params}`);
            const json = await res.json();
            if (Array.isArray(json)) {
                setData(json);
            } else {
                setData([]);
                console.error("API Error", json);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const totalDebit = data.filter(r => r.type === 'DEBIT').reduce((s, r) => s + r.amount, 0);
    const totalCredit = data.filter(r => r.type === 'CREDIT').reduce((s, r) => s + r.amount, 0);
    const netBalance = totalDebit - totalCredit;

    return (
        <div className={styles.container}>
            <div className={styles.filters}>
                <div className={styles.filterGroup}>
                    <label>Party:</label>
                    <select
                        value={filters.partyId}
                        onChange={e => setFilters({ ...filters, partyId: e.target.value })}
                        style={{ padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px', minWidth: '200px' }}
                    >
                        <option value="">Select Vendor/Customer</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                <div className={styles.summarySection} style={{ borderColor: '#bbf7d0', background: '#f0fdf4' }}>
                    <div className={styles.summaryLabel}>Total Sales (Debit)</div>
                    <div className={styles.summaryValue} style={{ color: '#16a34a' }}>₹ {totalDebit.toFixed(2)}</div>
                </div>
                <div className={styles.summarySection} style={{ borderColor: '#fecaca', background: '#fef2f2' }}>
                    <div className={styles.summaryLabel}>Total Received (Credit)</div>
                    <div className={styles.summaryValue} style={{ color: '#dc2626' }}>₹ {totalCredit.toFixed(2)}</div>
                </div>
                <div className={styles.summarySection}>
                    <div className={styles.summaryLabel}>Net Receivable</div>
                    <div className={styles.summaryValue}>₹ {netBalance.toFixed(2)}</div>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>Statement</div>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Ref No</th>
                                <th>Type</th>
                                <th>Debit (+)</th>
                                <th>Credit (-)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center' }}>Loading...</td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center' }}>No transactions found</td></tr>
                            ) : (
                                data.map((row, idx) => (
                                    <tr key={idx}>
                                        <td>{new Date(row.date).toLocaleDateString()}</td>
                                        <td>{row.refNo}</td>
                                        <td>{row.description}</td>
                                        <td style={{ color: '#16a34a', fontWeight: 600 }}>{row.type === 'DEBIT' ? `₹ ${row.amount}` : '-'}</td>
                                        <td style={{ color: '#dc2626', fontWeight: 600 }}>{row.type === 'CREDIT' ? `₹ ${row.amount}` : '-'}</td>
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
