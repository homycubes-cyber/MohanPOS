'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card/Card';
import styles from './page.module.css';

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        const res = await fetch('/api/expenses');
        if (res.ok) setExpenses(await res.json());
        setLoading(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Expenses</h1>
                <Button>+ Add Expense</Button>
            </div>

            <Card>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Mode</th>
                            <th>Amount</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan={6}>Loading...</td></tr> : expenses.map(e => (
                            <tr key={e.id}>
                                <td>{new Date(e.date).toLocaleDateString()}</td>
                                <td>{e.title}</td>
                                <td>{e.category}</td>
                                <td>{e.paymentMode}</td>
                                <td style={{ fontWeight: 600 }}>₹ {e.amount.toFixed(2)}</td>
                                <td>
                                    <a href={`/purchase/expenses/${e.id}`}>
                                        <Button size="sm" variant="outline">View</Button>
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
