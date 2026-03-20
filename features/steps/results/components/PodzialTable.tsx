
import React, { useMemo, useState } from 'react';
import { formatPLN } from '../../../../shared/utils/formatters';
import { NettoZasadniczaCell } from './NettoZasadniczaCell';
import { TableContainer, Thead, Tbody, Tfoot, Tr, ThGroup, ThRight, ThCenter, Td, TdRight, TdCenter } from '../../../../common/TableUI';
import { WynikPracownika } from '../../../../entities/calculation/model';
import { Info } from '../../../../common/Icons';

type GroupKey = 'swiadczenie' | 'wyplata' | 'zusPrac' | 'zdrowotna' | 'pit' | 'zusFirma';
type ExpState = Record<GroupKey, boolean>;

const ALL_CLOSED: ExpState = { swiadczenie: false, wyplata: false, zusPrac: false, zdrowotna: false, pit: false, zusFirma: false };
const ALL_OPEN: ExpState   = { swiadczenie: true,  wyplata: true,  zusPrac: true,  zdrowotna: true,  pit: true,  zusFirma: true  };

export const PodzialTable = ({ data }: { data: WynikPracownika[] }) => {
    if (!data || data.length === 0) return null;

    const [exp, setExp] = useState<ExpState>(ALL_CLOSED);
    const [compact, setCompact] = useState(false);

    const tog = (k: GroupKey) => setExp(p => ({ ...p, [k]: !p[k] }));
    const allOpen = Object.values(exp).every(Boolean);

    const qualifiedData = useMemo(() => data.filter(w => w.pracownik.trybSkladek !== 'STUDENT_UZ'), [data]);
    const excludedCount = data.length - qualifiedData.length;

    const total = useMemo(() => {
        const sum = (selector: (w: WynikPracownika) => number) =>
            qualifiedData.reduce((acc, w) => acc + (selector(w) || 0), 0);
        return {
            bruttoLaczne:        sum(w => w.podzial.pit.lacznyPrzychod),
            nettoZasadnicza:     sum(w => w.podzial.zasadnicza.nettoGotowka),
            bruttoZasadnicza:    sum(w => w.podzial.zasadnicza.brutto),
            swiadczenieNetto:    sum(w => w.podzial.swiadczenie.netto),
            dodatek:             sum(w => w.podzial.swiadczenie.netto),
            potracenie:          qualifiedData.length * 1.00,
            swiadczenieBrutto:   sum(w => w.podzial.swiadczenie.brutto),
            swiadczenieZaliczka: sum(w => w.podzial.swiadczenie.zaliczka),
            wyplataGotowka:      sum(w => w.podzial.doWyplatyGotowka),
            wyplataSwiadczenie:  sum(w => w.podzial.doWyplatySwiadczenie),
            wyplataRazem:        sum(w => w.podzial.doWyplaty),
            koszt:               sum(w => w.podzial.kosztPracodawcy),
            podstZus:            sum(w => w.podzial.zasadnicza.brutto),
            zusE:                sum(w => w.podzial.zasadnicza.zusPracownik.emerytalna),
            zusR:                sum(w => w.podzial.zasadnicza.zusPracownik.rentowa),
            zusC:                sum(w => w.podzial.zasadnicza.zusPracownik.chorobowa),
            zusSuma:             sum(w => w.podzial.zasadnicza.zusPracownik.suma),
            podstZdr:            sum(w => w.podzial.zasadnicza.podstawaZdrowotna),
            sklZdr:              sum(w => w.podzial.zasadnicza.zdrowotna),
            kup:                 sum(w => w.podzial.pit.kup),
            podstPit:            sum(w => w.podzial.pit.podstawa),
            pitZasadnicza:       sum(w => w.podzial.pit.kwotaOdZasadniczej),
            pitCalk:             sum(w => w.podzial.pit.kwota),
            firmaE:              sum(w => w.podzial.zasadnicza.zusPracodawca.emerytalna),
            firmaR:              sum(w => w.podzial.zasadnicza.zusPracodawca.rentowa),
            firmaW:              sum(w => w.podzial.zasadnicza.zusPracodawca.wypadkowa),
            firmaFP:             sum(w => w.podzial.zasadnicza.zusPracodawca.fp),
            firmaFGSP:           sum(w => w.podzial.zasadnicza.zusPracodawca.fgsp),
            zusFirma:            sum(w => w.podzial.zasadnicza.zusPracodawca.suma),
            sumaSkladek:         sum(w => w.podzial.zasadnicza.zusPracodawca.suma + w.podzial.zasadnicza.zusPracownik.suma + w.podzial.zasadnicza.zdrowotna),
        };
    }, [qualifiedData]);

    const rowPy = compact ? '!py-0.5' : '!py-2';
    const dh = `text-[10px] font-semibold text-slate-400 uppercase tracking-tight ${rowPy} px-2 text-right`;
    const dc = `text-[11px] text-slate-500 ${rowPy} px-2 tabular-nums text-right border-slate-50`;

    const collapsedGroups: { key: GroupKey; label: string; value: number; color: string }[] = (
        [
            { key: 'swiadczenie' as GroupKey, label: 'Świadczenie', value: total.swiadczenieNetto, color: 'bg-amber-50 text-amber-700 border-amber-200' },
            { key: 'wyplata'     as GroupKey, label: 'Do Wypłaty',  value: total.wyplataRazem,     color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            { key: 'zusPrac'     as GroupKey, label: 'ZUS Prac.',   value: total.zusSuma,          color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
            { key: 'zdrowotna'   as GroupKey, label: 'Zdrowotna',   value: total.sklZdr,           color: 'bg-teal-50 text-teal-700 border-teal-200' },
            { key: 'pit'         as GroupKey, label: 'PIT',         value: total.pitCalk,          color: 'bg-rose-50 text-rose-700 border-rose-200' },
            { key: 'zusFirma'    as GroupKey, label: 'ZUS Firma',   value: total.zusFirma,         color: 'bg-purple-50 text-purple-700 border-purple-200' },
        ] as { key: GroupKey; label: string; value: number; color: string }[]
    ).filter(g => !exp[g.key]);

    return (
        <div className="w-full h-full flex flex-col min-h-0">

            {/* ── D365 PIVOT TOOLBAR ──────────────────────────────────── */}
            <div className="flex items-stretch bg-[#f8f9fa] border-b border-[#edebe9] flex-shrink-0 h-[34px]">
                <span className="flex items-center text-[11px] font-semibold text-[#a19f9d] uppercase tracking-widest px-3 select-none border-r border-[#edebe9]">Widok</span>
                <button
                    onClick={() => setCompact(false)}
                    className={`flex items-center gap-1 px-4 h-full text-[12px] font-medium border-b-2 transition-all ${
                        !compact ? 'border-[#0078d4] text-[#0078d4]' : 'border-transparent text-[#605e5c] hover:text-[#323130] hover:border-[#c8c6c4]'
                    }`}
                >
                    <span className="text-[10px]">⊞</span> Komfort
                </button>
                <button
                    onClick={() => setCompact(true)}
                    className={`flex items-center gap-1 px-4 h-full text-[12px] font-medium border-b-2 transition-all ${
                        compact ? 'border-[#0078d4] text-[#0078d4]' : 'border-transparent text-[#605e5c] hover:text-[#323130] hover:border-[#c8c6c4]'
                    }`}
                >
                    <span className="text-[10px]">≡</span> Kompakt
                </button>
                <div className="flex-1" />
                <button
                    onClick={() => setExp(allOpen ? ALL_CLOSED : ALL_OPEN)}
                    className="flex items-center px-4 h-full text-[12px] text-[#0078d4] hover:text-[#106ebe] hover:underline transition-colors whitespace-nowrap border-l border-[#edebe9]"
                >
                    {allOpen ? '← Zwiń wszystkie' : '→ Rozwiń wszystkie'}
                </button>
            </div>

            {/* ── D365 FILTER BAR: collapsed group tags ───────────────── */}
            {collapsedGroups.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 px-3 py-1.5 bg-white border-b border-[#edebe9] flex-shrink-0">
                    <span className="text-[11px] text-[#a19f9d] font-medium select-none mr-1">Zwinięte:</span>
                    {collapsedGroups.map(g => (
                        <button
                            key={g.key}
                            onClick={() => tog(g.key)}
                            className="inline-flex items-center gap-1.5 h-[22px] px-2.5 bg-[#deecf9] text-[#0078d4] border border-[#c7e0f4] text-[11px] font-medium hover:bg-[#c7e0f4] active:bg-[#b3d6f0] transition-colors whitespace-nowrap"
                            title="Kliknij aby rozwinąć"
                        >
                            {g.label}
                            <span className="opacity-60 tabular-nums">{formatPLN(g.value)}</span>
                            <span className="opacity-40 text-[9px] ml-0.5">▸</span>
                        </button>
                    ))}
                </div>
            )}

                <TableContainer className="flex-1 min-h-0 bg-white">
            <Thead>
                <Tr className="h-8">
                    {/* Sticky Columns */}
                    <ThCenter rowSpan={2} className="bg-slate-50 border-r border-b min-w-[40px] text-slate-400">LP</ThCenter>
                    <ThCenter rowSpan={2} className="bg-slate-50 border-r border-b min-w-[140px] md:min-w-[220px] text-left pl-4 text-slate-600">PRACOWNIK</ThCenter>

                    {/* DANE WEJŚCIOWE — not collapsible */}
                    <ThCenter colSpan={4} className="text-[10px] font-bold uppercase tracking-wider py-1.5 border-b border-r bg-slate-50 text-slate-600 border-slate-200 whitespace-nowrap">DANE WEJŚCIOWE</ThCenter>

                    {/* Collapsible group headers */}
                    <ThGroup colSpan={exp.swiadczenie ? 5 : 1} expanded={exp.swiadczenie} onToggle={() => tog('swiadczenie')}
                        className="bg-amber-50/80 text-amber-700 border-amber-100">
                        {exp.swiadczenie ? 'ŚWIADCZENIE (MECHANIZM)' : 'Σ Świadczenie'}
                    </ThGroup>
                    <ThGroup colSpan={exp.wyplata ? 3 : 1} expanded={exp.wyplata} onToggle={() => tog('wyplata')}
                        className="bg-emerald-50/80 text-emerald-800 border-emerald-100">
                        {exp.wyplata ? 'DO WYPŁATY' : 'Σ Do Wypłaty'}
                    </ThGroup>
                    <ThCenter colSpan={1} className="text-[10px] font-bold uppercase tracking-wider py-1.5 border-b border-r bg-slate-100 text-slate-700 border-slate-300 whitespace-nowrap">KOSZT</ThCenter>
                    <ThGroup colSpan={exp.zusPrac ? 5 : 1} expanded={exp.zusPrac} onToggle={() => tog('zusPrac')}
                        className="bg-indigo-50/50 text-indigo-800 border-indigo-100">
                        {exp.zusPrac ? 'ZUS PRACOWNIKA' : 'Σ ZUS Prac.'}
                    </ThGroup>
                    <ThGroup colSpan={exp.zdrowotna ? 2 : 1} expanded={exp.zdrowotna} onToggle={() => tog('zdrowotna')}
                        className="bg-teal-50/50 text-teal-800 border-teal-100">
                        {exp.zdrowotna ? 'ZDROWOTNA' : 'Σ ZDR'}
                    </ThGroup>
                    <ThGroup colSpan={exp.pit ? 5 : 1} expanded={exp.pit} onToggle={() => tog('pit')}
                        className="bg-rose-50/50 text-rose-800 border-rose-100">
                        {exp.pit ? 'PODATEK PIT' : 'Σ PIT'}
                    </ThGroup>
                    <ThGroup colSpan={exp.zusFirma ? 6 : 1} expanded={exp.zusFirma} onToggle={() => tog('zusFirma')}
                        className="bg-purple-50/50 text-purple-800 border-purple-100">
                        {exp.zusFirma ? 'ZUS PRACODAWCY' : 'Σ ZUS Firma'}
                    </ThGroup>
                    <ThCenter colSpan={1} className="text-[10px] font-bold uppercase tracking-wider py-1.5 border-b border-r bg-slate-100 text-slate-600 border-slate-300 whitespace-nowrap">SUMA</ThCenter>
                </Tr>
                <Tr className="h-10">
                    {/* DANE WEJŚCIOWE */}
                    <ThCenter className="w-16 text-[11px] bg-slate-50/50 text-slate-500 border-b">Umowa</ThCenter>
                    <ThRight className="w-24 bg-slate-50/30 text-slate-600 border-b border-r text-[11px]">Brutto Łącz.</ThRight>
                    <ThRight className="w-28 bg-blue-50/40 text-blue-700 font-bold border-b border-blue-200">Netto Baza</ThRight>
                    <ThRight className="w-24 bg-blue-50/20 text-blue-900 border-b border-r border-blue-100 text-[11px]">Brutto Baza</ThRight>

                    {/* ŚWIADCZENIE */}
                    <ThRight className="w-24 bg-amber-50/40 text-amber-700 font-bold border-b border-amber-200">Św. Netto</ThRight>
                    {exp.swiadczenie && <ThRight className={dh}>Dodatek</ThRight>}
                    {exp.swiadczenie && <ThRight className={dh}>Potrąc.</ThRight>}
                    {exp.swiadczenie && <ThRight className="w-24 bg-amber-50/20 text-amber-900 border-b border-amber-200 text-[11px]">Św. Brutto</ThRight>}
                    {exp.swiadczenie && <ThRight className="w-20 bg-amber-50/10 text-amber-800 border-b border-r border-amber-100 text-[11px]">Zaliczka</ThRight>}

                    {/* WYPŁATA */}
                    {exp.wyplata && <ThRight className="w-24 bg-emerald-50/30 text-emerald-800 border-b border-emerald-100 text-[11px]">Gotówka</ThRight>}
                    {exp.wyplata && <ThRight className="w-24 bg-emerald-50/30 text-emerald-800 border-b border-emerald-100 text-[11px]">Benefit</ThRight>}
                    <ThRight className="w-28 bg-emerald-100 border-b border-r border-emerald-200 font-bold text-emerald-900">RAZEM</ThRight>

                    {/* KOSZT */}
                    <ThRight className="w-28 bg-slate-100 border-b border-r border-slate-300 font-extrabold text-slate-800">KOSZT CAŁK.</ThRight>

                    {/* ZUS PRACOWNIK */}
                    {exp.zusPrac && <ThRight className={dh}>Podst.</ThRight>}
                    {exp.zusPrac && <ThRight className={dh}>Emeryt.</ThRight>}
                    {exp.zusPrac && <ThRight className={dh}>Rent.</ThRight>}
                    {exp.zusPrac && <ThRight className={dh}>Chor.</ThRight>}
                    <ThRight className="text-[11px] font-bold text-indigo-700 bg-indigo-50/30 border-r border-indigo-100 py-2 px-2 text-right">Σ ZUS Prac.</ThRight>

                    {/* ZDROWOTNA */}
                    {exp.zdrowotna && <ThRight className={dh}>Podst.</ThRight>}
                    <ThRight className="text-[11px] font-bold text-teal-700 bg-teal-50/30 border-r border-teal-100 py-2 px-2 text-right">Σ ZDR</ThRight>

                    {/* PIT */}
                    {exp.pit && <ThRight className={dh}>KUP</ThRight>}
                    {exp.pit && <ThRight className={dh}>Podst.</ThRight>}
                    {exp.pit && <ThCenter className={dh}>%</ThCenter>}
                    {exp.pit && <ThRight className={dh}>Zal. Baz.</ThRight>}
                    <ThRight className="text-[11px] font-bold text-rose-700 bg-rose-50/30 border-r border-rose-100 py-2 px-2 text-right">Σ PIT</ThRight>

                    {/* PRACODAWCA */}
                    {exp.zusFirma && <ThRight className={dh}>Emeryt.</ThRight>}
                    {exp.zusFirma && <ThRight className={dh}>Rent.</ThRight>}
                    {exp.zusFirma && <ThRight className={dh}>Wyp.</ThRight>}
                    {exp.zusFirma && <ThRight className={dh}>FP</ThRight>}
                    {exp.zusFirma && <ThRight className={`${dh} border-r`}>FGŚP</ThRight>}
                    <ThRight className="text-[11px] font-bold text-purple-700 bg-purple-50/30 border-r border-purple-100 py-2 px-2 text-right">Σ Firma</ThRight>

                    {/* SUMA */}
                    <ThRight className="text-[11px] font-extrabold bg-slate-100 text-slate-800 py-2 px-2">SUMA SKŁ.</ThRight>
                </Tr>
            </Thead>
            <Tbody>
                {data.map((w, idx) => {
                    const isStudent = w.pracownik.trybSkladek === 'STUDENT_UZ';
                    const baseRow = isStudent
                        ? 'opacity-50 bg-slate-50 grayscale hover:bg-slate-100 transition-colors'
                        : `transition-colors group ${idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'} hover:bg-[#f0f7ff]`;

                    return (
                        <Tr key={w.pracownik.id} className={baseRow}>
                            {/* Sticky Columns */}
                            <Td className="text-center bg-white group-hover:bg-[#f0f7ff] border-r border-slate-200 text-slate-400 font-mono text-[10px]">
                                {idx + 1}
                            </Td>
                            <Td className="bg-white group-hover:bg-[#f0f7ff] border-r border-slate-200 pl-4">
                                <div className="font-semibold text-slate-900 text-sm truncate max-w-[120px] md:max-w-[200px]" title={`${w.pracownik.imie} ${w.pracownik.nazwisko}`}>
                                    {w.pracownik.imie} {w.pracownik.nazwisko}
                                </div>
                                {isStudent && <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Student (Wykluczony)</div>}
                            </Td>

                            {/* DANE WEJŚCIOWE */}
                            <TdCenter>
                                <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wide border ${w.pracownik.typUmowy === 'UOP' ? 'bg-white border-blue-200 text-blue-700' : 'bg-white border-amber-200 text-amber-700'}`}>
                                    {w.pracownik.typUmowy}
                                </span>
                            </TdCenter>
                            <TdRight className={`${dc} border-r border-slate-100`}>{formatPLN(w.podzial.pit.lacznyPrzychod)}</TdRight>
                            <td className={`px-2 border-b border-blue-100 bg-blue-50/20 text-right relative transition-colors ${compact ? 'py-1' : 'py-1.5'} ${isStudent ? '' : 'group-hover:bg-blue-50/40'}`}>
                                {isStudent ? (
                                    <span className="text-xs text-slate-400 block text-right pr-2">-</span>
                                ) : (
                                    <NettoZasadniczaCell pracownik={w.pracownik} standardKoszt={w.standard.kosztPracodawcy} />
                                )}
                            </td>
                            <TdRight className="bg-blue-50/10 text-slate-500 border-r border-blue-100 text-[11px]">{formatPLN(w.podzial.zasadnicza.brutto)}</TdRight>

                            {/* ŚWIADCZENIE */}
                            <TdRight className={`text-amber-700 font-bold bg-amber-50/20 tabular-nums ${rowPy} px-2 text-right`}>{formatPLN(w.podzial.swiadczenie.netto)}</TdRight>
                            {exp.swiadczenie && <TdRight className={dc}>{formatPLN(w.podzial.swiadczenie.netto)}</TdRight>}
                            {exp.swiadczenie && <TdRight className={dc}>1.00 zł</TdRight>}
                            {exp.swiadczenie && <TdRight className="bg-amber-50/10 text-amber-900 text-[11px]">{formatPLN(w.podzial.swiadczenie.brutto)}</TdRight>}
                            {exp.swiadczenie && <TdRight className="bg-amber-50/10 text-amber-800 border-r border-amber-100 text-[11px]">{formatPLN(w.podzial.swiadczenie.zaliczka)}</TdRight>}

                            {/* WYPŁATA */}
                            {exp.wyplata && <TdRight className="bg-emerald-50/10 text-slate-600 text-[11px]">{formatPLN(w.podzial.doWyplatyGotowka)}</TdRight>}
                            {exp.wyplata && <TdRight className="bg-emerald-50/10 text-slate-600 text-[11px]">{formatPLN(w.podzial.doWyplatySwiadczenie)}</TdRight>}
                            <TdRight className={`bg-emerald-100 border-r border-emerald-200 font-bold text-emerald-900 tabular-nums ${rowPy} px-2 text-right text-[13px]`}>{formatPLN(w.podzial.doWyplaty)}</TdRight>

                            {/* KOSZT */}
                            <TdRight className={`bg-slate-100 font-bold text-slate-900 border-r border-slate-300 tabular-nums ${rowPy} px-2 text-right text-[13px]`}>{formatPLN(w.podzial.kosztPracodawcy)}</TdRight>

                            {/* ZUS PRACOWNIK */}
                            {exp.zusPrac && <TdRight className={dc}>{formatPLN(w.podzial.zasadnicza.brutto)}</TdRight>}
                            {exp.zusPrac && <TdRight className={dc}>{formatPLN(w.podzial.zasadnicza.zusPracownik.emerytalna)}</TdRight>}
                            {exp.zusPrac && <TdRight className={dc}>{formatPLN(w.podzial.zasadnicza.zusPracownik.rentowa)}</TdRight>}
                            {exp.zusPrac && <TdRight className={dc}>{formatPLN(w.podzial.zasadnicza.zusPracownik.chorobowa)}</TdRight>}
                            <TdRight className={`text-[11px] font-semibold border-r border-indigo-100 bg-indigo-50/10 text-indigo-900 tabular-nums ${rowPy} px-2 text-right`}>{formatPLN(w.podzial.zasadnicza.zusPracownik.suma)}</TdRight>

                            {/* ZDROWOTNA */}
                            {exp.zdrowotna && <TdRight className={dc}>{formatPLN(w.podzial.zasadnicza.podstawaZdrowotna)}</TdRight>}
                            <TdRight className={`text-[11px] font-bold border-r border-teal-100 bg-teal-50/10 text-teal-800 tabular-nums ${rowPy} px-2 text-right`}>{formatPLN(w.podzial.zasadnicza.zdrowotna)}</TdRight>

                            {/* PIT */}
                            {exp.pit && <TdRight className={dc}>{formatPLN(w.podzial.pit.kup)}</TdRight>}
                            {exp.pit && <TdRight className={dc}>{formatPLN(w.podzial.pit.podstawa)}</TdRight>}
                            {exp.pit && <TdCenter className={dc}>{w.podzial.pit.stawka}%</TdCenter>}
                            {exp.pit && <TdRight className={dc}>{formatPLN(w.podzial.pit.kwotaOdZasadniczej)}</TdRight>}
                            <TdRight className={`text-[11px] font-bold border-r border-rose-100 bg-rose-50/10 text-rose-800 tabular-nums ${rowPy} px-2 text-right`}>{formatPLN(w.podzial.pit.kwota)}</TdRight>

                            {/* ZUS PRACODAWCA */}
                            {exp.zusFirma && <TdRight className={dc}>{formatPLN(w.podzial.zasadnicza.zusPracodawca.emerytalna)}</TdRight>}
                            {exp.zusFirma && <TdRight className={dc}>{formatPLN(w.podzial.zasadnicza.zusPracodawca.rentowa)}</TdRight>}
                            {exp.zusFirma && <TdRight className={dc}>{formatPLN(w.podzial.zasadnicza.zusPracodawca.wypadkowa)}</TdRight>}
                            {exp.zusFirma && <TdRight className={dc}>{formatPLN(w.podzial.zasadnicza.zusPracodawca.fp)}</TdRight>}
                            {exp.zusFirma && <TdRight className={`${dc} border-r border-slate-100`}>{formatPLN(w.podzial.zasadnicza.zusPracodawca.fgsp)}</TdRight>}
                            <TdRight className={`text-[12px] font-bold text-purple-900 bg-purple-50/10 border-r border-purple-200 tabular-nums ${rowPy} px-2 text-right`}>{formatPLN(w.podzial.zasadnicza.zusPracodawca.suma)}</TdRight>

                            {/* SUMA SKŁADEK */}
                            <TdRight className={`font-extrabold text-[12px] text-slate-800 bg-slate-50 tabular-nums ${rowPy} px-3`}>{formatPLN(w.podzial.zasadnicza.zusPracodawca.suma + w.podzial.zasadnicza.zusPracownik.suma + w.podzial.zasadnicza.zdrowotna)}</TdRight>
                        </Tr>
                    );
                })}
            </Tbody>
            <Tfoot>
                <Tr className="bg-slate-100 border-t-2 border-slate-300 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                    <Td className="bg-slate-100 border-r border-slate-300 font-bold text-slate-500 text-xs" colSpan={2}>
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
                    <Td className="bg-slate-100 border-b border-slate-300" />
                    <TdRight className="border-t border-slate-300 text-slate-500 text-[10px] border-r">{formatPLN(total.bruttoLaczne)}</TdRight>
                    <TdRight className="border-t border-slate-300 bg-blue-100 font-bold text-blue-900 text-[13px]">{formatPLN(total.nettoZasadnicza)}</TdRight>
                    <TdRight className="border-t border-slate-300 border-r border-blue-200 text-slate-500 text-[10px]">{formatPLN(total.bruttoZasadnicza)}</TdRight>

                    {/* Świadczenie */}
                    <TdRight className="border-t border-slate-300 bg-amber-50 font-bold text-amber-800 text-[13px]">{formatPLN(total.swiadczenieNetto)}</TdRight>
                    {exp.swiadczenie && <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.dodatek)}</TdRight>}
                    {exp.swiadczenie && <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.potracenie)}</TdRight>}
                    {exp.swiadczenie && <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.swiadczenieBrutto)}</TdRight>}
                    {exp.swiadczenie && <TdRight className="border-t border-slate-300 bg-amber-50 border-r border-amber-200 text-amber-700 text-[11px]">{formatPLN(total.swiadczenieZaliczka)}</TdRight>}

                    {/* Wypłata */}
                    {exp.wyplata && <TdRight className="border-t border-slate-300 bg-emerald-50 text-[11px]">{formatPLN(total.wyplataGotowka)}</TdRight>}
                    {exp.wyplata && <TdRight className="border-t border-slate-300 bg-emerald-50 text-[11px]">{formatPLN(total.wyplataSwiadczenie)}</TdRight>}
                    <TdRight className="border-t border-slate-300 bg-emerald-200 border-r border-emerald-300 font-extrabold text-emerald-900 text-[13px]">{formatPLN(total.wyplataRazem)}</TdRight>

                    {/* Koszt */}
                    <TdRight className="border-t border-slate-300 bg-slate-300 border-r border-slate-400 font-extrabold text-slate-900 text-[13px]">{formatPLN(total.koszt)}</TdRight>

                    {/* ZUS Pracownik */}
                    {exp.zusPrac && <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.podstZus)}</TdRight>}
                    {exp.zusPrac && <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.zusE)}</TdRight>}
                    {exp.zusPrac && <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.zusR)}</TdRight>}
                    {exp.zusPrac && <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.zusC)}</TdRight>}
                    <TdRight className="border-t border-slate-300 bg-indigo-50 border-r border-indigo-200 font-bold text-indigo-900 text-[11px]">{formatPLN(total.zusSuma)}</TdRight>

                    {/* Zdrowotna */}
                    {exp.zdrowotna && <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.podstZdr)}</TdRight>}
                    <TdRight className="border-t border-slate-300 bg-teal-50 border-r border-teal-200 font-bold text-teal-900 text-[11px]">{formatPLN(total.sklZdr)}</TdRight>

                    {/* PIT */}
                    {exp.pit && <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.kup)}</TdRight>}
                    {exp.pit && <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.podstPit)}</TdRight>}
                    {exp.pit && <Td className="border-t border-slate-300" />}
                    {exp.pit && <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.pitZasadnicza)}</TdRight>}
                    <TdRight className="border-t border-slate-300 bg-rose-50 border-r border-rose-200 font-bold text-rose-900 text-[11px]">{formatPLN(total.pitCalk)}</TdRight>

                    {/* ZUS Pracodawca */}
                    {exp.zusFirma && <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.firmaE)}</TdRight>}
                    {exp.zusFirma && <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.firmaR)}</TdRight>}
                    {exp.zusFirma && <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.firmaW)}</TdRight>}
                    {exp.zusFirma && <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.firmaFP)}</TdRight>}
                    {exp.zusFirma && <TdRight className="border-t border-slate-300 text-[10px] text-slate-400">{formatPLN(total.firmaFGSP)}</TdRight>}
                    <TdRight className="border-t border-slate-300 bg-purple-50 border-r border-purple-200 font-bold text-purple-900 text-[11px]">{formatPLN(total.zusFirma)}</TdRight>

                    {/* Suma Składek */}
                    <TdRight className="bg-slate-200 font-extrabold text-slate-900 text-xs border-t border-slate-300">{formatPLN(total.sumaSkladek)}</TdRight>
                </Tr>
            </Tfoot>
            </TableContainer>
        </div>
    );
};
