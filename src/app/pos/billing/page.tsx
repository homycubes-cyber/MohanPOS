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
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // F1: Focus Search
            if (e.key === 'F1') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            // F7: Save Bill
            if (e.key === 'F7') {
                e.preventDefault();
                handleSave();
            }
            // Ctrl + Esc: Exit
            if (e.ctrlKey && e.key === 'Escape') {
                e.preventDefault();
                router.push('/');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [router]);

    const handleSearch = async (val: string) => {
        setSearch(val);
        if (val.length > 1) {
            const res = await fetch(`/api/products?search=${val}`);
            const data = await res.json();
            setProducts(data);
            setShowResults(true);
        } else {
            setProducts([]);
            setShowResults(false);
        }
    };

    const handleSave = async () => {
        if (cart.length === 0) return;
        // Logic for saving...
        alert('Bill Saved successfully!');
        clearCart();
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
                <div className={styles.addTab}>+ Hold Bill & Create Another <span className={styles.shortcutLabel}>[CTRL + B]</span></div>
            </div>

            {/* Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.toolGroup}>
                    <button className={`${styles.toolBtn} ${styles.toolBtnPrimary}`}>+ New Item <span className={styles.shortcutLabel}>[CTRL + I]</span></button>
                    <button className={styles.toolBtn}>Change Price <span className={styles.shortcutLabel}>[P]</span></button>
                    <button className={styles.toolBtn}>Change QTY <span className={styles.shortcutLabel}>[Q]</span></button>
                    <button className={`${styles.toolBtn} ${styles.toolBtnDanger}`}>Delete Item <span className={styles.shortcutLabel}>[DEL]</span></button>
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
                    />
                    <span className={styles.f1Label}>F1</span>

                    {showResults && products.length > 0 && (
                        <div className={styles.searchResults}>
                            {products.map(p => (
                                <div key={p.id} className={styles.searchItem} onClick={() => {
                                    addToCart(p);
                                    setSearch('');
                                    setShowResults(false);
                                }}>
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
                                        <tr key={item.productId}>
                                            <td>{idx + 1}</td>
                                            <td>{item.name}</td>
                                            <td>---</td>
                                            <td>₹{item.price}</td>
                                            <td>₹{item.price}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                                                    style={{ width: '50px' }}
                                                />
                                            </td>
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
                            <button className={styles.toolBtn} style={{ flex: 1 }}>Add Discount [F2]</button>
                            <button className={styles.toolBtn} style={{ flex: 1 }}>Add Charge [F3]</button>
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

                    <div className={styles.sideCard}>
                        <label>Customer Details <span className={styles.shortcutLabel}>[F5]</span></label>
                        <div style={{ marginTop: '0.5rem', fontWeight: 600 }}>Cash Sale 📝</div>
                    </div>
                </aside>
            </div>

            {/* Footer */}
            <footer className={styles.footer}>
                <button className={styles.savePrintBtn} onClick={handleSave}>Save & Print [F6]</button>
                <button className={styles.saveBtn} onClick={handleSave}>Save Bill [F7]</button>
            </footer>
        </div>
    );
}
