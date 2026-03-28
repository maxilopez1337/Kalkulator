
import React, { useState, useMemo } from 'react';
import { Zap, TrendingUp } from '../../../shared/icons/Icons';
import { useAppStore } from '../../../store/AppContext';
import { obliczWariantStandard, obliczWariantPodzial } from '../../tax-engine';
import { Pracownik } from '../../../entities/employee/model';
import { ofertaV5Generator } from '../../../services/ofertaZgrubna/pages5/generatorV5';
import { animations } from '../../../shared/config/theme';
import { SimulacjaInputPanel } from './components/SimulacjaInputPanel';
import { SimulacjaResultPanel } from './components/SimulacjaResultPanel';

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
    const [mobileTab, setMobileTab] = useState<'params' | 'results'>('params');
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

    // --- ANALIZA WSTĘPNA ---
    const handleAnalizaWstepna = () => {
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
        <div className={`h-full flex flex-col xl:flex-row xl:overflow-hidden overflow-y-auto animate-in fade-in zoom-in-95 ${animations.slow}`}>

            {/* MOBILE TAB BAR — only on small screens */}
            <div className="xl:hidden bg-[#001433] border-b border-[#002855] flex shrink-0">
                <button
                    onClick={() => setMobileTab('params')}
                    className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors border-b-2 ${mobileTab === 'params' ? 'text-emerald-400 border-emerald-400' : 'text-[#a19f9d] border-transparent'}`}
                >
                    <Zap className="w-3.5 h-3.5" /> Parametry
                </button>
                <button
                    onClick={() => setMobileTab('results')}
                    className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors border-b-2 ${mobileTab === 'results' ? 'text-blue-400 border-blue-400' : 'text-[#a19f9d] border-transparent'}`}
                >
                    <TrendingUp className="w-3.5 h-3.5" /> Wyniki
                </button>
            </div>

            <SimulacjaInputPanel
                mobileTab={mobileTab}
                empCount={empCount}
                setEmpCount={setEmpCount}
                contractType={contractType}
                setContractType={setContractType}
                uzGodziny={uzGodziny}
                setUzGodziny={setUzGodziny}
                uzStawkaGodz={uzStawkaGodz}
                setUzStawkaGodz={setUzStawkaGodz}
                uzKwotaZasadnicza={uzKwotaZasadnicza}
                mixUOP={mixUOP}
                mixUZClamped={mixUZClamped}
                setMixUZ={setMixUZ}
                avgSalary={avgSalary}
                setAvgSalary={setAvgSalary}
                salaryMode={salaryMode}
                setSalaryMode={setSalaryMode}
                onTransfer={handleTransfer}
                onAnalizaWstepna={handleAnalizaWstepna}
            />

            <SimulacjaResultPanel
                mobileTab={mobileTab}
                simulation={simulation}
                empCount={empCount}
                contractType={contractType}
                mixUOP={mixUOP}
                mixUZClamped={mixUZClamped}
                prowizjaStandard={config.prowizja.standard}
            />

        </div>
    );
};
