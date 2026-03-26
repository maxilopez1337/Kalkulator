
import React, { ReactNode } from 'react';
import { theme } from '../config/theme';

export const FormField = ({ label, children, hint }: { label: string; children?: React.ReactNode; hint?: string }) => (
  <div className="flex flex-col gap-1 w-full">
    <label className={theme.typography.label}>{label}</label>
    {children}
    {hint && <span className={theme.typography.hint}>{hint}</span>}
  </div>
);

export const Section = ({ title, children, className = '' }: { title?: ReactNode; children?: ReactNode; className?: string }) => (
    <div className={`${theme.layout.section} ${className}`}>
        {title && <div className={`${theme.typography.h2} mb-4 pb-2 border-b border-[#edebe9]`}>{title}</div>}
        {children}
    </div>
);
