import React from 'react';
import { ShieldCheck, Check as CheckIcon } from '../../../../shared/icons/Icons';
import { formatPLN } from '../../../../shared/utils/formatters';
import { animations } from '../../../../shared/config/theme';

interface StandardCardProps {
    activeCard: 'STANDARD' | 'PRIME';
    customStandardRate: number;
    profitStandardCalc: number;
    isCustomStandard: boolean;
    onSelectStandard: () => void;
    onChangeStandardRate: (val: number) => void;
}

export const StandardCard: React.FC<StandardCardProps> = ({
    activeCard,
    customStandardRate,
    profitStandardCalc,
    isCustomStandard,
    onSelectStandard,
    onChangeStandardRate,
}) => (
    <div
        onClick={onSelectStandard}
        className={`lg:col-span-5 relative p-6 rounded-md flex flex-col border cursor-pointer transition-all ${animations.standard}
            ${activeCard === 'STANDARD'
                ? 'bg-white border-blue-500 ring-4 ring-blue-500/10 shadow-xl scale-[1.01] z-10'
                : 'bg-white border-[#edebe9] hover:border-blue-200 shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),0_0.3px_0.9px_0_rgba(0,0,0,0.11)] opacity-80 hover:opacity-100 hover:scale-[1.005]'
            }`}
    >
        {activeCard === 'STANDARD' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                <CheckIcon className="w-3 h-3" /> Wybrany Scenariusz
            </div>
        )}

        <div className="flex justify-between items-start mb-4">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className={`w-4 h-4 ${activeCard === 'STANDARD' ? 'text-blue-500' : 'text-[#a19f9d]'}`} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${activeCard === 'STANDARD' ? 'text-blue-600' : 'text-[#a19f9d]'}`}>Wariant Podstawowy</span>
                </div>
                <h3 className={`text-xl font-bold ${activeCard === 'STANDARD' ? 'text-[#201f1e]' : 'text-[#323130]'}`}>
                    Eliton Prime™
                </h3>
            </div>

            {/* EDITABLE INPUT STANDARD */}
            <div className="flex flex-col items-end" onClick={(e) => e.stopPropagation()}>
                <div className="relative group">
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={customStandardRate}
                        onChange={(e) => onChangeStandardRate(Number(e.target.value))}
                        className="text-3xl font-black text-[#a19f9d] text-right w-24 bg-transparent outline-none border-b-2 border-transparent hover:border-[#c8c6c4] focus:border-blue-500 focus:text-blue-600 transition-all"
                    />
                    <span className="absolute top-1 right-0 text-xs font-bold text-[#c8c6c4] pointer-events-none">%</span>
                </div>
                {isCustomStandard && (
                    <span className="text-[10px] font-bold text-[#605e5c] bg-[#f3f2f1] px-2 py-0.5 rounded-sm mt-1 animate-in fade-in">
                        Zmieniono (Indywidualna)
                    </span>
                )}
            </div>
        </div>

        <div className="flex-1">
            <ul className="space-y-3 text-sm text-[#605e5c]">
                <li className="flex gap-3 items-start">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#c8c6c4] shrink-0"></span>
                    <span>Całość efektu finansowego trafia do firmy (<strong>100%</strong>)</span>
                </li>
                <li className="flex gap-3 items-start">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#c8c6c4] shrink-0"></span>
                    <span>Wynagrodzenie pracownika pozostaje bez zmian (Netto)</span>
                </li>
                <li className="flex gap-3 items-start">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#c8c6c4] shrink-0"></span>
                    <span>Opłata serwisowa EBS: <strong className="text-[#605e5c]">{customStandardRate}%</strong></span>
                </li>
            </ul>
        </div>

        <div className="mt-6 pt-4 border-t border-[#edebe9]">
            <div className="text-xs text-[#a19f9d] mb-1 font-medium">Miesięczna oszczędność  netto dla Twojej firmy</div>
            <div className={`text-2xl font-bold ${activeCard === 'STANDARD' ? 'text-blue-600' : 'text-[#a19f9d] grayscale'}`}>
                {formatPLN(profitStandardCalc)}
            </div>
        </div>
    </div>
);
