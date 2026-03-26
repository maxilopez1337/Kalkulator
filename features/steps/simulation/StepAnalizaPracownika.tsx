import React, { useState, useMemo } from 'react';
import { useCalculation, useCompany } from '../../../store/AppContext';
import { formatPLN } from '../../../shared/utils/formatters';
import { Users, TrendingDown, ChevronDown, ChevronUp, Check } from '../../../shared/icons/Icons';
import { calcPitMiesiac } from '../../tax-engine/logic/pit';

// ─── Month names
const MO = ['Sty','Lut','Mar','Kwi','Maj','Cze','Lip','Sie','Wrz','Pa\u017a','Lis','Gru'];

// ─── Types
interface RaiseEntry { ebs: string; employer: string }

interface MonthRow {
    brutto: number;
    pit: number;
    netto: number;
    dochod: number;
    narastajace: number;
    isIIProg: boolean;
}
interface EliMonthRow extends MonthRow {
    s_brutto: number; // Świadczenie brutto (ekwiwalent)
}

// ─── Component
export const StepAnalizaPracownika = () => {
    const { wyniki } = useCalculation();
    const { config } = useCompany();

    const [raises, setRaises] = useState<Record<string | number, RaiseEntry>>({});
    const [globalEBS, setGlobalEBS]           = useState('');
    const [globalEmployer, setGlobalEmployer] = useState('');
    const [expanded, setExpanded]             = useState<Set<string | number>>(new Set());

    const p1Limit = config?.pit?.prog1Limit  ?? 120000;
    // WAŻNE: stałe przechowują 12 i 32 (procent), zamieniamy na ułamki
    const p1Rate  = (config?.pit?.prog1Stawka ?? 12) / 100;
    const p2Rate  = (config?.pit?.prog2Stawka ?? 32) / 100;

    const pracownicy: any[] = wyniki?.szczegoly || [];

    // ─── State helpers
    const setRaise = (id: string | number, field: 'ebs' | 'employer', val: string) =>
        setRaises(prev => ({ ...prev, [id]: { ...(prev[id] ?? { ebs: '', employer: '' }), [field]: val } }));

    const applyGlobal = () => {
        const next: Record<string | number, RaiseEntry> = {};
        pracownicy.forEach((p: any) => { next[p.pracownik.id] = { ebs: globalEBS, employer: globalEmployer }; });
        setRaises(next);
    };

    const toggleRow = (id: string | number) =>
        setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

    // ─── Main computation
    const tableData = useMemo(() => pracownicy.map((w: any) => {
        const emp    = w.pracownik;
        const r      = raises[emp.id] ?? { ebs: '', employer: '' };
        const podEBS = parseFloat(r.ebs) || 0;
        const podEmp = parseFloat(r.employer) || 0;
        const kzp    = parseFloat(emp.pit2) || 0;
        const isStudent    = emp.trybSkladek === 'STUDENT_UZ';
        const hasUlga      = emp.ulgaMlodych === true;
        const ulgaLimit    = config?.pit?.ulgaMlodziLimitRoczny ?? 85528;

        // Standard model constants
        const std_brutto = w.standard?.brutto  ?? 0;
        const std_zus    = w.standard?.zusPracownik?.suma ?? 0;
        const std_zdrow  = w.standard?.zdrowotna ?? 0;
        const std_kup    = w.standard?.kup ?? 0;
        const std_netto1 = w.standard?.netto  ?? 0;

        // Eliton model constants
        const z_brutto = w.podzial?.zasadnicza?.brutto ?? 0;
        const z_zus    = w.podzial?.zasadnicza?.zusPracownik?.suma ?? 0;
        const z_zdrow  = w.podzial?.zasadnicza?.zdrowotna ?? 0;
        const z_kup    = w.podzial?.zasadnicza?.kup ?? std_kup;
        const z_netto  = w.podzial?.zasadnicza?.netto ?? 0;

        const baseSwiadczenieNetto = w.podzial?.swiadczenie?.netto ?? 0;
        const totalSwNetto = baseSwiadczenieNetto + podEBS + podEmp;
        const eliTargetNetto = z_netto + totalSwNetto;

        // Binary search: znajdź s_brutto dla danego narastającego
        // ulgaAvailable: ile jeszcze zwolnienia z PIT pozostało w tym miesiącu (art. 21 ust. 1 pkt 148)
        const findSBrutto = (targetNetto: number, narastBefore: number, ulgaAvailable: number): { s_brutto: number; pit: number; dochod: number } => {
            if (targetNetto <= 0) return { s_brutto: 0, pit: 0, dochod: 0 };
            let lo = totalSwNetto * 0.8;
            let hi = Math.max(totalSwNetto * 8, eliTargetNetto * 2, 5000);
            for (let i = 0; i < 64; i++) {
                const mid         = (lo + hi) / 2;
                const dochod      = Math.max(0, z_brutto - z_zus + mid - z_kup);
                const taxable     = Math.max(0, dochod - ulgaAvailable);
                const pit         = calcPitMiesiac(taxable, narastBefore, p1Limit, p1Rate, p2Rate, kzp);
                const netto       = z_brutto + mid - z_zus - z_zdrow - pit;
                if (netto < targetNetto) lo = mid; else hi = mid;
            }
            const s_brutto    = (lo + hi) / 2;
            const dochod      = Math.max(0, z_brutto - z_zus + s_brutto - z_kup);
            const taxable     = Math.max(0, dochod - ulgaAvailable);
            const pit         = calcPitMiesiac(taxable, narastBefore, p1Limit, p1Rate, p2Rate, kzp);
            return { s_brutto, pit, dochod };
        };

        // Build 12-month arrays
        const stdMonths: MonthRow[] = [];
        const eliMonths: EliMonthRow[] = [];
        let narastStd = 0, narastEli = 0;
        let stdIIProg: number | null = null, eliIIProg: number | null = null;
        let ulgaUsedStd = 0, ulgaUsedEli = 0; // obie zmienne używane w pętli

        for (let m = 0; m < 12; m++) {
            // Standard month
            {
                let dochoBase = Math.max(0, std_brutto - std_zus - std_kup);
                let taxable   = dochoBase;
                if (hasUlga && ulgaUsedStd < ulgaLimit) {
                    const canEx = Math.min(taxable, ulgaLimit - ulgaUsedStd);
                    ulgaUsedStd += canEx;
                    taxable = Math.max(0, taxable - canEx);
                }
                const pit   = calcPitMiesiac(taxable, narastStd, p1Limit, p1Rate, p2Rate, kzp);
                const netto = std_brutto - std_zus - std_zdrow - pit;
                const wasBelow = narastStd < p1Limit;
                narastStd += taxable;
                if (wasBelow && narastStd >= p1Limit && !stdIIProg) stdIIProg = m + 1;
                stdMonths.push({ brutto: std_brutto, pit, netto, dochod: taxable, narastajace: narastStd, isIIProg: narastStd >= p1Limit });
            }

            // Eliton month
            if (isStudent) {
                eliMonths.push({ brutto: z_brutto + totalSwNetto, s_brutto: totalSwNetto, pit: 0, netto: eliTargetNetto, dochod: 0, narastajace: narastEli, isIIProg: false });
            } else {
                // Ulga młodych (art. 21 ust. 1 pkt 148): obejmuje przychody z art. 12 ust. 1,
                // czyli zarówno zasadnicze jak i świadczenie rzeczowe w ramach stosunku pracy.
                const ulgaAvailable = hasUlga ? Math.max(0, ulgaLimit - ulgaUsedEli) : 0;
                const { s_brutto, pit, dochod } = findSBrutto(eliTargetNetto, narastEli, ulgaAvailable);
                const netto = z_brutto + s_brutto - z_zus - z_zdrow - pit;
                const wasBelow = narastEli < p1Limit;
                const ulgaUsedThisMonth = Math.min(dochod, ulgaAvailable);
                ulgaUsedEli += ulgaUsedThisMonth;
                narastEli += dochod - ulgaUsedThisMonth; // narastające = tylko dochód opodatkowany
                if (wasBelow && narastEli >= p1Limit && !eliIIProg) eliIIProg = m + 1;
                eliMonths.push({ brutto: z_brutto + s_brutto, s_brutto, pit, netto, dochod, narastajace: narastEli, isIIProg: narastEli >= p1Limit });
            }
        }

        const stdRocznyPit = stdMonths.reduce((a, x) => a + x.pit, 0);
        const eliRocznyPit = eliMonths.reduce((a, x) => a + x.pit, 0);
        const pitOszczednosc = stdRocznyPit - eliRocznyPit;

        return {
            id: emp.id,
            imie: `${emp.imie} ${emp.nazwisko}`,
            typ: emp.typUmowy,
            student: isStudent,
            kzp,
            // Standard
            std_brutto,
            std_netto: stdMonths[0]?.netto ?? std_netto1,
            stdAvgPit: stdRocznyPit / 12,
            stdRocznyPit,
            stdIIProg,
            // Eliton
            zasadniczaNetto: z_netto,
            baseSwiadczenieNetto,
            totalSwNetto,
            eliNetto: eliTargetNetto,
            swBruttoM1: eliMonths[0]?.s_brutto ?? 0,
            eliAvgPit: eliRocznyPit / 12,
            eliRocznyPit,
            eliIIProg,
            // Comparison
            pitOszczednosc,
            podEBS,
            podEmp,
            // Monthly detail
            stdMonths,
            eliMonths,
        };
    }), [pracownicy, raises, config, p1Limit, p1Rate, p2Rate]);

    const totals = useMemo(() => tableData.reduce((a, r) => ({
        n:              a.n + 1,
        stdRocznyPit:   a.stdRocznyPit + r.stdRocznyPit,
        eliRocznyPit:   a.eliRocznyPit + r.eliRocznyPit,
        pitOszczednosc: a.pitOszczednosc + r.pitOszczednosc,
        stdIIProg:      a.stdIIProg + (r.stdIIProg ? 1 : 0),
        eliIIProg:      a.eliIIProg + (r.eliIIProg ? 1 : 0),
    }), { n: 0, stdRocznyPit: 0, eliRocznyPit: 0, pitOszczednosc: 0, stdIIProg: 0, eliIIProg: 0 }),
    [tableData]);

    // ─── Render
    return (
        <div className="h-full flex flex-col bg-[#f3f2f1] overflow-hidden">

            {/* D365 COMMAND BAR */}
            <div className="bg-white border-b border-[#edebe9] shadow-sm shrink-0">
                <div className="px-4 md:px-6 py-3 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <div className="w-1.5 h-6 bg-[#0078d4] rounded-sm shrink-0"></div>
                            <h1 className="text-sm md:text-base font-bold text-slate-900 leading-tight">Analiza PIT-37 – Symulacja Podatku Pracownika</h1>
                        </div>
                        <p className="hidden sm:block text-[11px] text-slate-500 pl-3.5">Model Tradycyjny vs. Eliton Prime™ &nbsp;·&nbsp; Skala 12% / 32% (narastająco) &nbsp;·&nbsp; Miesiąc po miesiącu &nbsp;·&nbsp; Próg II: 120 000 zł/rok</p>
                    </div>
                    {/* Global raise controls */}
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                        <div className="flex items-center gap-1.5 bg-[#eff6fc] border border-[#c8e1f7] rounded px-3 py-1.5">
                            <span className="text-[10px] text-[#0078d4] font-bold uppercase tracking-wider whitespace-nowrap">Podwyżka EBS netto:</span>
                            <input type="number" value={globalEBS} onChange={e => setGlobalEBS(e.target.value)}
                                placeholder="0 zł"
                                className="w-20 text-xs text-center bg-transparent border-none outline-none font-bold text-[#0078d4] placeholder-blue-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        </div>
                        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded px-3 py-1.5">
                            <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider whitespace-nowrap">Podwyżka Prac. netto:</span>
                            <input type="number" value={globalEmployer} onChange={e => setGlobalEmployer(e.target.value)}
                                placeholder="0 zł"
                                className="w-20 text-xs text-center bg-transparent border-none outline-none font-bold text-emerald-700 placeholder-emerald-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        </div>
                        <button onClick={applyGlobal}
                            className="px-4 py-1.5 bg-[#0078d4] hover:bg-[#106ebe] active:scale-[0.98] text-white text-xs font-bold rounded transition-all">
                            Zastosuj Globalnie
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI BAR */}
            <div className="shrink-0 px-4 md:px-6 py-3">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                    {[
                        { label: 'Pracownicy', val: totals.n, cls: 'bg-white border-slate-200 text-slate-800', valCls: 'text-slate-900' },
                        { label: 'PIT/rok – Tradycyjny', val: formatPLN(totals.stdRocznyPit), cls: 'bg-white border-rose-100', valCls: 'text-rose-700' },
                        { label: 'PIT/rok – Eliton Prime™', val: formatPLN(totals.eliRocznyPit), cls: 'bg-white border-emerald-100', valCls: 'text-emerald-700' },
                        { label: 'Oszczędność PIT (roczna)', val: `+${formatPLN(totals.pitOszczednosc)}`, cls: 'bg-emerald-50 border-emerald-200', valCls: 'text-emerald-800 font-black' },
                        { label: 'W II progu – Tradycyjny', val: `${totals.stdIIProg} os.`, cls: 'bg-amber-50 border-amber-200', valCls: 'text-amber-800' },
                        { label: 'W II progu – Eliton', val: `${totals.eliIIProg} os.`, cls: 'bg-white border-blue-200', valCls: 'text-blue-700' },
                    ].map(kpi => (
                        <div key={kpi.label} className={`border rounded-md px-3 py-2 shadow-sm ${kpi.cls}`}>
                            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">{kpi.label}</div>
                            <div className={`text-sm font-bold tabular-nums ${kpi.valCls}`}>{kpi.val}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MAIN TABLE */}
            <div className="flex-1 min-h-0 px-4 md:px-6 pb-4 md:pb-6 overflow-hidden">
                <div className="h-full bg-white rounded-md border border-[#edebe9] shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-auto flex-1 custom-scrollbar">
                        <table className="w-full border-collapse text-xs whitespace-nowrap">
                            <thead className="sticky top-0 z-20">
                                {/* Group header row */}
                                <tr>
                                    <th colSpan={3} className="py-2 px-3 text-left text-[10px] font-bold tracking-wider bg-[#001433] text-white border-r border-white/10">
                                        PRACOWNIK
                                    </th>
                                    <th colSpan={4} className="py-2 px-3 text-center text-[10px] font-bold tracking-wider bg-slate-700 text-white border-r border-white/20">
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
                                <tr className="bg-[#f3f2f1] border-b-2 border-[#edebe9] text-slate-600">
                                    <th className="py-2.5 px-2 w-8 border-r border-[#edebe9]"></th>
                                    <th className="py-2.5 px-3 text-left font-semibold border-r border-[#edebe9]">Pracownik</th>
                                    <th className="py-2.5 px-3 text-center font-semibold border-r border-[#edebe9]">Typ</th>
                                    {/* Standard */}
                                    <th className="py-2.5 px-3 text-right font-semibold text-slate-600">Brutto</th>
                                    <th className="py-2.5 px-3 text-right font-semibold text-slate-600">Netto</th>
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
                                    <th className="py-2.5 px-3 text-right font-semibold text-slate-600">Świad. brutto (m1)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#edebe9]">
                                {tableData.length === 0 && (
                                    <tr>
                                        <td colSpan={16} className="py-16 text-center text-slate-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <Users className="w-8 h-8 opacity-30" />
                                                <span className="text-sm font-medium">Brak danych. Przeprowadź kalkulację w poprzednich krokach.</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {tableData.map((row, i) => (
                                    <React.Fragment key={row.id}>
                                        {/* Main row */}
                                        <tr className={`transition-colors ${expanded.has(row.id) ? 'bg-blue-50/40' : 'hover:bg-[#f8f9fa]'}`}>
                                            {/* Expand */}
                                            <td className="py-2.5 px-2 border-r border-[#edebe9] text-center">
                                                <button onClick={() => toggleRow(row.id)}
                                                    className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-[#0078d4] hover:bg-[#eff6fc] transition-colors mx-auto">
                                                    {expanded.has(row.id) ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                </button>
                                            </td>
                                            {/* Name */}
                                            <td className="py-2.5 px-3 border-r border-[#edebe9]">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] text-slate-400 font-bold w-4 shrink-0">{i + 1}</span>
                                                    <span className="font-semibold text-slate-800">{row.imie}</span>
                                                    {row.student && <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.5 rounded font-bold border border-amber-200">STU</span>}
                                                </div>
                                            </td>
                                            {/* Typ */}
                                            <td className="py-2.5 px-3 text-center border-r border-[#edebe9]">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${row.typ === 'UOP' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-teal-50 text-teal-700 border-teal-200'}`}>
                                                    {row.typ}
                                                </span>
                                            </td>
                                            {/* Standard */}
                                            <td className="py-2.5 px-3 text-right text-slate-500 tabular-nums">{formatPLN(row.std_brutto)}</td>
                                            <td className="py-2.5 px-3 text-right text-slate-700 font-medium tabular-nums">{formatPLN(row.std_netto)}</td>
                                            <td className="py-2.5 px-3 text-right font-bold text-rose-700 bg-rose-50/40 tabular-nums">{formatPLN(row.stdAvgPit)}</td>
                                            <td className="py-2.5 px-3 text-center bg-amber-50/30 border-r border-[#edebe9]">
                                                {row.stdIIProg
                                                    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold border border-amber-200"><TrendingDown className="w-2.5 h-2.5" />Mies&nbsp;{row.stdIIProg}</span>
                                                    : <span className="text-slate-300 text-[10px] font-bold">— I próg —</span>}
                                            </td>
                                            {/* Eliton */}
                                            <td className="py-2.5 px-3 text-right text-slate-600 bg-blue-50/20 tabular-nums">{formatPLN(row.zasadniczaNetto)}</td>
                                            <td className="py-2.5 px-3 text-right text-blue-700 font-medium bg-blue-50/30 tabular-nums">{formatPLN(row.baseSwiadczenieNetto)}</td>
                                            {/* Podwyżka EBS input */}
                                            <td className="py-1.5 px-2 bg-blue-100/40">
                                                <div>
                                                    <input
                                                        type="number"
                                                        value={raises[row.id]?.ebs || ''}
                                                        onChange={e => setRaise(row.id, 'ebs', e.target.value)}
                                                        placeholder="0"
                                                        className="w-24 text-center py-1.5 px-2 bg-white border border-blue-200 rounded text-xs font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                    {row.podEBS > 0 && (
                                                        <div className="text-[9px] text-blue-500 mt-0.5 text-center">netto: {formatPLN(row.podEBS)}</div>
                                                    )}
                                                </div>
                                            </td>
                                            {/* Podwyżka Pracodawcy input */}
                                            <td className="py-1.5 px-2 bg-emerald-50/40">
                                                <div>
                                                    <input
                                                        type="number"
                                                        value={raises[row.id]?.employer || ''}
                                                        onChange={e => setRaise(row.id, 'employer', e.target.value)}
                                                        placeholder="0"
                                                        className="w-24 text-center py-1.5 px-2 bg-white border border-emerald-200 rounded text-xs font-bold text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                    {row.podEmp > 0 && (
                                                        <div className="text-[9px] text-emerald-600 mt-0.5 text-center">netto: {formatPLN(row.podEmp)}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-bold text-amber-800 bg-yellow-50 tabular-nums">{formatPLN(row.eliNetto)}</td>
                                            <td className="py-2.5 px-3 text-right font-bold text-emerald-700 bg-emerald-50/40 tabular-nums">{formatPLN(row.eliAvgPit)}</td>
                                            <td className="py-2.5 px-3 text-center bg-amber-50/30 border-r border-[#edebe9]">
                                                {row.eliIIProg
                                                    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold border border-amber-200"><TrendingDown className="w-2.5 h-2.5" />Mies&nbsp;{row.eliIIProg}</span>
                                                    : <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold border border-emerald-200"><Check className="w-2.5 h-2.5" />I próg</span>}
                                            </td>
                                            {/* Result */}
                                            <td className={`py-2.5 px-3 text-right font-black tabular-nums ${row.pitOszczednosc >= 0 ? 'text-emerald-800 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                                                {row.pitOszczednosc >= 0 ? '+' : ''}{formatPLN(row.pitOszczednosc)}
                                            </td>
                                            <td className="py-2.5 px-3 text-right text-slate-500 tabular-nums">
                                                <div>{formatPLN(row.swBruttoM1)}</div>
                                                {(row.podEBS + row.podEmp) > 0 && (
                                                    <div className="text-[9px] text-blue-500">+{formatPLN(row.swBruttoM1 - row.baseSwiadczenieNetto)} vs baza</div>
                                                )}
                                            </td>
                                        </tr>

                                        {/* 12-month detail */}
                                        {expanded.has(row.id) && (
                                            <tr className="bg-[#f8fbff]">
                                                <td colSpan={16} className="p-0 border-b-2 border-blue-200">
                                                    <div className="px-6 py-4">
                                                        <div className="text-[10px] font-bold text-[#0078d4] uppercase tracking-widest mb-3 flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-[#0078d4]"></div>
                                                            Zestawienie Miesiąc po Miesiącu – {row.imie}
                                                            <span className="ml-2 text-slate-400 font-normal normal-case">KZP (PIT-2): {formatPLN(row.kzp)}/mies &nbsp;·&nbsp; Próg II: {formatPLN(p1Limit)} dochodu narastająco</span>
                                                        </div>
                                                        <div className="overflow-x-auto rounded-md border border-[#cce1f5]">
                                                            <table className="w-full border-collapse text-[11px] whitespace-nowrap">
                                                                <thead>
                                                                    <tr>
                                                                        <th className="py-2 px-3 text-left bg-slate-800 text-white font-semibold w-14">Mies.</th>
                                                                        <th colSpan={4} className="py-2 px-3 text-center bg-slate-700 text-white font-semibold border-l border-white/10">
                                                                            MODEL TRADYCYJNY
                                                                        </th>
                                                                        <th colSpan={5} className="py-2 px-3 text-center bg-[#004e96] text-white font-semibold border-l border-white/20">
                                                                            ELITON PRIME™
                                                                        </th>
                                                                        <th className="py-2 px-3 text-center bg-emerald-800 text-white font-semibold border-l border-white/20">
                                                                            Δ PIT
                                                                        </th>
                                                                    </tr>
                                                                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold">
                                                                        <th className="py-2 px-3 text-left">#</th>
                                                                        <th className="py-2 px-3 text-right">Brutto std</th>
                                                                        <th className="py-2 px-3 text-right text-rose-700">PIT std</th>
                                                                        <th className="py-2 px-3 text-right">Netto std</th>
                                                                        <th className="py-2 px-3 text-right text-slate-400 border-r border-[#edebe9]">Narastające</th>
                                                                        <th className="py-2 px-3 text-right bg-blue-50/50 text-blue-700">Brutto łącz.</th>
                                                                        <th className="py-2 px-3 text-right bg-blue-50/50 text-blue-600">Świad. brutto</th>
                                                                        <th className="py-2 px-3 text-right bg-blue-50/50 text-emerald-700">PIT eli</th>
                                                                        <th className="py-2 px-3 text-right bg-blue-50/50">Netto eli</th>
                                                                        <th className="py-2 px-3 text-right bg-blue-50/50 text-slate-400 border-r border-[#edebe9]">Narastające</th>
                                                                        <th className="py-2 px-3 text-right bg-emerald-50 text-emerald-700">Oszczędność</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-slate-100">
                                                                    {row.stdMonths.map((sm, mi) => {
                                                                        const em = row.eliMonths[mi];
                                                                        const delta = sm.pit - em.pit;
                                                                        const stdCrossed = sm.isIIProg && !row.stdMonths[mi - 1]?.isIIProg;
                                                                        const eliCrossed = em.isIIProg && !row.eliMonths[mi - 1]?.isIIProg;
                                                                        return (
                                                                            <tr key={mi} className={`transition-colors ${(sm.isIIProg || em.isIIProg) ? 'bg-amber-50/30' : 'hover:bg-slate-50/60'}`}>
                                                                                <td className="py-2 px-3 font-bold text-slate-700">
                                                                                    {MO[mi]}
                                                                                    {stdCrossed && <span className="ml-1 text-[9px] bg-amber-200 text-amber-900 px-1 rounded font-bold">32%^</span>}
                                                                                    {eliCrossed && <span className="ml-1 text-[9px] bg-blue-200 text-blue-900 px-1 rounded font-bold">32%^</span>}
                                                                                </td>
                                                                                <td className="py-2 px-3 text-right text-slate-500 tabular-nums">{formatPLN(sm.brutto)}</td>
                                                                                <td className="py-2 px-3 text-right font-bold text-rose-700 tabular-nums">{formatPLN(sm.pit)}</td>
                                                                                <td className="py-2 px-3 text-right text-slate-700 tabular-nums">{formatPLN(sm.netto)}</td>
                                                                                <td className={`py-2 px-3 text-right text-[10px] tabular-nums border-r border-[#edebe9] ${sm.isIIProg ? 'text-amber-700 font-bold' : 'text-slate-400'}`}>
                                                                                    {formatPLN(sm.narastajace)}
                                                                                </td>
                                                                                <td className="py-2 px-3 text-right text-slate-600 bg-blue-50/30 tabular-nums">{formatPLN(em.brutto)}</td>
                                                                                <td className="py-2 px-3 text-right text-blue-700 bg-blue-50/30 tabular-nums">{formatPLN(em.s_brutto)}</td>
                                                                                <td className="py-2 px-3 text-right font-bold text-emerald-700 bg-blue-50/30 tabular-nums">{formatPLN(em.pit)}</td>
                                                                                <td className="py-2 px-3 text-right text-slate-700 bg-blue-50/30 tabular-nums">{formatPLN(em.netto)}</td>
                                                                                <td className={`py-2 px-3 text-right text-[10px] tabular-nums bg-blue-50/30 border-r border-[#edebe9] ${em.isIIProg ? 'text-amber-700 font-bold' : 'text-slate-400'}`}>
                                                                                    {formatPLN(em.narastajace)}
                                                                                </td>
                                                                                <td className={`py-2 px-3 text-right font-bold tabular-nums ${delta >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                                                                                    {delta >= 0 ? '+' : ''}{formatPLN(delta)}
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                    {/* Totals row */}
                                                                    <tr className="bg-[#001433] text-white font-bold">
                                                                        <td className="py-2.5 px-3 text-[10px] uppercase tracking-wider">RAZEM</td>
                                                                        <td className="py-2.5 px-3 text-right text-slate-300 tabular-nums">{formatPLN(row.stdMonths.reduce((a, x) => a + x.brutto, 0))}</td>
                                                                        <td className="py-2.5 px-3 text-right text-rose-300 tabular-nums">{formatPLN(row.stdRocznyPit)}</td>
                                                                        <td className="py-2.5 px-3 text-right tabular-nums">{formatPLN(row.stdMonths.reduce((a, x) => a + x.netto, 0))}</td>
                                                                        <td className="py-2.5 px-3 border-r border-white/10"></td>
                                                                        <td className="py-2.5 px-3 text-right text-slate-300 tabular-nums">{formatPLN(row.eliMonths.reduce((a, x) => a + x.brutto, 0))}</td>
                                                                        <td className="py-2.5 px-3 text-right text-blue-300 tabular-nums">{formatPLN(row.eliMonths.reduce((a, x) => a + x.s_brutto, 0))}</td>
                                                                        <td className="py-2.5 px-3 text-right text-emerald-300 tabular-nums">{formatPLN(row.eliRocznyPit)}</td>
                                                                        <td className="py-2.5 px-3 text-right tabular-nums">{formatPLN(row.eliMonths.reduce((a, x) => a + x.netto, 0))}</td>
                                                                        <td className="py-2.5 px-3 border-r border-white/10"></td>
                                                                        <td className={`py-2.5 px-3 text-right tabular-nums font-black ${row.pitOszczednosc >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                                                                            {row.pitOszczednosc >= 0 ? '+' : ''}{formatPLN(row.pitOszczednosc)}
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                        {/* Info notes */}
                                                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500">
                                                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-400 shrink-0"></span>Podświetlenie amber = miesiąc w II progu PIT (dochód narastająco &gt; {formatPLN(p1Limit)})</span>
                                                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-400 shrink-0"></span>Świadczenie brutto = ekwiwalent brutto utrzymujący zadane netto po PIT (binary search)</span>
                                                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-400 shrink-0"></span>Δ PIT &gt; 0 = mniejszy podatek w Eliton Prime™ (oszczędność pracownika)</span>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}

                                {/* Grand totals */}
                                {tableData.length > 0 && (
                                    <tr className="bg-[#001433] text-white">
                                        <td></td>
                                        <td colSpan={2} className="py-3.5 px-3 text-[10px] font-bold uppercase tracking-wider opacity-70">SUMA FIRMA / ROK</td>
                                        <td colSpan={2}></td>
                                        <td className="py-3.5 px-3 text-right font-black text-rose-300 tabular-nums text-xs">{formatPLN(totals.stdRocznyPit)}</td>
                                        <td className="py-3.5 px-3 text-center border-r border-white/10">
                                            <span className="text-amber-300 text-[10px] font-bold">{totals.stdIIProg} w II progu</span>
                                        </td>
                                        <td colSpan={5}></td>
                                        <td className="py-3.5 px-3 text-right font-black text-emerald-300 tabular-nums text-xs">{formatPLN(totals.eliRocznyPit)}</td>
                                        <td className="py-3.5 px-3 text-center border-r border-white/10">
                                            <span className="text-amber-300 text-[10px] font-bold">{totals.eliIIProg} w II progu</span>
                                        </td>
                                        <td className="py-3.5 px-3 text-right font-black text-emerald-400 tabular-nums text-xs">
                                            +{formatPLN(totals.pitOszczednosc)}
                                        </td>
                                        <td></td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
