import React from 'react';
import { cx } from '../utils/cx';

const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-purple-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-indigo-600',
];

interface AvatarProps {
  name: string;
  surname: string;
  /**
   * Override the auto-color + border classes.
   * The base layout (w-10 h-10, rounded-full, flex, font-bold, flex-shrink-0) is always applied.
   *
   * Example for a neutral variant:
   *   colorClass="bg-slate-100 text-slate-500 border border-slate-200"
   */
  colorClass?: string;
  /** Additional classes appended after all others (e.g. responsive size overrides). */
  className?: string;
}

/**
 * Employee initials avatar.
 * Defaults to a deterministic colour based on name length.
 */
export const Avatar = ({ name, surname, colorClass, className = '' }: AvatarProps) => {
  const initials = `${name?.[0] || ''}${surname?.[0] || ''}`.toUpperCase();
  const autoColor = AVATAR_COLORS[(name.length + surname.length) % AVATAR_COLORS.length];
  const color = colorClass ?? `${autoColor} text-white border-2 border-white shadow-sm`;

  return (
    <div
      className={cx('w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold tracking-wide flex-shrink-0', color, className || undefined)}
    >
      {initials || '?'}
    </div>
  );
};
