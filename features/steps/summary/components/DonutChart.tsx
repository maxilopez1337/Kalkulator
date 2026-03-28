import React, { useState } from 'react';
import { animations } from '../../../../shared/config/theme';
import { Alert } from '../../../../shared/ui/Alert';
import { Info } from '../../../../shared/icons/Icons';
import { formatPLN } from '../../../../shared/utils/formatters';

export const DonutChart = ({
    data,
    totalReference,
    savingsValue
}: {
    data: { label: string; value: number; color: string; subtext?: string }[],
    totalReference: number,
    savingsValue: number
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const chartSegments = [
        ...data,
        { label: 'Oszczędność', value: savingsValue, color: '#22c55e', subtext: 'Zysk netto firmy' }
    ];

    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const gapPx = 2.5;

    const minArc = 8;
    const rawArcs = chartSegments.map(s => Math.max(0, s.value) / totalReference * circumference);
    const bumpedArcs = rawArcs.map(a => Math.max(a, minArc));
    const bumpedTotal = bumpedArcs.reduce((a, b) => a + b, 0);
    const scaledArcs = bumpedArcs.map(a => (a / bumpedTotal) * circumference);

    return (
        <div className="flex flex-col lg:flex-row items-center gap-8 bg-white p-6">

            {/* CHART AREA */}
            <div className="relative w-64 h-64 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full drop-shadow-lg" style={{ overflow: 'visible' }}>
                    {/* Background track */}
                    <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="10" />
                    {chartSegments.map((slice, i) => {
                        const accum = scaledArcs.slice(0, i).reduce((a, b) => a + b, 0);
                        const arc = Math.max(0, scaledArcs[i] - gapPx);
                        const offset = -1 * (accum + gapPx / 2);
                        const isHovered = hoveredIndex === i;

                        return (
                            <circle
                                key={i}
                                cx="50" cy="50" r={radius}
                                fill="transparent"
                                stroke={slice.color}
                                strokeWidth={isHovered ? 16 : 11}
                                strokeDasharray={`${arc} ${circumference}`}
                                strokeDashoffset={offset}
                                style={{
                                    transition: 'stroke-width 0.2s ease, filter 0.2s ease',
                                    filter: isHovered ? `drop-shadow(0 0 4px ${slice.color})` : 'none',
                                }}
                            />
                        );
                    })}
                </svg>

                {/* Center Label — shows hovered segment or default savings */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-200">
                    {hoveredIndex !== null ? (
                        <>
                            <span
                                className="text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors duration-200"
                                style={{ color: chartSegments[hoveredIndex].color }}
                            >
                                {chartSegments[hoveredIndex].label}
                            </span>
                            <span className="text-3xl font-extrabold text-[#201f1e] tracking-tight leading-none">
                                {Math.round(chartSegments[hoveredIndex].value).toLocaleString('pl-PL')}
                                <span className="text-sm font-medium text-[#a19f9d] ml-0.5">zł</span>
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full mt-2 bg-[#f3f2f1] text-[#605e5c]">
                                {((chartSegments[hoveredIndex].value / totalReference) * 100).toFixed(1)}% całości
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="text-[10px] font-bold uppercase tracking-widest mb-1 text-emerald-600">
                                Oszczędność
                            </span>
                            <span className="text-3xl font-extrabold text-[#201f1e] tracking-tight leading-none">
                                {Math.round(savingsValue).toLocaleString('pl-PL')}
                                <span className="text-sm font-medium text-[#a19f9d] ml-0.5">zł</span>
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full mt-2 bg-emerald-50 text-emerald-700">
                                {((savingsValue / totalReference) * 100).toFixed(1)}% całości
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* LEGEND & DETAILS */}
            <div className="flex-1 w-full space-y-6">
                <div>
                    <h4 className="text-sm font-bold text-[#323130] uppercase tracking-wide border-b border-[#edebe9] pb-2 mb-4">
                        Struktura Kosztów
                    </h4>
                    <div className="space-y-1">
                        {chartSegments.map((item, i) => (
                            <div
                                key={i}
                                className={`flex items-center justify-between py-1.5 px-2 rounded-sm cursor-default transition-colors duration-150 ${hoveredIndex === i ? 'bg-[#f3f2f1]' : 'hover:bg-[#f3f2f1]/60'}`}
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex-shrink-0 rounded-full transition-all ${animations.quick}`}
                                        style={{
                                            backgroundColor: item.color,
                                            width: hoveredIndex === i ? '14px' : '10px',
                                            height: hoveredIndex === i ? '14px' : '10px',
                                            boxShadow: hoveredIndex === i ? `0 0 6px ${item.color}` : 'none',
                                        }}
                                    />
                                    <div>
                                        <div className={`text-sm font-bold transition-colors duration-150 ${hoveredIndex === i ? 'text-[#201f1e]' : 'text-[#323130]'}`}>{item.label}</div>
                                        <div className="text-[10px] text-[#a19f9d] font-medium">{item.subtext}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-[#201f1e]">{formatPLN(item.value)}</div>
                                    <div className="text-[10px] font-bold text-[#a19f9d] bg-[#f3f2f1] px-1.5 rounded-sm inline-block">
                                        {((item.value / totalReference) * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Alert icon={<Info className="w-4 h-4" />}>
                    <p>
                        Wykres przedstawia podział kosztów w modelu docelowym względem obecnego budżetu (100%).
                        Zielony segment to Twoja czysta oszczędność.
                    </p>
                </Alert>
            </div>
        </div>
    );
};
