'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import styles from './page.module.css';

export default function GSTReportPage() {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [report, setReport] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const generateReport = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reports/gst?from=${from}&to=${to}`);
            const data = await res.json();
            setReport(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const downloadCSV = () => {
        if (report.length === 0) return;

        const headers = ["Invoice No", "Date", "Customer", "Taxable Value", "Tax Amount", "Total"];
        const rows = report.map(r => [
            r.invoiceNo,
            new Date(r.date).toLocaleDateString(),
            r.customer,
            r.taxableValue.toFixed(2),
            r.taxAmount.toFixed(2),
            r.totalAmount.toFixed(2)
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "gst_report.csv");
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>GST Report (GSTR-1 Data)</h1>

            <Card className={styles.controls}>
                <div className={styles.dates}>
                    <Input label="From Date" type="date" value={from} onChange={e => setFrom(e.target.value)} />
                    <Input label="To Date" type="date" value={to} onChange={e => setTo(e.target.value)} />
                </div>
                <div className={styles.actions}>
                    <Button onClick={generateReport} disabled={loading}>{loading ? 'Generating...' : 'Generate Report'}</Button>
                    <Button variant="secondary" onClick={downloadCSV} disabled={report.length === 0}>Export CSV</Button>
                </div>
            </Card>

            <Card>
                <table>
                    <thead>
                        <tr>
                            <th>Invoice No</th>
                            <th>Date</th>
                            <th>Taxable</th>
                            <th>Tax</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.map(row => (
                            <tr key={row.id}>
                                <td>{row.invoiceNo}</td>
                                <td>{new Date(row.date).toLocaleDateString()}</td>
                                <td>{row.taxableValue.toFixed(2)}</td>
                                <td>{row.taxAmount.toFixed(2)}</td>
                                <td>{row.totalAmount.toFixed(2)}</td>
                            </tr>
                        ))}
                        {report.length === 0 && <tr><td colSpan={5} className={styles.empty}>No records found</td></tr>}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
