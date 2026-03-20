
import React, { useState, useMemo } from 'react';
import { Zap, Users, ArrowRight, Wallet, PieChart, TrendingUp, Filter, Building, Check, Layers, ShieldCheck } from '../../../common/Icons';
import { formatPLN } from '../../../shared/utils/formatters';
import { useAppStore } from '../../../store/AppContext';
import { obliczWariantStandard, obliczWariantPodzial } from '../../tax-engine';
import { Pracownik } from '../../../entities/employee/model';

interface Props {
    onTransfer: () => void;
}

type ContractType = 'UOP' | 'UZ' | 'MIXED';
type StrategyType = 'SAVINGS' | 'WIN_WIN';

export const StepSzybkaSymulacja = ({ onTransfer }: Props) => {
    const { config, setPracownicy, setProwizjaProc } = useAppStore();
    
    // --- STATE ---
    const [empCount, setEmpCount] = useState<number>(50);
    const [avgSalary, setAvgSalary] = useState<number>(6000);
    const [salaryMode, setSalaryMode] = useState<'NETTO' | 'BRUTTO'>('NETTO');
    const [contractType, setContractType] = useState<ContractType>('UOP');
    const [mixRatio, setMixRatio] = useState<number>(50); // % UZ w modelu MIXED (0 = 100% UoP, 100 = 100% UZ)
    const [strategy, setStrategy] = useState<StrategyType>('WIN_WIN');

    // --- CALCULATION ---
    const simulation = useMemo(() => {
        // 1. Determine Counts based on Mix
        let countUOP = 0;
        let countUZ = 0;

        if (contractType === 'UOP') countUOP = empCount;
        else if (contractType === 'UZ') countUZ = empCount;
        else {
            // MIXED Logic
            countUZ = Math.round(empCount * (mixRatio / 100));
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
                typUmowy: type, trybSkladek: 'PELNE', choroboweAktywne: true, pit2: '300', ulgaMlodych: false,
                kupTyp: type === 'UZ' ? 'PROC_20' : 'STANDARD',
                nettoDocelowe: baseNetto,
                nettoZasadnicza: type === 'UZ' ? config.minimalnaKwotaUZ.zasadniczaNetto : config.placaMinimalna.netto,
                pitMode: 'AUTO', skladkaFP: true, skladkaFGSP: true
            };

            const std = obliczWariantStandard(dummyEmployee, 1.67, config);
            const opt = obliczWariantPodzial(dummyEmployee, 1.67, dummyEmployee.nettoZasadnicza, config);

            // Strategy Logic
            // SAVINGS: 28% prowizji, brak podwyżek.
            // WIN_WIN: 26% prowizji całkowitej (z czego część idzie na podwyżkę, ale w uproszczeniu koszt modelu = koszt pracodawcy + cała "prowizja" 26%)
            const provPercent = strategy === 'SAVINGS' ? 28 : 26;
            const provision = opt.swiadczenie.netto * (provPercent / 100);

            // W wariancie WIN_WIN, podwyżka jest częścią "prowizji" w sensie podziału oszczędności, 
            // ale technicznie jest kosztem pracodawcy wypłacanym pracownikowi. 
            // Tutaj upraszczamy: Koszt Nowy = Koszt ZUS/PIT + Prowizja (która zawiera w sobie fee + podwyżkę).
            
            return {
                stdKoszt: std.kosztPracodawcy,
                optKosztBase: opt.kosztPracodawcy,
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

        return {
            countUOP,
            countUZ,
            totalStd,
            totalNew,
            totalProv,
            savings,
            monthlySavings: savings,
            yearlySavings: savings * 12,
            perEmployeeSavings: empCount > 0 ? savings / empCount : 0
        };

    }, [empCount, avgSalary, salaryMode, contractType, mixRatio, strategy, config]);

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
            trybSkladek: 'PELNE',
            choroboweAktywne: true,
            pit2: '300',
            ulgaMlodych: false,
            kupTyp: type === 'UZ' ? 'PROC_20' : 'STANDARD',
            nettoDocelowe: salaryMode === 'NETTO' ? avgSalary : (type === 'UOP' ? avgSalary * 0.71 : avgSalary * 0.78),
            nettoZasadnicza: type === 'UZ' ? config.minimalnaKwotaUZ.zasadniczaNetto : config.placaMinimalna.netto,
            pitMode: 'AUTO' as const,
            skladkaFP: true,
            skladkaFGSP: true
        });

        for(let i=0; i<genUOP; i++) newEmployees.push(createEmp('UOP', i));
        for(let i=0; i<genUZ; i++) newEmployees.push(createEmp('UZ', genUOP + i));

        setProwizjaProc(strategy === 'SAVINGS' ? 28 : 26);
        setPracownicy(newEmployees);
        onTransfer();
    };

    return (
        <div className="flex flex-col xl:flex-row h-full animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
            
            {/* LEFT PANEL: CONFIGURATION */}
            <div className="xl:w-[420px] bg-slate-900 text-white flex flex-col shrink-0 overflow-y-auto border-r border-slate-800 custom-scrollbar">
                
                {/* Header */}
                <div className="p-8 pb-2">
                    <div className="flex items-center gap-2 mb-3 text-emerald-400">
                        <div className="p-1.5 bg-emerald-500/10 rounded-lg"><Zap className="w-5 h-5" /></div>
                        <span className="font-bold uppercase tracking-widest text-xs">Szybka Symulacja v2.0</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white leading-tight">Parametry Biznesowe</h2>
                    <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                        Skonfiguruj strukturę zatrudnienia i wybierz strategię optymalizacji.
                    </p>
                </div>

                <div className="p-8 space-y-10 flex-1">
                    
                    {/* 1. PRACOWNICY */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Users className="w-4 h-4" /> Zatrudnienie
                            </label>
                            <span className="text-2xl font-bold text-white">{empCount}</span>
                        </div>
                        <input 
                            type="range" min="1" max="300" 
                            value={empCount} onChange={(e) => setEmpCount(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                            <span>1</span><span>150</span><span>300</span>
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

                        {/* Slider dla MIXED */}
                        {contractType === 'MIXED' && (
                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 animate-in slide-in-from-top-2">
                                <div className="flex justify-between text-xs font-bold mb-2">
                                    <span className="text-blue-400">{100 - mixRatio}% UoP</span>
                                    <span className="text-amber-400">{mixRatio}% UZ</span>
                                </div>
                                <input 
                                    type="range" min="0" max="100" step="10"
                                    value={mixRatio} onChange={(e) => setMixRatio(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-white"
                                />
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
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3.5 pl-4 pr-20 text-white font-bold text-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all group-hover:border-slate-600"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex bg-slate-700 rounded-lg p-1">
                                <button onClick={() => setSalaryMode('NETTO')} className={`px-2 py-1 text-[10px] font-bold rounded ${salaryMode==='NETTO' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>NET</button>
                                <button onClick={() => setSalaryMode('BRUTTO')} className={`px-2 py-1 text-[10px] font-bold rounded ${salaryMode==='BRUTTO' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>BRU</button>
                            </div>
                        </div>
                    </div>

                    {/* 4. STRATEGIA (NOWOŚĆ) */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Layers className="w-4 h-4" /> Strategia
                        </label>
                        <div className="grid grid-cols-1 gap-3">
                            <button 
                                onClick={() => setStrategy('WIN_WIN')}
                                className={`relative p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                                    strategy === 'WIN_WIN' ? 'bg-slate-800 border-blue-500/50 ring-1 ring-blue-500/50' : 'bg-slate-800/30 border-slate-700 opacity-60 hover:opacity-100'
                                }`}
                            >
                                <div className={`mt-1 p-1 rounded-full ${strategy === 'WIN_WIN' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                    <Users className="w-3 h-3" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">Model Win-Win (Domyślny)</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">Oszczędność + Podwyżki. Prowizja 26%.</div>
                                </div>
                            </button>

                            <button 
                                onClick={() => setStrategy('SAVINGS')}
                                className={`relative p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                                    strategy === 'SAVINGS' ? 'bg-slate-800 border-emerald-500/50 ring-1 ring-emerald-500/50' : 'bg-slate-800/30 border-slate-700 opacity-60 hover:opacity-100'
                                }`}
                            >
                                <div className={`mt-1 p-1 rounded-full ${strategy === 'SAVINGS' ? 'bg-emerald-500 text-slate-900' : 'bg-slate-700 text-slate-400'}`}>
                                    <TrendingUp className="w-3 h-3" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">Max Oszczędności</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">Wszystkie zyski dla firmy. Prowizja 28%.</div>
                                </div>
                            </button>
                        </div>
                    </div>

                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-slate-800 bg-slate-900/90 backdrop-blur sticky bottom-0">
                    <button 
                        onClick={handleTransfer}
                        className="w-full py-4 bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-900 font-bold rounded-xl shadow-xl shadow-slate-900/20 transition-all flex items-center justify-center gap-3 group"
                    >
                        <span>Przejdź do szczegółów</span>
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* RIGHT PANEL: VISUAL RESULTS */}
            <div className="flex-1 bg-[#f8fafc] p-6 md:p-12 overflow-y-auto flex flex-col">
                
                <div className="max-w-5xl mx-auto w-full space-y-10">
                    
                    {/* 1. HERO KPI CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* CARD A: MONTHLY */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Oszczędność Miesięczna</div>
                                    <div className="text-sm text-slate-500 font-medium mt-1">
                                        {strategy === 'WIN_WIN' ? 'Po wypłaceniu podwyżek' : 'Netto dla firmy'}
                                    </div>
                                </div>
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                                {formatPLN(simulation.monthlySavings)}
                            </div>
                            {strategy === 'WIN_WIN' && (
                                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                                    <Users className="w-3 h-3" /> 
                                    + Zadowoleni pracownicy
                                </div>
                            )}
                        </div>

                        {/* CARD B: YEARLY */}
                        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-900 shadow-xl text-white relative overflow-hidden group">
                            {/* Decorative Blur */}
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                            
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Potencjał Roczny</div>
                                    <div className="text-sm text-slate-400 font-medium mt-1">Skumulowany zysk</div>
                                </div>
                                <div className="p-2 bg-white/10 text-white rounded-lg">
                                    <PieChart className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight relative z-10">
                                {formatPLN(simulation.yearlySavings)}
                            </div>
                            <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden relative z-10">
                                <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 w-[70%] animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    {/* 2. COST COMPARISON BAR (VISUAL) */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                <ShieldCheck className="text-blue-500" />
                                Porównanie Kosztów
                            </h3>
                            <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                {contractType === 'MIXED' ? `Mix: ${100-mixRatio}% UoP / ${mixRatio}% UZ` : contractType}
                            </div>
                        </div>

                        {/* CHART BARS */}
                        <div className="space-y-6">
                            
                            {/* OLD MODEL */}
                            <div>
                                <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
                                    <span>Model Standard</span>
                                    <span>{formatPLN(simulation.totalStd)}</span>
                                </div>
                                <div className="h-10 w-full bg-slate-100 rounded-lg overflow-hidden flex relative">
                                    <div className="h-full bg-slate-400 flex items-center justify-center text-white text-xs font-bold w-full">
                                        KOSZTY ZATRUDNIENIA (100%)
                                    </div>
                                </div>
                            </div>

                            {/* NEW MODEL */}
                            <div>
                                <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
                                    <span>Model Eliton Prime</span>
                                    <span className="text-emerald-600 font-extrabold">{formatPLN(simulation.totalNew)}</span>
                                </div>
                                <div className="h-10 w-full bg-slate-100 rounded-lg overflow-hidden flex relative">
                                    {/* Cost Bar - Scaled relative to standard */}
                                    <div 
                                        style={{ width: `${(simulation.totalNew / simulation.totalStd) * 100}%` }}
                                        className="h-full bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-[0_0_15px_rgba(37,99,235,0.3)] z-10 transition-all duration-700"
                                    >
                                        NOWY KOSZT
                                    </div>
                                    
                                    {/* Savings Gap */}
                                    <div className="flex-1 bg-emerald-500/10 flex items-center justify-center text-emerald-700 text-xs font-bold relative overflow-hidden">
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-10"></div>
                                        OSZCZĘDNOŚĆ
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* 3. BREAKDOWN TABLE */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Kategoria</th>
                                    <th className="px-6 py-4 text-right">Standard</th>
                                    <th className="px-6 py-4 text-right">Eliton Prime</th>
                                    <th className="px-6 py-4 text-right text-emerald-600">Różnica</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-medium text-slate-700">Koszt Całkowity</td>
                                    <td className="px-6 py-4 text-right text-slate-500 line-through decoration-slate-300">
                                        {formatPLN(simulation.totalStd)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                                        {formatPLN(simulation.totalNew)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-emerald-600 bg-emerald-50/30">
                                        -{formatPLN(simulation.savings)}
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 text-slate-600 pl-10">
                                        w tym Opłata Serwisowa
                                        <div className="text-[10px] text-slate-400">Success fee</div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-300">-</td>
                                    <td className="px-6 py-4 text-right font-medium text-amber-600">
                                        {formatPLN(simulation.totalProv)}
                                    </td>
                                    <td className="px-6 py-4 text-right text-xs text-slate-400">Koszt operacyjny</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>

        </div>
    );
};
