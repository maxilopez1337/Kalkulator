
import React from 'react';
import { formatPLN } from '../../../../shared/utils/formatters';
import { NettoZasadniczaCell } from './NettoZasadniczaCell';
import { TableContainer, Thead, Tbody, Tfoot, Tr, Th, ThRight, ThCenter, Td, TdRight, TdCenter } from '../../../../common/TableUI';
import { WynikPracownika } from '../../../../entities/calculation/model';
import { Info } from '../../../../common/Icons';

export const PodzialTable = ({ data }: { data: WynikPracownika[] }) => {
    if (!data || data.length === 0) return null;

    // Helper do sumowania TYLKO KWALIFIKUJĄCYCH SIĘ PRACOWNIKÓW
    // Wykluczamy studentów (trybSkladek === 'STUDENT_UZ') z podsumowania
    const qualifiedData = data.filter(w => w.pracownik.trybSkladek !== 'STUDENT_UZ');
    const excludedCount = data.length - qualifiedData.length;

    const sum = (selector: (w: WynikPracownika) => number) => 
        qualifiedData.reduce((acc, w) => acc + (selector(w) || 0), 0);

    const total = {
        // Dane wejściowe / Baza
        bruttoLaczne: sum(w => w.podzial.pit.lacznyPrzychod),
        nettoZasadnicza: sum(w => w.podzial.zasadnicza.nettoGotowka),
        bruttoZasadnicza: sum(w => w.podzial.zasadnicza.brutto),
        
        // Świadczenie (Rozszerzone)
        swiadczenieNetto: sum(w => w.podzial.swiadczenie.netto),
        dodatek: sum(w => w.podzial.swiadczenie.netto), // W logice: Dodatek = Swiadczenie Netto
        potracenie: qualifiedData.length * 1.00, // Stałe potrącenie 1zł
        swiadczenieBrutto: sum(w => w.podzial.swiadczenie.brutto),
        swiadczenieZaliczka: sum(w => w.podzial.swiadczenie.zaliczka),
        
        // Wypłata
        wyplataGotowka: sum(w => w.podzial.doWyplatyGotowka),
        wyplataSwiadczenie: sum(w => w.podzial.doWyplatySwiadczenie),
        wyplataRazem: sum(w => w.podzial.doWyplaty),
        
        // Koszt
        koszt: sum(w => w.podzial.kosztPracodawcy),
        
        // ZUS Pracownik
        podstZus: sum(w => w.podzial.zasadnicza.brutto),
        zusE: sum(w => w.podzial.zasadnicza.zusPracownik.emerytalna),
        zusR: sum(w => w.podzial.zasadnicza.zusPracownik.rentowa),
        zusC: sum(w => w.podzial.zasadnicza.zusPracownik.chorobowa),
        zusSuma: sum(w => w.podzial.zasadnicza.zusPracownik.suma),
        
        // Zdrowotna
        podstZdr: sum(w => w.podzial.zasadnicza.podstawaZdrowotna),
        sklZdr: sum(w => w.podzial.zasadnicza.zdrowotna),
        
        // PIT (Rozszerzony)
        kup: sum(w => w.podzial.pit.kup),
        podstPit: sum(w => w.podzial.pit.podstawa),
        pitZasadnicza: sum(w => w.podzial.pit.kwotaOdZasadniczej),
        pitCalk: sum(w => w.podzial.pit.kwota),
        
        // ZUS Pracodawca
        firmaE: sum(w => w.podzial.zasadnicza.zusPracodawca.emerytalna),
        firmaR: sum(w => w.podzial.zasadnicza.zusPracodawca.rentowa),
        firmaW: sum(w => w.podzial.zasadnicza.zusPracodawca.wypadkowa),
        firmaFP: sum(w => w.podzial.zasadnicza.zusPracodawca.fp),
        firmaFGSP: sum(w => w.podzial.zasadnicza.zusPracodawca.fgsp),
        zusFirma: sum(w => w.podzial.zasadnicza.zusPracodawca.suma),
        
        // Suma składek
        sumaSkladek: sum(w => w.podzial.zasadnicza.zusPracodawca.suma + w.podzial.zasadnicza.zusPracownik.suma + w.podzial.zasadnicza.zdrowotna)
    };

    // Style helper classes
    const detailHeaderClass = "text-[10px] font-semibold text-slate-400 uppercase tracking-tight py-2 px-2";
    const detailCellClass = "text-[11px] text-slate-500 py-2 px-2 border-slate-50";
    const groupHeaderBase = "text-[10px] font-bold uppercase tracking-wider py-1.5 border-b border-r";

    return (
        <div className="w-full overflow-x-auto">
            <TableContainer className="max-h-[calc(100vh-350px)] bg-white min-w-[1200px]">
            <Thead>
                <Tr className="h-8">
                    {/* Sticky Columns */}
                    <ThCenter rowSpan={2} className="bg-slate-50 border-r border-b min-w-[40px] sticky left-0 z-30 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)] text-slate-400">LP</ThCenter>
                    <ThCenter rowSpan={2} className="bg-slate-50 border-r border-b min-w-[140px] md:min-w-[220px] sticky left-[40px] z-30 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)] text-left pl-4 text-slate-600">PRACOWNIK</ThCenter>
                    
                    {/* Group Headers */}
                    <ThCenter colSpan={4} className={`${groupHeaderBase} bg-slate-50 text-slate-600 border-slate-200`}>DANE WEJŚCIOWE</ThCenter>
                    <ThCenter colSpan={5} className={`${groupHeaderBase} bg-amber-50/80 text-amber-700 border-amber-100`}>ŚWIADCZENIE (MECHANIZM)</ThCenter>
                    <ThCenter colSpan={3} className={`${groupHeaderBase} bg-emerald-50/80 text-emerald-800 border-emerald-100`}>DO WYPŁATY</ThCenter>
                    <ThCenter colSpan={1} className={`${groupHeaderBase} bg-slate-100 text-slate-700 border-slate-300`}>KOSZT</ThCenter>
                    
                    <ThCenter colSpan={5} className={`${groupHeaderBase} bg-indigo-50/50 text-indigo-800 border-indigo-100`}>ZUS PRACOWNIKA</ThCenter>
                    <ThCenter colSpan={2} className={`${groupHeaderBase} bg-teal-50/50 text-teal-800 border-teal-100`}>ZDROWOTNA</ThCenter>
                    <ThCenter colSpan={5} className={`${groupHeaderBase} bg-rose-50/50 text-rose-800 border-rose-100`}>PODATEK PIT</ThCenter>
                    <ThCenter colSpan={6} className={`${groupHeaderBase} bg-purple-50/50 text-purple-800 border-purple-100`}>ZUS PRACODAWCY</ThCenter>
                    <ThCenter colSpan={1} className={`${groupHeaderBase} bg-slate-100 text-slate-600 border-slate-300`}>SUMA</ThCenter>
                </Tr>
                <Tr className="h-10">
                    {/* DANE WEJŚCIOWE */}
                    <ThCenter className="w-16 text-[10px] bg-slate-50/50 text-slate-500 border-b">Umowa</ThCenter>
                    <ThRight className="w-24 bg-slate-50/30 text-slate-600 border-b border-r text-[11px]">Brutto Łącz.</ThRight>
                    <ThRight className="w-28 bg-blue-50/40 text-blue-700 font-bold border-b border-blue-200">Netto Baza</ThRight>
                    <ThRight className="w-24 bg-blue-50/20 text-blue-900 border-b border-r border-blue-100 text-[11px]">Brutto Baza</ThRight>

                    {/* ŚWIADCZENIE */}
                    <ThRight className="w-24 bg-amber-50/40 text-amber-700 font-bold border-b border-amber-200">Św. Netto</ThRight>
                    <ThRight className={detailHeaderClass}>Dodatek</ThRight>
                    <ThRight className={detailHeaderClass}>Potrąc.</ThRight>
                    <ThRight className="w-24 bg-amber-50/20 text-amber-900 border-b border-amber-200 text-[11px]">Św. Brutto</ThRight>
                    <ThRight className="w-20 bg-amber-50/10 text-amber-800 border-b border-r border-amber-100 text-[11px]">Zaliczka</ThRight>

                    {/* WYPŁATA */}
                    <ThRight className="w-24 bg-emerald-50/30 text-emerald-800 border-b border-emerald-100 text-[11px]">Gotówka</ThRight>
                    <ThRight className="w-24 bg-emerald-50/30 text-emerald-800 border-b border-emerald-100 text-[11px]">Benefit</ThRight>
                    <ThRight className="w-28 bg-emerald-100 border-b border-r border-emerald-200 font-bold text-emerald-900">RAZEM</ThRight>

                    {/* KOSZT */}
                    <ThRight className="w-28 bg-slate-100 border-b border-r border-slate-300 font-extrabold text-slate-800">KOSZT CAŁK.</ThRight>

                    {/* ZUS PRACOWNIK */}
                    <ThRight className={detailHeaderClass}>Podst.</ThRight>
                    <ThRight className={detailHeaderClass}>Emeryt.</ThRight>
                    <ThRight className={detailHeaderClass}>Rent.</ThRight>
                    <ThRight className={detailHeaderClass}>Chor.</ThRight>
                    <ThRight className="text-[11px] font-bold text-indigo-700 bg-indigo-50/30 border-r border-indigo-100 py-2 px-2 text-right">Suma</ThRight>

                    {/* ZDROWOTNA */}
                    <ThRight className={detailHeaderClass}>Podst.</ThRight>
                    <ThRight className="text-[11px] font-bold text-teal-700 bg-teal-50/30 border-r border-teal-100 py-2 px-2 text-right">Skł. Zdr.</ThRight>

                    {/* PIT */}
                    <ThRight className={detailHeaderClass}>KUP</ThRight>
                    <ThRight className={detailHeaderClass}>Podst.</ThRight>
                    <ThCenter className={detailHeaderClass}>%</ThCenter>
                    <ThRight className={detailHeaderClass}>Zal. Baz.</ThRight>
                    <ThRight className="text-[11px] font-bold text-rose-700 bg-rose-50/30 border-r border-rose-100 py-2 px-2 text-right">PIT Całk.</ThRight>

                    {/* PRACODAWCA */}
                    <ThRight className={detailHeaderClass}>Emeryt.</ThRight>
                    <ThRight className={detailHeaderClass}>Rent.</ThRight>
                    <ThRight className={detailHeaderClass}>Wyp.</ThRight>
                    <ThRight className={detailHeaderClass}>FP</ThRight>
                    <ThRight className={detailHeaderClass}>FGŚP</ThRight>
                    <ThRight className="text-[11px] font-bold text-purple-700 bg-purple-50/30 border-r border-purple-100 py-2 px-2 text-right">ZUS Firmy</ThRight>
                    
                    {/* SUMA */}
                    <ThRight className="text-[11px] font-extrabold bg-slate-100 text-slate-800 py-2 px-2">SUMA SKŁ.</ThRight>
                </Tr>
            </Thead>
            <Tbody>
                {data.map((w, idx) => {
                    const isStudent = w.pracownik.trybSkladek === 'STUDENT_UZ';
                    const rowClass = isStudent 
                        ? 'opacity-50 bg-slate-50 grayscale hover:bg-slate-100 transition-colors' 
                        : 'hover:bg-blue-50/10 transition-colors group';

                    return (
                        <Tr key={w.pracownik.id} className={rowClass}>
                            {/* Sticky Columns */}
                            <Td className="text-center sticky left-0 bg-white group-hover:bg-[#fafcfe] z-20 border-r border-slate-200 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)] text-slate-400 font-mono text-[10px]">
                                {idx + 1}
                            </Td>
                            <Td className="sticky left-[40px] bg-white group-hover:bg-[#fafcfe] z-20 border-r border-slate-200 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)] pl-4">
                                <div className="font-semibold text-slate-900 text-sm truncate max-w-[120px] md:max-w-[200px]" title={`${w.pracownik.imie} ${w.pracownik.nazwisko}`}>
                                    {w.pracownik.imie} {w.pracownik.nazwisko}
                                </div>
                                {isStudent && <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Student (Wykluczony)</div>}
                            </Td>

                            {/* DANE WEJŚCIOWE */}
                            <TdCenter className="text-[10px] text-slate-500 uppercase">{w.pracownik.typUmowy}</TdCenter>
                            <TdRight className="text-slate-500 text-[11px] border-r border-slate-100">{formatPLN(w.podzial.pit.lacznyPrzychod)}</TdRight>
                            
                            {/* Netto Baza (Active Cell - DISABLED FOR STUDENTS) */}
                            <td className="px-2 py-1.5 border-b border-blue-100 bg-blue-50/20 text-right relative group-hover:bg-blue-50/40 transition-colors">
                                {isStudent ? (
                                    <span className="text-xs text-slate-400 block text-right pr-2">-</span>
                                ) : (
                                    <NettoZasadniczaCell pracownik={w.pracownik} standardKoszt={w.standard.kosztPracodawcy} />
                                )}
                            </td>
                            <TdRight className="bg-blue-50/10 text-slate-500 border-r border-blue-100 text-[11px]">{formatPLN(w.podzial.zasadnicza.brutto)}</TdRight>

                            {/* ŚWIADCZENIE */}
                            <TdRight className="text-amber-700 font-bold bg-amber-50/20">{formatPLN(w.podzial.swiadczenie.netto)}</TdRight>
                            <TdRight className={detailCellClass}>{formatPLN(w.podzial.swiadczenie.netto)}</TdRight>
                            <TdRight className={detailCellClass}>1.00 zł</TdRight>
                            <TdRight className="bg-amber-50/10 text-amber-900 text-[11px]">{formatPLN(w.podzial.swiadczenie.brutto)}</TdRight>
                            <TdRight className="bg-amber-50/10 text-amber-800 border-r border-amber-100 text-[11px]">{formatPLN(w.podzial.swiadczenie.zaliczka)}</TdRight>

                            {/* WYPŁATA */}
                            <TdRight className="bg-emerald-50/10 text-slate-600 text-[11px]">{formatPLN(w.podzial.doWyplatyGotowka)}</TdRight>
                            <TdRight className="bg-emerald-50/10 text-slate-600 text-[11px]">{formatPLN(w.podzial.doWyplatySwiadczenie)}</TdRight>
                            <TdRight className="bg-emerald-100 border-r border-emerald-200 font-bold text-emerald-900 text-[13px]">{formatPLN(w.podzial.doWyplaty)}</TdRight>

                            {/* KOSZT */}
                            <TdRight className="bg-slate-100 font-bold text-slate-900 border-r border-slate-300 text-[13px]">{formatPLN(w.podzial.kosztPracodawcy)}</TdRight>

                            {/* ZUS PRACOWNIK */}
                            <TdRight className={detailCellClass}>{formatPLN(w.podzial.zasadnicza.brutto)}</TdRight>
                            <TdRight className={detailCellClass}>{formatPLN(w.podzial.zasadnicza.zusPracownik.emerytalna)}</TdRight>
                            <TdRight className={detailCellClass}>{formatPLN(w.podzial.zasadnicza.zusPracownik.rentowa)}</TdRight>
                            <TdRight className={detailCellClass}>{formatPLN(w.podzial.zasadnicza.zusPracownik.chorobowa)}</TdRight>
                            <TdRight className="bg-indigo-50/20 font-medium border-r border-indigo-100 text-[11px] text-indigo-900">{formatPLN(w.podzial.zasadnicza.zusPracownik.suma)}</TdRight>

                            {/* ZDROWOTNA */}
                            <TdRight className={detailCellClass}>{formatPLN(w.podzial.zasadnicza.podstawaZdrowotna)}</TdRight>
                            <TdRight className="bg-teal-50/20 font-medium border-r border-teal-100 text-[11px] text-teal-900">{formatPLN(w.podzial.zasadnicza.zdrowotna)}</TdRight>

                            {/* PIT */}
                            <TdRight className={detailCellClass}>{formatPLN(w.podzial.pit.kup)}</TdRight>
                            <TdRight className={detailCellClass}>{formatPLN(w.podzial.pit.podstawa)}</TdRight>
                            <TdCenter className={detailCellClass}>{w.podzial.pit.stawka}%</TdCenter>
                            <TdRight className={detailCellClass}>{formatPLN(w.podzial.pit.kwotaOdZasadniczej)}</TdRight>
                            <TdRight className="bg-rose-50/20 font-bold border-r border-rose-100 text-[11px] text-rose-800">{formatPLN(w.podzial.pit.kwota)}</TdRight>

                            {/* ZUS PRACODAWCA */}
                            <TdRight className={detailCellClass}>{formatPLN(w.podzial.zasadnicza.zusPracodawca.emerytalna)}</TdRight>
                            <TdRight className={detailCellClass}>{formatPLN(w.podzial.zasadnicza.zusPracodawca.rentowa)}</TdRight>
                            <TdRight className={detailCellClass}>{formatPLN(w.podzial.zasadnicza.zusPracodawca.wypadkowa)}</TdRight>
                            <TdRight className={detailCellClass}>{formatPLN(w.podzial.zasadnicza.zusPracodawca.fp)}</TdRight>
                            <TdRight className={detailCellClass}>{formatPLN(w.podzial.zasadnicza.zusPracodawca.fgsp)}</TdRight>
                            <TdRight className="bg-purple-50/20 font-bold border-r border-purple-200 text-[11px] text-purple-900">{formatPLN(w.podzial.zasadnicza.zusPracodawca.suma)}</TdRight>
                        
                            {/* SUMA SKŁADEK */}
                            <TdRight className="font-extrabold text-[11px] text-slate-800 bg-slate-50">{formatPLN(w.podzial.zasadnicza.zusPracodawca.suma + w.podzial.zasadnicza.zusPracownik.suma + w.podzial.zasadnicza.zdrowotna)}</TdRight>
                        </Tr>
                    );
                })}
            </Tbody>
            <Tfoot>
                <Tr className="bg-slate-100 border-t-2 border-slate-300 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                    <Td className="bg-slate-100 sticky left-0 z-20 border-r border-slate-300 font-bold text-slate-500 text-xs" colSpan={2}>
                        <div className="pl-4 flex flex-col justify-center h-full">
                            <span className="hidden md:inline text-slate-700 font-extrabold">SUMA (KWALIFIKUJĄCY SIĘ)</span>
                            <span className="md:hidden">SUMA</span>
                            {excludedCount > 0 && (
                                <div className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1 w-max">
                                    <Info className="w-3 h-3" />
                                    <span className="font-bold">Pominięto {excludedCount} studentów</span>
                                </div>
                            )}
                        </div>
                    </Td>
                    
                    {/* Baza */}
                    <Td className="bg-slate-100 border-b border-slate-300"></Td>
                    <TdRight className="border-t border-slate-300 text-slate-500 text-[10px] border-r">{formatPLN(total.bruttoLaczne)}</TdRight>
                    <TdRight className="border-t border-slate-300 bg-blue-100 font-bold text-blue-900 text-[13px]">{formatPLN(total.nettoZasadnicza)}</TdRight>
                    <TdRight className="border-t border-slate-300 border-r border-blue-200 text-slate-500 text-[10px]">{formatPLN(total.bruttoZasadnicza)}</TdRight>

                    {/* Świadczenie */}
                    <TdRight className="border-t border-slate-300 bg-amber-50 font-bold text-amber-800 text-[13px]">{formatPLN(total.swiadczenieNetto)}</TdRight>
                    <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.dodatek)}</TdRight>
                    <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.potracenie)}</TdRight>
                    <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.swiadczenieBrutto)}</TdRight>
                    <TdRight className="border-t border-slate-300 bg-amber-50 border-r border-amber-200 text-amber-700 text-[11px]">{formatPLN(total.swiadczenieZaliczka)}</TdRight>

                    {/* Wypłata */}
                    <TdRight className="border-t border-slate-300 bg-emerald-50 text-[11px]">{formatPLN(total.wyplataGotowka)}</TdRight>
                    <TdRight className="border-t border-slate-300 bg-emerald-50 text-[11px]">{formatPLN(total.wyplataSwiadczenie)}</TdRight>
                    <TdRight className="border-t border-slate-300 bg-emerald-200 border-r border-emerald-300 font-extrabold text-emerald-900 text-[13px]">{formatPLN(total.wyplataRazem)}</TdRight>

                    {/* Koszt */}
                    <TdRight className="border-t border-slate-300 bg-slate-300 border-r border-slate-400 font-extrabold text-slate-900 text-[13px]">{formatPLN(total.koszt)}</TdRight>

                    {/* ZUS Pracownik */}
                    <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.podstZus)}</TdRight>
                    <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.zusE)}</TdRight>
                    <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.zusR)}</TdRight>
                    <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.zusC)}</TdRight>
                    <TdRight className="border-t border-slate-300 bg-indigo-50 border-r border-indigo-200 font-bold text-indigo-900 text-[11px]">{formatPLN(total.zusSuma)}</TdRight>

                    {/* Zdrowotna */}
                    <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.podstZdr)}</TdRight>
                    <TdRight className="border-t border-slate-300 bg-teal-50 border-r border-teal-200 font-bold text-teal-900 text-[11px]">{formatPLN(total.sklZdr)}</TdRight>

                    {/* PIT */}
                    <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.kup)}</TdRight>
                    <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.podstPit)}</TdRight>
                    <Td className="border-t border-slate-300"></Td>
                    <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.pitZasadnicza)}</TdRight>
                    <TdRight className="border-t border-slate-300 bg-rose-50 border-r border-rose-200 font-bold text-rose-900 text-[11px]">{formatPLN(total.pitCalk)}</TdRight>

                    {/* ZUS Pracodawca */}
                    <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.firmaE)}</TdRight>
                    <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.firmaR)}</TdRight>
                    <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.firmaW)}</TdRight>
                    <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.firmaFP)}</TdRight>
                    <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.firmaFGSP)}</TdRight>
                    <TdRight className="border-t border-slate-300 bg-purple-50 border-r border-purple-200 font-bold text-purple-900 text-[11px]">{formatPLN(total.zusFirma)}</TdRight>
                    
                    {/* Suma Składek */}
                    <TdRight className="bg-slate-200 font-extrabold text-slate-900 text-xs border-t border-slate-300">{formatPLN(total.sumaSkladek)}</TdRight>
                </Tr>
            </Tfoot>
            </TableContainer>
        </div>
    );
};
