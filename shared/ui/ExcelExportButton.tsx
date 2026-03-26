
import React from 'react';
import { Wallet } from '../icons/Icons';

interface ExcelExportButtonProps {
    onClick: () => void;
}

export const ExcelExportButton: React.FC<ExcelExportButtonProps> = ({ onClick }) => (
    <div className="flex items-center border-l border-[#edebe9] px-3 shrink-0">
        <button
            onClick={onClick}
            className="flex items-center gap-1.5 px-3 h-[30px] text-[12px] font-medium text-[#323130] bg-white border border-[#8a8886] hover:bg-[#f3f2f1] active:bg-[#edebe9] transition-colors whitespace-nowrap"
        >
            <Wallet className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Eksportuj do Excel</span>
            <span className="md:hidden">Excel</span>
        </button>
    </div>
);
