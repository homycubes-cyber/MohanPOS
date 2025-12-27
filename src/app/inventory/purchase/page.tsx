'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import styles from './page.module.css';

export default function PurchaseOrderPage() {
    const [vendors, setVendors] = useState<any[]>([]);
    const [selectedVendor, setSelectedVendor] = useState('');

    // Custom Items State
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [orderItems, setOrderItems] = useState<any[]>([]); // Array of { product, quantity, cost }

    // Bill Details
    const [vendorInvoiceNo, setVendorInvoiceNo] = useState('');
    const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

    useEffect(() => {
        fetchVendors();
    }, []);

    useEffect(() => {
        if (search.length > 2) {
            fetch(`/api/products?search=${search}`)
                .then(res => res.json())
                .then(setSearchResults);
        } else {
            setSearchResults([]);
        }
    }, [search]);

    const fetchLowStock = async () => {
        const res = await fetch('/api/inventory/low-stock');
        const data = await res.json();
        setLowStock(data);
    };
    const fetchVendors = async () => {
        try {
            const res = await fetch('/api/vendors');
            const data = await res.json();
            setVendors(data);
        } catch (e) { console.error(e); }
    };

    const addItem = (product: any) => {
        if (orderItems.find((i: any) => i.productId === product.id)) return;
        setOrderItems([...orderItems, {
            productId: product.id,
            name: product.name,
            quantity: 1,
            costPrice: product.costPrice || 0
        }]);
        setSearch(''); // Clear search
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...orderItems];
        newItems[index] = { ...newItems[index], [field]: Number(value) };
        setOrderItems(newItems);
    };

    const removeItem = (index: number) => {
        setOrderItems(orderItems.filter((_, i) => i !== index));
    };

    const createPO = async (confirmReceived: boolean) => {
        if (!selectedVendor) return alert('Select a vendor');
        if (orderItems.length === 0) return alert('Add items to order');

        // Simulate File Upload (In real app, upload to S3 here and get URL)
        const invoiceUrl = invoiceFile ? URL.createObjectURL(invoiceFile) : '';

        const res = await fetch('/api/inventory/purchase-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                vendorId: selectedVendor,
                items: orderItems,
                vendorInvoiceNo,
                invoiceUrl, // Sending blob URL or filename
                confirmReceived
            })
        });

        if (res.ok) {
            alert(confirmReceived ? 'Stock Added Successfully!' : 'Purchase Order Created!');
            setOrderItems([]);
            setVendorInvoiceNo('');
            setInvoiceFile(null);
        } else {
            alert('Failed.');
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>New Purchase Entry</h1>

            <div className={styles.topSection}>
                <Card className={styles.vendorCard}>
                    <h3>Bill Details</h3>
                    <div className={styles.field}>
                        <label>Vendor</label>
                        <select value={selectedVendor} onChange={e => setSelectedVendor(e.target.value)} className={styles.select}>
                            <option value="">Select Vendor</option>
                            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                    </div>
                    <div className={styles.field}>
                        <label>Bill Number / Ref No.</label>
                        <input className={styles.input} value={vendorInvoiceNo} onChange={e => setVendorInvoiceNo(e.target.value)} placeholder="e.g. INV-2024-001" />
                    </div>
                    <div className={styles.field}>
                        <label>Upload Bill Image</label>
                        <input className={styles.input} type="file" onChange={e => setInvoiceFile(e.target.files?.[0] || null)} />
                    </div>
                </Card>

                <Card className={styles.searchCard}>
                    <h3>Add Products</h3>
                    <div className={styles.searchWrapper}>
                        <input
                            className={styles.input}
                            placeholder="Search Product by Name or SKU..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {searchResults.length > 0 && (
                            <div className={styles.dropdown}>
                                {searchResults.map(p => (
                                    <div key={p.id} className={styles.item} onClick={() => addItem(p)}>
                                        {p.name} <span style={{ fontSize: '0.8em', color: '#64748b' }}>({p.sku})</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            <Card className={styles.itemsCard}>
                <h3>Order Items</h3>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Cost Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orderItems.map((item, idx) => (
                            <tr key={idx}>
                                <td>{item.name}</td>
                                <td>
                                    <input
                                        type="number"
                                        value={item.costPrice}
                                        onChange={e => updateItem(idx, 'costPrice', e.target.value)}
                                        className={styles.smallInput}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={e => updateItem(idx, 'quantity', e.target.value)}
                                        className={styles.smallInput}
                                    />
                                </td>
                                <td>₹{(item.costPrice * item.quantity).toFixed(2)}</td>
                                <td><button onClick={() => removeItem(idx)} className={styles.deleteBtn}>×</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className={styles.footer}>
                    <div>Total: <strong>₹{orderItems.reduce((acc, i) => acc + (i.costPrice * i.quantity), 0).toFixed(2)}</strong></div>
                    <div className={styles.actions}>
                        <Button variant="outline" onClick={() => createPO(false)}>Save Draft</Button>
                        <Button onClick={() => createPO(true)}>Save & Update Stock</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
