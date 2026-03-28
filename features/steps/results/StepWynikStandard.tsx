
import React, { useMemo, useState } from 'react';
import { TrendingUp, Wallet, PieChart, Users, ChevronDown } from '../../../shared/icons/Icons';
import { SectionLabel } from '../../../shared/ui/SectionLabel';
import { KpiCard } from '../../../shared/ui/KpiCard';
import { SearchInput } from '../../../shared/ui/SearchInput';
import { shadow, animations } from '../../../shared/config/theme';
import { DataTableToolbar } from '../../../shared/ui/DataTableToolbar';
import { ExcelExportButton } from '../../../shared/ui/ExcelExportButton';
import { applyHeaderStyle, applyDataStyle, applyTotalStyle } from './excelStyles';
import { useExcelExport } from '../../../hooks/useExcelExport';
import { useAppStore } from '../../../store/AppContext';
import { StandardTable } from './components/StandardTable';
import { useResultsFilter } from '../../../hooks/useResultsFilter';
import { formatPLN } from '../../../shared/utils/formatters';
import { STANDARD_TABLE_CONFIG } from './excelTableConfigs';
import { WynikPracownika } from '../../../entities/calculation/model';
import { Avatar } from '../../../shared/ui/Avatar';
import { EmptyState } from '../../../shared/ui/EmptyState';

