import React, { useState } from 'react';
import {
  TrendingUp,
  Save,
  FileText,
  Mail,
  ShieldCheck,
  PieChart,
  Calculator,
} from '../../../shared/icons/Icons';
import { shadow, animations } from '../../../shared/config/theme';
import { Alert } from '../../../shared/ui/Alert';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { useAppStore } from '../../../store/AppContext';
import { ComparisonState } from '../../../store/CalculationContext';
import { DonutChart } from './components/DonutChart';
import { SummaryActions } from './components/SummaryActions';
import { SummaryHeroCards } from './components/SummaryHeroCards';
import { SummaryComparisonSection } from './components/SummaryComparisonSection';
import { generatePremiumExcel } from './generatePremiumExcel';
import { generateFullHistoryExcel } from './generateFullHistoryExcel';
import { SaveSuccessModal } from '../../modals/SaveSuccessModal';
import { ZapisanaKalkulacja } from '../../../entities/history/model';
import { useSummaryData } from './useSummaryData';

interface StepPodsumowanieProps {
  onGoToDashboard?: () => void;
}

export const StepPodsumowanie = ({ onGoToDashboard }: StepPodsumowanieProps) => {
  const {
    wyniki,
    prowizjaProc,
    setProwizjaProc,
    setComparisonState,
    saveToHistory,
    firma,
    generateOfferElitonPrimePlus,
    generateLegalizacjaPremii,
    pracownicy,
    downloadCalculation,
    config,
    comparisonState,
  } = useAppStore();
  const [selectedPracownikId, setSelectedPracownikId] = useState<number | 'ALL'>('ALL');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [lastSavedItem, setLastSavedItem] = useState<ZapisanaKalkulacja | null>(null);

  const activeModel = comparisonState.activeCard;
  const defaultRate = activeModel === 'STANDARD' ? 28 : 26;
  const isCustomOffer = prowizjaProc !== defaultRate;

  const {
    globalStats,
    displayedStats,
    kpiStandardKoszt,
    kpiNowyKoszt,
    kpiOszczednoscMies,
    kpiOszczednoscRok,
    costReductionPercent,
    chartData,
  } = useSummaryData({
    szczegoly: wyniki?.szczegoly,
    prowizjaProc,
    activeModel,
    selectedPracownikId,
  });

  // Loading state when employees exist but calculation results are not ready yet
  if (!wyniki) {
    if (pracownicy.length > 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-[#a19f9d] animate-pulse">
          <Calculator className="w-12 h-12 mb-4 opacity-50" />
          <div className="text-lg font-medium">Przeliczanie wyników...</div>
        </div>
      );
    }
    return null;
  }

  // --- ACTIONS ---

  const handleGenerateEmail = () => {
    window.location.href = `mailto:${firma.email || ''}`;
  };

  const handleExportKalkulatorNadwyzek = async (): Promise<void> => {
    generatePremiumExcel({ firma, wyniki, prowizjaProc });
  };

  const handleExportZestawienieKrokow = async (): Promise<void> => {
    generateFullHistoryExcel({
      firma,
      pracownicy,
      wyniki,
      prowizjaProc,
      activeModel: comparisonState.activeCard,
    });
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

  const handleToggleModel = () => {
    if (activeModel === 'PRIME') {
      setComparisonState((prev: ComparisonState) => ({ ...prev, activeCard: 'STANDARD' }));
      setProwizjaProc(comparisonState.customStandardRate);
    } else {
      setComparisonState((prev: ComparisonState) => ({ ...prev, activeCard: 'PRIME' }));
      setProwizjaProc(comparisonState.customPrimeRate);
    }
  };

  const offerPayload = {
    id: 'temp',
    dataUtworzenia: new Date().toISOString(),
    nazwaFirmy: firma.nazwa,
    liczbaPracownikow: wyniki.szczegoly.length,
    oszczednoscRoczna: wyniki.podsumowanie.oszczednoscRoczna,
    dane: {
      firma,
      pracownicy: wyniki.szczegoly.map((x) => x.pracownik),
      config: config,
      prowizjaProc,
    },
  };

  return (
    <div className={animations.fadeIn}>
      <PageHeader
        icon={<TrendingUp />}
        iconColor="bg-emerald-50 text-emerald-700"
        title="Podsumowanie Oferty"
        description="Wyniki analizy optymalizacji wynagrodzeń. Zapis, wydruk lub wygeneruj ofertę klientową."
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6 items-start">
        {/* --- LEFT COLUMN: 8/12 --- */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          {/* 1. HERO CARDS */}
          <SummaryHeroCards
            kpiStandardKoszt={kpiStandardKoszt}
            kpiNowyKoszt={kpiNowyKoszt}
            kpiOszczednoscRok={kpiOszczednoscRok}
            kpiOszczednoscMies={kpiOszczednoscMies}
            costReductionPercent={costReductionPercent}
          />

          {/* 2. STRUKTURA KOSZTU (DONUT CHART) */}
          <div
            className={`bg-white rounded-md border border-[#edebe9] ${shadow.elevation4} overflow-hidden`}
          >
            <div className="px-5 py-3 flex items-center gap-2.5 border-b border-[#00245b] bg-brand rounded-t-md">
              <PieChart className="w-4 h-4 text-[#a19f9d] shrink-0" />
              <span className="text-[11px] font-black uppercase tracking-widest text-white">
                Struktura Nowego Kosztu
              </span>
              <span className="ml-auto text-[10px] text-[#a19f9d] hidden sm:block">
                Eliton Prime™ — alokacja kosztów
              </span>
            </div>
            <DonutChart
              data={chartData}
              totalReference={kpiStandardKoszt}
              savingsValue={kpiOszczednoscMies}
            />
          </div>

          {/* 3. MAIN COMPARISON TABLE */}
          <SummaryComparisonSection
            selectedPracownikId={selectedPracownikId}
            setSelectedPracownikId={setSelectedPracownikId}
            globalStats={globalStats}
            wyniki={wyniki}
            displayedStats={displayedStats}
            activeModel={activeModel}
            modelName={modelName}
            prowizjaProc={prowizjaProc}
            isCustomOffer={isCustomOffer}
            handleToggleModel={handleToggleModel}
          />
        </div>

        {/* --- RIGHT COLUMN: 4/12 (ACTIONS SIDEBAR) --- */}
        <div className="xl:col-span-4 flex flex-col gap-6 sticky top-6">
          <div className={`bg-white p-5 rounded-md border border-[#edebe9] ${shadow.elevation4}`}>
            <div className="flex items-center gap-2 mb-4 text-[#201f1e] font-bold">
              <FileText className="text-[#a19f9d]" />
              <span>Dokumentacja</span>
            </div>
            <SummaryActions
              onGenerateOfferElitonPrimePlus={() => generateOfferElitonPrimePlus(offerPayload)}
              onGenerateLegalizacjaPremii={() => generateLegalizacjaPremii(offerPayload)}
              onExportKalkulatorNadwyzek={handleExportKalkulatorNadwyzek}
              onExportZestawienieKrokow={handleExportZestawienieKrokow}
            />
          </div>

          <div className={`bg-white p-5 rounded-md border border-[#edebe9] ${shadow.elevation4}`}>
            <div className="flex items-center gap-2 mb-4 text-[#201f1e] font-bold">
              <Save className="text-[#a19f9d]" />
              <span>Archiwizacja</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSave}
                className={`flex flex-col items-center justify-center gap-2 p-3 bg-white border border-[#edebe9] rounded-sm hover:border-[#0078d4] hover:text-[#0078d4] transition-all ${animations.quick} text-[#605e5c] group`}
              >
                <Save className="group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">Zapisz w Bazie</span>
              </button>
              <button
                onClick={handleGenerateEmail}
                className={`flex flex-col items-center justify-center gap-2 p-3 bg-white border border-[#edebe9] rounded-sm hover:border-[#0078d4] hover:text-[#0078d4] transition-all ${animations.quick} text-[#605e5c]`}
              >
                <Mail />
                <span className="text-xs font-semibold">Wyślij E-mail</span>
              </button>
            </div>
          </div>

          <Alert icon={<ShieldCheck />} textSize="text-[10px]" className="text-[#a19f9d]">
            <strong>Bezpieczeństwo danych:</strong> Wszystkie obliczenia są wykonywane lokalnie w
            Twojej przeglądarce. Żadne dane osobowe nie są wysyłane na zewnętrzne serwery.
          </Alert>
        </div>
      </div>

      <SaveSuccessModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onExit={() => onGoToDashboard && onGoToDashboard()}
        onDownload={() => lastSavedItem && downloadCalculation(lastSavedItem)}
      />
    </div>
  );
};
