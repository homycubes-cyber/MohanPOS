'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    gstRate: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: any) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartTax: number;
    discount: number;
    setDiscount: (amount: number) => void;
    setCart: (cart: CartItem[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [discount, setDiscount] = useState(0);

    const addToCart = (product: any) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.productId === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [
                ...prev,
                {
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    gstRate: product.gstRate || 0,
                },
            ];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart((prev) => prev.filter((item) => item.productId !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart((prev) =>
            prev.map((item) =>
                item.productId === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
        setDiscount(0);
    };

    const subTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const cartTotal = Math.max(0, subTotal - discount);

    // Simple tax calculation (inclusive or exclusive? usually exclusive in POS logic for clarity, but retail often inclusive. Let's assume Price is Base Price for now, or handle as per requirement. The schema has taxAmount. Let's assume Price is user entered selling price, and we calculate tax on top or back-calculate. For simplicity: Price is Base, Tax is extra.)
    // Actually retail in India is usually MRP (Inclusive).
    // Strategy: If MRP is entered, we back calculate tax.
    // For this v1, let's assume Price = Selling Price (Inclusive) and we just show tax breakup.
    const cartTax = cart.reduce((acc, item) => {
        // Tax = (Price * GST) / (100 + GST) * Qty
        const taxPerUnit = (item.price * item.gstRate) / (100 + item.gstRate);
        return acc + (taxPerUnit * item.quantity);
    }, 0);

    return (
        <CartContext.Provider
            value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartTax, setCart, discount, setDiscount }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
