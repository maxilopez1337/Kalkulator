
import React, { ReactNode } from 'react';
import { theme } from '../config/theme';

interface BadgeProps {
    children?: ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
    className?: string;
}

export const Badge = ({ children, variant = 'neutral', className = '' }: BadgeProps) => (
    <span className={`${theme.badge.base} ${theme.badge.variants[variant]} ${className}`}>
        {children}
    </span>
);
