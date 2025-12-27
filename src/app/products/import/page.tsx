'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import styles from './page.module.css';

export default function ImportProductsPage() {
    const [data, setData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [fileName, setFileName] = useState('');
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    const downloadTemplate = () => {
        const headers = ['name', 'sku', 'price', 'cost', 'stock', 'category', 'barcode'];
        const csvContent = headers.join(',') + '\n' + 'Example Product,SKU-001,100,50,10,General,12345678';
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'product_import_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setHeaders(results.meta.fields || []);
                setData(results.data);
            },
            error: (error) => {
                console.error('Error:', error);
                alert('Error parsing CSV');
            }
        });
    };

    const handleImport = async () => {
        if (data.length === 0) return;
        setUploading(true);

        // Normalize fields (map CSV headers to API expected fields)
        // Assumption: CSV Headers are somewhat standard or user matches them. 
        // We can add a mapper later. For now, we expect: name, sku, price, stock, category

        try {
            const res = await fetch('/api/products/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ products: data })
            });

            if (res.ok) {
                const result = await res.json();
                alert(`Successfully imported ${result.count} products!`);
                router.push('/products');
            } else {
                alert('Import Failed. Check console/logs.');
            }
        } catch (e) {
            console.error(e);
            alert('Import Error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Bulk Product Import</h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button variant="secondary" onClick={downloadTemplate}>Download Template</Button>
                    <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                </div>
            </div>

            <label className={styles.uploadArea}>
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                />
                <h3>{fileName || 'Click to Upload CSV'}</h3>
                <p>Supported columns: name, sku, price, cost, stock, category, barcode</p>
            </label>

            {data.length > 0 && (
                <div className={styles.previewSection}>
                    <h3>Previewing {data.length} items</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    {headers.map(h => <th key={h}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {data.slice(0, 5).map((row, i) => (
                                    <tr key={i}>
                                        {headers.map(h => <td key={h}>{row[h]}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {data.length > 5 && <p>...and {data.length - 5} more</p>}

                    <div className={styles.actions}>
                        <Button
                            variant="primary"
                            onClick={handleImport}
                            disabled={uploading}
                        >
                            {uploading ? 'Importing...' : 'Start Import'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
