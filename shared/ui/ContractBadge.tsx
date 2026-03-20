import React from 'react';
import { theme } from '../../common/theme';

type TypUmowy = 'UOP' | 'B2B' | 'UZ' | 'MIX' | string;

const variantMap: Record<string, string> = {
  UOP: theme.badge.variants.primary,   // Fluent blue
  B2B: theme.badge.variants.warning,   // Amber
  UZ: theme.badge.variants.neutral,    // Grey
  MIX: theme.badge.variants.secondary, // Neutral dark
};

interface ContractBadgeProps {
  typUmowy: TypUmowy;
  className?: string;
}

/**
 * Wyświetla typ umowy (UOP / B2B / UZ / MIX) jako spójny Fluent badge.
 * Zastępuje inline <span> z hardkodowanymi klasami warunkowymi.
 */
export const ContractBadge = ({ typUmowy, className = '' }: ContractBadgeProps) => {
  const colorClasses = variantMap[typUmowy] ?? theme.badge.variants.neutral;
  return (
    <span className={`${theme.badge.base} ${colorClasses} ${className}`}>
      {typUmowy}
    </span>
  );
};
