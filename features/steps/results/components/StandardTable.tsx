
import React from 'react';
import { formatPLN } from '../../../../shared/utils/formatters';
import { TableContainer, Thead, Tbody, Tfoot, Tr, Th, ThRight, ThCenter, Td, TdRight, TdCenter } from '../../../../common/TableUI';
import { WynikPracownika } from '../../../../entities/calculation/model';

// Helper: Zaokrąglenie do 2 miejsc po przecinku (grosze)
const round = (val: number) => Math.round(val * 100) / 100;

export const StandardTable = ({ data }: { data: WynikPracownika[] }) => {
    if (!data || data.length === 0) return null;

    const total = {
        netto: data.reduce((acc, w) => acc + round(w.standard.netto), 0),
        brutto: data.reduce((acc, w) => acc + round(w.standard.brutto), 0),
        koszt: data.reduce((acc, w) => acc + round(w.standard.kosztPracodawcy), 0),
        podstawaZus: data.reduce((acc, w) => acc + round(w.standard.podstawaZus), 0),
        zusPrac: data.reduce((acc, w) => acc + round(w.standard.zusPracownik.suma), 0),
        zdrowotna: data.reduce((acc, w) => acc + round(w.standard.zdrowotna), 0),
        pit: data.reduce((acc, w) => acc + round(w.standard.pit), 0),
        zusFirma: data.reduce((acc, w) => acc + round(w.standard.zusPracodawca.suma), 0),
        sumaSkladek: data.reduce((acc, w) => acc + round(w.standard.zusPracodawca.suma + w.standard.zusPracownik.suma + w.standard.zdrowotna), 0),
        emerytalnaPrac: data.reduce((acc, w) => acc + round(w.standard.zusPracownik.emerytalna), 0),
        rentowaPrac: data.reduce((acc, w) => acc + round(w.standard.zusPracownik.rentowa), 0),
        chorobowaPrac: data.reduce((acc, w) => acc + round(w.standard.zusPracownik.chorobowa), 0),
        emerytalnaFirma: data.reduce((acc, w) => acc + round(w.standard.zusPracodawca.emerytalna), 0),
        rentowaFirma: data.reduce((acc, w) => acc + round(w.standard.zusPracodawca.rentowa), 0),
        wypadkowaFirma: data.reduce((acc, w) => acc + round(w.standard.zusPracodawca.wypadkowa), 0),
        fp: data.reduce((acc, w) => acc + round(w.standard.zusPracodawca.fp), 0),
        fgsp: data.reduce((acc, w) => acc + round(w.standard.zusPracodawca.fgsp), 0),
        kup: data.reduce((acc, w) => acc + round(w.standard.kup), 0),
        podstawaPit: data.reduce((acc, w) => acc + round(w.standard.podstawaPit), 0),
    };

    // Style helper classes
    const detailHeaderClass = "text-[10px] font-semibold text-slate-400 uppercase tracking-tight py-2 px-2";
    const detailCellClass = "text-[11px] text-slate-500 py-2 px-2 border-slate-50";
    const mainCellClass = "text-[13px] font-medium text-slate-700 py-3 px-3";
    const groupHeaderBase = "text-[10px] font-bold uppercase tracking-wider py-1.5 border-b border-r";

    return (
        <div className="w-full overflow-x-auto">
            <TableContainer className="max-h-[calc(100vh-350px)] bg-white min-w-[1200px]">
            <Thead>
                {/* GROUP HEADERS */}
                <Tr className="h-8">
                    <ThCenter rowSpan={2} className="bg-slate-50 border-r border-b min-w-[40px] sticky left-0 z-30 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)] text-slate-400">LP</ThCenter>
                    <ThCenter rowSpan={2} className="bg-slate-50 border-r border-b min-w-[140px] md:min-w-[220px] sticky left-[40px] z-30 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)] text-left pl-4 text-slate-600">PRACOWNIK</ThCenter>

                    <ThCenter colSpan={4} className={`${groupHeaderBase} bg-slate-50 text-slate-500 border-slate-200`}>WARUNKI ZATRUDNIENIA (AS-IS)</ThCenter>
                    
                    <ThCenter colSpan={5} className={`${groupHeaderBase} bg-indigo-50/50 text-indigo-800 border-indigo-100`}>SKŁADNIKI ZUS PRACOWNIKA</ThCenter>
                    <ThCenter colSpan={3} className={`${groupHeaderBase} bg-teal-50/50 text-teal-800 border-teal-100`}>ZDROWOTNA</ThCenter>
                    <ThCenter colSpan={4} className={`${groupHeaderBase} bg-rose-50/50 text-rose-800 border-rose-100`}>PODATEK PIT</ThCenter>
                    <ThCenter colSpan={6} className={`${groupHeaderBase} bg-purple-50/50 text-purple-800 border-purple-100`}>KOSZTY PRACODAWCY</ThCenter>
                    <ThCenter colSpan={1} className={`${groupHeaderBase} bg-slate-100 text-slate-600 border-slate-300`}>SUMA</ThCenter>
                </Tr>

                {/* COLUMN HEADERS */}
                <Tr className="h-10">
                    {/* DANE FINANSOWE */}
                    <ThCenter className="w-20 text-[11px]">Umowa</ThCenter>
                    <ThRight className="w-28 text-slate-700">Netto</ThRight>
                    <ThRight className="w-28 text-slate-500">Brutto</ThRight>
                    <ThRight className="w-32 border-r bg-slate-50/50 font-bold text-slate-800">Koszt Całk.</ThRight>

                    {/* ZUS PRACOWNIK */}
                    <ThRight className={detailHeaderClass}>Podstawa</ThRight>
                    <ThRight className={detailHeaderClass}>Emeryt.</ThRight>
                    <ThRight className={detailHeaderClass}>Rent.</ThRight>
                    <ThRight className={detailHeaderClass}>Chor.</ThRight>
                    <ThRight className="text-[11px] font-bold text-indigo-700 bg-indigo-50/30 border-r border-indigo-100 py-2 px-2 text-right">Suma</ThRight>
                    
                    {/* ZDROWOTNA */}
                    <ThRight className={detailHeaderClass}>Podstawa</ThRight>
                    <ThRight className={detailHeaderClass}>Składka</ThRight>
                    <ThRight className="text-[11px] font-bold text-teal-700 bg-teal-50/30 border-r border-teal-100 py-2 px-2 text-right">ZUS + ZDR</ThRight>

                    {/* PIT */}
                    <ThRight className={detailHeaderClass}>KUP</ThRight>
                    <ThRight className={detailHeaderClass}>Podstawa</ThRight>
                    <ThCenter className={detailHeaderClass}>%</ThCenter>
                    <ThRight className="text-[11px] font-bold text-rose-700 bg-rose-50/30 border-r border-rose-100 py-2 px-2 text-right">Zaliczka</ThRight>
                    
                    {/* ZUS PRACODAWCA */}
                    <ThRight className={detailHeaderClass}>Emeryt.</ThRight>
                    <ThRight className={detailHeaderClass}>Rent.</ThRight>
                    <ThRight className={detailHeaderClass}>Wypadk.</ThRight>
                    <ThRight className={detailHeaderClass}>FP</ThRight>
                    <ThRight className={`${detailHeaderClass} border-r`}>FGŚP</ThRight>
                    <ThRight className="text-[11px] font-bold text-purple-700 bg-purple-50/30 border-r border-purple-100 py-2 px-2 text-right">ZUS Firmy</ThRight>
                    
                    {/* SUMA */}
                    <ThRight className="text-[11px] font-extrabold bg-slate-100 text-slate-800 py-2 px-2">SUMA SKŁ.</ThRight>
                </Tr>
            </Thead>
            <Tbody>
                {data.map((w, idx) => {
                    return (
                        <Tr key={w.pracownik.id} className="hover:bg-blue-50/10 transition-colors group">
                            {/* Sticky Columns */}
                            <Td className="text-center sticky left-0 bg-white group-hover:bg-[#fafcfe] z-20 border-r border-slate-200 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)] text-slate-400 font-mono text-[10px]">{idx + 1}</Td>
                            <Td className="sticky left-[40px] bg-white group-hover:bg-[#fafcfe] z-20 border-r border-slate-200 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)] pl-4">
                                <div className="font-semibold text-slate-900 text-sm truncate max-w-[120px] md:max-w-[200px]" title={`${w.pracownik.imie} ${w.pracownik.nazwisko}`}>
                                    {w.pracownik.imie} {w.pracownik.nazwisko}
                                </div>
                            </Td>

                            {/* DANE FINANSOWE */}
                            <Td className="text-center">
                                <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wide border ${w.pracownik.typUmowy==='UOP' ? 'bg-white border-blue-200 text-blue-700' : 'bg-white border-amber-200 text-amber-700'}`}>
                                    {w.pracownik.typUmowy}
                                </span>
                            </Td>
                            <TdRight className={mainCellClass}>{formatPLN(w.standard.netto)}</TdRight>
                            <TdRight className={`${mainCellClass} text-slate-500`}>{formatPLN(w.standard.brutto)}</TdRight>
                            <TdRight className={`${mainCellClass} font-bold text-slate-900 border-r border-slate-200 bg-slate-50/30`}>{formatPLN(w.standard.kosztPracodawcy)}</TdRight>
                            
                            {/* ZUS PRACOWNIK (Detale) */}
                            <TdRight className={detailCellClass}>{formatPLN(w.standard.podstawaZus)}</TdRight>
                            <TdRight className={detailCellClass}>{formatPLN(w.standard.zusPracownik.emerytalna)}</TdRight>
                            <TdRight className={detailCellClass}>{formatPLN(w.standard.zusPracownik.rentowa)}</TdRight>
                            <TdRight className={detailCellClass}>{formatPLN(w.standard.zusPracownik.chorobowa)}</TdRight>
                            <TdRight className="text-[11px] font-medium border-r border-indigo-100 bg-indigo-50/10 text-indigo-900">{formatPLN(w.standard.zusPracownik.suma)}</TdRight>
                            
                            {/* ZDROWOTNA */}
                            <TdRight className={detailCellClass}>{formatPLN(w.standard.podstawaZdrowotna)}</TdRight>
                            <TdRight className={detailCellClass}>{formatPLN(w.standard.zdrowotna)}</TdRight>
                            <TdRight className="text-[11px] font-bold border-r border-teal-100 bg-teal-50/10 text-teal-800">{formatPLN(w.standard.zusPracownik.suma + w.standard.zdrowotna)}</TdRight>
                            
                            {/* PIT */}
                            <TdRight className={detailCellClass}>{formatPLN(w.standard.kup)}</TdRight>
                            <TdRight className={detailCellClass}>{formatPLN(w.standard.podstawaPit)}</TdRight>
                            <TdCenter className={detailCellClass}>{w.standard.stawkaPit}%</TdCenter>
                            <TdRight className="text-[11px] font-bold border-r border-rose-100 bg-rose-50/10 text-rose-800">{formatPLN(w.standard.pit)}</TdRight>
                            
                            {/* ZUS PRACODAWCA */}
                            <TdRight className={detailCellClass}>{formatPLN(w.standard.zusPracodawca.emerytalna)}</TdRight>
                            <TdRight className={detailCellClass}>{formatPLN(w.standard.zusPracodawca.rentowa)}</TdRight>
                            <TdRight className={detailCellClass}>{formatPLN(w.standard.zusPracodawca.wypadkowa)}</TdRight>
                            <TdRight className={detailCellClass}>{formatPLN(w.standard.zusPracodawca.fp)}</TdRight>
                            <TdRight className={`${detailCellClass} border-r border-slate-100`}>{formatPLN(w.standard.zusPracodawca.fgsp)}</TdRight>
                            <TdRight className="text-[12px] font-bold text-purple-900 bg-purple-50/10 border-r border-purple-200">{formatPLN(w.standard.zusPracodawca.suma)}</TdRight>
                            
                            {/* SUMA */}
                            <TdRight className="font-extrabold text-[12px] text-slate-800 bg-slate-50">{formatPLN(w.standard.zusPracodawca.suma + w.standard.zusPracownik.suma + w.standard.zdrowotna)}</TdRight>
                        </Tr>
                    );
                })}
            </Tbody>
            <Tfoot>
                <Tr className="bg-slate-100 border-t-2 border-slate-300 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                    <Td className="sticky left-0 bg-slate-100 z-30 font-bold text-slate-500 text-xs border-r border-slate-300" colSpan={2}>
                        <div className="pl-4 flex items-center gap-2">
                            <span className="hidden md:inline">SUMA CAŁKOWITA</span>
                            <span className="md:hidden">SUMA</span>
                            <span className="bg-slate-200 text-slate-600 px-1.5 rounded text-[10px]">{data.length} poz.</span>
                        </div>
                    </Td>
                    
                    <Td className="bg-slate-100"></Td>
                    <TdRight className="font-bold text-slate-800 text-sm border-t border-slate-300">{formatPLN(total.netto)}</TdRight>
                    <TdRight className="text-slate-600 border-t border-slate-300">{formatPLN(total.brutto)}</TdRight>
                    <TdRight className="font-extrabold text-slate-900 border-r border-slate-300 text-sm border-t">{formatPLN(total.koszt)}</TdRight>
                    
                    <TdRight className="text-[10px] text-slate-400 border-t border-slate-300">{formatPLN(total.podstawaZus)}</TdRight>
                    <TdRight className="text-[10px] text-slate-400 border-t border-slate-300">{formatPLN(total.emerytalnaPrac)}</TdRight>
                    <TdRight className="text-[10px] text-slate-400 border-t border-slate-300">{formatPLN(total.rentowaPrac)}</TdRight>
                    <TdRight className="text-[10px] text-slate-400 border-t border-slate-300">{formatPLN(total.chorobowaPrac)}</TdRight>
                    <TdRight className="font-bold text-indigo-900 text-xs border-r border-t border-slate-300">{formatPLN(total.zusPrac)}</TdRight>
                    
                    <TdRight className="text-[10px] text-slate-400 border-t border-slate-300">{/* Podst Zdr */}</TdRight>
                    <TdRight className="text-[10px] text-slate-400 border-t border-slate-300">{formatPLN(total.zdrowotna)}</TdRight>
                    <TdRight className="font-bold text-teal-900 text-xs border-r border-t border-slate-300">{formatPLN(total.zusPrac + total.zdrowotna)}</TdRight>
                    
                    <TdRight className="text-[10px] text-slate-400 border-t border-slate-300">{formatPLN(total.kup)}</TdRight>
                    <TdRight className="text-[10px] text-slate-400 border-t border-slate-300">{formatPLN(total.podstawaPit)}</TdRight>
                    <Td className="border-t border-slate-300"></Td>
                    <TdRight className="font-bold text-rose-900 text-xs border-r border-t border-slate-300">{formatPLN(total.pit)}</TdRight>
                    
                    <TdRight className="text-[10px] text-slate-400 border-t border-slate-300">{formatPLN(total.emerytalnaFirma)}</TdRight>
                    <TdRight className="text-[10px] text-slate-400 border-t border-slate-300">{formatPLN(total.rentowaFirma)}</TdRight>
                    <TdRight className="text-[10px] text-slate-400 border-t border-slate-300">{formatPLN(total.wypadkowaFirma)}</TdRight>
                    <TdRight className="text-[10px] text-slate-400 border-t border-slate-300">{formatPLN(total.fp)}</TdRight>
                    <TdRight className="text-[10px] text-slate-400 border-r border-t border-slate-300">{formatPLN(total.fgsp)}</TdRight>
                    
                    <TdRight className="font-bold text-purple-900 text-xs border-r border-t border-slate-300">{formatPLN(total.zusFirma)}</TdRight>
                    <TdRight className="bg-slate-200 font-extrabold text-slate-900 text-sm border-t border-slate-300">{formatPLN(total.sumaSkladek)}</TdRight>
                </Tr>
            </Tfoot>
            </TableContainer>
        </div>
    );
};
