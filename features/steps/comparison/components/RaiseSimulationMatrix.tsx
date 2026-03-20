import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../../../store/AppContext';
import { obliczWariantStandard, obliczWariantPodzial } from '../../../tax-engine';
import { Card } from '../../../../shared/ui/Card';
import { TrendingUp, Users, UserCheck } from '../../../../common/Icons';
import { formatPLN } from '../../../../shared/utils/formatters';

export const RaiseSimulationMatrix = () => {
    const { pracownicy, firma, config, prowizjaProc } = useAppStore();
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | 'ALL'>('ALL');

    // Kwoty podwyżek "na rękę" do symulacji
    const raiseSteps = [100, 200, 300, 400, 500, 1000];

    const matrixData = useMemo(() => {
        const targetEmployees = selectedEmployeeId === 'ALL' 
            ? pracownicy 
            : pracownicy.filter(p => p.id === selectedEmployeeId);

        if (targetEmployees.length === 0) return [];

        return raiseSteps.map(raiseAmount => {
            let totalStdKosztyBazowe = 0;
            let totalStdKosztyPoPodwyzce = 0;

            let totalPodzialKosztyBazowe = 0;
            let totalPodzialKosztyPoPodwyzce = 0;

            targetEmployees.forEach(p => {
                // 1. STANDARD BAZA
                const stdBase = obliczWariantStandard(p, firma.wypadkowa, config);
                totalStdKosztyBazowe += stdBase.kosztPracodawcy;

                // 2. STANDARD Z PODWYŻKĄ
                // Trzeba ustalić wyższe netto
                const modifiedStdEmp = { ...p, nettoDocelowe: p.nettoDocelowe + raiseAmount };
                const stdRaise = obliczWariantStandard(modifiedStdEmp, firma.wypadkowa, config);
                totalStdKosztyPoPodwyzce += stdRaise.kosztPracodawcy;

                // 3. ELITON BAZA
                const podzBase = obliczWariantPodzial(p, firma.wypadkowa, p.nettoZasadnicza, config);
                const prowizjaBase = podzBase.swiadczenie.netto * (prowizjaProc / 100);
                totalPodzialKosztyBazowe += podzBase.kosztPracodawcy + prowizjaBase;

                // 4. ELITON Z PODWYŻKĄ
                // W modelu splitu, cała podwyżka idzie w "świadczenie" wolne od ZUS. Podstawa ZUS pozostaje BEZ ZMIAN!
                const modifiedPodzEmp = { ...p, nettoDocelowe: p.nettoDocelowe + raiseAmount };
                const podzRaise = obliczWariantPodzial(modifiedPodzEmp, firma.wypadkowa, p.nettoZasadnicza, config);
                const prowizjaRaise = podzRaise.swiadczenie.netto * (prowizjaProc / 100);
                totalPodzialKosztyPoPodwyzce += podzRaise.kosztPracodawcy + prowizjaRaise;
            });

            const kosztPodwyzkiStandard = totalStdKosztyPoPodwyzce - totalStdKosztyBazowe;
            const kosztPodwyzkiEliton = totalPodzialKosztyPoPodwyzce - totalPodzialKosztyBazowe;
            const oszczednoscFirmy = kosztPodwyzkiStandard - kosztPodwyzkiEliton;
            const procentOszczednosci = kosztPodwyzkiStandard > 0 ? (oszczednoscFirmy / kosztPodwyzkiStandard) * 100 : 0;

            return {
                raiseAmount,
                totalNettoRaise: raiseAmount * targetEmployees.length,
                kosztPodwyzkiStandard,
                kosztPodwyzkiEliton,
                oszczednoscFirmy,
                procentOszczednosci
            };
        });
    }, [pracownicy, selectedEmployeeId, firma.wypadkowa, config, prowizjaProc]);

    if (pracownicy.length === 0) return null;

    return (
        <Card>
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <TrendingUp className="text-amber-500" />
                        Symulator Kosztów Podwyżek
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xl">
                        Sprawdź, ile realnie kosztuje firmę przyznanie podwyżki "na rękę" w modelu klasycznym (UoP w pełni oskładkowane) w porównaniu do modelu Eliton (gdzie podwyżka trafia bezpiecznie do kwoty wolnej od ZUS).
                    </p>
                </div>
                
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setSelectedEmployeeId('ALL')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${selectedEmployeeId === 'ALL' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Users className="w-3.5 h-3.5" />
                        Cały Zespół
                    </button>
                    {pracownicy.map((p) => (
                        <button 
                            key={p.id}
                            onClick={() => setSelectedEmployeeId(p.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all truncate max-w-[120px] ${selectedEmployeeId === p.id ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                            title={`${p.imie} ${p.nazwisko}`}
                        >
                            <UserCheck className="w-3.5 h-3.5" />
                            {p.imie}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                            <th className="py-4 px-6 text-indigo-700">Podwyżka Netto<br/><span className="text-[10px] font-normal text-slate-400">Na rękę (na pracownika)</span></th>
                            <th className="py-4 px-6 text-right">Koszt Pracodawcy<br/><span className="text-[10px] font-normal text-slate-400">Standardowy (UoP)</span></th>
                            <th className="py-4 px-6 text-right">Koszt Pracodawcy<br/><span className="text-[10px] font-normal text-slate-400">W modelu Eliton Prime™</span></th>
                            <th className="py-4 px-6 text-right bg-emerald-50/50">Oszczędność Firmy<br/><span className="text-[10px] font-normal text-emerald-600/70">W każdym miesiącu</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {matrixData.map((row) => (
                            <tr key={row.raiseAmount} className="hover:bg-slate-50 transition-colors group">
                                <td className="py-3 px-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs ring-1 ring-indigo-100 group-hover:scale-110 transition-transform">
                                            +{row.raiseAmount}
                                        </div>
                                        <div className="font-bold text-sm text-slate-800">
                                            {formatPLN(row.raiseAmount)} netto
                                            {selectedEmployeeId === 'ALL' && <div className="text-[10px] text-slate-400 font-normal">Suma: +{formatPLN(row.totalNettoRaise)} msc</div>}
                                        </div>
                                    </div>
                                </td>
                                
                                <td className="py-3 px-6 text-right">
                                    <span className="text-sm font-semibold text-slate-600">{formatPLN(row.kosztPodwyzkiStandard)}</span>
                                    <div className="flex items-center justify-end gap-1 mt-0.5">
                                        <span className="text-[10px] text-slate-400">Dopłata podatk./ZUS:</span>
                                        <span className="text-[10px] text-rose-500 font-medium">+{formatPLN(row.kosztPodwyzkiStandard - row.totalNettoRaise)}</span>
                                    </div>
                                </td>
                                
                                <td className="py-3 px-6 text-right border-l border-dashed border-slate-200 bg-slate-50/30">
                                    <span className="text-sm font-bold text-amber-700">{formatPLN(row.kosztPodwyzkiEliton)}</span>
                                    <div className="flex items-center justify-end gap-1 mt-0.5">
                                        <span className="text-[10px] text-slate-400">Marża platformy:</span>
                                        <span className="text-[10px] text-amber-600 font-medium">+{formatPLN(row.kosztPodwyzkiEliton - row.totalNettoRaise)}</span>
                                    </div>
                                </td>

                                <td className="py-3 px-6 text-right bg-emerald-50/50">
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-black text-emerald-600">+{formatPLN(row.oszczednoscFirmy)}</span>
                                        <span className="text-[10px] uppercase font-bold text-emerald-700/60 tracking-wider">Taniej o {row.procentOszczednosci.toFixed(0)}%</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-start gap-3">
                <div className="p-1 rounded-full bg-blue-100 text-blue-600 mt-0.5"><TrendingUp size={14} /></div>
                <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
                    <strong className="text-slate-700">Dlaczego warto?</strong> Przyznając pracownikowi 500 zł podwyżki w klasycznym modelu, firma pokrywa narzut PIT i obustronnego ZUS-u dochodzący do 70% wartości podwyżki.
                    W modelu Eliton Prime™ nowa kwota zasila strumień świadczenia rzeczowego, co oznacza zapłatę jedynie prowizji platformy i PIT. 
                    <strong className="text-slate-700 ml-1">Pracownik zarabia więcej, a budżet firmy pozostaje pod ścisłą kontrolą.</strong>
                </p>
            </div>
        </Card>
    );
};