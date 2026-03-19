import React from 'react';
import styles from './Card.module.css';

interface CardProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'form' | 'info' | 'blackSpace'; // Gør det muligt at tilføje ekstra margin udefra
}

export const Card = ({ children, onClick, variant = 'info' }: CardProps) => {
    const cardClass = `${styles.card} ${styles[variant]}`
    return (
        <div
            className={cardClass}
            onClick={onClick}
        >
            {children}
        </div>
    );
};