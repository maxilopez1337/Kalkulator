import React, { useState, useMemo } from 'react';
import { useCalculation, useCompany } from '../../../store/AppContext';
import { Card } from '../../../shared/ui/Card';
import { Input } from '../../../shared/ui/Input';
import { ButtonPrimary, ButtonSecondary } from '../../../shared/ui/Button';
import { formatPLN } from '../../../shared/utils/formatters';
import { Download, Users, TrendingUp, DollarSign } from '../../../common/Icons';

export const StepAnalizaPracownika = () => {
    const { wyniki } = useCalculation();
    const { config } = useCompany();
    
    const [raises, setRaises] = useState<Record<string, string>>({});
    const [globalRaise, setGlobalRaise] = useState<string>('');

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
            const kup = w.standard.kup || 0;
            
            const baseZasadniczaNetto = w.podzial.zasadnicza.netto || 0;
            const baseSwiadczenieNetto = w.podzial.swiadczenie.netto || 0;
            const totalTargetSwiadczenieNetto = baseSwiadczenieNetto + targetPodwyzka;

            const z_dochod_miesiac = Math.max(0, z_brutto - z_spol - kup);

            let roczneBrutto = 0;
            let rocznyPit = 0;
            let rocznyKosztPracodawcy = 0;
            let narastajacoDochod = 0;
            let firstProgCrossingMonth: number | null = null;
            
            for (let m = 1; m <= 12; m++) {
                if (isStudent) {
                    let s_brutto = totalTargetSwiadczenieNetto;
                    roczneBrutto += z_brutto + s_brutto;
                    rocznyKosztPracodawcy += z_brutto + s_brutto; // No ZUS
                    continue;
                }

                let s_brutto = 0;
                let s_pit = 0;
                let isZeroPit = false;
                
                if (emp.ulgaMlodych && narastajacoDochod < 85528) {
                    isZeroPit = true;
                }

                let preS_dochod = narastajacoDochod + z_dochod_miesiac;

                if (isZeroPit) {
                    s_brutto = totalTargetSwiadczenieNetto;
                    s_pit = 0;
                    narastajacoDochod += (z_dochod_miesiac + s_brutto);
                } else {
                    if (preS_dochod >= p1Limit) {
                        if (!firstProgCrossingMonth) firstProgCrossingMonth = m;
                        s_brutto = totalTargetSwiadczenieNetto / (1 - p2Stawka);
                        s_pit = s_brutto - totalTargetSwiadczenieNetto;
                    } else {
                        let bruttoW1Max = p1Limit - preS_dochod;
                        let netto1Max = bruttoW1Max * (1 - p1Stawka);
                        if (totalTargetSwiadczenieNetto <= netto1Max) {
                            s_brutto = totalTargetSwiadczenieNetto / (1 - p1Stawka);
                            s_pit = s_brutto - totalTargetSwiadczenieNetto;
                        } else {
                            if (!firstProgCrossingMonth) firstProgCrossingMonth = m;
                            let netto2 = totalTargetSwiadczenieNetto - netto1Max;
                            let brutto2 = netto2 / (1 - p2Stawka);
                            s_brutto = bruttoW1Max + brutto2;
                            s_pit = s_brutto - totalTargetSwiadczenieNetto;
                        }
                    }
                    narastajacoDochod += (z_dochod_miesiac + s_brutto);
                }

                let z_pit = w.podzial.pit?.zaliczkaZasadnicza || 0;
                rocznyPit += (z_pit + s_pit);
                roczneBrutto += (z_brutto + s_brutto);
                rocznyKosztPracodawcy += ((w.podzial.zasadnicza.kosztPracodawcy || z_brutto) + s_brutto);
            }

            const roczneNetto = (baseZasadniczaNetto + totalTargetSwiadczenieNetto) * 12;

            return {
                id: emp.id,
                imie: `${emp.imie} ${emp.nazwisko}`,
                typ: emp.typUmowy,
                student: isStudent,
                baseBrutto: z_brutto,
                baseNetto: w.standard.netto || 0,
                primeNettoBeforeRaise: baseZasadniczaNetto + baseSwiadczenieNetto,
                targetPodwyzka,
                newTotalNettoMiesiac: baseZasadniczaNetto + totalTargetSwiadczenieNetto,
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
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">KROK 7 — PANEL ZBIORCZY: ROZSZERZONA OPTYMALIZACJA PODWYŻEK (12 MSC)</h2>
                        <p className="text-slate-500 text-sm mt-1 max-w-3xl">
                            Wprowadź docelowe kwoty <strong className="text-blue-600">podwyżki netto (jako dodatek do świadczenia, bez objęcia ZUS)</strong>.
                            System symuluje pełen rok, precyzyjnie kalkulując brutto świadczenia na podstawie progów podatkowych (12% i 32%), KUP, oraz kwot narastająco. Zapewnia to pełną prognozę prawno-podatkową dla nowej stawki łącznej brutto i całkowitego kosztu.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Pracowników</div>
                            <div className="text-2xl font-black text-slate-700">{tableData.length}</div>
                        </div>
                        <Users className="text-slate-200 w-8 h-8" />
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Projekcja: Roczne Netto Lączne</div>
                            <div className="text-2xl font-black text-blue-600">{formatPLN(grandTotals.roczneNetto)}</div>
                        </div>
                        <DollarSign className="text-blue-100 w-8 h-8" />
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Projekcja: Roczny Koszt Firmy</div>
                            <div className="text-2xl font-black text-amber-600">{formatPLN(grandTotals.rocznyKoszt)}</div>
                        </div>
                        <TrendingUp className="text-amber-100 w-8 h-8" />
                    </div>
                    <div className="bg-slate-900 rounded-xl p-4 shadow-md flex flex-col justify-center">
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">Globalna Podwyżka Netto (+ Świadczenie)</div>
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

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                    <th className="py-3 px-4 font-bold">Pracownik</th>
                                    <th className="py-3 px-4 font-bold">Typ</th>
                                    <th className="py-3 px-4 font-bold text-right border-l border-slate-100">Standard: Netto</th>
                                    <th className="py-3 px-4 font-bold text-right bg-blue-50/50">Eliton: Start Netto</th>
                                    <th className="py-3 px-4 font-bold text-center bg-blue-50">+ Podwyżka Netto<br/><span className="text-[9px] font-normal">(w świadczeniu)</span></th>
                                    <th className="py-3 px-4 font-bold text-right bg-blue-100/50 border-r border-slate-200">Nowe Netto (1 mc)</th>
                                    <th className="py-3 px-4 font-bold text-right">Średnie Brutto (mc)</th>
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
                                            {formatPLN(row.primeNettoBeforeRaise)}
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
                                        
                                        <td className="py-3 px-4 text-right font-bold text-blue-700 bg-blue-100/50 border-r border-slate-200">
                                            {formatPLN(row.newTotalNettoMiesiac)}
                                        </td>

                                        <td className="py-3 px-4 text-right font-medium text-slate-600">
                                            {formatPLN(row.avgNewTotalBruttoMiesiac)}
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

                                <tr className="bg-[#001433] text-white border-t-2 border-slate-800">
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