import React from 'react';
import { Search, X } from '../../common/Icons';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Tailwind width class, default 'w-full' */
  width?: string;
  /** Extra Tailwind classes on the wrapper div */
  className?: string;
}

/**
 * Ujednolicone pole wyszukiwania z ikoną Search i przyciskiem X (clear).
 * Zastępuje 4 inline wzorce w aplikacji.
 */
export const SearchInput = ({
  value,
  onChange,
  placeholder = 'Szukaj...',
  width = 'w-full',
  className = '',
}: SearchInputProps) => (
  <div className={`relative ${width} ${className}`}>
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
      <Search />
    </div>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-9 pr-9 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
    />
    {value && (
      <button
        onClick={() => onChange('')}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        aria-label="Wyczyść"
      >
        <X />
      </button>
    )}
  </div>
);
