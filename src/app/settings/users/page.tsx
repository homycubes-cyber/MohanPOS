'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Card } from '@/components/ui/Card/Card';
import styles from '../page.module.css';

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ id: '', name: '', email: '', password: '', role: 'CASHIER', permissions: [] as string[] });

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        const res = await fetch('/api/settings/users');
        if (res.ok) setUsers(await res.json());
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = formData.id ? 'PUT' : 'POST';

        const res = await fetch('/api/settings/users', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            fetchUsers();
            setIsModalOpen(false);
            setFormData({ id: '', name: '', email: '', password: '', role: 'CASHIER', permissions: [] });
        } else {
            const err = await res.json();
            alert(`Failed to save user: ${err.error || 'Unknown error'}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this user?')) return;
        await fetch(`/api/settings/users?id=${id}`, { method: 'DELETE' });
        fetchUsers();
    };

    return (
        <div className={styles.container}>
            <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className={styles.title}>User Management</h1>
                <Button onClick={() => setIsModalOpen(true)}>+ Add User</Button>
            </div>

            <Card>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>Name</th>
                            <th style={{ padding: '1rem' }}>Email</th>
                            <th style={{ padding: '1rem' }}>Role</th>
                            <th style={{ padding: '1rem' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u: any) => (
                            <tr key={u.id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                                <td style={{ padding: '1rem' }}>{u.name}</td>
                                <td style={{ padding: '1rem' }}>{u.email}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        background: u.role === 'OWNER' ? '#purple' : '#blue',
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600
                                    }}>
                                        {u.role}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {u.role !== 'OWNER' && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    setFormData({
                                                        id: u.id,
                                                        name: u.name,
                                                        email: u.email,
                                                        password: '', // Don't prefill password
                                                        role: u.role,
                                                        permissions: u.permissions || []
                                                    });
                                                    setIsModalOpen(true);
                                                }}
                                            >
                                                Edit
                                            </Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDelete(u.id)}>Delete</Button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 9999,
                    backdropFilter: 'blur(4px)'
                }}>
                    <Card style={{
                        width: '400px',
                        padding: '2rem',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            style={{ position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}
                        >
                            &times;
                        </button>
                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', color: '#111827' }}>Add New User</h3>
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Input label="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                            <Input
                                label={formData.id ? "New Password (Leave blank to keep current)" : "Password"}
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                required={!formData.id}
                            />
                            <div>
                                <label style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block', fontWeight: 500, color: '#374151' }}>Role</label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem' }}
                                >
                                    <option value="CASHIER">Cashier</option>
                                    <option value="SALESMAN">Salesman</option>
                                    <option value="MANAGER">Manager</option>
                                    <option value="STORE_MANAGER">Store Manager</option>
                                    <option value="AUDITOR">Auditor</option>
                                    <option value="OWNER">Owner</option>
                                    <option value="STORE_MANAGER">Store Manager</option>
                                    <option value="AUDITOR">Auditor</option>
                                    <option value="OWNER">Owner</option>
                                </select>
                            </div>

                            {/* Permissions Section */}
                            {formData.role !== 'OWNER' && (
                                <div>
                                    <label style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block', fontWeight: 500, color: '#374151' }}>Access Permissions</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                        {['DASHBOARD', 'POS', 'INVENTORY', 'PURCHASE', 'FINANCE', 'REPORTS', 'SETTINGS'].map(p => (
                                            <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.permissions.includes(p)}
                                                    onChange={e => {
                                                        const newPerms = e.target.checked
                                                            ? [...formData.permissions, p]
                                                            : formData.permissions.filter(perm => perm !== p);
                                                        setFormData({ ...formData, permissions: newPerms });
                                                    }}
                                                />
                                                {p.charAt(0) + p.slice(1).toLowerCase()}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>Cancel</Button>
                                <Button type="submit" style={{ flex: 1 }}>{formData.id ? 'Update' : 'Create'} User</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
