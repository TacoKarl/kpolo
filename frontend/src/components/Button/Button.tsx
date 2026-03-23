import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'outline';
}

export const Button = ({ children,
                           variant = 'primary',
                           className,
                           ...props
                       }: ButtonProps) => {
    const buttonClass = `${styles.btn} ${styles[variant]} ${className ?? ''}`;

    return (
        <button className={buttonClass} {...props}>
            {children}
        </button>
    );
};