// --- MOBILE CARD COMPONENT ---
const ResultCard: React.FC<{ item: WynikPracownika, standardKoszt: number }> = ({ item, standardKoszt }) => {
    const [expanded, setExpanded] = useState(false);
    
    return (
        <div className={`bg-white rounded-md border border-[#edebe9] ${shadow.elevation4} overflow-hidden transition-all ${animations.quick} active:scale-[0.99]`}>
            {/* Header */}
            <div className="p-4 flex justify-between items-start cursor-pointer hover:bg-[#f3f2f1] transition-colors" role="button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center gap-3">
                    <Avatar
                        name={item.pracownik.imie}
                        surname={item.pracownik.nazwisko}
                        colorClass="bg-[#f3f2f1] text-[#605e5c] border border-[#edebe9]"
                    />
                    <div>
                        <div className="font-bold text-[#201f1e] text-sm">{item.pracownik.imie} {item.pracownik.nazwisko}</div>
                        <div className="text-xs text-[#605e5c] flex items-center gap-2 mt-0.5">
                            <span className={`uppercase font-bold tracking-wider text-[9px] px-1.5 py-0.5 rounded border ${item.pracownik.typUmowy === 'UOP' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                {item.pracownik.typUmowy}
                            </span>
                            <span>{formatPLN(item.standard.netto)} netto</span>
                        </div>
                    </div>
                </div>
                <div className={`text-[#a19f9d] p-1 transition-transform ${animations.quick} ${expanded ? 'rotate-180' : ''}`}>
                    <ChevronDown />
                </div>
            </div>

            {/* Key Metrics Row */}
            <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                <div className="bg-[#f3f2f1] p-2.5 rounded-sm border border-[#edebe9]">
                    <SectionLabel className="mb-1">Koszt Całkowity</SectionLabel>
                    <div className="text-sm font-bold text-[#323130]">{formatPLN(item.standard.kosztPracodawcy)}</div>
                </div>
                <div className="bg-[#f3f2f1] p-2.5 rounded-sm border border-[#edebe9]">
                    <SectionLabel className="mb-1">Brutto</SectionLabel>
                    <div className="text-sm font-bold text-[#323130]">{formatPLN(item.standard.brutto)}</div>
                </div>
            </div>

            {/* Expanded Details */}
            {expanded && (
                <div className="border-t border-[#edebe9] bg-[#f3f2f1]/50 p-4 space-y-4 animate-in slide-in-from-top-2">
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                        <div className="col-span-2 font-bold text-[#201f1e] border-b border-[#edebe9] pb-1 mb-1 mt-2 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                            Koszty Pracodawcy
                        </div>
                        
                        <div className="text-[#605e5c]">ZUS Emerytalne</div>
                        <div className="text-right font-mono text-[#323130]">{formatPLN(item.standard.zusPracodawca.emerytalna)}</div>
                        
                        <div className="text-[#605e5c]">ZUS Rentowe</div>
                        <div className="text-right font-mono text-[#323130]">{formatPLN(item.standard.zusPracodawca.rentowa)}</div>
                        
                        <div className="text-[#605e5c]">Wypadkowa</div>
                        <div className="text-right font-mono text-[#323130]">{formatPLN(item.standard.zusPracodawca.wypadkowa)}</div>
                        
                        <div className="text-[#605e5c]">FP + FGŚP</div>
                        <div className="text-right font-mono text-[#323130]">{formatPLN(item.standard.zusPracodawca.fp + item.standard.zusPracodawca.fgsp)}</div>

                        <div className="col-span-2 font-bold text-[#201f1e] border-b border-[#edebe9] pb-1 mb-1 mt-2 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                            Potrącenia Pracownika
                        </div>
                        
                        <div className="text-[#605e5c]">ZUS Społeczne</div>
                        <div className="text-right font-mono text-[#323130]">{formatPLN(item.standard.zusPracownik.suma)}</div>
                        
                        <div className="text-[#605e5c]">Zdrowotna</div>
                        <div className="text-right font-mono text-[#323130]">{formatPLN(item.standard.zdrowotna)}</div>
                        
                        <div className="text-[#605e5c]">Zaliczka PIT</div>
                        <div className="text-right font-mono text-[#323130]">{formatPLN(item.standard.pit)}</div>
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
        const sums = filteredWyniki.reduce((acc, w) => {
            const s = w.standard;
            acc.netto += s.netto;
            acc.brutto += s.brutto;
            acc.koszt += s.kosztPracodawcy;
            acc.podstZus += s.podstawaZus;
            acc.emerytalnaPrac += s.zusPracownik.emerytalna;
            acc.rentowaPrac += s.zusPracownik.rentowa;
            acc.chorobowaPrac += s.zusPracownik.chorobowa;
            acc.zusPrac += s.zusPracownik.suma;
            acc.podstZdrow += s.podstawaZdrowotna;
            acc.zdrowotna += s.zdrowotna;
            acc.sumaZusPrac += s.zusPracownik.suma + s.zdrowotna;
            acc.kup += s.kup;
            acc.podstPit += s.podstawaPit;
            acc.pit += s.pit;
            acc.emerytalnaFirma += s.zusPracodawca.emerytalna;
            acc.rentowaFirma += s.zusPracodawca.rentowa;
            acc.wypadkowaFirma += s.zusPracodawca.wypadkowa;
            acc.fp += s.zusPracodawca.fp;
            acc.fgsp += s.zusPracodawca.fgsp;
            acc.zusFirma += s.zusPracodawca.suma;
            acc.sumaSkladek += s.zusPracodawca.suma + s.zusPracownik.suma + s.zdrowotna;
            return acc;
        }, { netto:0, brutto:0, koszt:0, podstZus:0, emerytalnaPrac:0, rentowaPrac:0, chorobowaPrac:0, zusPrac:0, podstZdrow:0, zdrowotna:0, sumaZusPrac:0, kup:0, podstPit:0, pit:0, emerytalnaFirma:0, rentowaFirma:0, wypadkowaFirma:0, fp:0, fgsp:0, zusFirma:0, sumaSkladek:0 });

        const totalRow = { lp: '', name: 'SUMA CAŁKOWITA', type: '', stawkaPit: '', ...sums };

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
        <div className={`${animations.fadeIn} h-full min-h-0 flex flex-col gap-2`}>

            {/* DATA GRID CONTAINER */}
            <div className={`bg-white rounded-md ${shadow.elevation8} border border-[#edebe9] overflow-hidden flex flex-col flex-1 min-h-0`}>

                {/* D365 COMMAND BAR */}
                <div className="flex items-stretch border-b border-[#edebe9] bg-white flex-shrink-0 h-[44px] overflow-hidden">
                    {/* Title */}
                    <div className="flex items-center gap-2 px-4 border-r border-[#edebe9] shrink-0">
                        <div className="text-[#0078d4]"><TrendingUp /></div>
                        <span className="hidden sm:inline text-[13px] font-semibold text-[#323130] whitespace-nowrap">Aktualny Koszt Zatrudnienia</span>
                    </div>
                    {/* KPI Stats */}
                    <div className="flex items-stretch flex-1 overflow-x-auto scrollbar-hide">
                        <div className="flex items-center gap-2 px-4 border-r border-[#edebe9] shrink-0">
                            <Users className="w-3.5 h-3.5 text-[#a19f9d]" />
                            <span className="text-[11px] text-[#605e5c]">Pracownicy:</span>
                            <span className="text-[13px] font-semibold text-[#323130] tabular-nums">{filteredWyniki.length}</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 border-r border-[#edebe9] shrink-0">
                            <Wallet className="w-3.5 h-3.5 text-[#0078d4]" />
                            <span className="text-[11px] text-[#605e5c] uppercase tracking-wide">Netto</span>
                            <span className="text-[13px] font-semibold text-[#0078d4] tabular-nums">{formatPLN(stats.netto)}</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 border-r border-[#edebe9] shrink-0">
                            <PieChart className="w-3.5 h-3.5 text-[#a19f9d]" />
                            <span className="text-[11px] text-[#605e5c] uppercase tracking-wide">ZUS+PIT</span>
                            <span className="text-[13px] font-semibold text-[#323130] tabular-nums">{formatPLN(stats.podatki)}</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 shrink-0">
                            <TrendingUp className="w-3.5 h-3.5 text-[#0078d4]" />
                            <span className="text-[11px] text-[#605e5c] uppercase tracking-wide">Koszt</span>
                            <span className="text-[14px] font-bold text-[#0078d4] tabular-nums">{formatPLN(stats.koszt)}</span>
                        </div>
                    </div>
                    {/* Export — D365 command button */}
                    <ExcelExportButton onClick={handleExport} />
                </div>

                {/* Search Toolbar */}
                <DataTableToolbar
                    search={
                        <SearchInput
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Szukaj pracownika..."
                        />
                    }
                />

                {/* CONTENT: TABLE (Desktop) vs CARDS (Mobile) */}
                <div className="flex-1 overflow-hidden relative">
                    
                    {/* DESKTOP TABLE */}
                    <div className="hidden md:block h-full overflow-x-auto">
                        <StandardTable data={filteredWyniki} />
                    </div>

                    {/* MOBILE CARD LIST */}
                    <div className="md:hidden h-full overflow-y-auto p-4 space-y-3 bg-[#f3f2f1]/50 pb-6 custom-scrollbar">
                        {filteredWyniki.map((item) => (
                            <ResultCard key={item.pracownik.id} item={item} standardKoszt={item.standard.kosztPracodawcy} />
                        ))}
                        {filteredWyniki.length === 0 && (
                            <EmptyState icon={<Users />} title="Brak wyników" description="Brak wyników spełniających kryteria wyszukiwania." />
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};
