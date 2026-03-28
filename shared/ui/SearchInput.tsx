import React from 'react';
import { Search, X } from '../icons/Icons';

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
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a19f9d] pointer-events-none">
      <Search />
    </div>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-9 pr-9 py-2 text-sm border border-[#edebe9] rounded-sm bg-[#f3f2f1] focus:bg-white focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4] outline-none transition-all"
    />
    {value && (
      <button
        onClick={() => onChange('')}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#a19f9d] hover:text-[#605e5c]"
        aria-label="Wyczyść"
      >
        <X />
      </button>
    )}
  </div>
);
