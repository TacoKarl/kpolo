import React from 'react';
import styles from './Card.module.css';

interface CardProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'form' | 'info' | 'blackSpace'; // Gør det muligt at tilføje ekstra margin udefra
    hoverable?: boolean;
    className?: string;
}

export const Card = ({ children, onClick, variant = 'info', hoverable = true, className = '' }: CardProps) => {
    const cardClass = `${styles.card} ${styles[variant]} ${hoverable ? styles.hoverable : ''} ${className}`;
    return (
        <div
            className={cardClass}
            onClick={onClick}
        >
            {children}
        </div>
    );
};