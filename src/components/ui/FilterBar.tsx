import React from 'react';
import { Input } from '@/components/ui/Input/Input';

interface FilterOption {
    label: string;
    value: string;
}

interface FilterBarProps {
    search?: string;
    onSearchChange?: (val: string) => void;
    placeholder?: string;

    // Optional filters
    filters?: {
        label: string;
        value: string;
        options: FilterOption[];
        onChange: (val: string) => void;
    }[];

    // Date Range
    startDate?: string;
    endDate?: string;
    onDateChange?: (start: string, end: string) => void;

    children?: React.ReactNode; // For extra buttons like "Add New"
}

export const FilterBar: React.FC<FilterBarProps> = ({
    search,
    onSearchChange,
    placeholder = "Search...",
    filters,
    startDate,
    endDate,
    onDateChange,
    children
}) => {
    return (
        <div style={{
            display: 'flex',
            gap: '1rem',
            background: 'white',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            alignItems: 'center'
        }}>
            {/* Search */}
            {onSearchChange && (
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <Input
                        placeholder={placeholder}
                        value={search || ''}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            )}

            {/* Dropdown Filters */}
            {filters?.map((f, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{f.label}</label>
                    <select
                        value={f.value}
                        onChange={(e) => f.onChange(e.target.value)}
                        style={{
                            padding: '0.5rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            background: '#f8fafc',
                            minWidth: '140px',
                            fontSize: '0.9rem'
                        }}
                    >
                        {f.options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            ))}

            {/* Date Range */}
            {onDateChange && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <label style={{ fontSize: '0.75rem', color: '#64748b' }}>From</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => onDateChange(e.target.value, endDate || '')}
                            style={{ padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <label style={{ fontSize: '0.75rem', color: '#64748b' }}>To</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => onDateChange(startDate || '', e.target.value)}
                            style={{ padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </div>
                </div>
            )}

            {/* Extra Buttons */}
            {children && (
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                    {children}
                </div>
            )}
        </div>
    );
};
