'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import styles from '../../bills/[id]/page.module.css'; // Reusing detail styles

export default function ExpenseDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [expense, setExpense] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchExpense();
    }, [id]);

    const fetchExpense = async () => {
        try {
            const res = await fetch(`/api/expenses/${id}`);
            if (res.ok) {
                setExpense(await res.json());
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!expense) return <div>Expense not found</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <Button variant="outline" size="sm" onClick={() => router.back()}>← Back</Button>
                    <h1 className={styles.title}>{expense.title}</h1>
                    <span style={{ color: '#64748b' }}>Expense Details</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button variant="danger">Delete</Button>
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.card}>
                    <h3>Information</h3>
                    <div className={styles.row}>
                        <label>Date</label>
                        <span>{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                    <div className={styles.row}>
                        <label>Category</label>
                        <span>{expense.category}</span>
                    </div>
                    <div className={styles.row}>
                        <label>Amount</label>
                        <span style={{ color: '#dc2626', fontWeight: 'bold' }}>₹ {expense.amount.toFixed(2)}</span>
                    </div>
                    <div className={styles.row}>
                        <label>Payment Mode</label>
                        <span>{expense.paymentMode}</span>
                    </div>
                    {expense.bankAccount && (
                        <div className={styles.row}>
                            <label>Paid Via</label>
                            <span>{expense.bankAccount.name}</span>
                        </div>
                    )}
                </div>

                <div className={styles.card}>
                    <h3>Description</h3>
                    <p style={{ color: '#475569', lineHeight: '1.5' }}>{expense.description || 'No description provided.'}</p>
                </div>
            </div>
        </div>
    );
}
