import React, { useState } from 'react';
import { TrendingUp } from '../../../../shared/icons/Icons';
import { formatPLN } from '../../../../shared/utils/formatters';
import { CostBridgeChartHero } from './CostBridgeChartHero';
import { signStyles, buildBridgeRows } from './bridgeChartData';

interface CostBridgeChartProps {
    sumaKosztStandard: number;
    sumaKosztPodzial: number;
    prowizja: number;
    oszczednoscNetto: number;
    raiseAmount: number;
    adminAmount: number;
    activeCard: 'STANDARD' | 'PRIME';
}

export const CostBridgeChart: React.FC<CostBridgeChartProps> = ({
    sumaKosztStandard,
    sumaKosztPodzial,
    prowizja,
    oszczednoscNetto,
    raiseAmount,
    adminAmount,
    activeCard,
}) => {
    const [hovered, setHovered] = useState<string | null>(null);
    const ref = sumaKosztStandard;
    if (ref <= 0) return null;

    const isPrime = activeCard === 'PRIME';
    const rows = buildBridgeRows(sumaKosztStandard, sumaKosztPodzial, prowizja, oszczednoscNetto, raiseAmount, adminAmount, isPrime);

    return (
        <div className="bg-white rounded-md border border-[#edebe9] shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),0_0.3px_0.9px_0_rgba(0,0,0,0.11)] overflow-hidden">
            {/* ── HEADER ───────────────────────────────────────────────────── */}
            <div className="px-5 py-3 flex items-center justify-between border-b border-white/10 bg-[#001433] rounded-t-md">
                <h3 className="text-[11px] font-black text-white uppercase tracking-[.18em] flex items-center gap-2">
                    <TrendingUp className="text-emerald-400 w-3.5 h-3.5 shrink-0" />
                    Most Kosztowy — Dekompozycja Oszczędności
                </h3>
                <span className={`text-[9px] font-black px-2 py-0.5 uppercase tracking-widest border ${isPrime ? 'bg-transparent text-amber-400 border-amber-500' : 'bg-transparent text-blue-300 border-blue-500'}`}>
                    {isPrime ? 'Eliton Prime™ PLUS' : 'Eliton Prime™'}
                </span>
            </div>

            {/* ── BEFORE / AFTER HERO ──────────────────────────────────────── */}
            <CostBridgeChartHero
                sumaKosztStandard={sumaKosztStandard}
                oszczednoscNetto={oszczednoscNetto}
                isPrime={isPrime}
            />

            {/* ── COLUMN HEADERS ───────────────────────────────────────────── */}
            <div className="flex items-center gap-2 sm:gap-4 px-5 py-2 border-b border-white/10 bg-[#001433]">
                <div className="w-7 shrink-0" />
                <div className="w-28 sm:w-52 shrink-0 text-[9px] font-black text-[#c8c6c4] uppercase tracking-widest">Pozycja</div>
                <div className="flex-1 text-[9px] font-black text-[#c8c6c4] uppercase tracking-widest">Udział procentowy</div>
                <div className="w-20 sm:w-32 text-right text-[9px] font-black text-[#c8c6c4] uppercase tracking-widest">Wartość / mies.</div>
            </div>

            {/* ── ROWS ─────────────────────────────────────────────────────── */}
            <div className="divide-y divide-[#edebe9]">
                {rows.map((row) => {
                    const isAnchor  = row.key === 'today';
                    const isResult  = row.key === 'netto';
                    // Minimalny pasek 4px żeby małe wartości były zawsze widoczne
                    const barWidth = row.value > 0
                        ? `max(4px, ${Math.min(100, Math.max(0.5, row.pct))}%)`
                        : '0';
                    const pctVisible = row.pct >= 5;
                    return (
                        <div
                            key={row.key}
                            onMouseEnter={() => setHovered(row.key)}
                            onMouseLeave={() => setHovered(null)}
                            className={`flex items-center gap-2 sm:gap-4 px-5 py-2.5 transition-colors cursor-default border-l-4 ${
                                isAnchor ? 'bg-[#323130] border-l-white/30' :
                                isResult ? 'bg-emerald-700 border-l-emerald-300' :
                                row.sign === '-' ? 'bg-white border-l-emerald-500 hover:bg-emerald-50' :
                                row.sign === '+' ? 'bg-white border-l-amber-500 hover:bg-amber-50' :
                                'bg-white border-l-[#a19f9d] hover:bg-[#f3f2f1]'
                            }`}
                        >
                            <div className={`w-7 h-6 flex items-center justify-center border text-[10px] font-black shrink-0 ${signStyles[row.sign]}`}>
                                {row.sign}
                            </div>
                            <div className="w-28 sm:w-52 shrink-0 min-w-0">
                                <div className={`text-[11px] font-bold leading-tight ${
                                    isAnchor || isResult ? 'text-white' : 'text-[#201f1e]'
                                }`}>{row.label}</div>
                                {row.subLabel && <div className={`hidden sm:block text-[9px] mt-0.5 ${isAnchor || isResult ? 'text-white/50' : 'text-[#a19f9d]'}`}>{row.subLabel}</div>}
                            </div>
                            <div className={`flex-1 h-5 overflow-visible relative ${isAnchor ? 'bg-[#464f60]' : isResult ? 'bg-emerald-900' : 'bg-[#f3f2f1]'}`}>
                                {row.value > 0 ? (
                                    <div
                                        className={`h-full ${row.barClass} transition-all duration-700 ease-out flex items-center`}
                                        style={{ width: barWidth, minWidth: '4px' }}
                                    >
                                        {pctVisible && (
                                            <span className="text-[9px] font-black text-white/90 tabular-nums px-1.5">{row.pct.toFixed(1)}%</span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center px-2">
                                        <span className="text-[9px] text-[#a19f9d]">—</span>
                                    </div>
                                )}
                                {/* Etykieta % poza paskiem dla małych wartości */}
                                {row.value > 0 && !pctVisible && (
                                    <span className="absolute left-2 top-0 h-full flex items-center text-[9px] font-bold tabular-nums text-[#605e5c]">
                                        {row.pct.toFixed(1)}%
                                    </span>
                                )}
                            </div>
                            <div className={`w-20 sm:w-32 text-right tabular-nums shrink-0 font-black ${
                                isAnchor ? 'text-white text-sm sm:text-base' :
                                isResult ? 'text-white text-sm sm:text-base' :
                                row.sign === '-' ? 'text-emerald-700 text-xs sm:text-sm' :
                                row.sign === '+' ? 'text-amber-700 text-xs sm:text-sm' :
                                'text-[#323130] text-xs sm:text-sm'
                            }`}>
                                {row.sign === '-' ? '−' : row.sign === '+' ? '+' : ''}{formatPLN(row.value)}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── FOOTER ───────────────────────────────────────────────────── */}
            <div className={`px-5 py-3.5 flex items-center justify-between border-t ${isPrime ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
                <span className="text-[10px] font-black text-[#323130] uppercase tracking-widest">Skumulowana oszczędność roczna</span>
                <span className="text-xl font-black text-emerald-700 tabular-nums">
                    {formatPLN(oszczednoscNetto * 12)}
                    <span className="text-[11px] font-black text-emerald-600 ml-1">/ rok</span>
                </span>
            </div>
        </div>
    );
};
