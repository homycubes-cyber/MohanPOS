'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import styles from './page.module.css';

export default function BankAccountsPage() {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newAccount, setNewAccount] = useState({ name: '', accountNumber: '', branch: '', openingBalance: 0 });

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const res = await fetch('/api/finance/bank');
            const data = await res.json();
            setAccounts(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreate = async () => {
        try {
            await fetch('/api/finance/bank', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAccount)
            });
            setShowModal(false);
            fetchAccounts();
            setNewAccount({ name: '', accountNumber: '', branch: '', openingBalance: 0 });
        } catch (e) {
            alert('Failed to create account');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Bank Accounts</h1>
                <Button onClick={() => setShowModal(true)}>+ Add Bank Account</Button>
            </div>

            <div className={styles.grid}>
                {accounts.map(acc => (
                    <div key={acc.id} className={styles.card}>
                        <div className={styles.bankName}>🏦 {acc.name}</div>
                        <div className={styles.accountNumber}>{acc.accountNumber}</div>

                        <div>
                            <div className={styles.balanceLabel}>Current Balance</div>
                            <div className={styles.balance}>₹{acc.currentBalance.toFixed(2)}</div>
                        </div>

                        <div className={styles.actions}>
                            <Button size="sm" variant="outline">Statement</Button>
                            <Button size="sm" variant="secondary">Edit</Button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Add Bank Account</h2>
                        <div className={styles.formGroup}>
                            <label>Bank Name</label>
                            <Input value={newAccount.name} onChange={e => setNewAccount({ ...newAccount, name: e.target.value })} placeholder="e.g. HDFC Bank" />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Account Number</label>
                            <Input value={newAccount.accountNumber} onChange={e => setNewAccount({ ...newAccount, accountNumber: e.target.value })} placeholder="XXXXXXXX" />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Branch</label>
                            <Input value={newAccount.branch} onChange={e => setNewAccount({ ...newAccount, branch: e.target.value })} placeholder="Main Branch" />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Opening Balance</label>
                            <Input type="number" value={newAccount.openingBalance} onChange={e => setNewAccount({ ...newAccount, openingBalance: parseFloat(e.target.value) })} />
                        </div>
                        <div className={styles.actions} style={{ justifyContent: 'flex-end' }}>
                            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button onClick={handleCreate}>Save Account</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
