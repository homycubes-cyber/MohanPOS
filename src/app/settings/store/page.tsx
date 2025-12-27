'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Card } from '@/components/ui/Card/Card';
import styles from '../page.module.css';

export default function StoreProfilePage() {
    const [formData, setFormData] = useState({
        storeName: '', address: '', city: '', pincode: '', phone: '', email: '', gstin: '', website: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/settings/store')
            .then(res => res.json())
            .then(data => {
                if (data.id) setFormData(data);
                setLoading(false);
            });
    }, []);

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/settings/store', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        alert('Store Profile Updated!');
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Store Profile</h1>
            <Card style={{ maxWidth: '600px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Input label="Store Name" name="storeName" value={formData.storeName} onChange={handleChange} required />
                    <Input label="Address" name="address" value={formData.address || ''} onChange={handleChange} />
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Input label="City" name="city" value={formData.city || ''} onChange={handleChange} />
                        <Input label="Pincode" name="pincode" value={formData.pincode || ''} onChange={handleChange} />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Input label="Phone" name="phone" value={formData.phone || ''} onChange={handleChange} />
                        <Input label="Email" name="email" value={formData.email || ''} onChange={handleChange} />
                    </div>
                    <Input label="GSTIN" name="gstin" value={formData.gstin || ''} onChange={handleChange} />
                    <Input label="Website" name="website" value={formData.website || ''} onChange={handleChange} />

                    <Button type="submit" style={{ marginTop: '1rem' }}>Save Profile</Button>
                </form>
            </Card>
        </div>
    );
}
