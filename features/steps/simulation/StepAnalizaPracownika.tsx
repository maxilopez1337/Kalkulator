import React, { useState, useMemo } from 'react';
import { useCalculation, useCompany } from '../../../store/AppContext';
import { calcPitMiesiac } from '../../tax-engine/logic/pit';
import { AnalizaKpiBar } from './components/AnalizaKpiBar';
import { AnalizaDataTable } from './components/AnalizaDataTable';

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
                            <h1 className="text-sm md:text-base font-bold text-[#201f1e] leading-tight">Analiza PIT-37 – Symulacja Podatku Pracownika</h1>
                        </div>
                        <p className="hidden sm:block text-[11px] text-[#605e5c] pl-3.5">Model Tradycyjny vs. Eliton Prime™ &nbsp;·&nbsp; Skala 12% / 32% (narastająco) &nbsp;·&nbsp; Miesiąc po miesiącu &nbsp;·&nbsp; Próg II: 120 000 zł/rok</p>
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
            <AnalizaKpiBar totals={totals} />

            {/* MAIN TABLE */}
            <AnalizaDataTable
                tableData={tableData}
                totals={totals}
                raises={raises}
                setRaise={setRaise}
                expanded={expanded}
                toggleRow={toggleRow}
                p1Limit={p1Limit}
            />
        </div>
    );
};
