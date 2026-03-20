import React from 'react';
import { shadow } from '../../common/theme';

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  /** Optional left-border accent color, e.g. 'bg-blue-500' */
  accent?: string;
  /** 'light' = bg-white (default), 'dark' = bg-slate-900 text-white */
  variant?: 'light' | 'dark';
  /** Extra Tailwind classes on the wrapper */
  className?: string;
  /** Numeric delta for trend display (e.g. -1200 = savings of 1200) */
  delta?: number;
  /** Label next to the delta badge, e.g. "vs. mies. poprzedni" */
  deltaLabel?: string;
  /** When true, negative delta = green (good), positive = red (bad) — e.g. costs */
  deltaInverse?: boolean;
}

/**
 * KPI tile: etykieta + wartość + ikona.
 * Wspólny wzorzec w StepWynikStandard, StepAnalizaPracownika i podobnych.
 */
export const KpiCard = ({
  label,
  value,
  icon,
  accent,
  variant = 'light',
  className = '',
  delta,
  deltaLabel,
  deltaInverse = false,
}: KpiCardProps) => {
  const isDark = variant === 'dark';

  // Determine trend direction and color
  const hasDelta = delta !== undefined && delta !== 0;
  const isPositive = delta !== undefined && delta > 0;
  // deltaInverse: positive delta = bad (e.g. costs going up)
  const trendGood = deltaInverse ? !isPositive : isPositive;
  const trendColor = hasDelta
    ? trendGood
      ? isDark ? 'bg-green-500/20 text-green-300' : 'bg-[#dff6dd] text-[#107c10]'
      : isDark ? 'bg-red-500/20 text-red-300' : 'bg-[#fde7e9] text-[#a80000]'
    : '';
  const trendArrow = hasDelta ? (isPositive ? '↑' : '↓') : '';
  const deltaAbs = hasDelta ? Math.abs(delta!) : 0;
  const deltaFormatted = deltaAbs >= 1000
    ? deltaAbs.toLocaleString('pl-PL', { maximumFractionDigits: 0 })
    : deltaAbs.toLocaleString('pl-PL', { maximumFractionDigits: 2 });

  return (
    <div
      className={`p-5 rounded-md border ${shadow.elevation4} flex items-center justify-between relative overflow-hidden
        ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-[#edebe9]'}
        ${className}`}
    >
      {accent && <div className={`absolute left-0 top-0 bottom-0 w-1 ${accent}`} />}
      <div className="min-w-0">
        <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {label}
        </div>
        <div className={`text-2xl font-bold ${isDark ? 'text-white' : ''}`}>
          {value}
        </div>
        {hasDelta && (
          <div className={`mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold ${trendColor}`}>
            <span>{trendArrow}</span>
            <span>{deltaFormatted}</span>
            {deltaLabel && <span className="font-normal opacity-70">{deltaLabel}</span>}
          </div>
        )}
      </div>
      {icon && (
        <div className={`p-3 rounded-lg shrink-0 ${isDark ? 'bg-white/10 text-white' : ''}`}>
          {icon}
        </div>
      )}
    </div>
  );
};
