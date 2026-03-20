
import React, { useMemo, useState } from 'react';
import { formatPLN } from '../../../../shared/utils/formatters';
import { TableContainer, Thead, Tbody, Tfoot, Tr, ThGroup, ThRight, ThCenter, Td, TdRight, TdCenter } from '../../../../common/TableUI';
import { WynikPracownika } from '../../../../entities/calculation/model';

// Helper: Zaokrąglenie do 2 miejsc po przecinku (grosze)
const round = (val: number) => Math.round(val * 100) / 100;

type GroupKey = 'zusPrac' | 'zdrowotna' | 'pit' | 'zusFirma';
type ExpState = Record<GroupKey, boolean>;

const ALL_CLOSED: ExpState = { zusPrac: false, zdrowotna: false, pit: false, zusFirma: false };
const ALL_OPEN: ExpState   = { zusPrac: true,  zdrowotna: true,  pit: true,  zusFirma: true  };

export const StandardTable = ({ data }: { data: WynikPracownika[] }) => {
    if (!data || data.length === 0) return null;

    const [exp, setExp] = useState<ExpState>(ALL_CLOSED);
    const [compact, setCompact] = useState(false);

    const tog = (k: GroupKey) => setExp(p => ({ ...p, [k]: !p[k] }));
    const allOpen = Object.values(exp).every(Boolean);

    const total = useMemo(() => ({
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
    }), [data]);

    // ── Style helpers ──────────────────────────────────────────────────
    const rowPy = compact ? '!py-0.5' : '!py-2';
    const dh  = `text-[10px] font-semibold text-slate-400 uppercase tracking-tight ${rowPy} px-2 text-right`; // detail header
    const dc  = `text-[11px] text-slate-500 ${rowPy} px-2 tabular-nums text-right border-slate-50`;            // detail cell
    const mc  = `text-sm font-medium text-slate-700 ${rowPy} px-3 tabular-nums text-right`;                    // main cell

    // Collapsed-groups hint pills
    const collapsedGroups: { key: GroupKey; label: string; value: number; color: string }[] = (
        [
            { key: 'zusPrac'   as GroupKey, label: 'ZUS Prac.',  value: total.zusPrac,   color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
            { key: 'zdrowotna' as GroupKey, label: 'Zdrowotna',  value: total.zdrowotna, color: 'bg-teal-50 text-teal-700 border-teal-200' },
            { key: 'pit'       as GroupKey, label: 'PIT',        value: total.pit,       color: 'bg-rose-50 text-rose-700 border-rose-200' },
            { key: 'zusFirma'  as GroupKey, label: 'ZUS Firma',  value: total.zusFirma,  color: 'bg-purple-50 text-purple-700 border-purple-200' },
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
                {/* GROUP HEADERS */}
                <Tr className="h-8">
                    <ThCenter rowSpan={2} className="bg-slate-50 border-r border-b min-w-[40px] text-slate-400">LP</ThCenter>
                    <ThCenter rowSpan={2} className="bg-slate-50 border-r border-b min-w-[140px] md:min-w-[220px] text-left pl-4 text-slate-600">PRACOWNIK</ThCenter>

                    <ThCenter colSpan={4} className="text-[10px] font-bold uppercase tracking-wider py-1.5 border-b border-r bg-slate-50 text-slate-500 border-slate-200 text-center whitespace-nowrap">AKTUALNY KOSZT ZATRUDNIENIA</ThCenter>

                    <ThGroup colSpan={exp.zusPrac ? 5 : 1} expanded={exp.zusPrac} onToggle={() => tog('zusPrac')}
                        className="bg-indigo-50/50 text-indigo-800 border-indigo-100">
                        {exp.zusPrac ? 'ZUS PRACOWNIKA' : 'Σ ZUS Prac.'}
                    </ThGroup>
                    <ThGroup colSpan={exp.zdrowotna ? 3 : 1} expanded={exp.zdrowotna} onToggle={() => tog('zdrowotna')}
                        className="bg-teal-50/50 text-teal-800 border-teal-100">
                        {exp.zdrowotna ? 'ZDROWOTNA' : 'Σ ZDR'}
                    </ThGroup>
                    <ThGroup colSpan={exp.pit ? 4 : 1} expanded={exp.pit} onToggle={() => tog('pit')}
                        className="bg-rose-50/50 text-rose-800 border-rose-100">
                        {exp.pit ? 'PODATEK PIT' : 'Σ PIT'}
                    </ThGroup>
                    <ThGroup colSpan={exp.zusFirma ? 6 : 1} expanded={exp.zusFirma} onToggle={() => tog('zusFirma')}
                        className="bg-purple-50/50 text-purple-800 border-purple-100">
                        {exp.zusFirma ? 'ZUS PRACODAWCY' : 'Σ ZUS Firma'}
                    </ThGroup>
                    <ThCenter colSpan={1} className="text-[10px] font-bold uppercase tracking-wider py-1.5 border-b border-r bg-slate-100 text-slate-600 border-slate-300 text-center whitespace-nowrap">SUMA</ThCenter>
                </Tr>

                {/* COLUMN HEADERS */}
                <Tr className="h-10">
                    {/* DANE FINANSOWE — zawsze widoczne */}
                    <ThCenter className="w-20 text-[11px]">Umowa</ThCenter>
                    <ThRight className="w-28 text-slate-700">Netto</ThRight>
                    <ThRight className="w-28 text-slate-500">Brutto</ThRight>
                    <ThRight className="w-32 border-r bg-slate-50/50 font-bold text-slate-800">Koszt Całk.</ThRight>

                    {/* ZUS PRACOWNIK */}
                    {exp.zusPrac && <ThRight className={dh}>Podstawa</ThRight>}
                    {exp.zusPrac && <ThRight className={dh}>Emeryt.</ThRight>}
                    {exp.zusPrac && <ThRight className={dh}>Rent.</ThRight>}
                    {exp.zusPrac && <ThRight className={dh}>Chor.</ThRight>}
                    <ThRight className="text-[11px] font-bold text-indigo-700 bg-indigo-50/30 border-r border-indigo-100 py-2 px-2 text-right">Σ ZUS Prac.</ThRight>

                    {/* ZDROWOTNA */}
                    {exp.zdrowotna && <ThRight className={dh}>Podstawa</ThRight>}
                    {exp.zdrowotna && <ThRight className={dh}>Składka</ThRight>}
                    <ThRight className="text-[11px] font-bold text-teal-700 bg-teal-50/30 border-r border-teal-100 py-2 px-2 text-right">Σ ZDR</ThRight>

                    {/* PIT */}
                    {exp.pit && <ThRight className={dh}>KUP</ThRight>}
                    {exp.pit && <ThRight className={dh}>Podstawa</ThRight>}
                    {exp.pit && <ThCenter className={dh}>%</ThCenter>}
                    <ThRight className="text-[11px] font-bold text-rose-700 bg-rose-50/30 border-r border-rose-100 py-2 px-2 text-right">Σ PIT</ThRight>

                    {/* ZUS PRACODAWCA */}
                    {exp.zusFirma && <ThRight className={dh}>Emeryt.</ThRight>}
                    {exp.zusFirma && <ThRight className={dh}>Rent.</ThRight>}
                    {exp.zusFirma && <ThRight className={dh}>Wypadk.</ThRight>}
                    {exp.zusFirma && <ThRight className={dh}>FP</ThRight>}
                    {exp.zusFirma && <ThRight className={`${dh} border-r`}>FGŚP</ThRight>}
                    <ThRight className="text-[11px] font-bold text-purple-700 bg-purple-50/30 border-r border-purple-100 py-2 px-2 text-right">Σ Firma</ThRight>

                    {/* SUMA */}
                    <ThRight className="text-[11px] font-extrabold bg-slate-100 text-slate-800 py-2 px-2">SUMA SKŁ.</ThRight>
                </Tr>
            </Thead>
            <Tbody>
                {data.map((w, idx) => {
                    return (
                        <Tr key={w.pracownik.id} className={`transition-colors group ${idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'} hover:bg-[#f0f7ff]`}>
                            {/* Sticky Columns */}
                            <Td className="text-center bg-white group-hover:bg-[#f0f7ff] border-r border-slate-200 text-slate-400 font-mono text-[10px]">{idx + 1}</Td>
                            <Td className="bg-white group-hover:bg-[#f0f7ff] border-r border-slate-200 pl-4">
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
                            <TdRight className={mc}>{formatPLN(w.standard.netto)}</TdRight>
                            <TdRight className={`${mc} text-slate-500`}>{formatPLN(w.standard.brutto)}</TdRight>
                            <TdRight className={`${mc} font-bold text-slate-900 border-r border-slate-200`}>{formatPLN(w.standard.kosztPracodawcy)}</TdRight>

                            {/* ZUS PRACOWNIK (Detale) */}
                            {exp.zusPrac && <TdRight className={dc}>{formatPLN(w.standard.podstawaZus)}</TdRight>}
                            {exp.zusPrac && <TdRight className={dc}>{formatPLN(w.standard.zusPracownik.emerytalna)}</TdRight>}
                            {exp.zusPrac && <TdRight className={dc}>{formatPLN(w.standard.zusPracownik.rentowa)}</TdRight>}
                            {exp.zusPrac && <TdRight className={dc}>{formatPLN(w.standard.zusPracownik.chorobowa)}</TdRight>}
                            <TdRight className={`text-[11px] font-semibold border-r border-indigo-100 bg-indigo-50/10 text-indigo-900 tabular-nums ${rowPy} px-2 text-right`}>{formatPLN(w.standard.zusPracownik.suma)}</TdRight>

                            {/* ZDROWOTNA */}
                            {exp.zdrowotna && <TdRight className={dc}>{formatPLN(w.standard.podstawaZdrowotna)}</TdRight>}
                            {exp.zdrowotna && <TdRight className={dc}>{formatPLN(w.standard.zdrowotna)}</TdRight>}
                            <TdRight className={`text-[11px] font-bold border-r border-teal-100 bg-teal-50/10 text-teal-800 tabular-nums ${rowPy} px-2 text-right`}>{formatPLN(w.standard.zusPracownik.suma + w.standard.zdrowotna)}</TdRight>

                            {/* PIT */}
                            {exp.pit && <TdRight className={dc}>{formatPLN(w.standard.kup)}</TdRight>}
                            {exp.pit && <TdRight className={dc}>{formatPLN(w.standard.podstawaPit)}</TdRight>}
                            {exp.pit && <TdCenter className={dc}>{w.standard.stawkaPit}%</TdCenter>}
                            <TdRight className={`text-[11px] font-bold border-r border-rose-100 bg-rose-50/10 text-rose-800 tabular-nums ${rowPy} px-2 text-right`}>{formatPLN(w.standard.pit)}</TdRight>

                            {/* ZUS PRACODAWCA */}
                            {exp.zusFirma && <TdRight className={dc}>{formatPLN(w.standard.zusPracodawca.emerytalna)}</TdRight>}
                            {exp.zusFirma && <TdRight className={dc}>{formatPLN(w.standard.zusPracodawca.rentowa)}</TdRight>}
                            {exp.zusFirma && <TdRight className={dc}>{formatPLN(w.standard.zusPracodawca.wypadkowa)}</TdRight>}
                            {exp.zusFirma && <TdRight className={dc}>{formatPLN(w.standard.zusPracodawca.fp)}</TdRight>}
                            {exp.zusFirma && <TdRight className={`${dc} border-r border-slate-100`}>{formatPLN(w.standard.zusPracodawca.fgsp)}</TdRight>}
                            <TdRight className={`text-[12px] font-bold text-purple-900 bg-purple-50/10 border-r border-purple-200 tabular-nums ${rowPy} px-2 text-right`}>{formatPLN(w.standard.zusPracodawca.suma)}</TdRight>

                            {/* SUMA */}
                            <TdRight className={`font-extrabold text-[12px] text-slate-800 bg-slate-50 tabular-nums ${rowPy} px-3`}>{formatPLN(w.standard.zusPracodawca.suma + w.standard.zusPracownik.suma + w.standard.zdrowotna)}</TdRight>
                        </Tr>
                    );
                })}
            </Tbody>
            <Tfoot>
                <Tr className="bg-slate-100 border-t-2 border-slate-300">
                    <Td className="bg-slate-100 font-bold text-slate-500 text-xs border-r border-slate-300" colSpan={2}>
                        <div className="pl-4 flex items-center gap-2">
                            SUMA CAŁKOWITA
                            <span className="bg-slate-200 text-slate-600 px-1.5 rounded text-[10px]">{data.length} poz.</span>
                        </div>
                    </Td>

                    <Td className="bg-slate-100" />
                    <TdRight className="font-bold text-slate-800 text-sm">{formatPLN(total.netto)}</TdRight>
                    <TdRight className="text-slate-600">{formatPLN(total.brutto)}</TdRight>
                    <TdRight className="font-extrabold text-slate-900 border-r border-slate-300 text-sm">{formatPLN(total.koszt)}</TdRight>

                    {exp.zusPrac && <TdRight className="text-[10px] text-slate-400">{formatPLN(total.podstawaZus)}</TdRight>}
                    {exp.zusPrac && <TdRight className="text-[10px] text-slate-400">{formatPLN(total.emerytalnaPrac)}</TdRight>}
                    {exp.zusPrac && <TdRight className="text-[10px] text-slate-400">{formatPLN(total.rentowaPrac)}</TdRight>}
                    {exp.zusPrac && <TdRight className="text-[10px] text-slate-400">{formatPLN(total.chorobowaPrac)}</TdRight>}
                    <TdRight className="font-bold text-indigo-900 text-xs border-r">{formatPLN(total.zusPrac)}</TdRight>

                    {exp.zdrowotna && <TdRight className="text-[10px] text-slate-400" />}
                    {exp.zdrowotna && <TdRight className="text-[10px] text-slate-400">{formatPLN(total.zdrowotna)}</TdRight>}
                    <TdRight className="font-bold text-teal-900 text-xs border-r">{formatPLN(total.zusPrac + total.zdrowotna)}</TdRight>

                    {exp.pit && <TdRight className="text-[10px] text-slate-400">{formatPLN(total.kup)}</TdRight>}
                    {exp.pit && <TdRight className="text-[10px] text-slate-400">{formatPLN(total.podstawaPit)}</TdRight>}
                    {exp.pit && <Td />}
                    <TdRight className="font-bold text-rose-900 text-xs border-r">{formatPLN(total.pit)}</TdRight>

                    {exp.zusFirma && <TdRight className="text-[10px] text-slate-400">{formatPLN(total.emerytalnaFirma)}</TdRight>}
                    {exp.zusFirma && <TdRight className="text-[10px] text-slate-400">{formatPLN(total.rentowaFirma)}</TdRight>}
                    {exp.zusFirma && <TdRight className="text-[10px] text-slate-400">{formatPLN(total.wypadkowaFirma)}</TdRight>}
                    {exp.zusFirma && <TdRight className="text-[10px] text-slate-400">{formatPLN(total.fp)}</TdRight>}
                    {exp.zusFirma && <TdRight className="text-[10px] text-slate-400 border-r">{formatPLN(total.fgsp)}</TdRight>}
                    <TdRight className="font-bold text-purple-900 text-xs border-r">{formatPLN(total.zusFirma)}</TdRight>

                    <TdRight className="bg-slate-200 font-extrabold text-slate-900 text-sm">{formatPLN(total.sumaSkladek)}</TdRight>
                </Tr>
            </Tfoot>
            </TableContainer>
        </div>
    );
};
