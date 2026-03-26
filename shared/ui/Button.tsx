import React from 'react';
import { theme } from '../config/theme';

export type ButtonProps = React.ComponentProps<'button'> & {
    icon?: React.ReactNode;
    fullWidth?: boolean;
    size?: 'sm' | 'md' | 'lg';
};

export const ButtonPrimary = ({ className = '', icon, children, size = 'md', fullWidth, ...props }: ButtonProps) => (
    <button 
        className={`${theme.button.base} ${theme.button.sizes[size] || theme.button.sizes.md} ${theme.button.primary} ${fullWidth ? 'w-full' : ''} ${className}`} 
        {...props}
    >
        {icon} {children}
    </button>
);

export const ButtonSecondary = ({ className = '', icon, children, size = 'md', fullWidth, ...props }: ButtonProps) => (
    <button 
        className={`${theme.button.base} ${theme.button.sizes[size] || theme.button.sizes.md} ${theme.button.secondary} ${fullWidth ? 'w-full' : ''} ${className}`} 
        {...props}
    >
        {icon} {children}
    </button>
);

export const ButtonDanger = ({ className = '', icon, children, size = 'md', fullWidth, ...props }: ButtonProps) => (
    <button 
        className={`${theme.button.base} ${theme.button.sizes[size] || theme.button.sizes.md} ${theme.button.danger} ${fullWidth ? 'w-full' : ''} ${className}`} 
        {...props}
    >
        {icon} {children}
    </button>
);