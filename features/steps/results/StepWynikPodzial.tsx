
import React, { useMemo, useState } from 'react';
import { Layers, ShieldCheck, PieChart, ChevronDown, Info, Users, UserMinus } from '../../../shared/icons/Icons';
import { formatPLN } from '../../../shared/utils/formatters';
import { shadow } from '../../../shared/config/theme';
import { SectionLabel } from '../../../shared/ui/SectionLabel';
import { Alert } from '../../../shared/ui/Alert';
import { SearchInput } from '../../../shared/ui/SearchInput';
import { applyHeaderStyle, applyDataStyle, applyTotalStyle } from './excelStyles';
import { useExcelExport } from '../../../hooks/useExcelExport';
import { useAppStore } from '../../../store/AppContext';
import { PodzialTable } from './components/PodzialTable';
import { useResultsFilter } from '../../../hooks/useResultsFilter';
import { ButtonSecondary } from '../../../shared/ui/Button';
import { NettoZasadniczaCell } from './components/NettoZasadniczaCell';
import { SPLIT_TABLE_CONFIG } from './excelTableConfigs';
import { WynikPracownika } from '../../../entities/calculation/model';
import { Avatar } from '../../../shared/ui/Avatar';
import { DataTableToolbar } from '../../../shared/ui/DataTableToolbar';
import { ExcelExportButton } from '../../../shared/ui/ExcelExportButton';

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
        <div className={`rounded-md border shadow-sm overflow-hidden transition-all duration-200 active:scale-[0.99]
            ${isStudent ? 'bg-slate-50 border-[#edebe9] opacity-60 grayscale' : 'bg-white border-[#edebe9]'}
        `}>
            {/* Header */}
            <div className="p-4 flex justify-between items-start cursor-pointer hover:bg-slate-50/50 transition-colors" role="button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center gap-3">
                    <Avatar
                        name={item.pracownik.imie}
                        surname={item.pracownik.nazwisko}
                        colorClass={isStudent
                            ? 'bg-slate-200 text-slate-500 border border-slate-300'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        }
                    />
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
                    <SectionLabel className="mb-1">Nowy Koszt</SectionLabel>
                    <div className="text-sm font-bold text-slate-700">{formatPLN(koszt)}</div>
                </div>
                <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                    <SectionLabel color="text-amber-600" className="mb-1">Benefit (Świadczenie)</SectionLabel>
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
    const { wyniki, firma, setPracownicy } = useAppStore();
    const { exportToExcel } = useExcelExport();

    // Bulk netto baza state
    const [bulkUzValue, setBulkUzValue] = useState<string>('');
    const [bulkUopValue, setBulkUopValue] = useState<string>('');

    const handleBulkSet = (typ: 'UZ' | 'UOP', rawValue: string) => {
        const val = parseFloat(rawValue.replace(',', '.'));
        if (isNaN(val) || val <= 0) return;
        setPracownicy(prev => prev.map(p =>
            p.typUmowy === typ && p.trybSkladek !== 'STUDENT_UZ'
                ? { ...p, nettoZasadnicza: val }
                : p
        ));
    };

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
        const sums = filteredWyniki.reduce((acc, w) => {
            const p = w.podzial;
            const z = p.zasadnicza;
            acc.bruttoLaczne += p.pit.lacznyPrzychod;
            acc.nettoZasadnicze += z.nettoGotowka;
            acc.bruttoZasadnicze += z.brutto;
            acc.swiadczenieNettoInput += p.swiadczenie.netto;
            acc.dodatek += p.swiadczenie.netto;
            acc.potracenie += 1.00;
            acc.swiadczenieBrutto += p.swiadczenie.brutto;
            acc.swiadczenieZaliczka += p.swiadczenie.zaliczka;
            acc.doWyplatyGotowka += p.doWyplatyGotowka;
            acc.doWyplatySwiadczenie += p.doWyplatySwiadczenie;
            acc.doWyplatyRazem += p.doWyplaty;
            acc.koszt += p.kosztPracodawcy;
            acc.podstZus += z.brutto;
            acc.zusE += z.zusPracownik.emerytalna;
            acc.zusR += z.zusPracownik.rentowa;
            acc.zusC += z.zusPracownik.chorobowa;
            acc.zusSuma += z.zusPracownik.suma;
            acc.podstZdr += z.podstawaZdrowotna;
            acc.sklZdr += z.zdrowotna;
            acc.kup += p.pit.kup;
            acc.podstPit += p.pit.podstawa;
            acc.pitZasadnicza += p.pit.kwotaOdZasadniczej;
            acc.pitCalk += p.pit.kwota;
            acc.firmaE += z.zusPracodawca.emerytalna;
            acc.firmaR += z.zusPracodawca.rentowa;
            acc.firmaW += z.zusPracodawca.wypadkowa;
            acc.firmaFP += z.zusPracodawca.fp;
            acc.firmaFGSP += z.zusPracodawca.fgsp;
            acc.zusFirma += z.zusPracodawca.suma;
            acc.sumaSkladek += z.zusPracodawca.suma + z.zusPracownik.suma + z.zdrowotna;
            return acc;
        }, { bruttoLaczne:0, nettoZasadnicze:0, bruttoZasadnicze:0, swiadczenieNettoInput:0, dodatek:0, potracenie:0, swiadczenieBrutto:0, swiadczenieZaliczka:0, doWyplatyGotowka:0, doWyplatySwiadczenie:0, doWyplatyRazem:0, koszt:0, podstZus:0, zusE:0, zusR:0, zusC:0, zusSuma:0, podstZdr:0, sklZdr:0, kup:0, podstPit:0, pitZasadnicza:0, pitCalk:0, firmaE:0, firmaR:0, firmaW:0, firmaFP:0, firmaFGSP:0, zusFirma:0, sumaSkladek:0 });

        const totalRow = { lp: '', name: 'SUMA', type: '', stawkaPit: '', ...sums };

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
        <div className="animate-in fade-in zoom-in-95 duration-300 h-full min-h-0 flex flex-col gap-2">

            {/* DATA GRID CONTAINER */}
            <div className={`bg-white rounded-md ${shadow.elevation8} border border-[#edebe9] overflow-hidden flex flex-col flex-1 min-h-0`}>

                {/* D365 COMMAND BAR */}
                <div className="flex items-stretch border-b border-[#edebe9] bg-white flex-shrink-0 h-[44px] overflow-hidden">
                    {/* Title */}
                    <div className="flex items-center gap-2 px-4 border-r border-[#edebe9] shrink-0">
                        <div className="text-[#0078d4]"><Layers /></div>
                        <span className="hidden sm:inline text-[13px] font-semibold text-[#323130] whitespace-nowrap">Wynik – Model Docelowy</span>
                    </div>
                    {/* KPI Stats */}
                    <div className="flex items-stretch flex-1 overflow-x-auto scrollbar-hide">
                        <div className="flex items-center gap-2 px-4 border-r border-[#edebe9] shrink-0">
                            <Users className="w-3.5 h-3.5 text-[#0078d4]" />
                            <span className="text-[11px] text-[#605e5c]">Kwalifikujący:</span>
                            <span className="text-[13px] font-semibold text-[#0078d4] tabular-nums">{stats.countQualified}</span>
                        </div>
                        {stats.countStudents > 0 && (
                            <div className="flex items-center gap-2 px-4 border-r border-[#edebe9] shrink-0">
                                <UserMinus className="w-3.5 h-3.5 text-[#a19f9d]" />
                                <span className="text-[11px] text-[#605e5c]">Studenci:</span>
                                <span className="text-[13px] font-semibold text-[#323130] tabular-nums">{stats.countStudents}</span>
                            </div>
                        )}
                        <div className="hidden xl:flex items-center gap-2 px-4 border-r border-[#edebe9] shrink-0">
                            <div className="w-[80px] h-[6px] bg-[#edebe9] overflow-hidden flex">
                                <div style={{ width: `${stats.splitBazaProc}%` }} className="h-full bg-[#0078d4]" />
                                <div style={{ width: `${stats.splitBenefitProc}%` }} className="h-full bg-[#ca5010]" />
                            </div>
                            <span className="text-[11px] text-[#605e5c] whitespace-nowrap">ZUS / Ben.</span>
                        </div>
                        <div className="hidden lg:flex items-center gap-2 px-4 border-r border-[#edebe9] shrink-0">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#107c10]" />
                            <span className="text-[11px] text-[#107c10] font-semibold">Model Bezpieczny</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 shrink-0">
                            <PieChart className="w-3.5 h-3.5 text-[#0078d4]" />
                            <span className="text-[11px] text-[#605e5c] uppercase tracking-wide">Koszt całkowity</span>
                            <span className="text-[14px] font-bold text-[#0078d4] tabular-nums">{formatPLN(stats.totalKoszt)}</span>
                        </div>
                    </div>
                    {/* Export — D365 command button */}
                    <ExcelExportButton onClick={handleExport} />
                </div>
                
                {/* Search Bar */}
                <DataTableToolbar
                    search={
                        <SearchInput
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Szukaj pracownika..."
                        />
                    }
                    actions={stats.countStudents > 0 ? (
                        <Alert variant="warning-amber" icon={<Info className="w-4 h-4" />} className="hidden md:flex shadow-sm animate-in fade-in" padding="px-3 py-1.5">
                            <span className="font-semibold">Uwaga: {stats.countStudents} studentów jest wygaszonych i nie wlicza się do sumy kosztów modelu.</span>
                        </Alert>
                    ) : undefined}
                />

                {/* Bulk Netto Baza Panel */}
                <div className="hidden md:flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 bg-blue-50/40 flex-shrink-0 flex-wrap">
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest whitespace-nowrap">Ustaw netto bazę zbiorczo:</span>
                    
                    {/* UZ group */}
                    <div className="flex items-center gap-1.5 bg-white border border-blue-200 rounded-md px-2 py-1 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">UZ</span>
                        <input
                            type="number"
                            min={0}
                            step={1}
                            value={bulkUzValue}
                            onChange={e => setBulkUzValue(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { handleBulkSet('UZ', bulkUzValue); setBulkUzValue(''); } }}
                            placeholder="np. 2028,80"
                            className="w-28 text-xs text-right border-none outline-none bg-transparent font-mono text-slate-800 placeholder:text-slate-300"
                        />
                        <span className="text-[10px] text-slate-400">zł</span>
                        <button
                            onClick={() => { handleBulkSet('UZ', bulkUzValue); setBulkUzValue(''); }}
                            disabled={!bulkUzValue}
                            className="ml-1 px-2.5 py-1 rounded bg-blue-600 text-white text-[10px] font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                        >
                            Zastosuj dla UZ
                        </button>
                    </div>

                    <div className="w-px h-5 bg-slate-200" />

                    {/* UoP group */}
                    <div className="flex items-center gap-1.5 bg-white border border-indigo-200 rounded-md px-2 py-1 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">UoP</span>
                        <input
                            type="number"
                            min={0}
                            step={1}
                            value={bulkUopValue}
                            onChange={e => setBulkUopValue(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { handleBulkSet('UOP', bulkUopValue); setBulkUopValue(''); } }}
                            placeholder="np. 3605,85"
                            className="w-28 text-xs text-right border-none outline-none bg-transparent font-mono text-slate-800 placeholder:text-slate-300"
                        />
                        <span className="text-[10px] text-slate-400">zł</span>
                        <button
                            onClick={() => { handleBulkSet('UOP', bulkUopValue); setBulkUopValue(''); }}
                            disabled={!bulkUopValue}
                            className="ml-1 px-2.5 py-1 rounded bg-indigo-600 text-white text-[10px] font-bold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                        >
                            Zastosuj dla UoP
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden relative">
                    {/* DESKTOP TABLE */}
                    <div className="hidden md:block h-full overflow-x-auto">
                        <PodzialTable data={filteredWyniki} />
                    </div>

                    {/* MOBILE CARD LIST */}
                    <div className="md:hidden h-full overflow-y-auto p-4 space-y-3 bg-slate-100/50 pb-6 custom-scrollbar">
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
