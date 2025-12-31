'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function POSBillingPage() {
    const router = useRouter();
    const {
        cart,
        addToCart,
        updateQuantity,
        updatePrice,
        removeFromCart,
        cartTotal,
        cartTax,
        clearCart,
        discount,
        setDiscount
    } = useCart();

    const [search, setSearch] = useState('');
    const [products, setProducts] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Modals & Inputs
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [activeModal, setActiveModal] = useState<null | 'PRICE' | 'QTY' | 'DISCOUNT' | 'CUSTOMER' | 'ADD_PRODUCT'>(null);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', sku: '', barcode: '' });
    const [tempValue, setTempValue] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    // Auto-select last item when cart grows (new item added)
    useEffect(() => {
        if (cart.length > 0) {
            setSelectedIndex(cart.length - 1);
        }
    }, [cart.length]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (activeModal) {
                if (e.key === 'Escape') setActiveModal(null);
                return;
            }

            // Navigation
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, cart.length - 1));
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
            }

            // Actions on Selected Item
            if (e.key === 'Delete' && cart.length > 0) {
                e.preventDefault();
                removeFromCart(cart[selectedIndex].productId);
            }
            if (e.key.toLowerCase() === 'p' && cart.length > 0) {
                e.preventDefault();
                setTempValue(cart[selectedIndex].price.toString());
                setActiveModal('PRICE');
            }
            if (e.key.toLowerCase() === 'q' && cart.length > 0) {
                e.preventDefault();
                setTempValue(cart[selectedIndex].quantity.toString());
                setActiveModal('QTY');
            }

            // Global Shortcuts
            if (e.key === 'F1') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'F2') {
                e.preventDefault();
                setTempValue(discount.toString());
                setActiveModal('DISCOUNT');
            }
            if (e.key === 'F7') {
                e.preventDefault();
                handleSave();
            }
            if (e.ctrlKey && e.key === 'Escape') {
                e.preventDefault();
                router.push('/');
            }
            if (e.ctrlKey && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                handleHoldBill();
            }
            if (e.ctrlKey && e.key.toLowerCase() === 'i') {
                e.preventDefault();
                setNewProduct({ name: '', price: '', sku: `SKU-${Date.now()}`, barcode: '' });
                setActiveModal('ADD_PRODUCT');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart, selectedIndex, activeModal, discount, router]); // Dep array important for closure access

    const handleSearch = async (val: string) => {
        setSearch(val);
        if (val.length > 1) {
            const res = await fetch(`/api/products?search=${val}`);
            const data = await res.json();
            setProducts(Array.isArray(data) ? data : []);
            setShowResults(true);
        } else {
            setProducts([]);
            setShowResults(false);
        }
    };

    const handleAddItem = (product: any) => {
        addToCart(product);
        setSearch('');
        setShowResults(false);
        searchInputRef.current?.focus();
    };

    const handleModalSubmit = () => {
        const val = parseFloat(tempValue);
        if (isNaN(val)) return;

        if (activeModal === 'PRICE') {
            updatePrice(cart[selectedIndex].productId, val);
        } else if (activeModal === 'QTY') {
            updateQuantity(cart[selectedIndex].productId, val);
        } else if (activeModal === 'DISCOUNT') {
            setDiscount(val);
        }
        setActiveModal(null);
    };

    const handleQuickAdd = async () => {
        if (!newProduct.name || !newProduct.price || !newProduct.sku) {
            alert('Please fill Name, Price, and SKU');
            return;
        }

        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newProduct.name,
                    price: parseFloat(newProduct.price),
                    sku: newProduct.sku,
                    barcode: newProduct.barcode,
                    gstRate: 0,
                    initialStock: 100
                })
            });

            if (res.ok) {
                const product = await res.json();
                addToCart(product);
                setActiveModal(null);
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to add product');
            }
        } catch (e) {
            console.error(e);
            alert('Error creating product');
        }
    };

    const handleSave = async () => {
        if (cart.length === 0) {
            alert('Please add items to the cart before saving.');
            return;
        }

        try {
            const res = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    totalAmount: cartTotal,
                    taxAmount: cartTax,
                    discount,
                    customerId: selectedCustomer?.id,
                    paymentMode: 'CASH',
                    status: 'COMPLETED'
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (confirm('Bill Saved! Print Receipt?')) {
                    window.open(`/pos/print/${data.id}`, '_blank');
                }
                clearCart();
            } else {
                alert('Failed to save bill.');
            }
        } catch (error) {
            console.error(error);
            alert('Error creating invoice');
        }
    };

    const handleHoldBill = async () => {
        if (cart.length === 0) return;
        try {
            await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    totalAmount: cartTotal,
                    taxAmount: cartTax,
                    discount,
                    status: 'HELD',
                    paymentMode: 'CASH'
                })
            });
            alert('Bill Held Successfully!');
            clearCart();
        } catch (e) {
            console.error(e);
            alert('Failed to hold bill');
        }
    };

    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={styles.header}>
                <button className={styles.exitBtn} onClick={() => router.push('/')}>
                    ← Exit POS <span className={styles.shortcutLabel}>[CTRL + ESC]</span>
                </button>
                <div className={styles.title}>POS Billing</div>
                <div className={styles.headerRight}>
                    <button className={styles.guideBtn}>▶ Watch how to use POS Billing</button>
                    <button className={styles.settingsBtn}>Settings <span className={styles.shortcutLabel}>[CTRL + S]</span></button>
                </div>
            </header>

            {/* Tabs */}
            <div className={styles.tabBar}>
                <div className={`${styles.tab} ${styles.tabActive}`}>
                    Billing Screen 1 <span className={styles.shortcutLabel}>[CTRL + 1]</span> ✕
                </div>
                <div className={styles.addTab} onClick={handleHoldBill}>
                    + Hold Bill & Create Another <span className={styles.shortcutLabel}>[CTRL + B]</span>
                </div>
            </div>

            {/* Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.toolGroup}>
                    <button className={`${styles.toolBtn} ${styles.toolBtnPrimary}`} onClick={() => {
                        setNewProduct({ name: '', price: '', sku: `SKU-${Date.now()}`, barcode: '' });
                        setActiveModal('ADD_PRODUCT');
                    }}>
                        + New Item <span className={styles.shortcutLabel}>[CTRL + I / F1]</span>
                    </button>
                    <button className={styles.toolBtn} onClick={() => {
                        if (cart.length > 0) {
                            setTempValue(cart[selectedIndex].price.toString());
                            setActiveModal('PRICE');
                        }
                    }}>
                        Change Price <span className={styles.shortcutLabel}>[P]</span>
                    </button>
                    <button className={styles.toolBtn} onClick={() => {
                        if (cart.length > 0) {
                            setTempValue(cart[selectedIndex].quantity.toString());
                            setActiveModal('QTY');
                        }
                    }}>
                        Change QTY <span className={styles.shortcutLabel}>[Q]</span>
                    </button>
                    <button className={`${styles.toolBtn} ${styles.toolBtnDanger}`} onClick={() => {
                        if (cart.length > 0) removeFromCart(cart[selectedIndex].productId);
                    }}>
                        Delete Item <span className={styles.shortcutLabel}>[DEL]</span>
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className={styles.searchSection}>
                <select className={styles.categorySelect}>
                    <option>Category</option>
                </select>
                <div className={styles.searchInputWrapper}>
                    <input
                        ref={searchInputRef}
                        className={styles.searchInput}
                        placeholder="Search by Item/ Serial no./ HSN code/ SKU/ Custom Field / Category or Scan Barcode"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && products.length > 0) {
                                handleAddItem(products[0]);
                            }
                        }}
                    />
                    <span className={styles.f1Label}>F1</span>

                    {showResults && products.length > 0 && (
                        <div className={styles.searchResults}>
                            {products.map(p => (
                                <div key={p.id} className={styles.searchItem} onClick={() => handleAddItem(p)}>
                                    <div className={styles.searchItemName}>{p.name}</div>
                                    <div className={styles.searchItemMeta}>SKU: {p.sku} | Price: ₹{p.price}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Area */}
            <div className={styles.mainContent}>
                <div className={styles.billingArea}>
                    <div className={styles.tableWrapper}>
                        {cart.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>📦</div>
                                <div>
                                    <p>Add items by searching item name or item code</p>
                                    <p>Or</p>
                                    <p>Simply scan barcode to add items</p>
                                </div>
                            </div>
                        ) : (
                            <table className={styles.itemTable}>
                                <thead>
                                    <tr>
                                        <th>NO</th>
                                        <th>ITEMS</th>
                                        <th>ITEM CODE</th>
                                        <th>MRP</th>
                                        <th>SP (₹)</th>
                                        <th>QUANTITY</th>
                                        <th>AMOUNT (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map((item, idx) => (
                                        <tr
                                            key={item.productId}
                                            style={{ background: idx === selectedIndex ? '#eff6ff' : 'transparent', cursor: 'pointer' }}
                                            onClick={() => setSelectedIndex(idx)}
                                        >
                                            <td>{idx + 1}</td>
                                            <td>{item.name}</td>
                                            <td>---</td>
                                            <td>₹{item.price}</td>
                                            <td>₹{item.price}</td>
                                            <td>{item.quantity}</td>
                                            <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    <div className={styles.sideCard}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <button className={styles.toolBtn} style={{ flex: 1 }} onClick={() => {
                                setTempValue(discount.toString());
                                setActiveModal('DISCOUNT');
                            }}>
                                Add Discount [F2]
                            </button>
                            <button className={styles.toolBtn} style={{ flex: 1 }} onClick={() => alert('Feature coming soon')}>Add Charge [F3]</button>
                        </div>

                        <div className={styles.billDetails}>
                            <h4>Bill details</h4>
                            <div className={styles.row}>
                                <span>Sub Total</span>
                                <span>₹{(cartTotal - cartTax).toFixed(2)}</span>
                            </div>
                            <div className={styles.row}>
                                <span>Tax</span>
                                <span>₹{cartTax.toFixed(2)}</span>
                            </div>
                            <div className={styles.row}>
                                <span>Discount</span>
                                <span>- ₹{discount.toFixed(2)}</span>
                            </div>
                            <div className={styles.totalRow}>
                                <span>Total Amount</span>
                                <span>₹{cartTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.sideCard}>
                        <div className={styles.amountInputSection}>
                            <label>Received Amount <span className={styles.shortcutLabel}>[F4]</span></label>
                            <div className={styles.inputGroup}>
                                <input type="number" placeholder="₹ 0" value={cartTotal} readOnly />
                                <select>
                                    <option>Cash</option>
                                    <option>Card</option>
                                    <option>UPI</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Footer */}
            <footer className={styles.footer}>
                <button className={styles.savePrintBtn} onClick={handleSave}>Save & Print [F6]</button>
                <button className={styles.saveBtn} onClick={handleSave}>Save Bill [F7]</button>
            </footer>

            {/* Modals */}
            {activeModal && activeModal !== 'ADD_PRODUCT' && (
                <div className={styles.modalOverlay} style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', minWidth: '300px' }}>
                        <h3>
                            {activeModal === 'PRICE' && 'Change Unit Price'}
                            {activeModal === 'QTY' && 'Change Quantity'}
                            {activeModal === 'DISCOUNT' && 'Set Total Discount'}
                        </h3>
                        <input
                            autoFocus
                            type="number"
                            value={tempValue}
                            onChange={e => setTempValue(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') handleModalSubmit();
                            }}
                            style={{ width: '100%', padding: '0.5rem', margin: '1rem 0', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button onClick={() => setActiveModal(null)} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Cancel</button>
                            <button
                                onClick={handleModalSubmit}
                                style={{ padding: '0.5rem 1rem', background: '#4338ca', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeModal === 'ADD_PRODUCT' && (
                <div className={styles.modalOverlay} style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', minWidth: '400px' }}>
                        <h3>Quick Add New Product</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1rem 0' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Product Name *</label>
                                <input
                                    autoFocus
                                    className={styles.searchInput}
                                    placeholder="Enter Product Name"
                                    value={newProduct.name}
                                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Price *</label>
                                    <input
                                        type="number"
                                        className={styles.searchInput}
                                        placeholder="0.00"
                                        value={newProduct.price}
                                        onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#64748b' }}>SKU *</label>
                                    <input
                                        className={styles.searchInput}
                                        placeholder="SKU"
                                        value={newProduct.sku}
                                        onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Barcode (Optional)</label>
                                <input
                                    className={styles.searchInput}
                                    placeholder="Scan or enter barcode"
                                    value={newProduct.barcode}
                                    onChange={e => setNewProduct({ ...newProduct, barcode: e.target.value })}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') handleQuickAdd();
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button onClick={() => setActiveModal(null)} style={{ padding: '0.5rem 1rem', cursor: 'pointer', border: '1px solid #e2e8f0', borderRadius: '4px', background: 'white' }}>Cancel</button>
                            <button
                                onClick={handleQuickAdd}
                                style={{ padding: '0.5rem 1rem', background: '#4338ca', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Add to Cart & Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
