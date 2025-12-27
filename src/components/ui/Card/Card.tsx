import React from 'react';
import styles from './Card.module.css';

interface CardProps {
    children: React.ReactNode;
    className?: string; // Optional custom class
    title?: string;
    style?: React.CSSProperties; // Optional inline styles
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, style }) => {
    return (
        <div className={`${styles.card} ${className}`} style={style}>
            {title && <div className={styles.header}>{title}</div>}
            <div className={styles.body}>
                {children}
            </div>
        </div>
    );
};
