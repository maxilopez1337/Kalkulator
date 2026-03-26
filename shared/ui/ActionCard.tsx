import React from 'react';
import { shadow } from '../config/theme';

interface ActionCardProps {
  onClick: () => void;
  /** Icon node, e.g. <FileText /> */
  icon: React.ReactNode;
  /** Tailwind bg + text classes for the icon pill, e.g. 'bg-blue-50 text-blue-600' */
  iconClass: string;
  title: string;
  subtitle?: string;
  /** Tailwind hover border class, e.g. 'hover:border-[#0078d4]' */
  hoverBorderClass?: string;
  className?: string;
}

/**
 * Clickable action tile: icon pill + title + optional subtitle.
 * Used in StepDashboard quick-action grid.
 */
export const ActionCard = ({
  onClick,
  icon,
  iconClass,
  title,
  subtitle,
  hoverBorderClass = 'hover:border-[#0078d4]',
  className = '',
}: ActionCardProps) => (
  <button
    onClick={onClick}
    className={`bg-white p-2.5 md:p-5 rounded-md border border-[#edebe9] ${shadow.elevation4} ${hoverBorderClass} hover:shadow-[0_3.2px_7.2px_0_rgba(0,0,0,0.13),0_0.6px_1.8px_0_rgba(0,0,0,0.11)] transition-all group text-left ${className}`}
  >
    <div className={`w-8 h-8 md:w-12 md:h-12 ${iconClass} rounded-md flex items-center justify-center mb-2 md:mb-4 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <div className="font-bold text-[#201f1e] text-[11px] md:text-sm leading-tight">{title}</div>
    {subtitle && <div className="hidden md:block text-xs text-[#605e5c] mt-1">{subtitle}</div>}
  </button>
);
