import React from 'react';

const variantStyles = {
  info: {
    wrapper: 'bg-[#f3f2f1] border-[#edebe9] text-[#a19f9d]',
    icon: 'text-[#a19f9d]',
  },
  warning: {
    wrapper: 'bg-[#fff4ce] border-[#fde5c4] text-[#323130]',
    icon: 'text-[#797775]',
  },
  'warning-amber': {
    wrapper: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: 'text-amber-600',
  },
  success: {
    wrapper: 'bg-[#dff6dd] border-[#bad80a]/40 text-[#107c10]',
    icon: 'text-[#107c10]',
  },
} as const;

interface AlertProps {
  variant?: keyof typeof variantStyles;
  icon?: React.ReactNode;
  children: React.ReactNode;
  /** Extra Tailwind classes on the wrapper */
  className?: string;
  /** Padding, default 'p-4' */
  padding?: string;
  /** Font size, default 'text-xs' */
  textSize?: string;
}

/**
 * Info / warning / success alert box.
 * Struktura: ikona + treść obok siebie.
 */
export const Alert = ({
  variant = 'info',
  icon,
  children,
  className = '',
  padding = 'p-4',
  textSize = 'text-xs',
}: AlertProps) => {
  const styles = variantStyles[variant];
  return (
    <div
      className={`${padding} border rounded-sm ${textSize} ${styles.wrapper} flex gap-3 items-start leading-relaxed ${className}`}
    >
      {icon && (
        <span className={`flex-shrink-0 mt-0.5 ${styles.icon}`}>{icon}</span>
      )}
      <div>{children}</div>
    </div>
  );
};
