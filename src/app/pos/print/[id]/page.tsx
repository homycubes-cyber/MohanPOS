'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function PrintInvoicePage() {
    const params = useParams();
    const [invoice, setInvoice] = useState<any>(null);
    const [store, setStore] = useState<any>(null);
    const [config, setConfig] = useState<any>({
        pageSize: '80mm',
        textSize: 'medium',
        showCompanyInfo: true,
        headerText: '',
        footerText: ''
    });

    useEffect(() => {
        // 1. Fetch Invoice
        if (params.id) {
            fetch(`/api/invoices/${params.id}`)
                .then(res => res.json())
                .then(setInvoice);
        }

        // 2. Fetch Store Profile
        fetch('/api/settings/store')
            .then(res => res.json())
            .then(setStore);

        // 3. Load Printer Config
        const savedConfig = localStorage.getItem('printerConfig');
        if (savedConfig) {
            setConfig(JSON.parse(savedConfig));
        }
    }, [params.id]);

    useEffect(() => {
        if (invoice && store) {
            // Auto Print after short delay to render
            setTimeout(() => {
                window.print();
            }, 800);
        }
    }, [invoice, store]);

    if (!invoice || !store) return <div style={{ padding: '20px' }}>Loading Receipt...</div>;

    // Dynamic Styles based on Config
    const width = config.pageSize === '58mm' ? '58mm' : '80mm';
    // For print media, we usually set width to 100% of the page size, but let's constrain it wrapper
    const fontSize = config.textSize === 'small' ? '10px' : config.textSize === 'large' ? '14px' : '12px';

    return (
        <>
            <style jsx global>{`
                @page {
                    size: ${config.pageSize === '58mm' ? '58mm' : '80mm'} auto;
                    margin: 0;
                }
                body {
                    margin: 0;
                    padding: 0;
                    background: #fff;
                }
            `}</style>

            <div style={{
                width: width,
                maxWidth: '100%',
                padding: '10px',
                fontFamily: 'Courier New, monospace', // Thermal printers like monospace
                fontSize: fontSize,
                lineHeight: '1.2',
                color: '#000'
            }}>
                {/* Header */}
                {config.showCompanyInfo && (
                    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '1.2em' }}>{store.storeName || 'Mohan POS'}</div>
                        <div>{store.address}</div>
                        {store.city && <div>{store.city} - {store.pincode}</div>}
                        {store.phone && <div>Ph: {store.phone}</div>}
                    </div>
                )}

                {config.headerText && (
                    <div style={{ textAlign: 'center', marginBottom: '10px', borderBottom: '1px dashed #000', paddingBottom: '5px' }}>
                        {config.headerText}
                    </div>
                )}

                {/* Metadata */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Inv: {invoice.invoiceNo}</span>
                    <span>{new Date(invoice.createdAt).toLocaleDateString()}</span>
                </div>
                {invoice.customer && (
                    <div style={{ marginBottom: '8px', borderBottom: '1px dashed #000', paddingBottom: '5px' }}>
                        Cust: {invoice.customer.name} ({invoice.customer.phone})
                    </div>
                )}

                {/* Items Table */}
                <div style={{ borderBottom: '1px dashed #000', paddingBottom: '5px', marginBottom: '5px' }}>
                    <div style={{ display: 'flex', fontWeight: 'bold', marginBottom: '2px' }}>
                        <span style={{ flex: 1.5, overflow: 'hidden', whiteSpace: 'nowrap' }}>Item</span>
                        <span style={{ flex: 0.5, textAlign: 'center' }}>Qty</span>
                        <span style={{ flex: 1, textAlign: 'right' }}>Amt</span>
                    </div>
                    {invoice.items.map((item: any, i: number) => (
                        <div key={i} style={{ display: 'flex', marginBottom: '2px' }}>
                            <span style={{ flex: 1.5, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                {item.product.name}
                            </span>
                            <span style={{ flex: 0.5, textAlign: 'center' }}>{item.quantity}</span>
                            <span style={{ flex: 1, textAlign: 'right' }}>{item.total.toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                {/* Financials */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', borderBottom: '1px dashed #000', paddingBottom: '5px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                        <span>Subtotal:</span>
                        <span>{((invoice.totalAmount - invoice.taxAmount)).toFixed(2)}</span>
                    </div>
                    {invoice.discount > 0 && (
                        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                            <span>Discount:</span>
                            <span>-{invoice.discount}</span>
                        </div>
                    )}
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                        <span>Tax:</span>
                        <span>{invoice.taxAmount.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1em', marginTop: '4px' }}>
                        <span>Total:</span>
                        <span>{invoice.totalAmount.toFixed(2)}</span>
                    </div>
                </div>

                {/* Footer */}
                {config.footerText && (
                    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                        {config.footerText}
                    </div>
                )}

                <div style={{ textAlign: 'center', fontSize: '0.9em' }}>
                    Thank you, visit again!
                </div>
            </div>
        </>
    );
}
