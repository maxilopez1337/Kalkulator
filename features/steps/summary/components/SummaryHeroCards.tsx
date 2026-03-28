import React from 'react';
import { Building, TrendingUp, TrendingDown } from '../../../../shared/icons/Icons';
import { shadow } from '../../../../shared/config/theme';
import { formatPLN } from '../../../../shared/utils/formatters';

interface SummaryHeroCardsProps {
    kpiStandardKoszt: number;
    kpiNowyKoszt: number;
    kpiOszczednoscRok: number;
    kpiOszczednoscMies: number;
    costReductionPercent: number;
}

export const SummaryHeroCards = ({
    kpiStandardKoszt,
    kpiNowyKoszt,
    kpiOszczednoscRok,
    kpiOszczednoscMies,
    costReductionPercent,
}: SummaryHeroCardsProps) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* A. PAST (STANDARD) - Neutral/Grey Theme */}
        <div className={`bg-[#f8fafc] p-5 rounded-md border border-[#edebe9] ${shadow.elevation4} flex flex-col justify-between h-full relative overflow-hidden`}>
            <div className="flex justify-between items-start mb-2">
                <div className="text-[10px] font-bold text-[#a19f9d] uppercase tracking-wider">Koszt Obecny</div>
                <div className="p-1.5 bg-white rounded-sm text-[#a19f9d] border border-[#edebe9]"><Building className="w-4 h-4" /></div>
            </div>
            <div>
                <div className="text-2xl font-bold text-[#605e5c] tabular-nums">{formatPLN(kpiStandardKoszt)}</div>
                <div className="text-[10px] text-[#a19f9d] mt-1 font-medium">Aktualny Koszt Zatrudnienia</div>
            </div>
        </div>

        {/* B. FUTURE (ELITON) - Professional/Blue Theme */}
        <div className={`bg-white p-5 rounded-md border border-[#edebe9] border-l-4 border-l-[#0078d4] ${shadow.elevation4} flex flex-col justify-between h-full relative overflow-hidden`}>
            <div className="flex justify-between items-start mb-2">
                <div className="text-[10px] font-bold text-[#a19f9d] uppercase tracking-wider">Nowy Koszt</div>
                <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded text-[10px] font-bold text-blue-600">
                    <TrendingDown className="w-3 h-3" />
                    <span>{costReductionPercent.toFixed(1)}%</span>
                </div>
            </div>
            <div>
                <div className="text-2xl font-bold text-[#201f1e] tabular-nums">{formatPLN(kpiNowyKoszt)}</div>
                <div className="text-[10px] text-[#605e5c] mt-1 font-medium">Model Eliton Prime™</div>
            </div>
        </div>

        {/* C. RESULT (SAVINGS) */}
        <div className={`bg-white border border-[#edebe9] border-l-4 border-l-[#107c10] p-5 rounded-md ${shadow.elevation4} flex flex-col justify-between h-full`}>
            <div className="flex justify-between items-start mb-2">
                <div className="text-[10px] font-bold text-[#a19f9d] uppercase tracking-wider">Oszczędność Roczna</div>
                <div className="p-1.5 bg-emerald-50 rounded-md text-emerald-600"><TrendingUp className="w-4 h-4" /></div>
            </div>
            <div>
                <div className="text-3xl font-extrabold text-emerald-700 tracking-tight tabular-nums">{formatPLN(kpiOszczednoscRok)}</div>
                <div className="flex items-center gap-2 mt-1.5">
                    <span className="bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-medium border border-emerald-100 text-emerald-700">
                        Miesięcznie: {formatPLN(kpiOszczednoscMies)}
                    </span>
                </div>
            </div>
        </div>
    </div>
);
