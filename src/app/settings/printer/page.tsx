'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Card } from '@/components/ui/Card/Card';
import styles from '../page.module.css';

interface PrinterConfig {
    pageSize: '58mm' | '80mm';
    theme: 'default' | 'modern' | 'minimal';
    headerText: string;
    footerText: string;
    showCompanyInfo: boolean;
    autoCut: boolean;
    openDrawer: boolean;
    copies: number;
    textSize: 'small' | 'medium' | 'large';
}

export default function PrinterConfigPage() {
    const [config, setConfig] = useState<PrinterConfig>({
        pageSize: '80mm',
        theme: 'default',
        headerText: '',
        footerText: '',
        showCompanyInfo: true,
        autoCut: true,
        openDrawer: true,
        copies: 1,
        textSize: 'medium'
    });

    useEffect(() => {
        const saved = localStorage.getItem('printerConfig');
        if (saved) setConfig(JSON.parse(saved));
    }, []);

    const handleSave = () => {
        localStorage.setItem('printerConfig', JSON.stringify(config));
        alert('Printer Settings Saved!');
    };

    // --- Preview Component ---
    const ReceiptPreview = () => {
        const width = config.pageSize === '58mm' ? '240px' : '320px'; // Approx screen px for mm
        const fontSize = config.textSize === 'small' ? '0.7rem' : config.textSize === 'large' ? '0.9rem' : '0.8rem';

        return (
            <div style={{
                width: width,
                background: '#fff',
                padding: '1rem',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                fontFamily: 'monospace',
                fontSize: fontSize,
                lineHeight: '1.2',
                color: '#000',
                margin: '0 auto',
                border: '1px solid #eee'
            }}>
                {/* Header */}
                {config.showCompanyInfo && (
                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '1.2em' }}>Mohan POS</div>
                        <div>123, Retail Street</div>
                        <div>Ph: 9876543210</div>
                    </div>
                )}
                {config.headerText && (
                    <div style={{ textAlign: 'center', marginBottom: '1rem', borderBottom: '1px dashed #000', paddingBottom: '0.5rem' }}>
                        {config.headerText}
                    </div>
                )}

                {/* Meta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Inv: INV-001</span>
                    <span>26/12/2025</span>
                </div>

                {/* Items */}
                <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '0.5rem 0', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', fontWeight: 'bold', marginBottom: '0.2rem' }}>
                        <span style={{ flex: 2 }}>Item</span>
                        <span style={{ flex: 1, textAlign: 'center' }}>Qty</span>
                        <span style={{ flex: 1, textAlign: 'right' }}>Amt</span>
                    </div>
                    {['Chocolate Cake', 'Milk Packet', 'Bread'].map((item, i) => (
                        <div key={i} style={{ display: 'flex', marginBottom: '0.2rem' }}>
                            <span style={{ flex: 2 }}>{item}</span>
                            <span style={{ flex: 1, textAlign: 'center' }}>1</span>
                            <span style={{ flex: 1, textAlign: 'right' }}>{(Math.random() * 100).toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                {/* Totals */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                    <div>Subtotal: 250.00</div>
                    <div>Tax: 12.50</div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1em', marginTop: '0.2rem' }}>Total: 262.50</div>
                </div>

                {/* Footer */}
                {config.footerText && (
                    <div style={{ textAlign: 'center', marginTop: '1rem', borderTop: '1px dashed #000', paddingTop: '0.5rem' }}>
                        {config.footerText}
                    </div>
                )}
                <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.8em' }}>
                    Thank you, visit again!
                </div>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Printer Configuration</h1>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>

                {/* Left Panel: Settings */}
                <div style={{ flex: '1 1 400px' }}>
                    <Card>
                        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Settings</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Page Size */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Page Size</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {['58mm', '80mm'].map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setConfig({ ...config, pageSize: size as any })}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                border: config.pageSize === size ? '2px solid #2563eb' : '1px solid #ccc',
                                                background: config.pageSize === size ? '#eff6ff' : '#fff',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                flex: 1
                                            }}
                                        >
                                            {size === '58mm' ? '2 Inch (58mm)' : '3 Inch (80mm)'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Text Size */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Text Size</label>
                                <select
                                    value={config.textSize}
                                    onChange={e => setConfig({ ...config, textSize: e.target.value as any })}
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }}
                                >
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                </select>
                            </div>

                            {/* Header/Footer Inputs */}
                            <Input
                                label="Receipt Header"
                                placeholder="Custom Header Text"
                                value={config.headerText}
                                onChange={e => setConfig({ ...config, headerText: e.target.value })}
                            />
                            <Input
                                label="Receipt Footer"
                                placeholder="Custom Footer Text"
                                value={config.footerText}
                                onChange={e => setConfig({ ...config, footerText: e.target.value })}
                            />

                            {/* Toggles */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={config.showCompanyInfo}
                                        onChange={e => setConfig({ ...config, showCompanyInfo: e.target.checked })}
                                    />
                                    Print Company Name & Address
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={config.autoCut}
                                        onChange={e => setConfig({ ...config, autoCut: e.target.checked })}
                                    />
                                    Auto Cut Paper
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={config.openDrawer}
                                        onChange={e => setConfig({ ...config, openDrawer: e.target.checked })}
                                    />
                                    Open Cash Drawer
                                </label>
                            </div>

                            <Button onClick={handleSave} style={{ marginTop: '1rem' }}>Save Configuration</Button>
                        </div>
                    </Card>
                </div>

                {/* Right Panel: Preview */}
                <div style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                    <div style={{ position: 'sticky', top: '2rem' }}>
                        <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: '#64748b' }}>Live Preview</h3>
                        <ReceiptPreview />
                    </div>
                </div>

            </div>
        </div>
    );
}
