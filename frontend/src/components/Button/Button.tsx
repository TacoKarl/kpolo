import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
    children: React.ReactNode;
    variant?: 'green' | 'red' | 'outline'; // Valgfri prop
}
export const Button = ({ children, variant = 'primary' }: ButtonProps) => {
    const buttonClass = `${styles.btn} ${styles[variant]}`;

    return (
        <button className={buttonClass}>
            {children}
        </button>
    );
};