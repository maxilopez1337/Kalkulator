
import React from 'react';

interface TableToolbarProps {
    compact: boolean;
    onCompact: (compact: boolean) => void;
    allOpen: boolean;
    onToggleAll: () => void;
}

export const TableToolbar = ({ compact, onCompact, allOpen, onToggleAll }: TableToolbarProps) => (
    <div className="flex items-stretch bg-[#f8f9fa] border-b border-[#edebe9] flex-shrink-0 h-[34px]">
        <span className="flex items-center text-[11px] font-semibold text-[#a19f9d] uppercase tracking-widest px-3 select-none border-r border-[#edebe9]">Widok</span>
        <button
            onClick={() => onCompact(false)}
            className={`flex items-center gap-1 px-4 h-full text-[12px] font-medium border-b-2 transition-all ${
                !compact ? 'border-[#0078d4] text-[#0078d4]' : 'border-transparent text-[#605e5c] hover:text-[#323130] hover:border-[#c8c6c4]'
            }`}
        >
            <span className="text-[10px]">⊞</span> Komfort
        </button>
        <button
            onClick={() => onCompact(true)}
            className={`flex items-center gap-1 px-4 h-full text-[12px] font-medium border-b-2 transition-all ${
                compact ? 'border-[#0078d4] text-[#0078d4]' : 'border-transparent text-[#605e5c] hover:text-[#323130] hover:border-[#c8c6c4]'
            }`}
        >
            <span className="text-[10px]">≡</span> Kompakt
        </button>
        <div className="flex-1" />
        <button
            onClick={onToggleAll}
            className="flex items-center px-4 h-full text-[12px] text-[#0078d4] hover:text-[#106ebe] hover:underline transition-colors whitespace-nowrap border-l border-[#edebe9]"
        >
            {allOpen ? '← Zwiń wszystkie' : '→ Rozwiń wszystkie'}
        </button>
    </div>
);
