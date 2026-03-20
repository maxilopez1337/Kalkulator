import React from 'react';

interface SectionLabelProps {
  children: React.ReactNode;
  /** Tailwind text-color class, default 'text-slate-400' */
  color?: string;
  /** Extra Tailwind classes (e.g. 'mb-1', 'mb-1.5', 'tracking-wide') */
  className?: string;
}

/**
 * Etykieta sekcji / pola KPI.
 * Wzorzec: text-[10px] font-bold uppercase tracking-wider
 */
export const SectionLabel = ({
  children,
  color = 'text-slate-400',
  className = '',
}: SectionLabelProps) => (
  <div className={`text-[10px] font-bold uppercase tracking-wider ${color} ${className}`}>
    {children}
  </div>
);
