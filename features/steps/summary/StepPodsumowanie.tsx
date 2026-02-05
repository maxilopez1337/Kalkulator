
import React, { useState, useMemo } from 'react';
import { TrendingUp, LayoutGrid, List, Save, ArrowRight, FileText, Mail, Printer, Check, ShieldCheck, Download, PieChart, Wallet, Building, Calculator, Info, TrendingDown } from '../../../common/Icons';
import { FormField } from '../../../shared/ui/Layout';
import { Input, Select } from '../../../shared/ui/Input';
import { ButtonPrimary, ButtonSecondary } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { formatPLN } from '../../../shared/utils/formatters';
import { useAppStore } from '../../../store/AppContext';
import { SummaryComparisonTable } from './components/SummaryComparisonTable';
import { generatePremiumExcel } from './generatePremiumExcel';
import { SaveSuccessModal } from '../../modals/SaveSuccessModal';
import { ZapisanaKalkulacja } from '../../../entities/history/model';

interface StepPodsumowanieProps {
    onGoToDashboard?: () => void;
}

// --- INTERACTIVE DONUT CHART COMPONENT ---
const DonutChart = ({ 
    data, 
    totalReference, 
    savingsValue 
}: { 
    data: { label: string; value: number; color: string; subtext?: string }[], 
    totalReference: number, // To jest Koszt Standard (100% wykresu)
    savingsValue: number 
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Dodajemy segment oszczędności do wizualizacji, jeśli nie jest już w danych
    // Kolejność: Dane kosztowe + Oszczędność na końcu
    const chartSegments = [
        ...data,
        { 
            label: 'Oszczędność', 
            value: savingsValue, 
            color: '#10b981', // Emerald 500
            subtext: 'Zysk netto firmy'
        }
    ];

    // Dane do wyświetlenia w środku
    const activeItem = hoveredIndex !== null ? chartSegments[hoveredIndex] : null;
    
    // Domyślny widok (gdy brak hover) - POKAZUJEMY OSZCZĘDNOŚĆ
    const centerLabel = activeItem ? activeItem.label : 'Oszczędność';
    const centerValue = activeItem ? activeItem.value : savingsValue;
    const centerSub = activeItem 
        ? `${((activeItem.value / totalReference) * 100).toFixed(1)}% całości` 
        : 'Miesięcznie';
    const centerColor = activeItem ? activeItem.color : '#10b981';

    return (
        <div className="flex flex-col lg:flex-row items-center gap-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            
            {/* CHART AREA */}
            <div className="relative w-64 h-64 flex-shrink-0 group">
                <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full drop-shadow-lg">
                    {chartSegments.map((slice, i) => {
                        // Obliczamy procenty względem Kosztu Standardowego (Reference)
                        let localAccum = 0;
                        for(let j=0; j<i; j++) localAccum += chartSegments[j].value / totalReference;
                        
                        // Konfiguracja geometrii pierścienia
                        // Radius 40 (średnica 80) + Stroke 12 = Zewnętrzna krawędź ~92, Wewnętrzna ~68
                        // Zostawia dużo miejsca w środku
                        const radius = 40; 
                        const circumference = 2 * Math.PI * radius;
                        
                        // Zabezpieczenie przed ujemnymi wartościami (np. gdy koszt wzrósł)
                        const safeValue = Math.max(0, slice.value);
                        const dashArray = (safeValue / totalReference) * circumference;
                        
                        // Offset
                        const offset = -1 * localAccum * circumference;

                        const isHovered = hoveredIndex === i;
                        const isInactive = hoveredIndex !== null && !isHovered;

                        return (
                            <circle
                                key={i}
                                cx="50"
                                cy="50"
                                r={radius}
                                fill="transparent"
                                stroke={slice.color}
                                strokeWidth={isHovered ? 14 : 10} // Pogrubienie przy hover
                                strokeDasharray={`${dashArray} ${circumference}`}
                                strokeDashoffset={offset}
                                strokeLinecap="round" // Zaokrąglone końce dla ładniejszego wyglądu
                                className={`transition-all duration-300 ease-out cursor-pointer ${isInactive ? 'opacity-30' : 'opacity-100'}`}
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            />
                        );
                    })}
                    
                    {/* Tło pierścienia (cieniutka linia dla pełnego okręgu jeśli suma < 100% z powodu zaokrągleń) */}
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="10" className="-z-10" />
                </svg>

                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-200">
                    <span className="text-[11px] font-bold uppercase tracking-widest mb-1 transition-colors duration-300" style={{ color: hoveredIndex !== null ? '#64748b' : centerColor }}>
                        {centerLabel}
                    </span>
                    <span className="text-3xl font-extrabold text-slate-800 tracking-tight leading-none">
                        {formatPLN(centerValue).replace(' zł', '')}
                        <span className="text-sm font-medium text-slate-400 ml-0.5">zł</span>
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full mt-2 transition-colors duration-300 ${hoveredIndex !== null ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700'}`}>
                        {centerSub}
                    </span>
                </div>
            </div>

            {/* LEGEND & DETAILS */}
            <div className="flex-1 w-full space-y-6">
                <div>
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-2 mb-4">
                        Struktura Kosztów
                    </h4>
                    
                    <div className="space-y-3">
                        {chartSegments.map((item, i) => (
                            <div 
                                key={i} 
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200 ${hoveredIndex === i ? 'bg-slate-50 scale-[1.02] shadow-sm' : 'hover:bg-slate-50/50'}`}
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full shadow-sm ring-2 ring-white`} style={{ backgroundColor: item.color }}></div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-700">{item.label}</div>
                                        <div className="text-[10px] text-slate-400 font-medium">{item.subtext}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-slate-900">{formatPLN(item.value)}</div>
                                    <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 rounded inline-block">
                                        {((item.value / totalReference) * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 border border-slate-100 flex gap-2 items-start">
                    <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <p>
                        Wykres przedstawia podział kosztów w modelu docelowym względem obecnego budżetu (100%).
                        Zielony segment to Twoja czysta oszczędność.
                    </p>
                </div>
            </div>
        </div>
    );
};

export const StepPodsumowanie = ({ onGoToDashboard }: StepPodsumowanieProps) => {
  const { wyniki, prowizjaProc, saveToHistory, firma, generateOffer, pracownicy, downloadCalculation, config, comparisonState } = useAppStore();
  const [selectedPracownikId, setSelectedPracownikId] = useState<number | 'ALL'>('ALL');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [lastSavedItem, setLastSavedItem] = useState<ZapisanaKalkulacja | null>(null);

  // Pobieramy aktywny model z kontekstu (Standard vs Prime)
  const activeModel = comparisonState.activeCard;
  
  // Czy to oferta niestandardowa? (np. inna stawka niż domyślna dla modelu)
  const defaultRate = activeModel === 'STANDARD' ? 28 : 26;
  const isCustomOffer = prowizjaProc !== defaultRate;

  // Loading state when employees exist but calculation results are not ready yet
  if (!wyniki) {
      if (pracownicy.length > 0) {
          return (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 animate-pulse">
                  <Calculator className="w-12 h-12 mb-4 opacity-50" />
                  <div className="text-lg font-medium">Przeliczanie wyników...</div>
              </div>
          );
      }
      return null;
  }

  const round = (val: number) => Math.round(val * 100) / 100;

  // --- LOGIKA BIZNESOWA ---
  const calculateStats = (dataList: any[]) => {
    // 1. FILTROWANIE: Wyklucz studentów ze wszystkich kalkulacji (zgodnie z życzeniem "nie uwzględniaj w ogóle w ofercie")
    const qualifiedList = dataList.filter(w => w.pracownik.trybSkladek !== 'STUDENT_UZ');
    const excludedCount = dataList.length - qualifiedList.length;

    const standard = {
      brutto: qualifiedList.reduce((acc, w) => acc + round(w.standard.brutto), 0),
      zusPracodawca: qualifiedList.reduce((acc, w) => acc + round(w.standard.zusPracodawca.suma), 0),
      zusSpoleczne: qualifiedList.reduce((acc, w) => acc + round(w.standard.zusPracownik.suma), 0),
      zdrowotna: qualifiedList.reduce((acc, w) => acc + round(w.standard.zdrowotna), 0),
      pit: qualifiedList.reduce((acc, w) => acc + round(w.standard.pit), 0),
      kosztPracodawcy: qualifiedList.reduce((acc, w) => acc + round(w.standard.kosztPracodawcy), 0),
      netto: qualifiedList.reduce((acc, w) => acc + round(w.standard.netto), 0)
    };

    const stratton = {
      brutto: qualifiedList.reduce((acc, w) => {
          // Tutaj już nie musimy sprawdzać STUDENT_UZ, bo lista jest przefiltrowana
          return acc + round(w.podzial.pit.lacznyPrzychod);
      }, 0), 
      zusPracodawca: qualifiedList.reduce((acc, w) => {
          return acc + round(w.podzial.zasadnicza.zusPracodawca.suma);
      }, 0),
      zusSpoleczne: qualifiedList.reduce((acc, w) => {
          return acc + round(w.podzial.zasadnicza.zusPracownik.suma);
      }, 0),
      zdrowotna: qualifiedList.reduce((acc, w) => {
          return acc + round(w.podzial.zasadnicza.zdrowotna);
      }, 0),
      pit: qualifiedList.reduce((acc, w) => {
          return acc + round(w.podzial.pit.kwota);
      }, 0),
      kosztPracodawcy: qualifiedList.reduce((acc, w) => {
          return acc + round(w.podzial.kosztPracodawcy);
      }, 0),
      netto: qualifiedList.reduce((acc, w) => {
          return acc + round(w.podzial.doWyplaty);
      }, 0),
      
      prowizja: round(qualifiedList.reduce((acc, w) => {
          return acc + round(w.podzial.swiadczenie.brutto);
      }, 0) * (prowizjaProc / 100))
    };

    return { standard, stratton, count: qualifiedList.length, excludedCount };
  };

  const globalStats = calculateStats(wyniki.szczegoly);

  const displayedStats = useMemo(() => {
      if (selectedPracownikId === 'ALL') return globalStats;
      const emp = wyniki.szczegoly.find((w: any) => w.pracownik.id === selectedPracownikId);
      // Jeśli wybrany pracownik jest studentem, zwróci zera dla wszystkich pól finansowych (bo jest filtrowany w calculateStats)
      // Ale count = 0, excludedCount = 1
      return emp ? calculateStats([emp]) : globalStats;
  }, [selectedPracownikId, wyniki.szczegoly, globalStats]);

  // KPI Calculation
  const kpiStandardKoszt = displayedStats.standard.kosztPracodawcy;
  const kpiNowyKoszt = displayedStats.stratton.kosztPracodawcy + displayedStats.stratton.prowizja;
  const kpiOszczednoscMies = kpiStandardKoszt - kpiNowyKoszt;
  const kpiOszczednoscRok = kpiOszczednoscMies * 12;
  const costReductionPercent = kpiStandardKoszt > 0 ? (kpiOszczednoscMies / kpiStandardKoszt) * 100 : 0;

  // --- CHART DATA PREP (BUSINESS LOGIC) ---
  const capitalHuman = displayedStats.stratton.netto;
  const taxesState = 
      displayedStats.stratton.zusPracodawca + 
      displayedStats.stratton.zusSpoleczne + 
      displayedStats.stratton.zdrowotna + 
      displayedStats.stratton.pit;
    // Wylicz bonus admina 2% (zgodnie z SummaryComparisonTable)
    const totalProvision = displayedStats.stratton.prowizja;
    const baseBenefitBrutto = prowizjaProc > 0 ? totalProvision / (prowizjaProc / 100) : 0;
    const raiseAmount = activeModel === 'PRIME' ? baseBenefitBrutto * 0.04 : 0;
    const adminAmount = baseBenefitBrutto * 0.02;
    const feeAmount = activeModel === 'PRIME'
        ? Math.max(0, totalProvision - raiseAmount - adminAmount)
        : Math.max(0, totalProvision - adminAmount);
    const serviceFee = feeAmount;
  
  // NOTE: Nie sumujemy tutaj, bo totalReference to Koszt Standardowy, a nie suma elementów.
  // Oszczędność jest luką między Sumą Elementów a Kosztem Standardowym.

  const chartData = [
      { 
          label: 'Kapitał Ludzki', 
          subtext: 'Wynagrodzenia Netto + Benefity',
          value: capitalHuman, 
          color: '#3b82f6' // Blue 500
      },
      { 
          label: 'Obciążenia Fiskalne', 
          subtext: 'ZUS, NFZ, PIT (Skarbówka)',
          value: taxesState, 
          color: '#94a3b8' // Slate 400
      },
      // Podwyżka 4% tylko dla PRIME
      (activeModel === 'PRIME' && raiseAmount > 0) ? {
          label: 'Podwyżka dla Pracowników',
          subtext: '4% finansowane przez STRATTON',
          value: raiseAmount,
          color: '#059669' // Emerald 600
      } : null,
      // Bonus admina 2% zawsze pokazuj
      adminAmount > 0 ? {
          label: 'Bonus dla Działu Księgowo-Kadrowego',
          subtext: '2% wypłacane przez STRATTON',
          value: adminAmount,
          color: '#2563eb' // Blue 600
      } : null,
      { 
          label: 'Obsługa Systemu', 
          subtext: 'Opłata SUCCESS FEE za obsługę modelu Eliton Prime',
          value: serviceFee, 
          color: '#6366f1' // Indigo 500
      }
  ].filter(Boolean);

  // --- ACTIONS ---
  
  const handleGenerateEmail = () => {
    window.location.href = `mailto:${firma.email || ''}`;
  };

  const handleExportPremiumExcel = async () => {
      generatePremiumExcel({ firma, wyniki, prowizjaProc });
  };

  const handleSave = () => {
      const saved = saveToHistory();
      if (saved) {
          setLastSavedItem(saved);
          setIsSaveModalOpen(true);
      }
  };

  // ZMIANA: Skrócone nazwy modeli dla Badge'a
  const modelName = activeModel === 'PRIME' ? 'PLUS' : 'STANDARD';

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
        
        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* --- LEFT COLUMN: 8/12 --- */}
            <div className="xl:col-span-8 flex flex-col gap-6">
                
                {/* 1. HERO CARDS (REDESIGNED for Distinction) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* A. PAST (STANDARD) - Neutral/Grey Theme */}
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-full relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-2">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Koszt Obecny</div>
                            <div className="p-1.5 bg-white rounded-lg text-slate-400 border border-slate-200"><Building className="w-4 h-4" /></div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-600 tabular-nums">{formatPLN(kpiStandardKoszt)}</div>
                            <div className="text-[10px] text-slate-400 mt-1 font-medium">Model Standardowy (As-Is)</div>

                        </div>
                    </div>
                    
                    {/* B. FUTURE (ELITON) - Professional/Blue Theme */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-blue-500 shadow-sm flex flex-col justify-between h-full relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">Nowy Koszt</div>
                            <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded text-[10px] font-bold text-blue-600">
                                <TrendingDown className="w-3 h-3" />
                                <span>{costReductionPercent.toFixed(1)}%</span>
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900 tabular-nums">{formatPLN(kpiNowyKoszt)}</div>
                            <div className="text-[10px] text-slate-500 mt-1 font-medium">Model Eliton Prime</div>
                        </div>
                    </div>

                    {/* C. RESULT (SAVINGS) - Premium/Gradient Theme */}
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-800 p-5 rounded-xl shadow-lg text-white flex flex-col justify-between h-full relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        {/* Decorative Background */}
                        <div className="absolute -right-4 -bottom-4 opacity-10 text-white transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                            <Wallet className="w-24 h-24" />
                        </div>
                        
                        <div className="flex justify-between items-start mb-2 relative z-10">
                            <div className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Oszczędność Roczna</div>
                            <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-white"><TrendingUp className="w-4 h-4" /></div>
                        </div>
                        <div className="relative z-10">
                            <div className="text-3xl font-extrabold text-white tracking-tight tabular-nums">{formatPLN(kpiOszczednoscRok)}</div>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className="bg-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-medium border border-emerald-400/30 backdrop-blur-sm">
                                    Miesięcznie: {formatPLN(kpiOszczednoscMies)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. STRUKTURA KOSZTU (DONUT CHART) */}
                <div>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <PieChart className="text-blue-600" /> Struktura Nowego Kosztu
                            </h3>
                            <p className="text-sm text-slate-500">Analiza efektywności alokacji środków w Modelu Eliton Prime</p>
                        </div>
                    </div>
                    
                    <DonutChart 
                        data={chartData} 
                        totalReference={kpiStandardKoszt} // Ważne: 100% to koszt stary
                        savingsValue={kpiOszczednoscMies} // Wartość oszczędności do wyświetlenia jako dopełnienie
                    />
                </div>

                {/* 3. MAIN COMPARISON TABLE - REDESIGNED CONTAINER */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col mt-2">
                    
                    {/* Header Filters */}
                    <div className="px-6 py-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Symulacja Szczegółowa</h3>
                            <div className="text-xs text-slate-500 mt-0.5">Porównanie kosztów i wyników finansowych</div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
                            <div className="relative">
                                <select 
                                    value={selectedPracownikId} 
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setSelectedPracownikId(val === 'ALL' ? 'ALL' : Number(val));
                                    }}
                                    className="appearance-none w-full md:w-64 pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                                >
                                    <option value="ALL">
                                        Cała Firma ({globalStats.count} os.)
                                    </option>
                                    {wyniki.szczegoly.map((w: any) => {
                                        const isStudent = w.pracownik.trybSkladek === 'STUDENT_UZ';
                                        return (
                                            <option key={w.pracownik.id} value={w.pracownik.id} disabled={isStudent} className={isStudent ? 'text-gray-400 bg-gray-100' : ''}>
                                                {w.pracownik.imie} {w.pracownik.nazwisko} {isStudent ? '(Student)' : ''}
                                            </option>
                                        );
                                    })}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                            
                            {/* MODEL BADGE */}
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                                activeModel === 'PRIME' 
                                ? 'bg-amber-50 border-amber-200 text-amber-800' 
                                : 'bg-indigo-50 border-indigo-200 text-indigo-800'
                            }`}>
                                <div className="flex flex-col leading-none">
                                    <span className="text-[9px] opacity-60 font-semibold uppercase tracking-wider mb-0.5">Model</span>
                                    <span className="text-xs font-black tracking-tight">{modelName}</span>
                                </div>
                                <div className={`h-6 w-px mx-1 ${activeModel === 'PRIME' ? 'bg-amber-200' : 'bg-indigo-200'}`}></div>
                                <span className="text-sm font-mono font-bold">
                                    {prowizjaProc}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        {selectedPracownikId !== 'ALL' && wyniki.szczegoly.find(w => w.pracownik.id === Number(selectedPracownikId))?.pracownik.trybSkladek === 'STUDENT_UZ' ? (
                            <div className="text-center py-12 text-slate-400">
                                <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p>Wybrany pracownik ma status studenta i jest wykluczony z oferty optymalizacji.</p>
                            </div>
                        ) : (
                            <SummaryComparisonTable 
                                stats={displayedStats} 
                                prowizjaProc={prowizjaProc} 
                                activeModel={activeModel}
                            />
                        )}
                        
                        {/* Footer Notes */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            {isCustomOffer && (
                                <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                    <span>Oferta Indywidualna</span>
                                    <span className="bg-white border border-slate-200 px-1.5 rounded font-mono text-slate-600">{prowizjaProc}%</span>
                                </div>
                            )}
                            
                            {globalStats.excludedCount > 0 && selectedPracownikId === 'ALL' && (
                                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 ml-auto">
                                    <Info className="w-3 h-3" />
                                    <span>Pominięto {globalStats.excludedCount} studentów</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* --- RIGHT COLUMN: 4/12 (ACTIONS SIDEBAR) --- */}
            <div className="xl:col-span-4 flex flex-col gap-6 sticky top-6">
                
                {/* PRIMARY ACTIONS CARD */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-md">
                    <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold">
                        <FileText className="text-slate-400" />
                        <span>Dokumentacja</span>
                    </div>
                    
                    <div className="space-y-3">
                        <button 
                            onClick={() => generateOffer({ 
                                id: 'temp', 
                                dataUtworzenia: new Date().toISOString(), 
                                nazwaFirmy: firma.nazwa, 
                                liczbaPracownikow: wyniki.szczegoly.length, 
                                oszczednoscRoczna: wyniki.podsumowanie.oszczednoscRoczna, 
                                dane: { 
                                    firma, 
                                    pracownicy: wyniki.szczegoly.map(x=>x.pracownik), 
                                    config: config, 
                                    prowizjaProc 
                                } 
                            })}
                            className="w-full flex items-center justify-between p-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 hover:shadow-lg transition-all group"
                        >
                            <div className="flex flex-col items-start">
                                <span className="font-bold text-sm">Generuj Ofertę PDF</span>
                                <span className="text-[10px] text-slate-400 group-hover:text-slate-300">Gotowa do druku i podpisu</span>
                            </div>
                            <Printer />
                        </button>

                        <button 
                            onClick={handleExportPremiumExcel}
                            className="w-full flex items-center justify-between p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-all group"
                        >
                            <div className="flex flex-col items-start">
                                <span className="font-bold text-sm">Eksportuj Raport</span>
                                <span className="text-[10px] text-emerald-600/70">XLSX (Pełny Raport Menadżerski)</span>
                            </div>
                            <Download />
                        </button>
                    </div>
                </div>

                {/* SECONDARY ACTIONS */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold">
                        <Save className="text-slate-400" />
                        <span>Archiwizacja</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={handleSave}
                            className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-all text-slate-600 group"
                        >
                            <Save className="group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-semibold">Zapisz w Bazie</span>
                        </button>

                        <button 
                            onClick={handleGenerateEmail}
                            className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-all text-slate-600"
                        >
                            <Mail />
                            <span className="text-xs font-semibold">Wyślij E-mail</span>
                        </button>
                    </div>
                </div>

                {/* LEGAL NOTE */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-[10px] text-slate-400 leading-relaxed flex gap-2">
                    <ShieldCheck className="flex-shrink-0 mt-0.5" />
                    <div>
                        <strong>Bezpieczeństwo danych:</strong> Wszystkie obliczenia są wykonywane lokalnie w Twojej przeglądarce. Żadne dane osobowe nie są wysyłane na zewnętrzne serwery.
                    </div>
                </div>

            </div>

        </div>

        {/* MODAL PO ZAPISANIU */}
        <SaveSuccessModal 
            isOpen={isSaveModalOpen} 
            onClose={() => setIsSaveModalOpen(false)}
            onExit={() => onGoToDashboard && onGoToDashboard()}
            onDownload={() => lastSavedItem && downloadCalculation(lastSavedItem)}
        />
    </div>
  );
};
