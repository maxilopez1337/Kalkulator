
import React, { useMemo, useEffect } from 'react';
import { TrendingUp, Info, PieChart, Users, Wallet } from '../../../shared/icons/Icons';
import { Card } from '../../../shared/ui/Card';
import { Alert } from '../../../shared/ui/Alert';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { formatPLN } from '../../../shared/utils/formatters';
import { useCalculation } from '../../../store/AppContext';
import { animations } from '../../../shared/config/theme';
import { CostBridgeChart } from './components/CostBridgeChart';
import { ComparisonCards } from './components/ComparisonCards';
import { TopSaversRanking } from './components/TopSaversRanking';

export const StepPorownanie = () => {
  const { wyniki, prowizjaProc, setProwizjaProc, comparisonState, setComparisonState } = useCalculation();

  // Pobieramy stan z kontekstu globalnego (zamiast lokalnego useState)
  // Dzięki temu wartości inputów nie resetują się przy zmianie tabów.
  const { activeCard, customStandardRate, customPrimeRate } = comparisonState;

  // --- HANDLERS ---

  const handleSelectStandard = () => {
      setComparisonState(prev => ({ ...prev, activeCard: 'STANDARD' }));
      setProwizjaProc(customStandardRate);
  };

  const handleSelectPrime = () => {
      setComparisonState(prev => ({ ...prev, activeCard: 'PRIME' }));
      setProwizjaProc(customPrimeRate);
  };

  const handleChangeStandardRate = (val: number) => {
      // Aktualizujemy stan w pamięci
      setComparisonState(prev => ({ ...prev, customStandardRate: val }));

      // Jeśli ta karta jest aktywna, od razu przeliczamy wyniki (prowizjaProc)
      if (activeCard === 'STANDARD') {
          setProwizjaProc(val);
      }
  };

  const handleChangePrimeRate = (val: number) => {
      // Aktualizujemy stan w pamięci
      setComparisonState(prev => ({ ...prev, customPrimeRate: val }));

      // Jeśli ta karta jest aktywna, od razu przeliczamy wyniki (prowizjaProc)
      if (activeCard === 'PRIME') {
          setProwizjaProc(val);
      }
  };

  // Synchronizacja przy pierwszym wejściu (jeśli np. załadowano kopię zapasową)
  // Jeśli prowizjaProc jest różna od tego co mamy w stanie UI aktywnej karty, aktualizujemy stan UI.
  useEffect(() => {
      if (activeCard === 'STANDARD' && prowizjaProc !== customStandardRate) {
          // Ktoś zmienił prowizję z zewnątrz (np. import), a jesteśmy na Standard -> update inputa
          setComparisonState(prev => ({ ...prev, customStandardRate: prowizjaProc }));
      } else if (activeCard === 'PRIME' && prowizjaProc !== customPrimeRate) {
          // Ktoś zmienił prowizję z zewnątrz, a jesteśmy na Prime -> update inputa
          setComparisonState(prev => ({ ...prev, customPrimeRate: prowizjaProc }));
      }
  }, []);

  // --- OBLICZENIA (FILTRACJA STUDENTÓW) ---

  const stats = useMemo(() => {
      if (!wyniki) return null;

      // 1. Filtrujemy tylko pracowników kwalifikujących się (BEZ STUDENTÓW)
      const qualifiedEmployees = wyniki.szczegoly.filter(w => w.pracownik.trybSkladek !== 'STUDENT_UZ');
      const excludedCount = wyniki.szczegoly.length - qualifiedEmployees.length;

            // 2. Przeliczamy sumy ręcznie na podstawie przefiltrowanej listy
            const sumaKosztStandard = qualifiedEmployees.reduce((acc, w) => acc + w.standard.kosztPracodawcy, 0);
            const sumaKosztPodzial = qualifiedEmployees.reduce((acc, w) => acc + w.podzial.kosztPracodawcy, 0);
            const benefitNettoTotal = qualifiedEmployees.reduce((acc, w) => acc + w.podzial.swiadczenie.netto, 0);

            const oszczednoscBrutto = sumaKosztStandard - sumaKosztPodzial;

            // Koszt prowizji (Faktura) zależny od *wybranego* modelu (globalnego prowizjaProc)
            const totalCommissionAmount = benefitNettoTotal * (prowizjaProc / 100);

            // Logika podziału dla wyświetlania szczegółów w Dashboardzie (dla aktywnego scenariusza)
            const isStandard = activeCard === 'STANDARD';

            const raiseRate = isStandard ? 0 : 4;
            // Bonus 2% tylko dla modelu PLUS
            const adminAmount = isStandard ? 0 : benefitNettoTotal * 0.02;
            const raiseAmount = benefitNettoTotal * (raiseRate / 100);
            const feeAmount = Math.max(0, totalCommissionAmount - raiseAmount - adminAmount);

            return {
                    sumaKosztStandard,
                    sumaKosztPodzial,
                    benefitNettoTotal,
                    oszczednoscBrutto,
                    feeAmount,
                    raiseAmount,
                    adminAmount,
                    oszczednoscNetto: oszczednoscBrutto - totalCommissionAmount,
                    baseSavings: oszczednoscBrutto, // Brutto oszczędność (przed prowizją)
                    benefitBase: benefitNettoTotal,
                    oszczednoscRoczna: (oszczednoscBrutto - totalCommissionAmount) * 12,
                    prowizja: totalCommissionAmount,
                    qualifiedCount: qualifiedEmployees.length,
                    excludedCount: excludedCount
            };
  }, [wyniki, prowizjaProc, activeCard]);

  if (!wyniki || !stats) return null;

  // Wyliczenia lokalne dla kart (niezależne od tego co jest aktywne - symulacja "co by było gdyby")
    const profitStandardCalc = stats.baseSavings - (stats.benefitBase * (customStandardRate / 100));
    const profitPrimeCalc = stats.baseSavings - (stats.benefitBase * (customPrimeRate / 100));

    const raiseAmountDisplay = stats.benefitBase * 0.04;

  // Top Savers - również filtrujemy studentów
  const topSavers = [...wyniki.szczegoly]
    .filter(w => w.pracownik.trybSkladek !== 'STUDENT_UZ')
    .sort((a, b) => b.oszczednosc - a.oszczednosc)
    .slice(0, 5);

  const isCustomStandard = customStandardRate !== 28;
  const isCustomPrime = customPrimeRate !== 26;

  return (
    <div className={`${animations.fadeIn} space-y-4 md:space-y-8`}>

      {/* 1. HEADER & CONTEXT */}
      <PageHeader
          icon={<TrendingUp />}
          iconColor="bg-blue-50 text-blue-700"
          title="Analiza Opłacalności Decyzji"
          description="Wybierz strategię wdrożeniową. Kliknij na kartę, aby wybrać model docelowy. Parametry procentowe są edytowalne."
          actions={stats.excludedCount > 0 ? (
              <Alert variant="warning-amber" icon={<Info className="w-3.5 h-3.5" />} padding="px-3 py-1.5">
                  Analiza dla {stats.qualifiedCount} pracowników (pominięto {stats.excludedCount} studentów)
              </Alert>
          ) : undefined}
      />

      {/* 2. STRATEGY SELECTOR */}
      <ComparisonCards
          activeCard={activeCard}
          customStandardRate={customStandardRate}
          customPrimeRate={customPrimeRate}
          profitStandardCalc={profitStandardCalc}
          profitPrimeCalc={profitPrimeCalc}
          raiseAmountDisplay={raiseAmountDisplay}
          isCustomStandard={isCustomStandard}
          isCustomPrime={isCustomPrime}
          onSelectStandard={handleSelectStandard}
          onSelectPrime={handleSelectPrime}
          onChangeStandardRate={handleChangeStandardRate}
          onChangePrimeRate={handleChangePrimeRate}
      />

      {/* 3. KPI DASHBOARD */}
      <div className="bg-white rounded-md border border-[#edebe9] shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),0_0.3px_0.9px_0_rgba(0,0,0,0.11)] overflow-hidden">
          <div className="px-5 py-3 flex items-center justify-between border-b border-white/10 bg-[#001433] rounded-t-md">
              <div className="flex items-center gap-2.5">
                  <PieChart className="w-4 h-4 text-[#a19f9d] shrink-0" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-white">Symulacja Wyniku Finansowego</span>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${activeCard === 'PRIME' ? 'text-amber-400 bg-amber-900/60' : 'text-blue-300 bg-blue-900/60'}`}>
                  {activeCard === 'PRIME' ? 'Eliton Prime™ PLUS' : 'Eliton Prime™'}
              </span>
          </div>
          <div className="p-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">

              {/* LEFT: COSTS BREAKDOWN */}
              <div className="space-y-6 col-span-2">
                  <div className="flex justify-between items-center group p-3 rounded-md hover:bg-[#f3f2f1] transition-colors">
                      <span className="text-[#605e5c] font-medium">Twój Koszt Dziś</span>
                      <span className="text-lg font-bold text-[#605e5c]">{formatPLN(stats.sumaKosztStandard)}</span>
                  </div>

                  <div className={`relative pl-6 border-l-2 space-y-4 ${activeCard === 'PRIME' ? 'border-amber-200' : 'border-blue-200'}`}>
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-[#323130] font-medium">Twój Koszt po wdrożeniu Modelu Eliton Prime™</span>
                          <span className="font-bold text-[#201f1e]">{formatPLN(stats.sumaKosztPodzial)}</span>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                          <span className="text-[#605e5c] flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#a19f9d]"></span>
                              Opłata serwisowa EBS ({prowizjaProc}% wartości nominalnej świadczeń)
                          </span>
                          <span className="font-bold text-[#323130]">{formatPLN(stats.feeAmount)}</span>
                      </div>

                      {/* WARUNKOWE WYŚWIETLANIE PODWYŻEK (TYLKO DLA PRIME) */}
                      {stats.raiseAmount > 0 && (
                          <div className={`flex justify-between items-center text-sm p-2 rounded -mx-2 border bg-amber-50 border-amber-100`}>
                              <span className={`flex items-center gap-2 font-bold text-amber-800`}>
                                  <span className={`w-2 h-2 rounded-full bg-amber-500`}></span>
                                  +4% świadczeń rzeczowych EBS finansowane przez Stratton Prime
                              </span>
                              <span className={`font-bold text-amber-700`}>{formatPLN(stats.raiseAmount)}</span>
                          </div>
                      )}

                                            {/* BONUS DLA STANDARD I PRIME - pod Success Fee / podwyżkami */}
                                            {activeCard === 'PRIME' && (
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-[#605e5c] flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                                        Bonus operacyjny dla działu Księgowo-Kadrowego (2%)
                                                    </span>
                                                    <span className="font-bold text-[#323130]">{formatPLN(stats.adminAmount)}</span>
                                                </div>
                                            )}
                  </div>

                  <div className="pt-4 border-t border-[#edebe9] flex justify-between items-center">
                      <span className="font-bold text-[#201f1e]">Twój Nowy Poziom Kosztów</span>
                      <span className="text-xl font-bold text-[#201f1e]">
                          {formatPLN(stats.sumaKosztPodzial + stats.prowizja)}
                      </span>
                  </div>
              </div>

              {/* RIGHT: SAVINGS HERO */}
              <div className={`lg:col-span-2 rounded-md p-8 border flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),0_0.3px_0.9px_0_rgba(0,0,0,0.11)] transition-all ${animations.slow}
                  ${activeCard === 'PRIME'
                      ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100'
                      : 'bg-white border-[#edebe9]'
                  }`}
              >
                  <div className={`absolute top-0 right-0 p-10 opacity-10 ${activeCard === 'PRIME' ? 'text-amber-600' : 'text-[#a19f9d]'}`}><Wallet className="w-24 h-24" /></div>

                  <span className={`font-bold uppercase tracking-widest text-xs mb-3 px-3 py-1 rounded-full shadow-sm
                      ${activeCard === 'PRIME' ? 'bg-white text-amber-800' : 'bg-[#f3f2f1] text-[#605e5c]'}`}>
                      Realna Oszczędność Miesięczna
                  </span>

                  <span className={`text-5xl font-extrabold mb-2 tracking-tight drop-shadow-sm
                      ${activeCard === 'PRIME' ? 'text-amber-600' : 'text-[#323130]'}`}>
                      {formatPLN(stats.oszczednoscNetto)}
                  </span>

                  <div className="w-full h-px my-4 max-w-[200px] bg-amber-200/50"></div>

                  <span className="font-medium text-lg text-amber-800">
                      {formatPLN(stats.oszczednoscRoczna)} <span className="text-sm opacity-80">rocznie</span>
                  </span>

                  {activeCard === 'PRIME' && (
                      <div className="mt-6 px-5 py-3 bg-white rounded-sm text-amber-800 text-xs font-bold border border-amber-100 shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),0_0.3px_0.9px_0_rgba(0,0,0,0.11)] flex items-center gap-2 animate-in slide-in-from-bottom-2">
                          <div className="p-1 bg-amber-100 rounded-full"><Users className="w-3 h-3 text-amber-600" /></div>
                          <span>Dodatkowo +{formatPLN(stats.raiseAmount)} miesięcznie trafia do pracowników!</span>
                      </div>
                  )}
              </div>
          </div>
          </div>{/* /p-6 */}
      </div>

      {/* 3.5. COST BRIDGE CHART */}
      <CostBridgeChart
          sumaKosztStandard={stats.sumaKosztStandard}
          sumaKosztPodzial={stats.sumaKosztPodzial}
          prowizja={stats.prowizja}
          oszczednoscNetto={stats.oszczednoscNetto}
          raiseAmount={stats.raiseAmount}
          adminAmount={stats.adminAmount}
          activeCard={activeCard}
      />

      {/* 4. TOP GAINERS TABLE (Excludes Students) */}
      <TopSaversRanking topSavers={topSavers} />

      {/* 5. DISCLAIMER */}
      <Alert icon={<Info />}>
          <strong>Nota prawna:</strong> Przedstawione wyliczenia mają charakter symulacji biznesowej opartej na parametrach roku podatkowego 2026.
          Ostateczna oszczędność zależy od indywidualnych interpretacji podatkowych oraz wdrożenia odpowiedniej dokumentacji (Regulamin Wynagradzania).
      </Alert>

    </div>
  );
};
