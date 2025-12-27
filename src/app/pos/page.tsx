'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Card } from '@/components/ui/Card/Card';
import styles from './pos.module.css';

export default function POSPage() {
    const { cart, addToCart, removeFromCart, updateQuantity, cartTotal, cartTax, clearCart, setCart, discount, setDiscount } = useCart();
    const [products, setProducts] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchProducts();
        // Focus search on load
        searchInputRef.current?.focus();
    }, []);

    const fetchProducts = async (query = '') => {
        setLoading(true);
        try {
            const url = query ? `/api/products?search=${query}` : '/api/products';
            const res = await fetch(url);
            const data = await res.json();
            if (Array.isArray(data)) {
                setProducts(data);
            } else {
                console.error('POS API returned non-array:', data);
                setProducts([]);
            }
        } catch (error) {
            console.error(error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearch(query);
        // Debounce this in real app
        fetchProducts(query);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        // Create Invoice logic
        try {
            const res = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    totalAmount: cartTotal,
                    taxAmount: cartTax,
                    discount,
                    paymentMode: 'CASH' // Default for now
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (confirm('Bill Created! Print Receipt?')) {
                    window.open(`/pos/print/${data.id}`, '_blank');
                }
                clearCart();
            } else {
                alert('Failed to create bill');
            }
        } catch (e) {
            console.error(e);
            alert('Error processing transaction');
        }
    };

    const handleEstimate = async () => {
        if (cart.length === 0) return;
        try {
            const res = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    totalAmount: cartTotal,
                    taxAmount: cartTax,
                    discount,
                    status: 'ESTIMATE',
                    paymentMode: 'CASH'
                })
            });
            if (res.ok) {
                const data = await res.json();
                alert('Estimate Created!');
                // Open Print for Estimate
                window.open(`/pos/print/${data.id}?type=estimate`, '_blank');
                // Option: Clear cart or keep it? 
                // User said "immediately convert", so keeping it might be useful, 
                // but "Recall" flow is safer to avoid accidental double billing if they walk away.
                // Let's clear it, as Recall is easy.
                clearCart();
            }
        } catch (e) { console.error(e); }
    };

    const handleHoldBill = async () => {
        if (cart.length === 0) return;
        try {
            const res = await fetch('/api/invoices', {
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
            if (res.ok) {
                alert('Bill Held Successfully!');
                clearCart();
            }
        } catch (e) { console.error(e); }
    };

    // START CHECKOUT LOGIC
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [customerSearch, setCustomerSearch] = useState('');
    const [customers, setCustomers] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [paymentSplits, setPaymentSplits] = useState<{ mode: string, amount: number }[]>([
        { mode: 'CASH', amount: 0 }
    ]);

    // Fetch customers when searching
    useEffect(() => {
        if (customerSearch.length > 2) {
            fetch(`/api/customers?search=${customerSearch}`)
                .then(r => r.json())
                .then(setCustomers);
        }
    }, [customerSearch]);

    const handleCheckoutClick = () => {
        // Open Modal, Init Payment to Total
        if (cart.length === 0) return;
        setPaymentSplits([{ mode: 'CASH', amount: cartTotal }]);
        setIsCheckoutOpen(true);
    };

    const handleFinalSubmit = async () => {
        // Validate Total
        const totalPaid = paymentSplits.reduce((sum, p) => sum + p.amount, 0);
        if (Math.abs(totalPaid - cartTotal) > 1) { // Tolerance
            alert(`Payment mismatch! Due: ${cartTotal}, Paid: ${totalPaid}`);
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
                    payments: paymentSplits,
                    status: 'COMPLETED'
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (confirm('Bill Created! Print Receipt?')) {
                    window.open(`/pos/print/${data.id}`, '_blank');
                }
                clearCart();
                setIsCheckoutOpen(false);
                setSelectedCustomer(null);
                setDiscount(0);
            } else {
                alert('Failed to create bill');
            }
        } catch (e) { console.error(e); }
    };
    // END CHECKOUT LOGIC

    // START RECALL LOGIC
    const [isModalOpen, setIsRecallOpen] = useState(false);
    const [heldBills, setHeldBills] = useState<any[]>([]);

    const fetchHeldBills = async () => {
        // Fetch HELD and ESTIMATE
        const [resHeld, resEst] = await Promise.all([
            fetch('/api/invoices?status=HELD'),
            fetch('/api/invoices?status=ESTIMATE')
        ]);
        const held = await resHeld.json();
        const est = await resEst.json();

        // Combine and add type for UI distinction
        const combined = [
            ...(Array.isArray(held) ? held : []).map((i: any) => ({ ...i, type: 'HELD' })),
            ...(Array.isArray(est) ? est : []).map((i: any) => ({ ...i, type: 'ESTIMATE' }))
        ];

        setHeldBills(combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setIsRecallOpen(true);
    };
    // END RECALL LOGIC

    return (
        <div className={styles.container}>
            {/* Left Side: Product Selection */}
            <div className={styles.productSection}>
                <div className={styles.searchBar}>
                    <Input
                        ref={searchInputRef}
                        placeholder="Search Product / Scan Barcode..."
                        value={search}
                        onChange={handleSearch}
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.productList}>
                    {loading ? <div>Loading...</div> : (
                        <div className={styles.grid}>
                            {products.map(product => (
                                <div
                                    key={product.id}
                                    className={styles.productCard}
                                    onClick={() => addToCart(product)}
                                >
                                    <div className={styles.productName}>{product.name}</div>
                                    <div className={styles.productMeta}>
                                        <span className={styles.sku}>{product.sku}</span>
                                        <span className={styles.stock}>Stock: {product.inventory?.quantity || 0}</span>
                                    </div>
                                    <div className={styles.price}>₹{product.price}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side: Cart & Billing */}
            <div className={styles.cartSection}>
                <Card className={styles.cartCard}>
                    <div className={styles.cartHeader}>
                        <h2>Current Bill</h2>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Button size="sm" variant="outline" onClick={fetchHeldBills}>Recall / Est</Button>
                            <Button size="sm" style={{ backgroundColor: '#ea580c', color: 'white' }} onClick={handleEstimate} disabled={cart.length === 0}>Estimate</Button>
                            <Button size="sm" variant="secondary" onClick={handleHoldBill} disabled={cart.length === 0}>Hold</Button>
                            <Button size="sm" variant="danger" onClick={clearCart}>Clear</Button>
                        </div>
                    </div>

                    <div className={styles.cartItems}>
                        {cart.length === 0 ? (
                            <div className={styles.emptyCart}>Cart is empty</div>
                        ) : (
                            cart.map(item => (
                                <div key={item.productId} className={styles.cartItem}>
                                    <div className={styles.itemInfo}>
                                        <div className={styles.itemName}>{item.name}</div>
                                        <div className={styles.itemPrice}>₹{item.price} x {item.quantity}</div>
                                    </div>
                                    <div className={styles.itemActions}>
                                        <button className={styles.qtyBtn} onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
                                        <span className={styles.qty}>{item.quantity}</span>
                                        <button className={styles.qtyBtn} onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                                        <div className={styles.itemTotal}>₹{(item.price * item.quantity).toFixed(2)}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className={styles.cartFooter}>
                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>₹{(cartTotal - cartTax).toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Tax (GST)</span>
                            <span>₹{cartTax.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryRow} style={{ alignItems: 'center' }}>
                            <span>Discount</span>
                            <input
                                type="number"
                                className={styles.discountInput}
                                value={discount}
                                onChange={(e) => setDiscount(Number(e.target.value))}
                                placeholder="0"
                            />
                        </div>
                        <div className={`${styles.summaryRow} ${styles.total}`}>
                            <span>Total</span>
                            <span>₹{cartTotal.toFixed(2)}</span>
                        </div>

                        <Button
                            variant="primary"
                            className={styles.checkoutBtn}
                            onClick={handleCheckoutClick}
                            disabled={cart.length === 0}
                        >
                            CHECKOUT (F1)
                        </Button>
                    </div>
                </Card>
            </div>
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <Card className={styles.modal}>
                        <h3>Recall Held Bill</h3>
                        <div className={styles.billList}>
                            {heldBills.map(bill => (
                                <div key={bill.id} className={styles.billItem}>
                                    <div>
                                        <strong>{bill.type === 'ESTIMATE' ? '📝 EST' : '⏸️ HELD'} {bill.invoiceNo}</strong>
                                        <br />
                                        <span style={{ fontSize: '0.8rem' }}>{new Date(bill.createdAt).toLocaleTimeString()} - ₹{bill.totalAmount}</span>
                                    </div>
                                    <Button size="sm" onClick={() => {
                                        setCart(bill.items.map((i: any) => ({
                                            productId: i.productId,
                                            name: i.product.name,
                                            price: i.price,
                                            quantity: i.quantity,
                                            gstRate: i.product.gstRate
                                        })));
                                        setIsRecallOpen(false);
                                    }}>Load</Button>
                                </div>
                            ))}
                            {heldBills.length === 0 && <p>No held bills found.</p>}
                        </div>
                        <Button variant="secondary" onClick={() => setIsRecallOpen(false)} style={{ marginTop: '1rem', width: '100%' }}>Close</Button>
                    </Card>
                </div>
            )}

            {isCheckoutOpen && (
                <div className={styles.modalOverlay}>
                    <Card className={styles.modal} style={{ maxWidth: '600px' }}>
                        <h3>Checkout & Payment</h3>

                        {/* Customer Section */}
                        <div className={styles.section}>
                            <label>Customer (Optional)</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Input
                                    placeholder="Search Phone / Name..."
                                    value={customerSearch}
                                    onChange={e => setCustomerSearch(e.target.value)}
                                />
                                {selectedCustomer && <Button size="sm" variant="outline" onClick={() => setSelectedCustomer(null)}>Clear</Button>}
                            </div>
                            {customerSearch && !selectedCustomer && customers.length > 0 && (
                                <div className={styles.dropdown}>
                                    {customers.map(c => (
                                        <div key={c.id} className={styles.dropdownItem} onClick={() => {
                                            setSelectedCustomer(c);
                                            setCustomerSearch(c.name);
                                            setCustomers([]);
                                        }}>
                                            {c.name} ({c.phone})
                                        </div>
                                    ))}
                                </div>
                            )}
                            {selectedCustomer && <div className={styles.selectedBadge}>Selected: {selectedCustomer.name}</div>}
                        </div>

                        {/* Payment Section */}
                        <div className={styles.section}>
                            <h4>Payment Split (Total: {cartTotal})</h4>
                            {paymentSplits.map((split, idx) => (
                                <div key={idx} className={styles.splitRow}>
                                    <select
                                        value={split.mode}
                                        onChange={(e) => {
                                            const newSplits = [...paymentSplits];
                                            newSplits[idx].mode = e.target.value;
                                            setPaymentSplits(newSplits);
                                        }}
                                        className={styles.select}
                                    >
                                        <option value="CASH">Cash</option>
                                        <option value="UPI">UPI</option>
                                        <option value="CARD">Card</option>
                                        <option value="CREDIT">Khata (Credit)</option>
                                    </select>
                                    <Input
                                        type="number"
                                        value={split.amount}
                                        onChange={(e) => {
                                            const newSplits = [...paymentSplits];
                                            newSplits[idx].amount = Number(e.target.value);
                                            setPaymentSplits(newSplits);
                                        }}
                                    />
                                    <Button size="sm" variant="danger" onClick={() => {
                                        const newSplits = paymentSplits.filter((_, i) => i !== idx);
                                        setPaymentSplits(newSplits);
                                    }}>X</Button>
                                </div>
                            ))}
                            <Button size="sm" variant="secondary" onClick={() => setPaymentSplits([...paymentSplits, { mode: 'UPI', amount: 0 }])}>+ Add Split</Button>
                        </div>

                        <div className={styles.summaryFooter}>
                            <div>Paid: {paymentSplits.reduce((a, b) => a + b.amount, 0)}</div>
                            <div>Balance: {cartTotal - paymentSplits.reduce((a, b) => a + b.amount, 0)}</div>
                        </div>

                        <div className={styles.actions}>
                            <Button variant="secondary" onClick={() => setIsCheckoutOpen(false)}>Cancel</Button>
                            <Button onClick={handleFinalSubmit}>Complete Sale</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
