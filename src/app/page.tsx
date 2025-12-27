'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card/Card';
import Link from 'next/link';
import styles from './page.module.css';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  if (loading) return <div className={styles.container}>Loading Dashboard...</div>;

  // Simulate Chart Data (Last 7 Days)
  const chartData = [45, 70, 30, 85, 50, 60, stats?.todaySales || 40];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
  const maxVal = Math.max(...chartData, 100);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.welcome}>
          <h1>Dashboard</h1>
          <p>Welcome back, here's what's happening today.</p>
        </div>
        <div className={styles.date}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className={styles.statsGrid}>
        {/* Total Revenue */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon} style={{ background: '#e0e7ff', color: '#4361ee' }}>₹</div>
            <span className={`${styles.trend} ${styles.trendUp}`}>+12%</span>
          </div>
          <div>
            <div className={styles.statValue}>₹{stats.todaySales?.toFixed(2) || '0.00'}</div>
            <div className={styles.statLabel}>Total Revenue (Today)</div>
          </div>
        </div>

        {/* Orders */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon} style={{ background: '#dcfce7', color: '#16a34a' }}>📦</div>
            {/* <span className={`${styles.trend} ${styles.trendUp}`}>+5%</span> */}
          </div>
          <div>
            <div className={styles.statValue}>{Math.round(stats.todaySales / 500) || 0}</div> {/* Mock Order Count */}
            <div className={styles.statLabel}>Orders Today</div>
          </div>
        </div>

        {/* Products */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon} style={{ background: '#f3e8ff', color: '#9333ea' }}>🛍️</div>
          </div>
          <div>
            <div className={styles.statValue}>{stats.totalProducts || 0}</div>
            <div className={styles.statLabel}>Total Products</div>
          </div>
        </div>

        {/* Low Stock */}
        <div className={styles.statCard} style={{ borderLeft: stats.lowStock > 0 ? '4px solid #ef4444' : 'none' }}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon} style={{ background: '#fee2e2', color: '#ef4444' }}>⚠️</div>
          </div>
          <div>
            <div className={styles.statValue}>{stats.lowStock || 0}</div>
            <div className={styles.statLabel}>Low Stock Items</div>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Visual Chart */}
        <div className={styles.chartSection}>
          <h3 className={styles.sectionHeader}>Sales Overview (Last 7 Days)</h3>
          <div className={styles.bars}>
            {chartData.map((val, idx) => (
              <div key={idx} className={styles.barCol}>
                <div
                  className={styles.bar}
                  style={{ height: `${(val / maxVal) * 100}%` }}
                  title={`Sales: ₹${val}`}
                />
                <span className={styles.barLabel}>{days[idx]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={styles.recentSection}>
          <h3 className={styles.sectionHeader}>Recent Transactions</h3>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSales.map((sale: any) => (
                  <tr key={sale.id}>
                    <td>{sale.invoiceNo}</td>
                    <td>₹{sale.totalAmount.toFixed(2)}</td>
                    <td><span className={`${styles.status} ${styles.statusCompleted}`}>Completed</span></td>
                  </tr>
                ))}
                {stats.recentSales.length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: '#94a3b8' }}>No recent sales</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <Link href="/sales" style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '0.9rem' }}>View All Sales &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
