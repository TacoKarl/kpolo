import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'outline';
    inactive?: boolean;
}

export const Button = ({ children,
                           variant = 'primary',
                           className,
                           inactive = false,
                           ...props
                       }: ButtonProps) => {
    const buttonClass = `${styles.btn} ${styles[variant]} ${inactive ? styles.inactive : ''} ${className ?? ''}`;

    return (
        <button className={buttonClass} {...props} disabled={inactive || props.disabled}>
            {children}
        </button>
    );
};