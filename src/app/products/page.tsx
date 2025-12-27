'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { StatsCard } from '@/components/ui/StatsCard';
import styles from './page.module.css';

interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
    costPrice?: number;
    inventory: { quantity: number; lowStockThreshold: number };
    category: { name: string };
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [activeTab, setActiveTab] = useState('PRODUCTS');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    // Inline editing state
    const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
    const [tempPrice, setTempPrice] = useState<string>('');
    const [isSavingPrice, setIsSavingPrice] = useState(false);

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [activeTab, search]); // Refetch when tab changes or search changes

    const handleAddCategory = async () => {
        if (!newCategoryName) return;
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategoryName })
            });
            if (res.ok) {
                setNewCategoryName('');
                setIsCategoryModalOpen(false);
                fetchCategories(); // Refresh list
            } else {
                alert('Failed to create category');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleStartEditPrice = (product: Product) => {
        setEditingPriceId(product.id);
        setTempPrice(product.price.toString());
    };

    const handleCancelEditPrice = () => {
        setEditingPriceId(null);
        setTempPrice('');
    };

    const handleSavePrice = async (product: Product) => {
        if (!tempPrice || isNaN(Number(tempPrice))) return;
        setIsSavingPrice(true);
        try {
            const res = await fetch(`/api/products/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    price: Number(tempPrice)
                })
            });

            if (res.ok) {
                const updatedProduct = await res.json();
                // Update local state
                setProducts(products.map(p => p.id === product.id ? updatedProduct : p));
                if (selectedProduct?.id === product.id) {
                    setSelectedProduct(updatedProduct);
                }
                setEditingPriceId(null);
            } else {
                alert('Failed to update price');
            }
        } catch (e) {
            console.error(e);
            alert('Error updating price');
        } finally {
            setIsSavingPrice(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch(`/api/products?search=${search}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setProducts(data);
                if (activeTab === 'PRODUCTS' && data.length > 0 && !selectedProduct) {
                    setSelectedProduct(data[0]);
                }
            } else {
                console.error('API returned non-array:', data);
                setProducts([]);
            }
        } catch (e) {
            console.error(e);
            setProducts([]);
        }
        finally { setLoading(false); }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            if (Array.isArray(data)) {
                setCategories(data);
            } else {
                console.error('API returned non-array for categories:', data);
                setCategories([]);
            }
        } catch (e) {
            console.error(e);
            setCategories([]);
        }
    };

    // Calculate KPIs
    const totalItems = products.length;
    const totalValue = products.reduce((sum, p) => sum + ((p.inventory?.quantity || 0) * (p.costPrice || 0)), 0);
    const lowStockCount = products.filter(p => p.inventory?.quantity <= p.inventory?.lowStockThreshold).length;

    return (
        <div style={{ padding: '0px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Top Page Header */}
            <div style={{
                height: '60px',
                background: 'white',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 1.5rem'
            }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>
                    Products Manager
                </h1>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <StatsCard title="Total Items" value={totalItems} color="blue" variant="mini" />
                    <StatsCard title="Inventory Value" value={`₹ ${totalValue.toFixed(0)}`} color="green" variant="mini" />
                    <StatsCard title="Low Stock" value={lowStockCount} color={lowStockCount > 0 ? 'red' : 'green'} variant="mini" />
                </div>
            </div>

            {/* Main Split Layout */}
            <div className={styles.container} style={{ height: 'calc(100vh - 60px)' }}>
                {/* Left Panel: List */}
                <div className={styles.leftPanel}>
                    <div className={styles.lpHeader}>
                        <div className={styles.tabs}>
                            <div
                                className={`${styles.tab} ${activeTab === 'PRODUCTS' ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab('PRODUCTS')}
                            >
                                PRODUCTS
                            </div>
                            <div
                                className={`${styles.tab} ${activeTab === 'CATEGORY' ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab('CATEGORY')}
                            >
                                CATEGORY
                            </div>
                        </div>
                    </div>

                    <div className={styles.searchSection}>
                        <Input
                            placeholder="Search items..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className={styles.searchInput}
                        />
                        <Link href="/products/import">
                            <Button size="sm" variant="outline" className={styles.addButton}>Import CSV</Button>
                        </Link>

                        {activeTab === 'PRODUCTS' ? (
                            <Link href="/products/new">
                                <Button size="sm" className={styles.addButton}>+ Add Item</Button>
                            </Link>
                        ) : (
                            <Button size="sm" className={styles.addButton} onClick={() => setIsCategoryModalOpen(true)}>
                                + Add Category
                            </Button>
                        )}
                    </div>

                    <div className={styles.listContainer}>
                        {activeTab === 'PRODUCTS' && products.map(product => (
                            <div
                                key={product.id}
                                className={`${styles.listItem} ${selectedProduct?.id === product.id ? styles.selected : ''}`}
                                onClick={() => setSelectedProduct(product)}
                            >
                                <div className={styles.itemName}>{product.name}</div>
                                <div className={`${styles.stockBadge} ${product.inventory?.quantity <= product.inventory?.lowStockThreshold ? styles.lowStock : ''}`}>
                                    {product.inventory?.quantity || 0}
                                </div>
                            </div>
                        ))}

                        {activeTab === 'CATEGORY' && categories.map(cat => (
                            <div key={cat.id} className={styles.listItem}>
                                <div className={styles.itemName}>{cat.name}</div>
                                <div className={styles.sku} style={{ fontSize: '0.7rem' }}>0 Items</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Details */}
                <div className={styles.rightPanel}>
                    {selectedProduct ? (
                        <>
                            <div className={styles.rpHeader}>
                                <h2 className={styles.rpTitle}>{selectedProduct.name} <span className={styles.sku}>SKU: {selectedProduct.sku}</span></h2>
                                <div className={styles.rpActions}>
                                    <Link href={`/products/${selectedProduct.id}`}>
                                        <Button variant="outline" size="sm">Edit Whole Product</Button>
                                    </Link>
                                    <Button variant="secondary" size="sm">Adjust Stock</Button>
                                </div>
                            </div>

                            <div className={styles.statsRow}>
                                <div className={styles.statBox}>
                                    <label>Sale Price</label>
                                    {editingPriceId === selectedProduct.id ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                            <Input
                                                value={tempPrice}
                                                onChange={(e) => setTempPrice(e.target.value)}
                                                style={{ width: '100px', padding: '4px', fontSize: '1rem', height: '32px' }}
                                                autoFocus
                                            />
                                            <Button
                                                size="sm"
                                                onClick={() => handleSavePrice(selectedProduct)}
                                                disabled={isSavingPrice}
                                                style={{ padding: '0 8px', height: '32px' }}
                                            >
                                                ✓
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant='secondary'
                                                onClick={handleCancelEditPrice}
                                                style={{ padding: '0 8px', height: '32px', color: '#64748b' }}
                                            >
                                                ✕
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className={styles.statValue} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            ₹{selectedProduct.price.toFixed(2)}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStartEditPrice(selectedProduct);
                                                }}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: '#94a3b8',
                                                    fontSize: '0.8rem',
                                                    padding: '2px',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                                title="Edit Price"
                                            >
                                                ✎
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className={styles.statBox}>
                                    <label>Purchase Price</label>
                                    <div className={styles.statValue} style={{ color: '#64748b' }}>
                                        ₹{selectedProduct.costPrice?.toFixed(2) || '0.00'}
                                    </div>
                                </div>
                                <div className={styles.statBox}>
                                    <label>Stock Quantity</label>
                                    <div className={`${styles.statValue} ${selectedProduct.inventory?.quantity <= selectedProduct.inventory?.lowStockThreshold ? styles.textRed : ''}`}>
                                        {selectedProduct.inventory?.quantity || 0}
                                    </div>
                                </div>
                                <div className={styles.statBox}>
                                    <label>Stock Value</label>
                                    <div className={styles.statValue}>
                                        ₹{((selectedProduct.inventory?.quantity || 0) * (selectedProduct.costPrice || 0)).toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.transactionsSection}>
                                <div className={styles.sectionTitle}>TRANSACTIONS</div>
                                <div className={styles.tableHeader}>
                                    <span>Type</span>
                                    <span>Ref No.</span>
                                    <span>Date</span>
                                    <span>Qty</span>
                                    <span>Status</span>
                                </div>
                                <div className={styles.emptyState}>
                                    <p>No transactions to show</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className={styles.emptySelection}>Select an item to view details</div>
                    )}
                </div>

                {/* Category Creation Modal */}
                {isCategoryModalOpen && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                    }}>
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h3>Add New Category</h3>
                            <Input
                                placeholder="Category Name"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                            />
                            {/* Future: Add Parent Category Selector Here */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <Button variant="secondary" onClick={() => setIsCategoryModalOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddCategory}>Save</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
