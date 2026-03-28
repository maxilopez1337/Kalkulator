import React from 'react';

export const AnalizaTableHeader = () => (
    <thead className="sticky top-0 z-20">
        {/* Group header row */}
        <tr>
            <th colSpan={3} className="py-2 px-3 text-left text-[10px] font-bold tracking-wider bg-[#001433] text-white border-r border-white/10">
                PRACOWNIK
            </th>
            <th colSpan={4} className="py-2 px-3 text-center text-[10px] font-bold tracking-wider bg-[#002855] text-white border-r border-white/20">
                ▶ MODEL TRADYCYJNY (Standard PIT-37)
            </th>
            <th colSpan={6} className="py-2 px-3 text-center text-[10px] font-bold tracking-wider bg-[#005a9e] text-white border-r border-white/20">
                ★ ELITON PRIME™ (Po Podziale Wynagrodzenia)
            </th>
            <th colSpan={2} className="py-2 px-3 text-center text-[10px] font-bold tracking-wider bg-emerald-800 text-white">
                ✓ WYNIK PODATKOWY
            </th>
        </tr>
        {/* Column header row */}
        <tr className="bg-[#f3f2f1] border-b-2 border-[#edebe9] text-[#605e5c]">
            <th className="py-2.5 px-2 w-8 border-r border-[#edebe9]"></th>
            <th className="py-2.5 px-3 text-left font-semibold border-r border-[#edebe9]">Pracownik</th>
            <th className="py-2.5 px-3 text-center font-semibold border-r border-[#edebe9]">Typ</th>
            {/* Standard */}
            <th className="py-2.5 px-3 text-right font-semibold text-[#605e5c]">Brutto</th>
            <th className="py-2.5 px-3 text-right font-semibold text-[#605e5c]">Netto</th>
            <th className="py-2.5 px-3 text-right font-semibold text-rose-700 bg-rose-50/50">PIT avg/mies</th>
            <th className="py-2.5 px-3 text-center font-semibold text-amber-700 bg-amber-50/50 border-r border-[#edebe9]">II Próg (STD)</th>
            {/* Eliton */}
            <th className="py-2.5 px-3 text-right font-semibold text-blue-700 bg-blue-50/30">Zasadnicze</th>
            <th className="py-2.5 px-3 text-right font-semibold text-blue-700 bg-blue-50/30">Świadczenie</th>
            <th className="py-2.5 px-3 text-center font-semibold text-blue-900 bg-blue-100/60">
                + Podwyżka EBS<br/>
                <span className="text-[9px] font-normal text-blue-600">(netto → auto brutto)</span>
            </th>
            <th className="py-2.5 px-3 text-center font-semibold text-emerald-900 bg-emerald-50/60">
                + Podwyżka Prac.<br/>
                <span className="text-[9px] font-normal text-emerald-600">(netto → auto brutto)</span>
            </th>
            <th className="py-2.5 px-3 text-right font-semibold text-amber-800 bg-yellow-50">Nowe Netto</th>
            <th className="py-2.5 px-3 text-right font-semibold text-emerald-700 bg-emerald-50/50">PIT avg/mies</th>
            <th className="py-2.5 px-3 text-center font-semibold text-amber-700 bg-amber-50/50 border-r border-[#edebe9]">II Próg (ELI)</th>
            {/* Result */}
            <th className="py-2.5 px-3 text-right font-semibold text-emerald-800 bg-emerald-50">Δ PIT / rok</th>
            <th className="py-2.5 px-3 text-right font-semibold text-[#605e5c]">Świad. brutto (m1)</th>
        </tr>
    </thead>
);
