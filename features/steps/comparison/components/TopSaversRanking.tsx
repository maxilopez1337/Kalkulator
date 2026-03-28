import React from 'react';
import { Users } from '../../../../shared/icons/Icons';
import { formatPLN } from '../../../../shared/utils/formatters';
import { WynikPracownika } from '../../../../entities/calculation/model';

interface TopSaversRankingProps {
    topSavers: WynikPracownika[];
}

export const TopSaversRanking: React.FC<TopSaversRankingProps> = ({ topSavers }) => {
    return (
        <div className="bg-white rounded-md border border-[#edebe9] shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),0_0.3px_0.9px_0_rgba(0,0,0,0.11)] overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3 flex items-center justify-between border-b border-white/10 bg-[#001433] rounded-t-md">
                <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-white">
                        Ranking Potencjału Oszczędności
                    </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded">
                    Top 5 Pracowników
                </span>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1.4fr] border-b border-white/10 bg-[#001433]">
                <div className="py-2 px-4 text-[9px] font-black uppercase tracking-widest text-[#c8c6c4]">Pracownik</div>
                <div className="py-2 px-4 text-[9px] font-black uppercase tracking-widest text-[#c8c6c4] text-right">Koszt Obecny</div>
                <div className="py-2 px-4 text-[9px] font-black uppercase tracking-widest text-emerald-400 text-right">Oszczędność</div>
                <div className="py-2 px-4 text-[9px] font-black uppercase tracking-widest text-[#c8c6c4]">% Redukcji</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-[#edebe9]">
                {topSavers.length === 0 ? (
                    <div className="py-6 text-center text-[#a19f9d] text-xs italic">
                        Brak pracowników spełniających kryteria.
                    </div>
                ) : (
                    topSavers.map((w, i) => {
                        const percent = ((w.oszczednosc / w.standard.kosztPracodawcy) * 100);
                        const percentStr = percent.toFixed(1);
                        const rankColors = ['border-l-amber-400', 'border-l-[#a19f9d]', 'border-l-orange-700', 'border-l-emerald-500', 'border-l-emerald-500'];
                        const rankBg = ['bg-amber-400 text-[#201f1e]', 'bg-[#a19f9d] text-white', 'bg-orange-700 text-white', 'bg-emerald-600 text-white', 'bg-emerald-600 text-white'];
                        return (
                            <div
                                key={i}
                                className={`grid grid-cols-[2fr_1fr_1fr_1.4fr] items-center border-l-4 ${rankColors[i] ?? 'border-l-[#edebe9]'} hover:bg-[#f3f2f1] transition-colors`}
                            >
                                {/* Name + rank */}
                                <div className="py-3 px-4 flex items-center gap-2.5">
                                    <span className={`w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-black shrink-0 ${rankBg[i] ?? 'bg-[#e1dfdd] text-[#323130]'}`}>
                                        {i + 1}
                                    </span>
                                    <div>
                                        <div className="font-bold text-[#201f1e] text-sm leading-tight">{w.pracownik.imie} {w.pracownik.nazwisko}</div>
                                        <div className="text-[10px] text-[#a19f9d] uppercase tracking-wide mt-0.5">{w.pracownik.typUmowy}</div>
                                    </div>
                                </div>
                                {/* Current cost */}
                                <div className="py-3 px-4 text-right text-sm text-[#605e5c] tabular-nums font-medium">
                                    {formatPLN(w.standard.kosztPracodawcy)}
                                </div>
                                {/* Savings */}
                                <div className="py-3 px-4 text-right font-black text-emerald-600 tabular-nums text-sm">
                                    +{formatPLN(w.oszczednosc)}
                                </div>
                                {/* Bar */}
                                <div className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-4 bg-[#f3f2f1] overflow-hidden min-w-[50px]">
                                            <div
                                                className="h-full bg-emerald-400 transition-all duration-700"
                                                style={{ width: `${Math.max(4, percent)}%`, minWidth: '4px' }}
                                            />
                                        </div>
                                        <span className="text-xs font-black text-[#323130] w-10 text-right tabular-nums">{percentStr}%</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer — total savings */}
            {topSavers.length > 0 && (() => {
                const totalSavings = topSavers.reduce((s, w) => s + w.oszczednosc, 0);
                return (
                    <div className="px-5 py-3 flex items-center justify-between border-t border-emerald-200 bg-emerald-50">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                            Łączny Potencjał Top 5
                        </span>
                        <span className="text-xl font-black text-emerald-700 tabular-nums">
                            +{formatPLN(totalSavings)}<span className="text-sm font-semibold text-emerald-600 ml-1">/ rok</span>
                        </span>
                    </div>
                );
            })()}
        </div>
    );
};
