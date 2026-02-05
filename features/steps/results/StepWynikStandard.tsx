
import React, { useMemo, useState } from 'react';
import { Calculator, Search, X, TrendingUp, Wallet, PieChart, Users, ArrowRight, ChevronDown, ChevronUp } from '../../../common/Icons';
import { ButtonSecondary } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { applyHeaderStyle, applyDataStyle, applyTotalStyle } from './excelStyles';
import { useExcelExport } from '../../../hooks/useExcelExport';
import { useAppStore } from '../../../store/AppContext';
import { StandardTable } from './components/StandardTable';
import { useResultsFilter } from '../../../hooks/useResultsFilter';
import { formatPLN } from '../../../shared/utils/formatters';
import { STANDARD_TABLE_CONFIG } from './excelTableConfigs';
import { WynikPracownika } from '../../../entities/calculation/model';

declare global {
    interface Window {
        XLSX: any;
        ExcelJS: any;
    }
}

// --- MOBILE CARD COMPONENT ---
const ResultCard: React.FC<{ item: WynikPracownika, standardKoszt: number }> = ({ item, standardKoszt }) => {
    const [expanded, setExpanded] = useState(false);
    
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 active:scale-[0.99]">
            {/* Header */}
            <div className="p-4 flex justify-between items-start cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm border border-slate-200">
                        {item.pracownik.imie.charAt(0)}{item.pracownik.nazwisko.charAt(0)}
                    </div>
                    <div>
                        <div className="font-bold text-slate-900 text-sm">{item.pracownik.imie} {item.pracownik.nazwisko}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className={`uppercase font-bold tracking-wider text-[9px] px-1.5 py-0.5 rounded border ${item.pracownik.typUmowy === 'UOP' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                {item.pracownik.typUmowy}
                            </span>
                            <span>{formatPLN(item.standard.netto)} netto</span>
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
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Koszt Całkowity</div>
                    <div className="text-sm font-bold text-slate-700">{formatPLN(item.standard.kosztPracodawcy)}</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Brutto</div>
                    <div className="text-sm font-bold text-slate-700">{formatPLN(item.standard.brutto)}</div>
                </div>
            </div>

            {/* Expanded Details */}
            {expanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-4 animate-in slide-in-from-top-2">
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                        <div className="col-span-2 font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1 mt-2 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                            Koszty Pracodawcy
                        </div>
                        
                        <div className="text-slate-500">ZUS Emerytalne</div>
                        <div className="text-right font-mono text-slate-700">{formatPLN(item.standard.zusPracodawca.emerytalna)}</div>
                        
                        <div className="text-slate-500">ZUS Rentowe</div>
                        <div className="text-right font-mono text-slate-700">{formatPLN(item.standard.zusPracodawca.rentowa)}</div>
                        
                        <div className="text-slate-500">Wypadkowa</div>
                        <div className="text-right font-mono text-slate-700">{formatPLN(item.standard.zusPracodawca.wypadkowa)}</div>
                        
                        <div className="text-slate-500">FP + FGŚP</div>
                        <div className="text-right font-mono text-slate-700">{formatPLN(item.standard.zusPracodawca.fp + item.standard.zusPracodawca.fgsp)}</div>

                        <div className="col-span-2 font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1 mt-2 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                            Potrącenia Pracownika
                        </div>
                        
                        <div className="text-slate-500">ZUS Społeczne</div>
                        <div className="text-right font-mono text-slate-700">{formatPLN(item.standard.zusPracownik.suma)}</div>
                        
                        <div className="text-slate-500">Zdrowotna</div>
                        <div className="text-right font-mono text-slate-700">{formatPLN(item.standard.zdrowotna)}</div>
                        
                        <div className="text-slate-500">Zaliczka PIT</div>
                        <div className="text-right font-mono text-slate-700">{formatPLN(item.standard.pit)}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const StepWynikStandard = () => {
    const { wyniki, firma } = useAppStore();
    const { exportToExcel } = useExcelExport();

    // Hooki
    const { searchQuery, setSearchQuery, filteredData: filteredWyniki } = useResultsFilter(wyniki?.szczegoly);

    // Obliczenia KPI dla widocznych danych
    const stats = useMemo(() => {
        if (!filteredWyniki) return null;
        return filteredWyniki.reduce((acc, w) => ({
            netto: acc.netto + w.standard.netto,
            koszt: acc.koszt + w.standard.kosztPracodawcy,
            podatki: acc.podatki + (w.standard.zusPracodawca.suma + w.standard.zusPracownik.suma + w.standard.zdrowotna + w.standard.pit)
        }), { netto: 0, koszt: 0, podatki: 0 });
    }, [filteredWyniki]);

    if (!wyniki || !stats) return null;

    const handleExport = () => {
        const totalRow = {
            lp: '',
            name: 'SUMA CAŁKOWITA',
            type: '',
            netto: filteredWyniki.reduce((acc:number, w:any) => acc + w.standard.netto, 0),
            brutto: filteredWyniki.reduce((acc:number, w:any) => acc + w.standard.brutto, 0),
            koszt: filteredWyniki.reduce((acc:number, w:any) => acc + w.standard.kosztPracodawcy, 0),
            podstZus: filteredWyniki.reduce((acc:number, w:any) => acc + w.standard.podstawaZus, 0),
            emerytalnaPrac: filteredWyniki.reduce((acc:number, w:any) => acc + w.standard.zusPracownik.emerytalna, 0),
            rentowaPrac: filteredWyniki.reduce((acc:number, w:any) => acc + w.standard.zusPracownik.rentowa, 0),
            chorobowaPrac: filteredWyniki.reduce((acc:number, w:any) => acc + w.standard.zusPracownik.chorobowa, 0),
            zusPrac: filteredWyniki.reduce((acc:number, w:any) => acc + w.standard.zusPracownik.suma, 0),
            podstZdrow: filteredWyniki.reduce((acc:number, w:any) => acc + w.standard.podstawaZdrowotna, 0),
            zdrowotna: filteredWyniki.reduce((acc:number, w:any) => acc + w.standard.zdrowotna, 0),
            sumaZusPrac: filteredWyniki.reduce((acc:number, w:any) => acc + w.standard.zusPracownik.suma + w.standard.zdrowotna, 0),
            kup: filteredWyniki.reduce((acc:number, w:any) => acc + w.standard.kup, 0),
            podstPit: filteredWyniki.reduce((acc:number, w:any) => acc + w.standard.podstawaPit, 0),
            stawkaPit: '',
            pit: filteredWyniki.reduce((acc:number, w:any) => acc + w.standard.pit, 0),
            emerytalnaFirma: filteredWyniki.reduce((acc:number, w:any) => acc + w.standard.zusPracodawca.emerytalna, 0),
            rentowaFirma: filteredWyniki.reduce((acc:number, w:any) => acc + w.standard.zusPracodawca.rentowa, 0),
            wypadkowaFirma: filteredWyniki.reduce((acc:number, w:any) => acc + w.standard.zusPracodawca.wypadkowa, 0),
            fp: filteredWyniki.reduce((acc:number, w:any) => acc + w.standard.zusPracodawca.fp, 0),
            fgsp: filteredWyniki.reduce((acc:number, w:any) => acc + w.standard.zusPracodawca.fgsp, 0),
            zusFirma: filteredWyniki.reduce((acc:number, w:any) => acc + w.standard.zusPracodawca.suma, 0),
            sumaSkladek: filteredWyniki.reduce((acc:number, w:any) => acc + w.standard.zusPracodawca.suma + w.standard.zusPracownik.suma + w.standard.zdrowotna, 0)
        };

        exportToExcel({
            fileName: `Wynik_Standard_${firma.nazwa || 'Firma'}`,
            sheetName: 'Wynik Standard',
            headerGroups: STANDARD_TABLE_CONFIG.headerGroups, 
            columns: STANDARD_TABLE_CONFIG.columns,
            data: filteredWyniki,
            dataMapper: (w, idx) => ({
                lp: idx + 1,
                name: `${w.pracownik.imie} ${w.pracownik.nazwisko}`,
                type: w.pracownik.typUmowy,
                netto: w.standard.netto,
                brutto: w.standard.brutto,
                koszt: w.standard.kosztPracodawcy,
                podstZus: w.standard.podstawaZus,
                emerytalnaPrac: w.standard.zusPracownik.emerytalna,
                rentowaPrac: w.standard.zusPracownik.rentowa,
                chorobowaPrac: w.standard.zusPracownik.chorobowa,
                zusPrac: w.standard.zusPracownik.suma,
                podstZdrow: w.standard.podstawaZdrowotna,
                zdrowotna: w.standard.zdrowotna,
                sumaZusPrac: w.standard.zusPracownik.suma + w.standard.zdrowotna,
                kup: w.standard.kup,
                podstPit: w.standard.podstawaPit,
                stawkaPit: `${w.standard.stawkaPit}%`,
                pit: w.standard.pit,
                emerytalnaFirma: w.standard.zusPracodawca.emerytalna,
                rentowaFirma: w.standard.zusPracodawca.rentowa,
                wypadkowaFirma: w.standard.zusPracodawca.wypadkowa,
                fp: w.standard.zusPracodawca.fp,
                fgsp: w.standard.zusPracodawca.fgsp,
                zusFirma: w.standard.zusPracodawca.suma,
                sumaSkladek: w.standard.zusPracodawca.suma + w.standard.zusPracownik.suma + w.standard.zdrowotna
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
            
            {/* 1. EXECUTIVE SUMMARY (KPIs) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div>
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Pracownicy</div>
                        <div className="text-2xl font-bold text-slate-900">{filteredWyniki.length}</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg text-slate-400"><Users /></div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                    <div>
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Netto dla Ludzi</div>
                        <div className="text-2xl font-bold text-blue-900">{formatPLN(stats.netto)}</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><Wallet /></div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                    <div>
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Obciążenia (ZUS+PIT)</div>
                        <div className="text-2xl font-bold text-amber-900">{formatPLN(stats.podatki)}</div>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg text-amber-600"><PieChart /></div>
                </div>

                <div className="bg-slate-900 p-5 rounded-xl border border-slate-900 shadow-md flex items-center justify-between relative overflow-hidden text-white">
                    <div>
                        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Koszt Całkowity</div>
                        <div className="text-2xl font-bold">{formatPLN(stats.koszt)}</div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-lg text-white"><TrendingUp /></div>
                </div>
            </div>

            {/* 2. DATA GRID CONTAINER */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-280px)]">
                
                {/* Header */}
                <div className="flex items-center gap-3 px-4 md:px-7 py-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-slate-700"><Calculator /></div>
                    <h2 className="text-base md:text-lg font-bold text-slate-900">Analiza Kosztów (As-Is)</h2>
                    <div className="ml-auto flex gap-2">
                         <ButtonSecondary size="sm" onClick={handleExport} icon={<Wallet />}>
                             <span className="hidden md:inline">Eksportuj do Excel</span>
                             <span className="md:hidden">Excel</span>
                         </ButtonSecondary>
                    </div>
                </div>

                {/* Search Toolbar */}
                <div className="px-4 md:px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col xl:flex-row gap-4 justify-between items-center flex-shrink-0">
                    
                    {/* Search */}
                    <div className="relative w-full xl:w-96">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Search /></div>
                        <Input 
                            type="text" 
                            placeholder="Filtruj listę..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-10 py-2 text-sm bg-white"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X /></button>
                        )}
                    </div>
                </div>

                {/* CONTENT: TABLE (Desktop) vs CARDS (Mobile) */}
                <div className="flex-1 overflow-hidden relative">
                    
                    {/* DESKTOP TABLE */}
                    <div className="hidden md:block h-full overflow-x-auto">
                        <StandardTable data={filteredWyniki} />
                    </div>

                    {/* MOBILE CARD LIST */}
                    <div className="md:hidden h-full overflow-y-auto p-4 space-y-3 bg-slate-100/50 pb-20 custom-scrollbar">
                        {filteredWyniki.map((item) => (
                            <ResultCard key={item.pracownik.id} item={item} standardKoszt={item.standard.kosztPracodawcy} />
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
