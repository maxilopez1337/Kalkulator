
import React, { useMemo, useEffect } from 'react';
import { TrendingUp, Info, PieChart, Users, Check, Wallet, Star, ShieldCheck, Settings, Check as CheckIcon } from '../../../common/Icons';
import { Card } from '../../../shared/ui/Card';
import { formatPLN } from '../../../shared/utils/formatters';
import { useAppStore } from '../../../store/AppContext';

export const StepPorownanie = () => {
  const { wyniki, prowizjaProc, setProwizjaProc, comparisonState, setComparisonState } = useAppStore();
  
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
            // ZAWSZE licz 2% bonusu od benefitNettoTotal dla STANDARD
            const adminAmount = benefitNettoTotal * 0.02;
            const raiseAmount = benefitNettoTotal * (raiseRate / 100);
            const feeAmount = Math.max(0, totalCommissionAmount - raiseAmount - (isStandard ? 0 : adminAmount));

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
    <div className="animate-in fade-in zoom-in-95 duration-300 space-y-8">
      
      {/* 1. HEADER & CONTEXT */}
      <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-700"><TrendingUp /></div>
                <h2 className="text-2xl font-bold text-slate-900">Analiza Opłacalności Decyzji</h2>
            </div>
            {stats.excludedCount > 0 && (
                <div className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-2 font-medium">
                    <Info className="w-3.5 h-3.5 text-amber-600" />
                    <span>Analiza dla {stats.qualifiedCount} pracowników (pominięto {stats.excludedCount} studentów)</span>
                </div>
            )}
          </div>
          <p className="text-slate-500 text-sm max-w-3xl">
              Wybierz strategię wdrożeniową. Kliknij na kartę, aby wybrać model docelowy. Parametry procentowe są edytowalne.
          </p>
      </div>

      {/* 2. STRATEGY SELECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* OPTION A: STANDARD (BENCHMARK) */}
          <div 
            onClick={handleSelectStandard}
            className={`lg:col-span-5 relative p-6 rounded-2xl flex flex-col border-2 cursor-pointer transition-all duration-300
                ${activeCard === 'STANDARD' 
                    ? 'bg-white border-blue-500 ring-4 ring-blue-500/10 shadow-xl scale-[1.01] z-10' 
                    : 'bg-white border-slate-200 hover:border-blue-200 shadow-sm opacity-80 hover:opacity-100 hover:scale-[1.005]'
                }`}
          >
              {activeCard === 'STANDARD' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <CheckIcon className="w-3 h-3" /> Wybrany Scenariusz
                  </div>
              )}

              <div className="flex justify-between items-start mb-4">
                  <div>
                      <div className="flex items-center gap-2 mb-1">
                          <ShieldCheck className={`w-4 h-4 ${activeCard === 'STANDARD' ? 'text-blue-500' : 'text-slate-400'}`} />
                          <span className={`text-xs font-bold uppercase tracking-wider ${activeCard === 'STANDARD' ? 'text-blue-600' : 'text-slate-400'}`}>Wariant Podstawowy</span>
                      </div>
                      <h3 className={`text-xl font-bold ${activeCard === 'STANDARD' ? 'text-slate-900' : 'text-slate-700'}`}>
                          Model Eliton Prime <span className="text-blue-600">STANDARD</span>
                      </h3>
                  </div>
                  
                  {/* EDITABLE INPUT STANDARD */}
                  <div className="flex flex-col items-end" onClick={(e) => e.stopPropagation()}>
                      <div className="relative group">
                          <input 
                              type="number"
                              min="0"
                              max="100"
                              value={customStandardRate}
                              onChange={(e) => handleChangeStandardRate(Number(e.target.value))}
                              className="text-3xl font-black text-slate-400 text-right w-24 bg-transparent outline-none border-b-2 border-transparent hover:border-slate-300 focus:border-blue-500 focus:text-blue-600 transition-all"
                          />
                          <span className="absolute top-1 right-0 text-xs font-bold text-slate-300 pointer-events-none">%</span>
                      </div>
                      {isCustomStandard && (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-1 animate-in fade-in">
                              Zmieniono (Indywidualna)
                          </span>
                      )}
                  </div>
              </div>

              <div className="flex-1">
                  <ul className="space-y-3 text-sm text-slate-500">
                      <li className="flex gap-3 items-start">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></span>
                          <span>Całość efektu finansowego trafia do firmy (<strong>100%</strong>)</span>
                      </li>
                      <li className="flex gap-3 items-start">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></span>
                          <span>Wynagrodzenie pracownika pozostaje bez zmian (Netto)</span>
                      </li>
                      <li className="flex gap-3 items-start">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></span>
                          <span>Opłata za sukces: <strong className="text-slate-600">{customStandardRate}%</strong></span>
                      </li>
                      {/* Bonus 2% dla działu księgowo-kadrowego - zawsze pokazuj */}
                      <li className="flex gap-3 items-start">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-200 shrink-0"></span>
                          <span>Bonus operacyjny dla działu Księgowo-Kadrowego (2%)</span>
                      </li>
                  </ul>

              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-400 mb-1 font-medium">Miesięczna oszczędność  netto dla Twojej firmy</div>
                  <div className={`text-2xl font-bold ${activeCard === 'STANDARD' ? 'text-blue-600' : 'text-slate-400 grayscale'}`}>
                      {formatPLN(profitStandardCalc)}
                  </div>
              </div>
          </div>

          {/* OPTION B: PRIME PLUS (OFFER) */}
          <div 
            onClick={handleSelectPrime}
            className={`lg:col-span-7 relative rounded-2xl flex flex-col border-2 cursor-pointer transition-all duration-300 overflow-visible
                ${activeCard === 'PRIME' 
                    ? 'bg-gradient-to-b from-white to-[#FFF9E5] border-amber-400 ring-4 ring-amber-400/20 shadow-2xl scale-[1.01] z-10' 
                    : 'bg-white border-slate-200 hover:border-amber-200 shadow-sm opacity-80 hover:opacity-100 hover:scale-[1.005]'
                }`}
          >
              {activeCard === 'PRIME' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 z-20">
                      <CheckIcon className="w-3 h-3" /> Najczęściej wybierany 
                  </div>
              )}

              <div className="h-full w-full p-6 flex flex-col relative z-10">
                  
                  {/* Decorative Glow */}
                  {activeCard === 'PRIME' && (
                      <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-200/30 blur-[60px] rounded-full pointer-events-none"></div>
                  )}

                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                      <div>
                          <div className="flex items-center gap-2 mb-1">
                              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm border ${activeCard === 'PRIME' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                  <Star className="w-3 h-3" /> Rekomendowany
                              </div>
                          </div>
                          <h3 className="text-2xl font-extrabold text-slate-900">
                              Model Eliton Prime <span className="text-amber-600">PLUS</span>
                          </h3>
                      </div>
                      
                      {/* EDITABLE INPUT PRIME */}
                      <div className="flex flex-col items-end z-20" onClick={(e) => e.stopPropagation()}>
                          <div className="relative group">
                              <input 
                                  type="number"
                                  min="0" 
                                  max="100"
                                  step="0.1"
                                  value={customPrimeRate}
                                  onChange={(e) => handleChangePrimeRate(Number(e.target.value))}
                                  className="text-4xl font-black text-amber-500 text-right w-28 bg-transparent outline-none border-b-2 border-transparent hover:border-amber-300 focus:border-amber-500 transition-all placeholder-amber-200"
                              />
                              <span className="absolute top-2 right-0 text-sm font-bold text-amber-300 pointer-events-none">%</span>
                          </div>
                          {isCustomPrime ? (
                              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-1 rounded mt-1 shadow-sm animate-in slide-in-from-right-2">
                                  <Settings className="w-3 h-3" /> Oferta Indywidualna
                              </div>
                          ) : (
                              <div className="text-[10px] font-medium text-amber-400 mt-1 opacity-60">Standardowa stawka</div>
                          )}
                      </div>
                  </div>

                  {/* Content Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">Korzyści dla firmy</p>
                          <ul className="space-y-3 text-sm text-slate-700">
                              <li className="flex gap-2.5 items-start">
                                  <div className="mt-0.5 p-0.5 rounded-full bg-amber-100 text-amber-600"><Check className="w-3 h-3" /></div>
                                  <span>Niższy udział w efekcie (<strong>{customPrimeRate}%</strong> vs {customStandardRate}%)</span>
                              </li>
                              <li className="flex gap-2.5 items-start">
                                  <div className="mt-0.5 p-0.5 rounded-full bg-amber-100 text-amber-600"><Check className="w-3 h-3" /></div>
                                  <span>Stabilność zespołu i niższa rotacja</span>
                              </li>
                              <li className="flex gap-2.5 items-start">
                                  <div className="mt-0.5 p-0.5 rounded-full bg-amber-100 text-amber-600"><Check className="w-3 h-3" /></div>
                                  <span>Bonus operacyjny<br></br> dla działu Księgowo-Kadrowego (2%)</span>
                              </li>
                          </ul>
                      </div>
                      
                      {/* Highlight Box */}
                      <div className={`rounded-xl p-5 border transition-colors shadow-sm ${activeCard === 'PRIME' ? 'bg-white border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                          <p className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2 text-amber-700">
                              <Users className="w-4 h-4" /> Bezpośrednia korzyść dla pracownika
                          </p>
                          <div className="flex items-baseline gap-1.5 mb-2">
                              <span className="text-3xl font-black text-amber-500">+4%</span>
                              <span className="text-sm font-bold text-amber-700">netto</span>
                          </div>
                          <p className="text-xs text-slate-500 leading-snug">
                              Każdy pracownik otrzymuje realną podwyżkę netto, finansowaną przez Stratton Prime wyliczaną od wysokości opłaty za obsługę.
                          </p>
                      </div>
                  </div>

                  {/* Footer Stats */}
                  <div className="mt-auto pt-5 border-t border-slate-200/60 flex items-end justify-between relative z-10">
                      <div>
                          <div className="text-xs text-slate-400 mb-1 font-bold uppercase tracking-wide">Miesięczny zysk netto firmy</div>
                          <div className={`text-3xl font-extrabold tracking-tight ${activeCard === 'PRIME' ? 'text-slate-900' : 'text-slate-500'}`}>
                              {formatPLN(profitPrimeCalc)}
                          </div>
                      </div>
                      <div className="text-right hidden sm:block">
                          <div className="text-[10px] text-amber-600 font-bold uppercase mb-1">Reinwestycja w zespół</div>
                          <div className={`text-lg font-bold px-3 py-1 rounded-lg border ${activeCard === 'PRIME' ? 'text-amber-700 bg-amber-100/50 border-amber-200' : 'text-slate-500 bg-slate-100 border-slate-200'}`}>
                              +{formatPLN(raiseAmountDisplay)} / mc
                          </div>
                      </div>
                  </div>

              </div>
          </div>
      </div>

      {/* 3. KPI DASHBOARD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
          <div className={`absolute top-0 left-0 w-full h-1 ${activeCard === 'PRIME' ? 'bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-300' : 'bg-blue-500'}`}></div>
          
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
              <PieChart className="text-slate-400" /> Symulacja Wyniku Finansowego ({activeCard === 'PRIME' ? 'Eliton Prime PLUS' : 'Eliton Prime STANDARD'})
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
              
              {/* LEFT: COSTS BREAKDOWN */}
              <div className="space-y-6 col-span-2">
                  <div className="flex justify-between items-center group p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <span className="text-slate-500 font-medium">Twój Koszt Dziś</span>
                      <span className="text-lg font-bold text-slate-500">{formatPLN(stats.sumaKosztStandard)}</span>
                  </div>
                  
                  <div className={`relative pl-6 border-l-2 space-y-4 ${activeCard === 'PRIME' ? 'border-amber-200' : 'border-blue-200'}`}>
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-700 font-medium">Twój Koszt po wdrożeniu Modelu Eliton Prime</span>
                          <span className="font-bold text-slate-900">{formatPLN(stats.sumaKosztPodzial)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-600 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                              Wynagrodzenie za Efekt (Success Fee)
                          </span>
                          <span className="font-bold text-slate-700">{formatPLN(stats.feeAmount - (activeCard === 'STANDARD' ? stats.adminAmount : 0))}</span>
                      </div>

                      {/* WARUNKOWE WYŚWIETLANIE PODWYŻEK (TYLKO DLA PRIME) */}
                      {stats.raiseAmount > 0 && (
                          <div className={`flex justify-between items-center text-sm p-2 rounded -mx-2 border bg-amber-50 border-amber-100`}>
                              <span className={`flex items-center gap-2 font-bold text-amber-800`}>
                                  <span className={`w-2 h-2 rounded-full bg-amber-500`}></span>
                                  Podwyżki dla Pracowników finansowane przez Stratton (4%)
                              </span>
                              <span className={`font-bold text-amber-700`}>{formatPLN(stats.raiseAmount)}</span>
                          </div>
                      )}

                                            {/* BONUS DLA STANDARD I PRIME - pod Success Fee / podwyżkami */}
                                            {(activeCard === 'STANDARD' || activeCard === 'PRIME') && (
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-600 flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                                        Bonus operacyjny dla działu Księgowo-Kadrowego (2%)
                                                    </span>
                                                    <span className="font-bold text-slate-700">{formatPLN(stats.adminAmount)}</span>
                                                </div>
                                            )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <span className="font-bold text-slate-900">Twój Nowy Poziom Kosztów</span>
                      <span className="text-xl font-bold text-slate-900">
                          {formatPLN(stats.sumaKosztPodzial + stats.prowizja)}
                      </span>
                  </div>
              </div>

              {/* RIGHT: SAVINGS HERO */}
              <div className={`lg:col-span-2 rounded-2xl p-8 border flex flex-col items-center justify-center text-center relative overflow-hidden shadow-sm transition-all duration-500
                  ${activeCard === 'PRIME' 
                      ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100' 
                      : 'bg-white border-slate-200'
                  }`}
              >
                  <div className={`absolute top-0 right-0 p-10 opacity-10 ${activeCard === 'PRIME' ? 'text-amber-600' : 'text-slate-400'}`}><Wallet className="w-24 h-24" /></div>
                  
                  <span className={`font-bold uppercase tracking-widest text-xs mb-3 px-3 py-1 rounded-full shadow-sm 
                      ${activeCard === 'PRIME' ? 'bg-white text-amber-800' : 'bg-slate-100 text-slate-500'}`}>
                      Realna Oszczędność Miesięczna
                  </span>
                  
                  <span className={`text-5xl font-extrabold mb-2 tracking-tight drop-shadow-sm 
                      ${activeCard === 'PRIME' ? 'text-amber-600' : 'text-slate-700'}`}>
                      {formatPLN(stats.oszczednoscNetto)}
                  </span>
                  
                  <div className="w-full h-px my-4 max-w-[200px] bg-amber-200/50"></div>

                  <span className="font-medium text-lg text-amber-800">
                      {formatPLN(stats.oszczednoscRoczna)} <span className="text-sm opacity-80">rocznie</span>
                  </span>
                  
                  {activeCard === 'PRIME' && (
                      <div className="mt-6 px-5 py-3 bg-white rounded-xl text-amber-800 text-xs font-bold border border-amber-100 shadow-sm flex items-center gap-2 animate-in slide-in-from-bottom-2">
                          <div className="p-1 bg-amber-100 rounded-full"><Users className="w-3 h-3 text-amber-600" /></div>
                          <span>Dodatkowo +{formatPLN(stats.raiseAmount)} miesięcznie trafia do pracowników!</span>
                      </div>
                  )}
              </div>
          </div>
      </div>

      {/* 4. TOP GAINERS TABLE (Excludes Students) */}
      <Card title={`Top 5 - Największy potencjał oszczędności`} icon={<Users />}>
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase">
                          <th className="py-3 px-4 font-semibold">Pracownik</th>
                          <th className="py-3 px-4 font-semibold text-right">Koszt Obecny</th>
                          <th className="py-3 px-4 font-semibold text-right text-emerald-600">Potencjał Oszcz.</th>
                          <th className="py-3 px-4 font-semibold text-center">% Redukcji</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                      {topSavers.length === 0 ? (
                          <tr><td colSpan={4} className="py-4 text-center text-slate-400 text-xs italic">Brak pracowników spełniających kryteria.</td></tr>
                      ) : (
                          topSavers.map((w, i) => {
                              const percent = ((w.oszczednosc / w.standard.kosztPracodawcy) * 100).toFixed(1);
                              return (
                                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                                      <td className="py-3 px-4">
                                          <div className="font-bold text-slate-700">{w.pracownik.imie} {w.pracownik.nazwisko}</div>
                                          <div className="text-[10px] text-slate-400">{w.pracownik.typUmowy}</div>
                                      </td>
                                      <td className="py-3 px-4 text-right text-slate-500 tabular-nums">
                                          {formatPLN(w.standard.kosztPracodawcy)}
                                      </td>
                                      <td className="py-3 px-4 text-right font-bold text-emerald-600 tabular-nums bg-emerald-50/30 rounded-lg">
                                          +{formatPLN(w.oszczednosc)}
                                      </td>
                                      <td className="py-3 px-4 text-center">
                                          <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">{percent}%</span>
                                      </td>
                                  </tr>
                              );
                          })
                      )}
                  </tbody>
              </table>
          </div>
      </Card>

      {/* 5. DISCLAIMER */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 flex gap-3 leading-relaxed">
          <Info />
          <div>
              <strong>Nota prawna:</strong> Przedstawione wyliczenia mają charakter symulacji biznesowej opartej na parametrach roku podatkowego 2026. 
              Ostateczna oszczędność zależy od indywidualnych interpretacji podatkowych oraz wdrożenia odpowiedniej dokumentacji (Regulamin Wynagradzania).
          </div>
      </div>

    </div>
  );
};
