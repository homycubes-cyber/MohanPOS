'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Card } from '@/components/ui/Card/Card';
import styles from './ProductForm.module.css';

interface Category {
    id: string;
    name: string;
}

interface ProductFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, isEdit = false }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    // New Category State
    const [isNewCatOpen, setIsNewCatOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        fetch('/api/categories').then(res => res.json()).then(setCategories);
    }, []);

    const handleCreateCategory = async () => {
        if (!newCategoryName) return;
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategoryName })
            });
            if (res.ok) {
                const newCat = await res.json();
                setCategories([...categories, newCat]);
                setFormData({ ...formData, categoryId: newCat.id });
                setIsNewCatOpen(false);
                setNewCategoryName('');
            }
        } catch (e) { console.error(e); }
    };

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        barcode: '',
        hsnCode: '',
        price: '',
        costPrice: '',
        categoryId: '',
        initialStock: '',
        lowStockThreshold: '5',
        ...initialData
    });

    useEffect(() => {
        fetchCategories();
        if (initialData) {
            setFormData({
                ...initialData,
                categoryId: initialData.categoryId || '',
                price: initialData.price?.toString() || '',
                costPrice: initialData.costPrice?.toString() || '',
                initialStock: initialData.inventory?.quantity?.toString() || '',
                lowStockThreshold: initialData.inventory?.lowStockThreshold?.toString() || '5'
            });
        }
    }, [initialData]);

    const fetchCategories = async () => {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = isEdit ? `/api/products/${initialData.id}` : '/api/products';
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const error = await res.json();
                alert(error.error || 'Failed to save product');
                return;
            }

            router.push('/products');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className={styles.formCard}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.grid}>
                    <Input
                        label="Product Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="SKU (Unique Code)"
                        name="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={styles.grid} style={{ alignItems: 'flex-end' }}>
                    <Input
                        label="Barcode"
                        name="barcode"
                        onChange={handleChange}
                    />
                    <Button type="button" size="sm" onClick={() => {
                        const random = Math.floor(100000000000 + Math.random() * 900000000000).toString();
                        setFormData((prev: any) => ({ ...prev, barcode: random }));
                    }}>Generate EAN</Button>
                    <Input
                        label="HSN Code"
                        name="hsnCode"
                        value={formData.hsnCode}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.grid}>
                    <Input
                        label="Selling Price (MRP)"
                        name="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Cost Price (Optional)"
                        name="costPrice"
                        type="number"
                        step="0.01"
                        value={formData.costPrice}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.grid}>
                    <div className={styles.inputGroup}>
                        <div className={styles.formGroup}>
                            <label>Category</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <select
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleChange}
                                    className={styles.select}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat: any) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <Button type="button" variant="secondary" size="sm" onClick={() => setIsNewCatOpen(true)}>+</Button>
                            </div>
                        </div>

                        {isNewCatOpen && (
                            <div className={styles.miniModal}>
                                <input
                                    className={styles.input}
                                    placeholder="New Category Name"
                                    value={newCategoryName}
                                    onChange={e => setNewCategoryName(e.target.value)}
                                />
                                <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem' }}>
                                    <Button type="button" size="sm" onClick={handleCreateCategory}>Save</Button>
                                    <Button type="button" size="sm" variant="outline" onClick={() => setIsNewCatOpen(false)}>Cancel</Button>
                                </div>
                            </div>
                        )}        </div>
                </div>

                {!isEdit && (
                    <div className={styles.grid}>
                        <Input
                            label="Initial Stock"
                            name="initialStock"
                            type="number"
                            value={formData.initialStock}
                            onChange={handleChange}
                        />
                        <Input
                            label="Low Stock Alert Level"
                            name="lowStockThreshold"
                            type="number"
                            value={formData.lowStockThreshold}
                            onChange={handleChange}
                        />
                    </div>
                )}

                <div className={styles.actions}>
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
                    </Button>
                </div>
            </form>
        </Card>
    );
};
