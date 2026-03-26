
import React, { ReactNode } from 'react';
import { theme } from '../config/theme';

interface CardProps {
    title?: string;
    icon?: ReactNode;
    actions?: ReactNode;
    children?: ReactNode;
    className?: string;
    noPadding?: boolean;
}

export const Card = ({ title, icon, actions, children, className = '', noPadding = false }: CardProps) => (
    <div className={`${theme.card.base} ${className}`}>
        {(title || icon || actions) && (
            <div className={theme.card.header}>
                <div className="flex items-center gap-3">
                    {icon && <div className="p-1.5 bg-[#eff6fc] rounded-sm text-[#0078d4]">{icon}</div>}
                    {title && <h2 className={theme.typography.h1}>{title}</h2>}
                </div>
                {actions && <div className="flex gap-2">{actions}</div>}
            </div>
        )}
        <div className={noPadding ? theme.card.noPaddingBody : theme.card.body}>
            {children}
        </div>
    </div>
);
