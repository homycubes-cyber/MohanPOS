'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';

interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'IN' | 'OUT';
    ref?: string;
}

export default function CashInHandPage() {
    const [stats, setStats] = useState({
        openingBalance: 0,
        cashIn: 0,
        cashOut: 0,
        currentBalance: 0
    });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/finance/cash-summary'); // We need to build this
            const data = await res.json();
            setStats(data.stats);
            setTransactions(data.transactions);
        } catch (e) {
            console.error(e);
            // Fallback mock data for dev
            setStats({
                openingBalance: 5000,
                cashIn: 12500,
                cashOut: 3200,
                currentBalance: 14300
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Cash In Hand</h1>
                <p style={{ color: '#64748b' }}>Track daily cash flow from sales and expenses.</p>
            </div>

            <div className={styles.summaryCards}>
                <div className={styles.card}>
                    <div className={styles.cardLabel}>Opening (Today)</div>
                    <div className={styles.cardValue}>₹{stats.openingBalance.toFixed(2)}</div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardLabel}>Cash In</div>
                    <div className={`${styles.cardValue} ${styles.valueGreen}`}>
                        +₹{stats.cashIn.toFixed(2)}
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardLabel}>Cash Out</div>
                    <div className={`${styles.cardValue} ${styles.valueRed}`}>
                        -₹{stats.cashOut.toFixed(2)}
                    </div>
                </div>
                <div className={styles.card} style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
                    <div className={styles.cardLabel}>Net Balance</div>
                    <div className={styles.cardValue} style={{ color: '#1e40af' }}>
                        ₹{stats.currentBalance.toFixed(2)}
                    </div>
                </div>
            </div>

            <div className={styles.transactions}>
                <div className={styles.tableHeader}>Recent Cash Transactions (Today)</div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Description</th>
                            <th>Reference</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length > 0 ? transactions.map(tx => (
                            <tr key={tx.id}>
                                <td>{new Date(tx.date).toLocaleTimeString()}</td>
                                <td>{tx.description}</td>
                                <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{tx.ref || '-'}</td>
                                <td className={tx.type === 'IN' ? styles.inflow : styles.outflow}>
                                    {tx.type === 'IN' ? '+' : '-'} ₹{Math.abs(tx.amount).toFixed(2)}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                    No cash transactions today.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
