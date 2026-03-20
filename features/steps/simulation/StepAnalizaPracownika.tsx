import React, { useState, useMemo } from 'react';
import { useCalculation, useCompany } from '../../../store/AppContext';
import { Card } from '../../../shared/ui/Card';
import { Input } from '../../../shared/ui/Input';
import { ButtonPrimary, ButtonSecondary } from '../../../shared/ui/Button';
import { formatPLN } from '../../../shared/utils/formatters';
import { Download, Users, TrendingUp, DollarSign, ChevronDown, ChevronUp } from '../../../common/Icons';
import { SectionLabel } from '../../../shared/ui/SectionLabel';
import { KpiCard } from '../../../shared/ui/KpiCard';
import { PageHeader } from '../../../shared/ui/PageHeader';

export const StepAnalizaPracownika = () => {
    const { wyniki } = useCalculation();
    const { config } = useCompany();
    
    const [raises, setRaises] = useState<Record<string, string>>({});
    const [globalRaise, setGlobalRaise] = useState<string>('');
    const [expandedMobi, setExpandedMobi] = useState<string[]>([]);
    const toggleMobi = (id: string) => setExpandedMobi(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const pracownicy = wyniki?.szczegoly || [];

    const handleApplyGlobalRaise = () => {
        const newRaises: Record<string, string> = {};
        pracownicy.forEach((p: any) => {
            newRaises[p.pracownik.id] = globalRaise;
        });
        setRaises(newRaises);
    };

    const handleRaiseChange = (id: string, value: string) => {
        setRaises(prev => ({ ...prev, [id]: value }));
    };

    const tableData = useMemo(() => {
        return pracownicy.map((w: any) => {
            const emp = w.pracownik;
            const targetPodwyzka = parseFloat(raises[emp.id]) || 0;

            const p1Limit = config?.pit?.prog1Limit || 120000;
            const p1Stawka = config?.pit?.prog1Stawka || 0.12;
            const p2Stawka = config?.pit?.prog2Stawka || 0.32;

            const isStudent = emp.trybSkladek === 'STUDENT_UZ';

            const z_brutto = w.podzial.zasadnicza.brutto || 0;
            const z_spol = w.podzial.zasadnicza.zusPracownik?.suma || 0;
            const z_zdrow = w.podzial.zasadnicza.zdrowotna || 0;
            const kup = w.standard.kup || 0;
            
            // KZP is PIT-2 kwota zmniejszajaca
            let kzp = typeof w.standard.pit?.kwotaZmniejszajaca === 'number' ? w.standard.pit.kwotaZmniejszajaca : parseFloat(emp.pit2Kwota);
            if (isNaN(kzp)) kzp = 0;

            const baseZasadniczaNetto = w.podzial.zasadnicza.netto || 0;
            const baseSwiadczenieNetto = w.podzial.swiadczenie.netto || 0;
            const totalTargetSwiadczenieNetto = baseSwiadczenieNetto + targetPodwyzka;

            let roczneBrutto = 0;
            let rocznyPit = 0;
            let rocznyKosztPracodawcy = 0;
            let narastajacoDochod = 0;
            let firstProgCrossingMonth: number | null = null;
            let m1TotalBrutto = 0;

            for (let m = 1; m <= 12; m++) {
                if (isStudent) {
                    let s_brutto = totalTargetSwiadczenieNetto;
                    let m_brutto = z_brutto + s_brutto;
                    if (m === 1) m1TotalBrutto = m_brutto;
                    roczneBrutto += m_brutto;
                    rocznyKosztPracodawcy += m_brutto; 
                    continue;
                }

                // Funkcja liczaca podatki wedlug wymogow uzytkownika - sumaryczne odejmowanie KUP i KZP
                const obliczMiesiac = (kandydat_s_brutto: number) => {
                    let dochod = z_brutto - z_spol + kandydat_s_brutto - kup;
                    if (dochod < 0) dochod = 0;
                    
                    let podstawa = Math.round(dochod);
                    let tax = 0;
                    let m_narastajaco = narastajacoDochod;

                    let isZeroPit = emp.ulgaMlodych && m_narastajaco < 85528;
                    if (isZeroPit) {
                        let zwolnione = Math.min(dochod, 85528 - m_narastajaco);
                        let doOpodatkowania = Math.max(0, dochod - zwolnione);
                        podstawa = Math.round(doOpodatkowania);
                    }

                    if (m_narastajaco < p1Limit) {
                        let spaceInP1 = p1Limit - m_narastajaco;
                        if (podstawa <= spaceInP1) {
                            tax = podstawa * p1Stawka;
                        } else {
                            tax = spaceInP1 * p1Stawka + (podstawa - spaceInP1) * p2Stawka;
                        }
                    } else {
                        tax = podstawa * p2Stawka;
                    }

                    tax -= kzp;
                    if (tax < 0) tax = 0;
                    tax = Math.round(tax);

                    let netto = z_brutto + kandydat_s_brutto - z_spol - z_zdrow - tax;
                    return { netto, tax, dochod };
                };

                const bazaRes = obliczMiesiac(0);
                const ZasadniczeNetto = bazaRes.netto; 
                
                let targetTotalNetto = ZasadniczeNetto + totalTargetSwiadczenieNetto;

                let minS = totalTargetSwiadczenieNetto;
                let maxS = totalTargetSwiadczenieNetto * 3.0; // Margin
                for(let i = 0; i < 40; i++) {
                    let mid = (minS + maxS) / 2;
                    let r = obliczMiesiac(mid);
                    if (r.netto < targetTotalNetto) minS = mid;
                    else maxS = mid;
                }
                
                let final_s_brutto = (minS + maxS) / 2;
                let finalRes = obliczMiesiac(final_s_brutto);
                let final_dochod = z_brutto - z_spol + final_s_brutto - kup;
                if (final_dochod < 0) final_dochod = 0;
                
                if (!firstProgCrossingMonth && (narastajacoDochod + final_dochod > p1Limit)) {
                    firstProgCrossingMonth = m;
                }

                narastajacoDochod += final_dochod;
                rocznyPit += finalRes.tax;
                
                let b_total = z_brutto + final_s_brutto;
                if (m === 1) m1TotalBrutto = b_total;
                roczneBrutto += b_total;
                rocznyKosztPracodawcy += ((w.podzial.zasadnicza.kosztPracodawcy || z_brutto) + final_s_brutto);
            }

            const roczneNetto = (baseZasadniczaNetto + totalTargetSwiadczenieNetto) * 12;

            return {
                id: emp.id,
                imie: `${emp.imie} ${emp.nazwisko}`,
                typ: emp.typUmowy,
                student: isStudent,
                baseBrutto: z_brutto, // Zmiana 1: Zasadnicze brutto
                baseSwiadczenieNetto: baseSwiadczenieNetto, // Zmiana 2: Swiadczenie netto w Eliton
                targetPodwyzka,
                newTotalNettoMiesiac: baseZasadniczaNetto + totalTargetSwiadczenieNetto, // Nowe netto z sumy
                m1TotalBrutto: m1TotalBrutto, // Zmiana 4: Sumaryczne brutto wedlug obliczen (1mc)
                avgNewTotalBruttoMiesiac: roczneBrutto / 12,
                roczneNetto,
                roczneBrutto,
                rocznyKosztPracodawcy,
                rocznyPit,
                firstProgCrossingMonth
            };
        });
    }, [pracownicy, raises, config]);

    const grandTotals = useMemo(() => {
        return tableData.reduce((acc, row) => {
            acc.roczneNetto += row.roczneNetto;
            acc.roczneBrutto += row.roczneBrutto;
            acc.rocznyKoszt += row.rocznyKosztPracodawcy;
            acc.rocznyPit += row.rocznyPit;
            return acc;
        }, { roczneNetto: 0, roczneBrutto: 0, rocznyKoszt: 0, rocznyPit: 0 });
    }, [tableData]);

    return (
        <div className="w-full flex justify-center">
            <div className="max-w-[1400px] w-full px-2 md:px-0">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                    <PageHeader
                        icon={<Users />}
                        iconColor="bg-[#eff6fc] text-[#0078d4]"
                        title="Panel Zbiorczy: Optymalizacja Podwyżek"
                        description="Wprowadź docelowe kwoty podwyżki netto. System prognozuje pełen rok z uwzględnieniem progów podatkowych (12% i 32%), KUP oraz kwot narastająco."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <KpiCard
                        label="Pracowników"
                        value={<span className="font-black">{tableData.length}</span>}
                        icon={<Users className="text-slate-200 w-8 h-8" />}
                        className="p-4"
                    />
                    <KpiCard
                        label="Projekcja: Roczne Netto Lączne"
                        value={<span className="text-blue-600 font-black">{formatPLN(grandTotals.roczneNetto)}</span>}
                        icon={<DollarSign className="text-blue-100 w-8 h-8" />}
                        className="p-4"
                    />
                    <KpiCard
                        label="Projekcja: Roczny Koszt Firmy"
                        value={<span className="text-amber-600 font-black">{formatPLN(grandTotals.rocznyKoszt)}</span>}
                        icon={<TrendingUp className="text-amber-100 w-8 h-8" />}
                        className="p-4"
                    />
                    <div className="bg-slate-900 rounded-xl p-4 shadow-md flex flex-col justify-center">
                        <SectionLabel className="mb-1.5">Globalna Podwyżka Netto (+ Świadczenie)</SectionLabel>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number"
                                value={globalRaise}
                                onChange={e => setGlobalRaise(e.target.value)}
                                placeholder="np. 500"
                                className="w-full px-3 py-1.5 rounded-md text-sm border-none bg-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                            />
                            <ButtonPrimary size="sm" onClick={handleApplyGlobalRaise}>Zastosuj</ButtonPrimary>
                        </div>
                    </div>
                </div>

                {/* Desktop table */}
                <div className="hidden md:block bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                    <th className="py-3 px-4 font-bold">Pracownik</th>
                                    <th className="py-3 px-4 font-bold">Typ</th>
                                    <th className="py-3 px-4 font-bold text-right border-l border-slate-100 text-green-700">Zasadnicze Brutto</th>
                                    <th className="py-3 px-4 font-bold text-right bg-blue-50/50 text-blue-700">Świadczenie Netto</th>
                                    <th className="py-3 px-4 font-bold text-center bg-blue-50">+ Podwyżka Netto<br/><span className="text-[9px] font-normal">(w świadczeniu)</span></th>
                                    <th className="py-3 px-4 font-bold text-right bg-yellow-50 border-r border-yellow-200 text-yellow-800">Nowe Łączne Netto</th>
                                    <th className="py-3 px-4 font-bold text-right text-pink-600">Nowe Łączne Brutto (1mc)</th>
                                    <th className="py-3 px-4 font-bold text-center border-l border-slate-100 bg-amber-50/30">Przekroczenie II Progu<br/><span className="text-[9px] font-normal">(miesiąc wejścia)</span></th>
                                    <th className="py-3 px-4 font-bold text-right bg-indigo-50/50">Roczny Koszt Całk.</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tableData.map((row, i) => (
                                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3 px-4 font-semibold text-slate-800 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-bold border border-slate-200">{i+1}</div>
                                            {row.imie} {row.student && <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.5 rounded">STUDENT</span>}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${row.typ === 'UOP' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                {row.typ}
                                            </span>
                                        </td>
                                        
                                        <td className="py-3 px-4 text-right text-slate-500 border-l border-slate-100">
                                            {formatPLN(row.baseNetto)}
                                        </td>

                                        <td className="py-3 px-4 text-right font-medium text-slate-700 bg-blue-50/50">
                                            {formatPLN(row.baseSwiadczenieNetto)}
                                        </td>
                                        
                                        <td className="py-2 px-4 bg-blue-50 text-center relative z-10">
                                            <input 
                                                type="number" 
                                                value={raises[row.id] || ''} 
                                                onChange={e => handleRaiseChange(row.id, e.target.value)}
                                                className="w-24 text-center px-2 py-1.5 border border-blue-200 rounded text-sm font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
                                                placeholder="0"
                                            />
                                        </td>
                                        
                                        <td className="py-3 px-4 text-right font-bold text-yellow-800 bg-yellow-50 border-r border-yellow-200">
                                            {formatPLN(row.newTotalNettoMiesiac)}
                                        </td>

                                        <td className="py-3 px-4 text-right font-medium text-pink-600">
                                            {formatPLN(row.m1TotalBrutto)}
                                        </td>
                                        
                                        <td className="py-3 px-4 text-center border-l border-slate-100 bg-amber-50/30">
                                            {row.firstProgCrossingMonth ? (
                                                <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md border border-amber-200 shadow-sm">
                                                    Miesiąc: {row.firstProgCrossingMonth}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300 text-[10px] font-bold uppercase tracking-wider">Brak (- I próg -)</span>
                                            )}
                                        </td>

                                        <td className="py-3 px-4 text-right font-black text-indigo-900 bg-indigo-50/50 tabular-nums">
                                            {formatPLN(row.rocznyKosztPracodawcy)}
                                        </td>
                                    </tr>
                                ))}

                                <tr className="bg-brand text-white border-t-2 border-slate-800">
                                    <td colSpan={5} className="py-4 px-4 font-bold tracking-widest text-[10px] uppercase opacity-80 text-right">
                                        Roczne Prognozy Zbiorcze Całej Firmy
                                    </td>
                                    <td className="py-4 px-4 text-right font-bold bg-blue-900/40">
                                        <div className="text-[9px] text-blue-200 mb-0.5 opacity-60">ROCZNIE NETTO (W ZD)</div>
                                        {formatPLN(grandTotals.roczneNetto)}
                                    </td>
                                    <td className="py-4 px-4 text-right font-bold">
                                        <div className="text-[9px] text-slate-400 mb-0.5 opacity-60">ROCZNIE BRUTTO (B+Ś)</div>
                                        {formatPLN(grandTotals.roczneBrutto)}
                                    </td>
                                    <td className="py-4 px-4 text-center bg-amber-900/40 border-l border-slate-700">
                                        <div className="text-[9px] text-amber-200 opacity-60">ZALICZKA PIT (B+S) RAZEM</div>
                                        {formatPLN(grandTotals.rocznyPit)}
                                    </td>
                                    <td className="py-4 px-4 text-right font-black bg-indigo-900/60">
                                        <div className="text-[9px] text-indigo-300 mb-0.5 opacity-60">ROCZNY KOSZT FIRMY</div>
                                        <span className="text-[#38bdf8]">{formatPLN(grandTotals.rocznyKoszt)}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile card list */}
                <div className="md:hidden mb-6 space-y-3">
                    {tableData.map((row, i) => {
                        const isExpanded = expandedMobi.includes(row.id);
                        return (
                            <div key={row.id} className="bg-white border border-[#edebe9] rounded-md shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-[#edebe9]">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <div className="w-6 h-6 rounded-sm bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-bold border border-slate-200">{i + 1}</div>
                                        <span className="font-semibold text-sm text-slate-800">{row.imie}</span>
                                        {row.student && <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.5 rounded">STUDENT</span>}
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${row.typ === 'UOP' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{row.typ}</span>
                                    </div>
                                    <button onClick={() => toggleMobi(row.id)} aria-expanded={isExpanded} className="p-1.5 text-slate-400 hover:text-[#0078d4] rounded-sm transition-colors">
                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                </div>
                                <div className="px-4 py-3 flex items-start gap-3">
                                    <div className="flex-1">
                                        <div className="text-[10px] text-slate-400 mb-1 uppercase font-semibold">+ Podwyżka Netto</div>
                                        <input
                                            type="number"
                                            value={raises[row.id] || ''}
                                            onChange={e => handleRaiseChange(row.id, e.target.value)}
                                            className="w-full px-2 py-1.5 border border-blue-200 rounded text-sm font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Nowe Netto</div>
                                        <div className="font-bold text-yellow-800 tabular-nums text-sm">{formatPLN(row.newTotalNettoMiesiac)}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Koszt Firmy</div>
                                        <div className="font-black text-indigo-900 tabular-nums text-sm">{formatPLN(row.rocznyKosztPracodawcy)}</div>
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="px-4 pb-3 pt-3 border-t border-[#edebe9] grid grid-cols-2 gap-2 text-xs">
                                        <div><span className="text-slate-400">Zasadnicze Brutto</span><div className="font-medium text-slate-700 tabular-nums">{formatPLN(row.baseBrutto)}</div></div>
                                        <div><span className="text-slate-400">Świadczenie Netto</span><div className="font-medium text-slate-700 tabular-nums">{formatPLN(row.baseSwiadczenieNetto)}</div></div>
                                        <div><span className="text-slate-400">Brutto m1</span><div className="font-medium text-pink-600 tabular-nums">{formatPLN(row.m1TotalBrutto)}</div></div>
                                        <div><span className="text-slate-400">II Próg – miesiąc</span><div className="font-medium tabular-nums">{row.firstProgCrossingMonth ? <span className="text-amber-700">Miesiąc: {row.firstProgCrossingMonth}</span> : <span className="text-slate-300">Brak</span>}</div></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div className="bg-[#0078d4] text-white rounded-md px-4 py-3 flex justify-between items-center">
                        <span className="font-bold uppercase tracking-wider text-xs opacity-80">Łącznie</span>
                        <div className="flex gap-6">
                            <div className="text-right"><div className="text-[10px] opacity-70">Roczne Netto</div><div className="font-bold tabular-nums text-sm">{formatPLN(grandTotals.roczneNetto)}</div></div>
                            <div className="text-right"><div className="text-[10px] opacity-70">Koszt Firmy</div><div className="font-black tabular-nums text-sm">{formatPLN(grandTotals.rocznyKoszt)}</div></div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-500 pb-12">
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-slate-700 mb-1 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Jak działa symulacja roczna?</h4>
                        <p>Kalkulator modeluje zarobki miesiąc po miesiącu uwzględniając koszty uzyskania przychodu (KUP), kwotę wolną i ulgi dla Młodych. Benefity Eliton Prime są dopisywane do kwoty brutto nie zwiększając składek ZUS, dzięki czemu precyzyjnie obserwujemy wejście w II próg podatkowy i realnie rosnący koszt ubruttowienia podwyżki po przekroczeniu 120 000 zł dochodu (na zasadach Ordynacji Podatkowej).</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-slate-700 mb-1 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Przekroczenie progu (32%)</h4>
                        <p>Gdy „dochód podatkowy” z klasycznego etatu połączony ze świadczeniem w ujęciu narastającym przekroczy limit progu, system od momentu zderzenia uwzględnia stawkę PIT II progu (tj. 32%). Podnosi to kwotę Łącznego Średniego Brutta oraz miesięczny Koszt Całkowity Przedsiębiorcy, by finalnie utrzymać zadeklarowane Wynagrodzenie Netto bez zmian (tzw. ubruttowienie docelowej kwoty 'do ręki').</p>
                    </div>
                </div>

            </div>
        </div>
    );
};