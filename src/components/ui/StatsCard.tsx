import React from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    color?: string;
    subtext?: string;
    size?: 'sm' | 'md';
    variant?: 'card' | 'mini';
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color = 'blue', subtext, size = 'md', variant = 'card' }) => {
    const textColors: any = {
        blue: '#1d4ed8',
        green: '#15803d',
        red: '#b91c1c',
        orange: '#c2410c',
        purple: '#7e22ce'
    };

    if (variant === 'mini') {
        const textColor = textColors[color] || '#1e293b';
        return (
            <div style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '0.35rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                fontSize: '0.85rem'
            }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>{title}:</span>
                <span style={{ fontWeight: 700, color: textColor }}>{value}</span>
            </div>
        );
    }

    const bgColors: any = {
        blue: '#eff6ff',
        green: '#f0fdf4',
        red: '#fef2f2',
        orange: '#fff7ed',
        purple: '#faf5ff'
    };
    /* ... existing card styles ... */
    const borderColors: any = {
        blue: '#bfdbfe',
        green: '#bbf7d0',
        red: '#fecaca',
        orange: '#fed7aa',
        purple: '#e9d5ff'
    };

    const isSmall = size === 'sm';

    return (
        <div style={{
            background: bgColors[color] || 'white',
            border: `1px solid ${borderColors[color] || '#e2e8f0'}`,
            borderRadius: '8px',
            padding: isSmall ? '0.75rem' : '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: isSmall ? '0.25rem' : '0.5rem',
            minWidth: isSmall ? '120px' : '200px',
            flex: isSmall ? '0 1 auto' : 1
        }}>
            <div style={{ fontSize: isSmall ? '0.75rem' : '0.875rem', color: '#64748b', fontWeight: 500 }}>{title}</div>
            <div style={{ fontSize: isSmall ? '1.1rem' : '1.5rem', fontWeight: 700, color: textColors[color] || '#1e293b' }}>
                {value}
            </div>
            {subtext && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{subtext}</div>}
        </div>
    );
};
