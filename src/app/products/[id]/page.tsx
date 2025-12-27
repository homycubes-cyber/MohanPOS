'use client';

import React, { useEffect, useState } from 'react';
import { ProductForm } from '@/components/products/ProductForm';
import styles from './page.module.css';

export default function EditProductPage({ params }: { params: { id: string } }) {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProduct();
    }, []);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`/api/products/${params.id}`);
            if (!res.ok) {
                // Handle 404
                return;
            }
            const data = await res.json();
            setProduct(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (!product) return <div className={styles.error}>Product not found</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Edit Product</h1>
            <ProductForm initialData={product} isEdit />
        </div>
    );
}
