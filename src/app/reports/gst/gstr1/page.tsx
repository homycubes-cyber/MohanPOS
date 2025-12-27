'use client';

import React, { useState, useEffect } from 'react';
import styles from '../../sales/page.module.css';
import { Button } from '@/components/ui/Button/Button';

export default function GSTR1Page() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: new Date().getFullYear() + '-04-01', // GST Financial Year Start generally
        endDate: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        fetchReport();
    }, [filters.startDate, filters.endDate]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                start: filters.startDate,
                end: filters.endDate
            });
            const res = await fetch(`/api/reports/gst/gstr1?${params}`);
            const json = await res.json();
            setData(json);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    return (
        <div className={styles.container}>
            <div className={styles.filters}>
                <div className={styles.filterGroup}>
                    <label>From:</label>
                    <input type="date" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} style={{ padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                <div className={styles.filterGroup}>
                    <label>To:</label>
                    <input type="date" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} style={{ padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                <div className={styles.filterGroup}>
                    <Button variant="secondary" onClick={fetchReport}>Apply</Button>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>
                    <span>GSTR-1 (Outward Supplies)</span>
                    <Button size="sm" variant="outline">Export CSV</Button>
                </div>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Invoice No</th>
                                <th>Customer GSTIN</th>
                                <th>Receiver Name</th>
                                <th>Taxable Value</th>
                                <th>IGST</th>
                                <th>CGST</th>
                                <th>SGST</th>
                                <th>Total Tax</th>
                                <th>Total Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={10} style={{ textAlign: 'center' }}>Loading...</td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan={10} style={{ textAlign: 'center' }}>No GSTR-1 data found</td></tr>
                            ) : (
                                data.map((row, idx) => (
                                    <tr key={idx}>
                                        <td>{new Date(row.date).toLocaleDateString()}</td>
                                        <td>{row.invoiceNo}</td>
                                        <td>{row.gstin || '-'}</td>
                                        <td>{row.receiverName}</td>
                                        <td>₹ {row.taxableValue.toFixed(2)}</td>
                                        <td>₹ {row.igst.toFixed(2)}</td>
                                        <td>₹ {row.cgst.toFixed(2)}</td>
                                        <td>₹ {row.sgst.toFixed(2)}</td>
                                        <td>₹ {(row.igst + row.cgst + row.sgst).toFixed(2)}</td>
                                        <td>₹ {row.totalAmount.toFixed(2)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
