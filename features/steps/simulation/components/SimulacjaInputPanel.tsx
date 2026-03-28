import React from 'react';
import { Zap, Users, ArrowRight, Wallet, PieChart, Filter } from '../../../../shared/icons/Icons';
import { formatPLN } from '../../../../shared/utils/formatters';

type ContractType = 'UOP' | 'UZ' | 'MIXED';

interface SimulacjaInputPanelProps {
    mobileTab: 'params' | 'results';
    empCount: number;
    setEmpCount: (v: number | ((prev: number) => number)) => void;
    contractType: ContractType;
    setContractType: (v: ContractType) => void;
    uzGodziny: number;
    setUzGodziny: (v: number) => void;
    uzStawkaGodz: number;
    setUzStawkaGodz: (v: number) => void;
    uzKwotaZasadnicza: number;
    mixUOP: number;
    mixUZClamped: number;
    setMixUZ: (v: number) => void;
    avgSalary: number;
    setAvgSalary: (v: number) => void;
    salaryMode: 'NETTO' | 'BRUTTO';
    setSalaryMode: (v: 'NETTO' | 'BRUTTO') => void;
    onTransfer: () => void;
    onAnalizaWstepna: () => void;
}

export const SimulacjaInputPanel = ({
    mobileTab,
    empCount,
    setEmpCount,
    contractType,
    setContractType,
    uzGodziny,
    setUzGodziny,
    uzStawkaGodz,
    setUzStawkaGodz,
    uzKwotaZasadnicza,
    mixUOP,
    mixUZClamped,
    setMixUZ,
    avgSalary,
    setAvgSalary,
    salaryMode,
    setSalaryMode,
    onTransfer,
    onAnalizaWstepna,
}: SimulacjaInputPanelProps) => {
    return (
        <div className={`xl:w-[420px] bg-[#001433] text-white flex-col shrink-0 xl:min-h-0 border-r border-[#001d40] ${mobileTab === 'results' ? 'hidden xl:flex' : 'flex'}`}>

            {/* Header */}
            <div className="px-3 py-2 md:p-5 md:pb-2 shrink-0">
                <div className="flex items-center gap-2 mb-2 md:mb-3 text-emerald-400">
                    <div className="p-1.5 bg-emerald-500/10 rounded-sm"><Zap className="w-4 h-4 md:w-5 md:h-5" /></div>
                    <span className="font-bold uppercase tracking-widest text-[10px] md:text-xs">Szybka Symulacja v2.0</span>
                </div>
                <h2 className="text-sm md:text-2xl font-bold text-white leading-tight">Parametry Biznesowe</h2>
                <p className="hidden md:block text-[#a19f9d] text-sm mt-2 leading-relaxed">
                    Skonfiguruj strukturę zatrudnienia i wybierz strategię optymalizacji.
                </p>
            </div>

            <div className="px-3 py-2 space-y-3 md:p-5 md:space-y-5 xl:flex-1 xl:overflow-y-auto xl:min-h-0 custom-scrollbar">

                {/* 1. PRACOWNICY */}
                <div className="space-y-2 md:space-y-4">
                    <label className="hidden md:flex text-xs font-bold text-[#a19f9d] uppercase tracking-wider items-center gap-2">
                        <Users className="w-4 h-4" /> Zatrudnienie
                    </label>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setEmpCount(c => Math.max(1, c - 1))}
                            className="w-9 h-9 md:w-11 md:h-11 bg-[#002855] hover:bg-[#00336e] active:scale-95 rounded-sm text-white font-bold text-xl flex items-center justify-center transition-all shrink-0"
                        >−</button>
                        <input
                            type="number"
                            min="1" max="9999"
                            value={empCount}
                            onChange={(e) => setEmpCount(Math.max(1, parseInt(e.target.value) || 1))}
                            className="flex-1 bg-[#001d40] border border-[#002855] rounded-sm py-2 md:py-2.5 text-center text-white font-bold text-xl md:text-2xl focus:ring-2 focus:ring-[#0078d4] focus:border-transparent outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                            onClick={() => setEmpCount(c => Math.min(9999, c + 1))}
                            className="w-9 h-9 md:w-11 md:h-11 bg-[#002855] hover:bg-[#00336e] active:scale-95 rounded-sm text-white font-bold text-xl flex items-center justify-center transition-all shrink-0"
                        >+</button>
                    </div>
                </div>

                {/* 2. STRUKTURA (UOP/UZ/MIX) */}
                <div className="space-y-2 md:space-y-4">
                    <label className="hidden md:flex text-xs font-bold text-[#a19f9d] uppercase tracking-wider items-center gap-2">
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
                                    : 'bg-[#001d40] border-[#002855] text-[#a19f9d] hover:border-[#005299] hover:text-white'
                                }`}
                            >
                                {type === 'MIXED' ? 'MIESZANY' : type}
                            </button>
                        ))}
                    </div>

                    {/* Panel UZ — ozusowanie zasadniczej */}
                    {(contractType === 'UZ' || contractType === 'MIXED') && (
                        <div className="bg-[#001d40]/50 p-3 md:p-4 rounded-sm border border-amber-600/30 animate-in slide-in-from-top-2 space-y-3">
                            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Podstawa ozusowania — UZ</div>
                            <div className="flex items-end gap-3">
                                <div className="flex-1">
                                    <label className="text-[10px] text-[#a19f9d] mb-1 block">Godziny zasadnicze / miesiąc</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={uzGodziny}
                                        onChange={(e) => setUzGodziny(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-full bg-[#002855] border border-[#00336e] rounded-sm py-2 px-3 text-white font-bold text-center focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>
                                <div className="text-[#a19f9d] font-bold text-lg pb-2">×</div>
                                <div className="flex-1">
                                    <label className="text-[10px] text-[#a19f9d] mb-1 block">Stawka godz. netto</label>
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={uzStawkaGodz}
                                        onChange={(e) => setUzStawkaGodz(Math.max(0.01, parseFloat(e.target.value) || 25.36))}
                                        className="w-full bg-[#002855] border border-[#00336e] rounded-sm py-2 px-3 text-white font-bold text-center focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                        <div className="bg-[#001d40]/50 p-3 md:p-4 rounded-sm border border-[#002855] animate-in slide-in-from-top-2 space-y-3">
                            <div className="text-xs font-bold text-[#a19f9d] uppercase tracking-wider">Podział pracowników</div>
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
                                        className="w-full bg-[#002855] border border-blue-600/40 rounded-sm py-2 px-3 text-white font-bold text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                                        className={`w-full bg-[#002855] rounded-sm py-2 px-3 text-white font-bold text-center focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                                            mixUZClamped > empCount ? 'border-2 border-red-500' : 'border border-amber-600/40'
                                        }`}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between bg-[#002855]/50 rounded-sm px-3 py-1.5 text-[10px]">
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
                <div className="space-y-2 md:space-y-4">
                    <label className="hidden md:flex text-xs font-bold text-[#a19f9d] uppercase tracking-wider items-center gap-2">
                        <Wallet className="w-4 h-4" /> Średnia Płaca
                    </label>
                    <div className="relative group">
                        <input
                            type="number"
                            value={avgSalary}
                            onChange={(e) => setAvgSalary(parseFloat(e.target.value))}
                            className="w-full bg-[#001d40] border border-[#002855] rounded-sm py-2 md:py-3.5 pl-4 pr-20 text-white font-bold text-base md:text-lg focus:ring-2 focus:ring-[#0078d4] focus:border-transparent outline-none transition-all group-hover:border-[#00336e]"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex bg-[#002855] rounded-sm p-1">
                            <button onClick={() => setSalaryMode('NETTO')} className={`px-2 py-1 text-[10px] font-bold rounded-sm ${salaryMode==='NETTO' ? 'bg-[#0078d4] text-white' : 'text-[#a19f9d]'}`}>NET</button>
                            <button onClick={() => setSalaryMode('BRUTTO')} className={`px-2 py-1 text-[10px] font-bold rounded-sm ${salaryMode==='BRUTTO' ? 'bg-[#0078d4] text-white' : 'text-[#a19f9d]'}`}>BRU</button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer Actions */}
            <div className="px-3 py-2 md:p-5 border-t border-[#001d40] bg-[#001433] shrink-0 space-y-2">
                <button
                    onClick={onTransfer}
                    className="w-full py-2.5 md:py-3.5 bg-white hover:bg-[#f3f2f1] active:scale-[0.98] text-[#201f1e] font-bold rounded-sm shadow-md transition-all flex items-center justify-center gap-3 group"
                >
                    <span>Przejdź do szczegółów</span>
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                    onClick={onAnalizaWstepna}
                    className="w-full py-2 md:py-3 bg-[#0078d4] hover:bg-[#106ebe] active:scale-[0.98] text-white font-bold rounded-sm transition-all flex items-center justify-center gap-2 text-xs md:text-sm"
                >
                    <PieChart className="w-4 h-4" />
                    Wygeneruj Analizę Wstępną
                </button>
            </div>
        </div>
    );
};
