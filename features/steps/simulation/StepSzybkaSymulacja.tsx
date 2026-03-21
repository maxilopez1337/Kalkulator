
import React, { useState, useMemo } from 'react';
import { Zap, Users, ArrowRight, Wallet, PieChart, TrendingUp, Filter, Building, Check, ShieldCheck } from '../../../common/Icons';
import { formatPLN } from '../../../shared/utils/formatters';
import { useAppStore } from '../../../store/AppContext';
import { obliczWariantStandard, obliczWariantPodzial } from '../../tax-engine';
import { Pracownik } from '../../../entities/employee/model';
import { ofertaV5Generator } from '../../../services/ofertaZgrubna/pages5/generatorV5';

interface Props {
    onTransfer: () => void;
}

type ContractType = 'UOP' | 'UZ' | 'MIXED';

export const StepSzybkaSymulacja = ({ onTransfer }: Props) => {
    const { config, setPracownicy, setProwizjaProc, setComparisonState, firma } = useAppStore();
    
    // --- STATE ---
    const [empCount, setEmpCount] = useState<number>(50);
    const [avgSalary, setAvgSalary] = useState<number>(6000);
    const [salaryMode, setSalaryMode] = useState<'NETTO' | 'BRUTTO'>('NETTO');
    const [contractType, setContractType] = useState<ContractType>('UOP');
    const [mixUZ, setMixUZ] = useState<number>(0);
    // Pochodne
    const mixUZClamped = Math.min(mixUZ, empCount);
    const mixUOP = empCount - mixUZClamped;
    // Zachowane dla generatora oferty (ratio %)
    const mixRatio = empCount > 0 ? Math.round((mixUZClamped / empCount) * 100) : 0;
    const [uzGodziny, setUzGodziny] = useState<number>(80);
    const [uzStawkaGodz, setUzStawkaGodz] = useState<number>(25.36);
    const uzKwotaZasadnicza = Math.round(uzGodziny * uzStawkaGodz * 100) / 100;

    // --- CALCULATION ---
    const simulation = useMemo(() => {
        // 1. Determine Counts based on Mix
        let countUOP = 0;
        let countUZ = 0;

        if (contractType === 'UOP') countUOP = empCount;
        else if (contractType === 'UZ') countUZ = empCount;
        else {
            // MIXED Logic
            countUZ = mixUZClamped;
            countUOP = empCount - countUZ;
        }

        // 2. Helper to calculate single employee cost
        const calculateOne = (type: 'UOP' | 'UZ') => {
            let baseNetto = avgSalary;
            
            // Gross-up approx if BRUTTO selected
            if (salaryMode === 'BRUTTO') {
                baseNetto = type === 'UOP' ? avgSalary * 0.71 : avgSalary * 0.78;
            }

            const dummyEmployee: Pracownik = {
                id: 0, imie: 'X', nazwisko: 'X', dataUrodzenia: '1990-01-01', plec: 'M',
                typUmowy: type, trybSkladek: 'PELNE', choroboweAktywne: type !== 'UZ', pit2: String(config.pit.kwotaZmniejszajacaMies), ulgaMlodych: false,
                kupTyp: type === 'UZ' ? 'PROC_20' : 'STANDARD',
                nettoDocelowe: baseNetto,
                nettoZasadnicza: type === 'UZ' ? uzKwotaZasadnicza : config.placaMinimalna.netto,
                pitMode: 'AUTO', skladkaFP: true, skladkaFGSP: true
            };

            const std = obliczWariantStandard(dummyEmployee, firma.stawkaWypadkowa, config);
            const opt = obliczWariantPodzial(dummyEmployee, firma.stawkaWypadkowa, dummyEmployee.nettoZasadnicza, config);

            // Strategy Logic
            // SAVINGS: config.prowizja.standard % prowizji, brak podwyżek.
            // WIN_WIN: config.prowizja.plus % prowizji całkowitej (z czego część idzie na podwyżkę, ale w uproszczeniu koszt modelu = koszt pracodawcy + cała "prowizja" plus%)
            const provPercent = config.prowizja.standard;
            const provision = opt.swiadczenie.netto * (provPercent / 100);

            // W wariancie WIN_WIN, podwyżka jest częścią "prowizji" w sensie podziału oszczędności, 
            // ale technicznie jest kosztem pracodawcy wypłacanym pracownikowi. 
            // Tutaj upraszczamy: Koszt Nowy = Koszt ZUS/PIT + Prowizja (która zawiera w sobie fee + podwyżkę).
            
            return {
                stdKoszt: std.kosztPracodawcy,
                stdBrutto: std.brutto,
                stdZus: std.zusPracodawca.suma,
                optKosztBase: opt.kosztPracodawcy,
                optBrutto: opt.zasadnicza.brutto + opt.swiadczenie.brutto, // łączne brutto
                optZus: opt.zasadnicza.zusPracodawca.suma, // ZUS tylko od zasadniczej
                optEbs: opt.swiadczenie.netto,
                provision: provision,
                optKosztTotal: opt.kosztPracodawcy + provision,
                netto: baseNetto
            };
        };

        const resUOP = calculateOne('UOP');
        const resUZ = calculateOne('UZ');

        const totalStd = (resUOP.stdKoszt * countUOP) + (resUZ.stdKoszt * countUZ);
        const totalNew = (resUOP.optKosztTotal * countUOP) + (resUZ.optKosztTotal * countUZ);
        const totalProv = (resUOP.provision * countUOP) + (resUZ.provision * countUZ);
        
        const savings = totalStd - totalNew;

        const n = empCount || 1;
        const avgBruttoStd  = (resUOP.stdBrutto  * countUOP + resUZ.stdBrutto  * countUZ) / n;
        const avgZusStd     = (resUOP.stdZus      * countUOP + resUZ.stdZus      * countUZ) / n;
        const avgBruttoNowy = (resUOP.optBrutto   * countUOP + resUZ.optBrutto   * countUZ) / n;
        const avgZusNowy    = (resUOP.optZus       * countUOP + resUZ.optZus       * countUZ) / n;
        const avgEbs        = (resUOP.optEbs       * countUOP + resUZ.optEbs       * countUZ) / n;

        return {
            countUOP,
            countUZ,
            totalStd,
            totalNew,
            totalProv,
            savings,
            monthlySavings: savings,
            yearlySavings: savings * 12,
            perEmployeeSavings: empCount > 0 ? savings / empCount : 0,
            avgBruttoStd,
            avgZusStd,
            avgBruttoNowy,
            avgZusNowy,
            avgEbs,
        };

    }, [empCount, avgSalary, salaryMode, contractType, mixUZ, uzKwotaZasadnicza, config]);

    // --- OFERTA ZGRUBNA ---
    const handleOfertaV5 = () => {
        ofertaV5Generator.generate({
            empCount,
            avgSalary,
            salaryMode,
            contractType,
            mixRatio,
            uzGodziny,
            uzKwotaZasadnicza,
            firmaNazwa: firma?.nazwa,
            advisorName:  firma?.opiekunNazwa  || undefined,
            advisorPhone: firma?.opiekunTelefon || undefined,
            advisorEmail: firma?.opiekunEmail  || undefined,
            prowizjaStandard: config.prowizja.standard,
            prowizjaPlus: config.prowizja.plus,
            simulation,
        });
    };

    // --- TRANSFER ---
    const handleTransfer = () => {
        // Usunięto sztuczny limit 50 pracowników. Generujemy dokładnie tyle, ile wynika z symulacji.
        const genUOP = simulation.countUOP;
        const genUZ = simulation.countUZ;

        const newEmployees: Pracownik[] = [];
        let idCounter = Date.now();

        const createEmp = (type: 'UOP' | 'UZ', i: number) => ({
            id: idCounter + i,
            imie: `Pracownik`,
            nazwisko: `${type} ${i + 1}`,
            dataUrodzenia: '1990-01-01',
            plec: 'M' as const,
            typUmowy: type,
            trybSkladek: type === 'UZ' ? 'BEZ_CHOROBOWEJ' : 'PELNE',
            choroboweAktywne: type !== 'UZ',
            pit2: String(config.pit.kwotaZmniejszajacaMies),
            ulgaMlodych: false,
            kupTyp: type === 'UZ' ? 'PROC_20' : 'STANDARD',
            nettoDocelowe: salaryMode === 'NETTO' ? avgSalary : (type === 'UOP' ? avgSalary * 0.71 : avgSalary * 0.78),
            nettoZasadnicza: type === 'UZ' ? uzKwotaZasadnicza : config.placaMinimalna.netto,
            pitMode: 'AUTO' as const,
            skladkaFP: true,
            skladkaFGSP: true
        });

        for(let i=0; i<genUOP; i++) newEmployees.push(createEmp('UOP', i));
        for(let i=0; i<genUZ; i++) newEmployees.push(createEmp('UZ', genUOP + i));

        setProwizjaProc(config.prowizja.standard);
        setComparisonState(prev => ({ ...prev, activeCard: 'STANDARD', customStandardRate: config.prowizja.standard }));
        setPracownicy(newEmployees);
        onTransfer();
    };

    return (
        <div className="flex flex-col xl:flex-row xl:h-full xl:overflow-hidden overflow-y-auto animate-in fade-in zoom-in-95 duration-500">
            
            {/* LEFT PANEL: CONFIGURATION */}
            <div className="xl:w-[420px] bg-slate-900 text-white flex flex-col shrink-0 xl:min-h-0 border-r border-slate-800">
                
                {/* Header */}
                <div className="p-5 pb-2 shrink-0">
                    <div className="flex items-center gap-2 mb-3 text-emerald-400">
                        <div className="p-1.5 bg-emerald-500/10 rounded-lg"><Zap className="w-5 h-5" /></div>
                        <span className="font-bold uppercase tracking-widest text-xs">Szybka Symulacja v2.0</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white leading-tight">Parametry Biznesowe</h2>
                    <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                        Skonfiguruj strukturę zatrudnienia i wybierz strategię optymalizacji.
                    </p>
                </div>

                <div className="p-5 space-y-5 xl:flex-1 xl:overflow-y-auto xl:min-h-0 custom-scrollbar">
                    
                    {/* 1. PRACOWNICY */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Users className="w-4 h-4" /> Zatrudnienie
                        </label>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setEmpCount(c => Math.max(1, c - 1))}
                                className="w-11 h-11 bg-slate-700 hover:bg-slate-600 active:scale-95 rounded-sm text-white font-bold text-xl flex items-center justify-center transition-all shrink-0"
                            >−</button>
                            <input
                                type="number"
                                min="1" max="9999"
                                value={empCount}
                                onChange={(e) => setEmpCount(Math.max(1, parseInt(e.target.value) || 1))}
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-sm py-2.5 text-center text-white font-bold text-2xl focus:ring-2 focus:ring-[#0078d4] focus:border-transparent outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                                onClick={() => setEmpCount(c => Math.min(9999, c + 1))}
                                className="w-11 h-11 bg-slate-700 hover:bg-slate-600 active:scale-95 rounded-sm text-white font-bold text-xl flex items-center justify-center transition-all shrink-0"
                            >+</button>
                        </div>
                    </div>

                    {/* 2. STRUKTURA (UOP/UZ/MIX) */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Filter className="w-4 h-4" /> Struktura Umów
                        </label>
                        
                        <div className="grid grid-cols-3 gap-2">
                            {['UOP', 'MIXED', 'UZ'].map((type) => (
                                <button 
                                    key={type}
                                    onClick={() => setContractType(type as ContractType)}
                                    className={`py-2 px-1 text-xs font-bold rounded-md border transition-all ${
                                        contractType === type 
                                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/50' 
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
                                    }`}
                                >
                                    {type === 'MIXED' ? 'MIESZANY' : type}
                                </button>
                            ))}
                        </div>

                        {/* Panel UZ — ozusowanie zasadniczej */}
                        {(contractType === 'UZ' || contractType === 'MIXED') && (
                            <div className="bg-slate-800/50 p-4 rounded-sm border border-amber-600/30 animate-in slide-in-from-top-2 space-y-3">
                                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Podstawa ozusowania — UZ</div>
                                <div className="flex items-end gap-3">
                                    <div className="flex-1">
                                        <label className="text-[10px] text-slate-400 mb-1 block">Godziny zasadnicze / miesiąc</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={uzGodziny}
                                            onChange={(e) => setUzGodziny(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="w-full bg-slate-700 border border-slate-600 rounded-sm py-2 px-3 text-white font-bold text-center focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                    </div>
                                    <div className="text-slate-400 font-bold text-lg pb-2">×</div>
                                    <div className="flex-1">
                                        <label className="text-[10px] text-slate-400 mb-1 block">Stawka godz. netto</label>
                                        <input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={uzStawkaGodz}
                                            onChange={(e) => setUzStawkaGodz(Math.max(0.01, parseFloat(e.target.value) || 25.36))}
                                            className="w-full bg-slate-700 border border-slate-600 rounded-sm py-2 px-3 text-white font-bold text-center focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between bg-amber-900/20 border border-amber-700/30 rounded-sm px-3 py-2">
                                    <span className="text-[11px] text-amber-300 font-medium">Kwota zasadnicza netto</span>
                                    <span className="text-amber-400 font-bold font-mono">{formatPLN(uzKwotaZasadnicza)}</span>
                                </div>
                            </div>
                        )}

                        {/* Pola liczby pracowników dla MIXED */}
                        {contractType === 'MIXED' && (
                            <div className="bg-slate-800/50 p-4 rounded-sm border border-slate-700 animate-in slide-in-from-top-2 space-y-3">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Podział pracowników</div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-blue-400 mb-1 block font-bold">UoP</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={empCount}
                                            value={mixUOP}
                                            onChange={(e) => {
                                                const val = Math.min(empCount, Math.max(0, parseInt(e.target.value) || 0));
                                                setMixUZ(empCount - val);
                                            }}
                                            className="w-full bg-slate-700 border border-blue-600/40 rounded-sm py-2 px-3 text-white font-bold text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-amber-400 mb-1 block font-bold">UZ</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={empCount}
                                            value={mixUZClamped}
                                            onChange={(e) => {
                                                const val = Math.min(empCount, Math.max(0, parseInt(e.target.value) || 0));
                                                setMixUZ(val);
                                            }}
                                            className={`w-full bg-slate-700 rounded-sm py-2 px-3 text-white font-bold text-center focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                                                mixUZClamped > empCount ? 'border-2 border-red-500' : 'border border-amber-600/40'
                                            }`}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between bg-slate-700/50 rounded-sm px-3 py-1.5 text-[10px]">
                                    <span className="text-blue-400 font-bold">{mixUOP} UoP</span>
                                    <span className={`font-bold ${mixUOP + mixUZClamped === empCount ? 'text-emerald-400' : 'text-red-400'}`}>
                                        Suma: {mixUOP + mixUZClamped} / {empCount}
                                    </span>
                                    <span className="text-amber-400 font-bold">{mixUZClamped} UZ</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3. WYNAGRODZENIE */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Wallet className="w-4 h-4" /> Średnia Płaca
                        </label>
                        <div className="relative group">
                            <input 
                                type="number" 
                                value={avgSalary}
                                onChange={(e) => setAvgSalary(parseFloat(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-700 rounded-sm py-3.5 pl-4 pr-20 text-white font-bold text-lg focus:ring-2 focus:ring-[#0078d4] focus:border-transparent outline-none transition-all group-hover:border-slate-600"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex bg-slate-700 rounded-sm p-1">
                                <button onClick={() => setSalaryMode('NETTO')} className={`px-2 py-1 text-[10px] font-bold rounded-sm ${salaryMode==='NETTO' ? 'bg-[#0078d4] text-white' : 'text-slate-400'}`}>NET</button>
                                <button onClick={() => setSalaryMode('BRUTTO')} className={`px-2 py-1 text-[10px] font-bold rounded-sm ${salaryMode==='BRUTTO' ? 'bg-[#0078d4] text-white' : 'text-slate-400'}`}>BRU</button>
                            </div>
                        </div>
                    </div>


                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-slate-800 bg-slate-900 shrink-0 space-y-2">
                    <button 
                        onClick={handleTransfer}
                        className="w-full py-3.5 bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-900 font-bold rounded-sm shadow-md transition-all flex items-center justify-center gap-3 group"
                    >
                        <span>Przejdź do szczegółów</span>
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={handleOfertaV5}
                        className="w-full py-3 bg-[#0078d4] hover:bg-[#106ebe] active:scale-[0.98] text-white font-bold rounded-sm transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        <PieChart className="w-4 h-4" />
                        Wygeneruj Analizę Wstępną
                    </button>
                </div>
            </div>

            {/* RIGHT PANEL: VISUAL RESULTS */}
            <div className="flex-1 bg-[#f3f2f1] p-4 md:p-5 xl:overflow-hidden overflow-y-auto flex flex-col">
                
                <div className="max-w-5xl mx-auto w-full flex flex-col gap-3 flex-1 min-h-0">
                    
                    {/* 1. HERO KPI CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-shrink-0">
                        
                        {/* CARD A: MONTHLY */}
                        <div className="bg-white rounded-md p-3.5 border border-[#edebe9] shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),0_0.3px_0.9px_0_rgba(0,0,0,0.11)]">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Oszczędność Miesięczna</div>
                                    <div className="text-xs text-slate-500 font-medium mt-0.5">Po wypłaceniu podwyżek</div>
                                </div>
                                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                                {formatPLN(simulation.monthlySavings)}
                            </div>
                            <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                                <Users className="w-3 h-3" />
                                + Zadowoleni pracownicy
                            </div>
                        </div>

                        {/* CARD B: YEARLY */}
                        <div className="bg-[#0078d4] rounded-md p-3.5 text-white shadow-[0_3.2px_7.2px_0_rgba(0,0,0,0.13),0_0.6px_1.8px_0_rgba(0,0,0,0.11)]">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Potencjał Roczny</div>
                                    <div className="text-xs text-blue-200 font-medium mt-0.5">Skumulowany zysk</div>
                                </div>
                                <div className="p-1.5 bg-white/15 text-white rounded-md">
                                    <PieChart className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl font-extrabold text-white tracking-tight tabular-nums">
                                {formatPLN(simulation.yearlySavings)}
                            </div>
                            <div className="mt-2 h-1 w-full bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white/60 w-[70%]"></div>
                            </div>
                        </div>

                        {/* CARD C: PER EMPLOYEE */}
                        <div className="bg-white rounded-md p-3.5 border border-[#edebe9] shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),0_0.3px_0.9px_0_rgba(0,0,0,0.11)]">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Na Pracownika</div>
                                    <div className="text-xs text-slate-500 font-medium mt-0.5">Miesięcznie</div>
                                </div>
                                <div className="p-1.5 bg-[#eff6fc] text-[#0078d4] rounded-md">
                                    <Users className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                                {formatPLN(simulation.perEmployeeSavings)}
                            </div>
                            <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                                {empCount} pracowników
                            </div>
                        </div>
                    </div>

                    {/* 2. COST COMPARISON BAR (VISUAL) */}
                    <div className="bg-white rounded-md border border-[#edebe9] shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),0_0.3px_0.9px_0_rgba(0,0,0,0.11)] overflow-hidden flex-shrink-0">
                        <div className="px-4 py-2.5 border-b border-[#edebe9] flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                                <ShieldCheck className="text-[#0078d4] w-4 h-4" />
                                Porównanie Kosztów
                            </h3>
                            <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-sm border border-[#edebe9]">
                                {contractType === 'MIXED' ? `Mix: ${mixUOP} UoP / ${mixUZClamped} UZ` : contractType}
                            </div>
                        </div>

                        {/* CHART BARS */}
                        <div className="px-4 py-3 space-y-3">
                            
                            {/* OLD MODEL */}
                            <div>
                                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                                    <span>Model Standard</span>
                                    <span className="tabular-nums">{formatPLN(simulation.totalStd)}</span>
                                </div>
                                <div className="h-7 w-full bg-slate-100 rounded-sm overflow-hidden">
                                    <div className="h-full bg-slate-400 flex items-center justify-center text-white text-xs font-bold w-full">
                                        100%
                                    </div>
                                </div>
                            </div>

                            {/* NEW MODEL */}
                            <div>
                                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                                    <span>Model Eliton Prime™</span>
                                    <span className="text-emerald-600 font-extrabold tabular-nums">{formatPLN(simulation.totalNew)}</span>
                                </div>
                                <div className="h-7 w-full bg-emerald-50 rounded-sm overflow-hidden flex border border-emerald-100">
                                    <div
                                        style={{ width: `${(simulation.totalNew / simulation.totalStd) * 100}%` }}
                                        className="h-full bg-[#0078d4] flex items-center justify-center text-white text-xs font-bold transition-all duration-700"
                                    >
                                        {Math.round((simulation.totalNew / simulation.totalStd) * 100)}%
                                    </div>
                                    <div className="flex-1 flex items-center justify-center text-emerald-700 text-xs font-bold">
                                        −{Math.round((1 - simulation.totalNew / simulation.totalStd) * 100)}%
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* 3. BREAKDOWN TABLE */}
                    <div className="bg-white rounded-md border border-[#edebe9] shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),0_0.3px_0.9px_0_rgba(0,0,0,0.11)] overflow-hidden flex-1 min-h-0 flex flex-col">
                        <div className="px-4 py-2.5 border-b border-[#edebe9] flex-shrink-0">
                            <span className="text-sm font-semibold text-slate-800">Zestawienie Kosztów</span>
                        </div>
                        <div className="overflow-y-auto flex-1 min-h-0">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8f9fa] text-slate-500 text-xs uppercase font-semibold border-b border-[#edebe9]">
                                <tr>
                                    <th className="px-4 py-2.5">Kategoria</th>
                                    <th className="px-4 py-2.5 text-right">Standard</th>
                                    <th className="px-4 py-2.5 text-right">Eliton Prime™</th>
                                    <th className="px-4 py-2.5 text-right text-emerald-600">Różnica</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#edebe9]">
                                <tr className="hover:bg-[#f8f9fa] transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-700">Koszt Całkowity</td>
                                    <td className="px-4 py-3 text-right text-slate-400 line-through decoration-slate-300 tabular-nums">
                                        {formatPLN(simulation.totalStd)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-slate-900 tabular-nums">
                                        {formatPLN(simulation.totalNew)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-emerald-600 bg-emerald-50/50 tabular-nums">
                                        −{formatPLN(simulation.savings)}
                                    </td>
                                </tr>
                                <tr className="hover:bg-[#f8f9fa] transition-colors">
                                    <td className="px-4 py-3 text-slate-600 pl-8">
                                        Opłata serwisowa EBS
                                        <div className="text-[10px] text-slate-400">{config.prowizja.standard}% wartości nominalnej świadczeń</div>
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-300">—</td>
                                    <td className="px-4 py-3 text-right font-medium text-amber-600 tabular-nums">
                                        {formatPLN(simulation.totalProv)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-xs text-slate-400">Koszt operacyjny</td>
                                </tr>
                            </tbody>
                        </table>
                        </div>
                    </div>



                </div>
            </div>

        </div>
    );
};
