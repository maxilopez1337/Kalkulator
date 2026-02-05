
import React, { useMemo, useState } from 'react';
import { Calculator, Search, X, Layers, ShieldCheck, Wallet, PieChart, ChevronDown, ChevronUp, Info, Users, UserMinus } from '../../../common/Icons';
import { formatPLN } from '../../../shared/utils/formatters';
import { applyHeaderStyle, applyDataStyle, applyTotalStyle } from './excelStyles';
import { useExcelExport } from '../../../hooks/useExcelExport';
import { useAppStore } from '../../../store/AppContext';
import { PodzialTable } from './components/PodzialTable';
import { useResultsFilter } from '../../../hooks/useResultsFilter';
import { Input } from '../../../shared/ui/Input';
import { ButtonSecondary } from '../../../shared/ui/Button';
import { NettoZasadniczaCell } from './components/NettoZasadniczaCell';
import { SPLIT_TABLE_CONFIG } from './excelTableConfigs';
import { WynikPracownika } from '../../../entities/calculation/model';

declare global {
    interface Window {
        XLSX: any;
        ExcelJS: any;
    }
}

// --- MOBILE CARD COMPONENT ---
const PodzialResultCard: React.FC<{ item: WynikPracownika }> = ({ item }) => {
    const [expanded, setExpanded] = useState(false);
    
    const isStudent = item.pracownik.trybSkladek === 'STUDENT_UZ';

    // Dane do wyświetlenia
    const doWyplaty = item.podzial.doWyplaty;
    const koszt = item.podzial.kosztPracodawcy;
    const benefit = item.podzial.swiadczenie.netto;
    const bazaNetto = item.podzial.zasadnicza.nettoGotowka;

    return (
        <div className={`rounded-xl border shadow-sm overflow-hidden transition-all duration-200 active:scale-[0.99]
            ${isStudent ? 'bg-slate-50 border-slate-200 opacity-60 grayscale' : 'bg-white border-slate-200'}
        `}>
            {/* Header */}
            <div className="p-4 flex justify-between items-start cursor-pointer hover:bg-slate-50/50 transition-colors" onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border 
                        ${isStudent ? 'bg-slate-200 text-slate-500 border-slate-300' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
                        {item.pracownik.imie.charAt(0)}{item.pracownik.nazwisko.charAt(0)}
                    </div>
                    <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            {item.pracownik.imie} {item.pracownik.nazwisko}
                            {isStudent && <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 rounded border border-slate-300">STUDENT</span>}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            {!isStudent && (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                                    Do ręki
                                </span>
                            )}
                            <span className="font-bold text-slate-700">{formatPLN(doWyplaty)}</span>
                        </div>
                    </div>
                </div>
                <div className={`text-slate-400 p-1 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
                    <ChevronDown />
                </div>
            </div>

            {/* Key Metrics Row */}
            <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Nowy Koszt</div>
                    <div className="text-sm font-bold text-slate-700">{formatPLN(koszt)}</div>
                </div>
                <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                    <div className="text-[10px] uppercase font-bold text-amber-600 mb-1">Benefit (Świadczenie)</div>
                    <div className="text-sm font-bold text-amber-800">{formatPLN(benefit)}</div>
                </div>
            </div>

            {/* Expanded Details */}
            {expanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-4 animate-in slide-in-from-top-2">
                    
                    {isStudent ? (
                        <div className="p-3 bg-slate-100 rounded text-xs text-slate-500 text-center italic">
                            Osoba ze statusem studenta nie podlega optymalizacji w tym modelu.
                        </div>
                    ) : (
                        <>
                            {/* Config Input for Mobile */}
                            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="text-xs font-bold text-blue-700">Baza ZUS (Edycja)</div>
                                    <div className="text-[10px] text-blue-500 bg-white px-1.5 py-0.5 rounded border border-blue-100">Netto Zasadnicza</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 bg-white rounded border border-blue-200 h-9 flex items-center px-1 shadow-sm">
                                        <NettoZasadniczaCell pracownik={item.pracownik} standardKoszt={item.standard.kosztPracodawcy} />
                                    </div>
                                </div>
                            </div>

                            {/* Breakdown Structure */}
                            <div className="bg-white p-3 rounded-lg border border-slate-200">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1">Struktura Wypłaty</div>
                                <div className="flex justify-between items-center text-xs mb-1">
                                    <span className="text-slate-600">Gotówka (Zasadnicza)</span>
                                    <span className="font-mono font-medium">{formatPLN(item.podzial.doWyplatyGotowka)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-amber-700 font-medium">Świadczenie (Benefit)</span>
                                    <span className="font-mono font-bold text-amber-700">{formatPLN(item.podzial.doWyplatySwiadczenie)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-slate-100 font-bold">
                                    <span className="text-slate-900">Razem do ręki</span>
                                    <span className="text-emerald-600">{formatPLN(item.podzial.doWyplaty)}</span>
                                </div>
                            </div>

                            {/* Taxes Breakdown */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                                <div className="col-span-2 font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1 mt-2 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                    Koszty Pracodawcy
                                </div>
                                <div className="text-slate-500">ZUS od Bazy</div>
                                <div className="text-right font-mono text-slate-700">{formatPLN(item.podzial.zasadnicza.zusPracodawca.suma)}</div>
                                <div className="text-slate-500">Brutto Benefitu</div>
                                <div className="text-right font-mono text-slate-700">{formatPLN(item.podzial.swiadczenie.brutto)}</div>

                                <div className="col-span-2 font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1 mt-2 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                                    Podatki i ZUS (Pracownik)
                                </div>
                                <div className="text-slate-500">ZUS + Zdrowotna</div>
                                <div className="text-right font-mono text-slate-700">{formatPLN(item.podzial.zasadnicza.zusPracownik.suma + item.podzial.zasadnicza.zdrowotna)}</div>
                                <div className="text-slate-500">PIT Całkowity</div>
                                <div className="text-right font-mono text-slate-700">{formatPLN(item.podzial.pit.kwota)}</div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export const StepWynikPodzial = () => {
    const { wyniki, firma } = useAppStore();
    const { exportToExcel } = useExcelExport();

    // Hook filtrowania
    const { searchQuery, setSearchQuery, filteredData: filteredWyniki } = useResultsFilter(wyniki?.szczegoly);

    // --- KPI CALCS (EXCLUDING STUDENTS) ---
    const stats = useMemo(() => {
        if (!wyniki) return null;
        
        // Filtrujemy, aby obliczenia dotyczyły tylko osób kwalifikujących się (NIE-Studentów)
        const qualifiedEmployees = wyniki.szczegoly.filter(w => w.pracownik.trybSkladek !== 'STUDENT_UZ');
        
        const totalNetto = qualifiedEmployees.reduce((acc, w) => acc + w.podzial.doWyplaty, 0);
        const totalBaza = qualifiedEmployees.reduce((acc, w) => acc + w.podzial.zasadnicza.nettoGotowka, 0);
        const totalBenefit = qualifiedEmployees.reduce((acc, w) => acc + w.podzial.swiadczenie.netto, 0);
        const totalKoszt = qualifiedEmployees.reduce((acc, w) => acc + w.podzial.kosztPracodawcy, 0);
        
        const splitBazaProc = totalNetto > 0 ? (totalBaza / totalNetto) * 100 : 0;
        const splitBenefitProc = totalNetto > 0 ? (totalBenefit / totalNetto) * 100 : 0;

        const countTotal = wyniki.szczegoly.length;
        const countQualified = qualifiedEmployees.length;
        const countStudents = countTotal - countQualified;

        return { 
            totalNetto, 
            totalBaza, 
            totalBenefit, 
            totalKoszt, 
            splitBazaProc, 
            splitBenefitProc,
            countTotal,
            countQualified,
            countStudents
        };
    }, [wyniki]);

    if (!wyniki || !stats) return null;

    const handleExport = () => {
        // Logika eksportu pozostaje bez zmian
        // ... (kod eksportu identyczny jak wcześniej)
        const totalRow = {
            lp: '', name: 'SUMA', type: '',
            bruttoLaczne: filteredWyniki.reduce((acc: number, w: any) => acc + w.podzial.pit.lacznyPrzychod, 0),
            nettoZasadnicze: filteredWyniki.reduce((acc: number, w: any) => acc + w.podzial.zasadnicza.nettoGotowka, 0),
            bruttoZasadnicze: filteredWyniki.reduce((acc: number, w: any) => acc + w.podzial.zasadnicza.brutto, 0),
            swiadczenieNettoInput: filteredWyniki.reduce((acc: number, w: any) => acc + w.podzial.swiadczenie.netto, 0),
            dodatek: filteredWyniki.reduce((acc: number, w: any) => acc + w.podzial.swiadczenie.netto, 0),
            potracenie: filteredWyniki.length * 1.00,
            swiadczenieBrutto: filteredWyniki.reduce((acc: number, w: any) => acc + w.podzial.swiadczenie.brutto, 0),
            swiadczenieZaliczka: filteredWyniki.reduce((acc: number, w: any) => acc + w.podzial.swiadczenie.zaliczka, 0),
            doWyplatyGotowka: filteredWyniki.reduce((acc: number, w: any) => acc + w.podzial.doWyplatyGotowka, 0),
            doWyplatySwiadczenie: filteredWyniki.reduce((acc: number, w: any) => acc + w.podzial.doWyplatySwiadczenie, 0),
            doWyplatyRazem: filteredWyniki.reduce((acc: number, w: any) => acc + w.podzial.doWyplaty, 0),
            koszt: filteredWyniki.reduce((acc: number, w: any) => acc + w.podzial.kosztPracodawcy, 0),
            podstZus: filteredWyniki.reduce((acc: number, w: any) => acc + w.podzial.zasadnicza.brutto, 0),
            zusE: filteredWyniki.reduce((acc: number, w: any) => acc + w.podzial.zasadnicza.zusPracownik.emerytalna, 0),
            zusR: filteredWyniki.reduce((acc: number, w: any) => acc + w.podzial.zasadnicza.zusPracownik.rentowa, 0),
            zusC: filteredWyniki.reduce((acc: number, w: any) => acc + w.podzial.zasadnicza.zusPracownik.chorobowa, 0),
            zusSuma: filteredWyniki.reduce((acc: number, w: any) => acc + w.podzial.zasadnicza.zusPracownik.suma, 0),
            podstZdr: filteredWyniki.reduce((acc: number, w: any) => acc + w.podzial.zasadnicza.podstawaZdrowotna, 0),
            sklZdr: filteredWyniki.reduce((acc: number, w: any) => acc + w.podzial.zasadnicza.zdrowotna, 0),
            kup: filteredWyniki.reduce((acc: number, w: any) => acc + w.podzial.pit.kup, 0),
            podstPit: filteredWyniki.reduce((acc: number, w: any) => acc + w.podzial.pit.podstawa, 0),
            stawkaPit: '',
            pitZasadnicza: filteredWyniki.reduce((acc: number, w: any) => acc + w.podzial.pit.kwotaOdZasadniczej, 0),
            pitCalk: filteredWyniki.reduce((acc: number, w: any) => acc + w.podzial.pit.kwota, 0),
            firmaE: filteredWyniki.reduce((acc: number, w: any) => acc + w.podzial.zasadnicza.zusPracodawca.emerytalna, 0),
            firmaR: filteredWyniki.reduce((acc: number, w: any) => acc + w.podzial.zasadnicza.zusPracodawca.rentowa, 0),
            firmaW: filteredWyniki.reduce((acc: number, w: any) => acc + w.podzial.zasadnicza.zusPracodawca.wypadkowa, 0),
            firmaFP: filteredWyniki.reduce((acc: number, w: any) => acc + w.podzial.zasadnicza.zusPracodawca.fp, 0),
            firmaFGSP: filteredWyniki.reduce((acc: number, w: any) => acc + w.podzial.zasadnicza.zusPracodawca.fgsp, 0),
            zusFirma: filteredWyniki.reduce((acc: number, w: any) => acc + w.podzial.zasadnicza.zusPracodawca.suma, 0),
            sumaSkladek: filteredWyniki.reduce((acc: number, w: any) => acc + (w.podzial.zasadnicza.zusPracodawca.suma + w.podzial.zasadnicza.zusPracownik.suma + w.podzial.zasadnicza.zdrowotna), 0)
        };

        exportToExcel({
            fileName: `Wynik_Podzial_${firma.nazwa || 'Firma'}`,
            sheetName: 'Wynik Podział',
            headerGroups: SPLIT_TABLE_CONFIG.headerGroups, 
            columns: SPLIT_TABLE_CONFIG.columns,
            data: filteredWyniki,
            dataMapper: (w, idx) => ({
                lp: idx + 1,
                name: `${w.pracownik.imie} ${w.pracownik.nazwisko}`,
                type: w.pracownik.typUmowy,
                bruttoLaczne: w.podzial.pit.lacznyPrzychod,
                nettoZasadnicze: w.podzial.zasadnicza.nettoGotowka,
                bruttoZasadnicze: w.podzial.zasadnicza.brutto,
                swiadczenieNettoInput: w.podzial.swiadczenie.netto,
                dodatek: w.podzial.swiadczenie.netto,
                potracenie: 1.00,
                swiadczenieBrutto: w.podzial.swiadczenie.brutto,
                swiadczenieZaliczka: w.podzial.swiadczenie.zaliczka,
                doWyplatyGotowka: w.podzial.doWyplatyGotowka,
                doWyplatySwiadczenie: w.podzial.doWyplatySwiadczenie,
                doWyplatyRazem: w.podzial.doWyplaty,
                koszt: w.podzial.kosztPracodawcy,
                podstZus: w.podzial.zasadnicza.brutto,
                zusE: w.podzial.zasadnicza.zusPracownik.emerytalna,
                zusR: w.podzial.zasadnicza.zusPracownik.rentowa,
                zusC: w.podzial.zasadnicza.zusPracownik.chorobowa,
                zusSuma: w.podzial.zasadnicza.zusPracownik.suma,
                podstZdr: w.podzial.zasadnicza.podstawaZdrowotna,
                sklZdr: w.podzial.zasadnicza.zdrowotna,
                kup: w.podzial.pit.kup,
                podstPit: w.podzial.pit.podstawa,
                stawkaPit: `${w.podzial.pit.stawka}%`,
                pitZasadnicza: w.podzial.pit.kwotaOdZasadniczej,
                pitCalk: w.podzial.pit.kwota,
                firmaE: w.podzial.zasadnicza.zusPracodawca.emerytalna,
                firmaR: w.podzial.zasadnicza.zusPracodawca.rentowa,
                firmaW: w.podzial.zasadnicza.zusPracodawca.wypadkowa,
                firmaFP: w.podzial.zasadnicza.zusPracodawca.fp,
                firmaFGSP: w.podzial.zasadnicza.zusPracodawca.fgsp,
                zusFirma: w.podzial.zasadnicza.zusPracodawca.suma,
                sumaSkladek: w.podzial.zasadnicza.zusPracodawca.suma + w.podzial.zasadnicza.zusPracownik.suma + w.podzial.zasadnicza.zdrowotna
            }),
            totalData: totalRow,
            styles: {
                header: applyHeaderStyle,
                data: applyDataStyle,
                total: applyTotalStyle
            }
        });
    };

    return (
        <div className="animate-in fade-in zoom-in-95 duration-300 space-y-6">
            
            {/* 1. EXECUTIVE DASHBOARD - STRUCTURE & SAFETY */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Structure Analysis Card (REDESIGNED for High Visibility) */}
                <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-indigo-50 rounded text-indigo-600"><Layers /></div>
                        <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">Struktura Zatrudnienia</span>
                    </div>
                    
                    {/* NEW: Large Count Display */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex flex-col items-center text-center">
                            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Kwalifikujący się</div>
                            <div className="text-3xl font-extrabold text-blue-900">{stats.countQualified}</div>
                            <div className="text-[9px] text-blue-400 mt-1 font-medium flex items-center gap-1">
                                <Users className="w-3 h-3" /> Podlegają optymalizacji
                            </div>
                        </div>
                        
                        <div className={`border rounded-lg p-3 flex flex-col items-center text-center transition-colors
                            ${stats.countStudents > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200 opacity-60'}
                        `}>
                            <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${stats.countStudents > 0 ? 'text-amber-700' : 'text-slate-400'}`}>Wykluczeni</div>
                            <div className={`text-3xl font-extrabold ${stats.countStudents > 0 ? 'text-amber-800' : 'text-slate-400'}`}>{stats.countStudents}</div>
                            <div className={`text-[9px] mt-1 font-medium flex items-center gap-1 ${stats.countStudents > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                                <UserMinus className="w-3 h-3" /> Studenci &lt; 26 lat
                            </div>
                        </div>
                    </div>
                    
                    <div className="relative h-6 w-full bg-slate-100 rounded-full overflow-hidden flex items-center mb-1 border border-slate-200">
                        <div 
                            style={{ width: `${stats.splitBazaProc}%` }} 
                            className="h-full bg-blue-500 flex items-center justify-center text-[9px] font-bold text-white transition-all duration-500"
                        >
                            BAZA {stats.splitBazaProc.toFixed(0)}%
                        </div>
                        <div 
                            style={{ width: `${stats.splitBenefitProc}%` }} 
                            className="h-full bg-amber-400 flex items-center justify-center text-[9px] font-bold text-amber-900 transition-all duration-500"
                        >
                            BENEFIT {stats.splitBenefitProc.toFixed(0)}%
                        </div>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold px-1">
                        <span>CZĘŚĆ ZASADNICZA (ZUS)</span>
                        <span>CZĘŚĆ ŚWIADCZENIOWA (PIT)</span>
                    </div>
                </div>

                {/* Safety Card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-emerald-50 rounded text-emerald-600"><ShieldCheck /></div>
                        <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">Bezpieczeństwo</span>
                    </div>
                    <div className="text-xs text-slate-500 leading-relaxed">
                        Każdy pracownik posiada podstawę wymiaru składek (część bazową), co gwarantuje ubezpieczenie chorobowe i emerytalne.
                    </div>
                    <div className="mt-3 text-lg font-bold text-emerald-700">Model Bezpieczny</div>
                </div>

                {/* Optimization Card */}
                <div className="bg-slate-900 p-5 rounded-xl border border-slate-900 shadow-md flex flex-col justify-between relative overflow-hidden text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nowy Koszt Całkowity</span>
                        <PieChart />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{formatPLN(stats.totalKoszt)}</div>
                        <div className="text-xs text-slate-400 mt-2 font-medium flex flex-col gap-1">
                            <div className="flex justify-between items-center">
                                <span>Kwalifikujący się:</span> 
                                <span className="text-white font-bold">{stats.countQualified} os.</span>
                            </div>
                            {stats.countStudents > 0 && (
                                <div className="flex justify-between items-center text-amber-400/80">
                                    <span>Studenci (0 zł kosztu):</span>
                                    <span className="font-bold">{stats.countStudents} os.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. DATA GRID CONTAINER */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-280px)]">
                <div className="flex items-center gap-3 px-4 md:px-7 py-5 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-slate-700"><Calculator /></div>
                    <h2 className="text-base md:text-lg font-bold text-slate-900">Wynik – Model Docelowy (To-Be)</h2>
                    <div className="ml-auto flex gap-2">
                        <ButtonSecondary size="sm" onClick={handleExport} icon={<Wallet />}>
                            <span className="hidden md:inline">Eksportuj do Excel</span>
                            <span className="md:hidden">Excel</span>
                        </ButtonSecondary>
                    </div>
                </div>
                
                {/* Search Bar */}
                <div className="px-4 md:px-6 py-4 bg-slate-50 border-b border-slate-200 flex-shrink-0 flex items-center justify-between">
                    <div className="relative w-full max-w-md">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Search /></div>
                        <Input 
                            type="text" 
                            placeholder="Szukaj pracownika..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-10 py-2 text-sm bg-white"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X /></button>
                        )}
                    </div>
                    
                    {stats.countStudents > 0 && (
                        <div className="hidden md:flex items-center gap-2 text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 shadow-sm animate-in fade-in">
                            <Info className="w-4 h-4 text-amber-600" />
                            <span className="font-semibold">Uwaga: {stats.countStudents} studentów jest wygaszonych i nie wlicza się do sumy kosztów modelu.</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-hidden relative">
                    {/* DESKTOP TABLE */}
                    <div className="hidden md:block h-full overflow-x-auto">
                        <PodzialTable data={filteredWyniki} />
                    </div>

                    {/* MOBILE CARD LIST */}
                    <div className="md:hidden h-full overflow-y-auto p-4 space-y-3 bg-slate-100/50 pb-20 custom-scrollbar">
                        {filteredWyniki.map((item) => (
                            <PodzialResultCard key={item.pracownik.id} item={item} />
                        ))}
                        {filteredWyniki.length === 0 && (
                            <div className="text-center py-10 text-slate-400 text-sm">Brak wyników spełniających kryteria.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
