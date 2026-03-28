import React from 'react';
import { Users, PieChart, TrendingUp, ShieldCheck } from '../../../../shared/icons/Icons';
import { formatPLN } from '../../../../shared/utils/formatters';

type ContractType = 'UOP' | 'UZ' | 'MIXED';

interface SimulationResult {
    countUOP: number;
    countUZ: number;
    totalStd: number;
    totalNew: number;
    totalProv: number;
    savings: number;
    monthlySavings: number;
    yearlySavings: number;
    perEmployeeSavings: number;
    avgBruttoStd: number;
    avgZusStd: number;
    avgBruttoNowy: number;
    avgZusNowy: number;
    avgEbs: number;
}

interface SimulacjaResultPanelProps {
    mobileTab: 'params' | 'results';
    simulation: SimulationResult;
    empCount: number;
    contractType: ContractType;
    mixUOP: number;
    mixUZClamped: number;
    prowizjaStandard: number;
}

export const SimulacjaResultPanel = ({
    mobileTab,
    simulation,
    empCount,
    contractType,
    mixUOP,
    mixUZClamped,
    prowizjaStandard,
}: SimulacjaResultPanelProps) => {
    return (
        <div className={`xl:flex-1 bg-[#f3f2f1] p-2.5 md:p-4 xl:p-5 xl:overflow-hidden flex-col overflow-y-auto xl:overflow-hidden ${mobileTab === 'params' ? 'hidden xl:flex' : 'flex'}`}>

            <div className="max-w-5xl mx-auto w-full flex flex-col gap-2 md:gap-3 xl:flex-1 xl:min-h-0">

                {/* 1. HERO KPI CARDS */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 md:gap-3 flex-shrink-0">

                    {/* CARD A: MONTHLY — full width on mobile */}
                    <div className="col-span-2 md:col-span-1 bg-white rounded-md p-2.5 md:p-3.5 border border-[#edebe9] shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),0_0.3px_0.9px_0_rgba(0,0,0,0.11)]">
                        <div className="flex justify-between items-start mb-1 md:mb-2">
                            <div>
                                <div className="text-[10px] font-bold text-[#a19f9d] uppercase tracking-widest">Oszczędność Miesięczna</div>
                                <div className="hidden md:block text-xs text-[#605e5c] font-medium mt-0.5">Po wypłaceniu podwyżek</div>
                            </div>
                            <div className="p-1 md:p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
                                <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </div>
                        </div>
                        <div className="text-xl md:text-2xl font-extrabold text-[#201f1e] tracking-tight tabular-nums">
                            {formatPLN(simulation.monthlySavings)}
                        </div>
                        <div className="hidden md:inline-flex mt-1.5 items-center gap-1.5 px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                            <Users className="w-3 h-3" />
                            + Zadowoleni pracownicy
                        </div>
                    </div>

                    {/* CARD B: YEARLY */}
                    <div className="bg-[#0078d4] rounded-md p-2.5 md:p-3.5 text-white shadow-[0_3.2px_7.2px_0_rgba(0,0,0,0.13),0_0.6px_1.8px_0_rgba(0,0,0,0.11)]">
                        <div className="flex justify-between items-start mb-1 md:mb-2">
                            <div>
                                <div className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Rocznie</div>
                                <div className="hidden md:block text-xs text-blue-200 font-medium mt-0.5">Skumulowany zysk</div>
                            </div>
                            <div className="hidden md:block p-1.5 bg-white/15 text-white rounded-md">
                                <PieChart className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-base md:text-2xl font-extrabold text-white tracking-tight tabular-nums">
                            {formatPLN(simulation.yearlySavings)}
                        </div>
                        <div className="hidden md:block mt-2 h-1 w-full bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white/60 w-[70%]"></div>
                        </div>
                    </div>

                    {/* CARD C: PER EMPLOYEE */}
                    <div className="bg-white rounded-md p-2.5 md:p-3.5 border border-[#edebe9] shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),0_0.3px_0.9px_0_rgba(0,0,0,0.11)]">
                        <div className="flex justify-between items-start mb-1 md:mb-2">
                            <div>
                                <div className="text-[10px] font-bold text-[#a19f9d] uppercase tracking-widest">Na os.</div>
                                <div className="hidden md:block text-xs text-[#605e5c] font-medium mt-0.5">Miesięcznie</div>
                            </div>
                            <div className="hidden md:block p-1.5 bg-[#eff6fc] text-[#0078d4] rounded-md">
                                <Users className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-base md:text-2xl font-extrabold text-[#201f1e] tracking-tight tabular-nums">
                            {formatPLN(simulation.perEmployeeSavings)}
                        </div>
                        <div className="hidden md:inline-flex mt-1.5 items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#f3f2f1] text-[#605e5c] text-[10px] font-bold border border-[#edebe9]">
                            {empCount} pracowników
                        </div>
                    </div>
                </div>

                {/* 2. COST COMPARISON BAR (VISUAL) */}
                <div className="bg-white rounded-md border border-[#edebe9] shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),0_0.3px_0.9px_0_rgba(0,0,0,0.11)] overflow-hidden flex-shrink-0">
                    <div className="px-3 py-2 md:px-4 md:py-2.5 border-b border-[#edebe9] flex items-center justify-between">
                        <h3 className="font-semibold text-[#201f1e] text-sm flex items-center gap-2">
                            <ShieldCheck className="text-[#0078d4] w-4 h-4" />
                            Porównanie Kosztów
                        </h3>
                        <div className="text-xs font-medium text-[#605e5c] bg-[#f3f2f1] px-2 md:px-3 py-1 rounded-sm border border-[#edebe9]">
                            {contractType === 'MIXED' ? `Mix: ${mixUOP} UoP / ${mixUZClamped} UZ` : contractType}
                        </div>
                    </div>

                    {/* CHART BARS */}
                    <div className="px-3 py-2 md:px-4 md:py-3 space-y-2 md:space-y-3">

                        {/* OLD MODEL */}
                        <div>
                            <div className="flex justify-between text-xs font-semibold text-[#605e5c] mb-1 uppercase tracking-wide">
                                <span>Model Standard</span>
                                <span className="tabular-nums">{formatPLN(simulation.totalStd)}</span>
                            </div>
                            <div className="h-5 md:h-7 w-full bg-[#f3f2f1] rounded-sm overflow-hidden">
                                <div className="h-full bg-[#a19f9d] flex items-center justify-center text-white text-xs font-bold w-full">
                                    100%
                                </div>
                            </div>
                        </div>

                        {/* NEW MODEL */}
                        <div>
                            <div className="flex justify-between text-xs font-semibold text-[#605e5c] mb-1 uppercase tracking-wide">
                                <span>Model Eliton Prime™</span>
                                <span className="text-emerald-600 font-extrabold tabular-nums">{formatPLN(simulation.totalNew)}</span>
                            </div>
                            <div className="h-5 md:h-7 w-full bg-emerald-50 rounded-sm overflow-hidden flex border border-emerald-100">
                                <div
                                    style={{ width: `${(simulation.totalNew / simulation.totalStd) * 100}%` }}
                                    className="h-full bg-[#0078d4] flex items-center justify-center text-white text-xs font-bold transition-all duration-700"
                                >
                                    {Math.round((simulation.totalNew / simulation.totalStd) * 100)}%
                                </div>
                                <div className="flex-1 flex items-center justify-center text-emerald-700 text-xs font-bold">
                                    −{Math.round((1 - simulation.totalNew / simulation.totalStd) * 100)}%
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* 3. BREAKDOWN TABLE */}
                <div className="bg-white rounded-md border border-[#edebe9] shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),0_0.3px_0.9px_0_rgba(0,0,0,0.11)] overflow-hidden xl:flex-1 xl:min-h-0 flex flex-col">
                    <div className="px-3 py-2 md:px-4 md:py-2.5 border-b border-[#edebe9] flex-shrink-0">
                        <span className="text-sm font-semibold text-[#201f1e]">Zestawienie Kosztów</span>
                    </div>
                    <div className="xl:overflow-y-auto xl:flex-1 xl:min-h-0 overflow-x-auto">
                        <table className="w-full text-xs md:text-sm text-left">
                            <thead className="bg-[#f3f2f1] text-[#605e5c] text-[10px] md:text-xs uppercase font-semibold border-b border-[#edebe9]">
                                <tr>
                                    <th className="px-2 md:px-4 py-2 md:py-2.5">Kategoria</th>
                                    <th className="px-2 md:px-4 py-2 md:py-2.5 text-right">Standard</th>
                                    <th className="px-2 md:px-4 py-2 md:py-2.5 text-right">Eliton Prime™</th>
                                    <th className="px-2 md:px-4 py-2 md:py-2.5 text-right text-emerald-600">Różnica</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#edebe9]">
                                <tr className="hover:bg-[#f8f9fa] transition-colors">
                                    <td className="px-2 md:px-4 py-2 md:py-3 font-medium text-[#323130]">Koszt Całkowity</td>
                                    <td className="px-2 md:px-4 py-2 md:py-3 text-right text-[#a19f9d] line-through decoration-[#c8c6c4] tabular-nums">
                                        {formatPLN(simulation.totalStd)}
                                    </td>
                                    <td className="px-2 md:px-4 py-2 md:py-3 text-right font-bold text-[#201f1e] tabular-nums">
                                        {formatPLN(simulation.totalNew)}
                                    </td>
                                    <td className="px-2 md:px-4 py-2 md:py-3 text-right font-bold text-emerald-600 bg-emerald-50/50 tabular-nums">
                                        −{formatPLN(simulation.savings)}
                                    </td>
                                </tr>
                                <tr className="hover:bg-[#f8f9fa] transition-colors">
                                    <td className="px-2 md:px-4 py-2 md:py-3 text-[#605e5c] pl-5 md:pl-8">
                                        Opłata serwisowa EBS
                                        <div className="hidden md:block text-[10px] text-[#a19f9d]">{prowizjaStandard}% wartości nominalnej świadczeń</div>
                                    </td>
                                    <td className="px-2 md:px-4 py-2 md:py-3 text-right text-[#c8c6c4]">—</td>
                                    <td className="px-2 md:px-4 py-2 md:py-3 text-right font-medium text-amber-600 tabular-nums">
                                        {formatPLN(simulation.totalProv)}
                                    </td>
                                    <td className="hidden md:table-cell px-4 py-3 text-right text-xs text-[#a19f9d]">Koszt operacyjny</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};
