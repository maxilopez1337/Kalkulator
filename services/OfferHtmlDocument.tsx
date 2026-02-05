import React from 'react';
import { formatPLN } from '../shared/utils/formatters';

interface Props {
    firma: any;
    stats: any;
}

export const OfferHtmlDocument = ({ firma, stats }: Props) => {

    const today = new Date().toLocaleDateString('pl-PL');
    
    // Obliczenia do tabeli
    const deltaZusPracodawcy = stats.standard.zusPracodawca - stats.stratton.zusPracodawca;
    const deltaZusPracownika = stats.standard.zusPracownik - stats.stratton.zusPracownik;
    const deltaPit = stats.standard.pit - stats.stratton.pit;
    const totalSavings = stats.oszczednoscRoczna; 
    const monthlySavings = stats.oszczednoscMiesieczna;

    // Kalkulacja Success Fee (przykładowa - jeśli nie ma w stats, liczymy 20% od oszczędności, lub 0 jeśli to tylko symulacja)
    const successFee = stats.stratton.prowizja || 0; 
    
    // Chart height calculation
    const maxCost = Math.max(stats.standard.kosztPracodawcy, stats.stratton.kosztPracodawcy, stats.plus?.kosztPracodawcy || 0);
    const hStandard = (stats.standard.kosztPracodawcy / maxCost) * 100;
    const hStratton = (stats.stratton.kosztPracodawcy / maxCost) * 100;
    const hPlus = stats.plus ? (stats.plus.kosztPracodawcy / maxCost) * 100 : 0;


    return (
        <html lang="pl">
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Oferta HTML Export</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
          <script dangerouslySetInnerHTML={{__html: `
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    brand: {
                      dark: '#050A18',
                      gold: '#C59D5F',
                      light: '#F8FAFC',
                      accent: '#1E293B'
                    }
                  },
                  fontFamily: {
                    sans: ['Inter', 'sans-serif'],
                    serif: ['Playfair Display', 'serif'],
                  }
                }
              }
            }
          `}} />
          <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
            
            @page {
                size: A4 portrait;
                margin: 0;
            }
            
            body {
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            /* Unifikacja - klasa strony A4 */
            .a4-page {
                width: 210mm;
                height: 297mm;
                overflow: hidden;
                background: white;
                position: relative;
                page-break-after: always;
                margin: 0 auto;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }

            @media print {
                body {
                    background: white;
                }
                .a4-page {
                    box-shadow: none;
                    margin: 0;
                    page-break-after: always;
                    height: 297mm; /* Wymuszenie wysokości w druku */
                    width: 210mm;
                }
            }
          `}} />
        </head>
        <body className="bg-gray-200 flex flex-col items-center py-8 print:py-0 print:bg-white">
            <div className="flex flex-col gap-8 print:gap-0">
            
            {/* PAGE 1: COVER */}
            <section className="a4-page flex flex-col">
                <div className="flex flex-col h-full bg-white relative overflow-hidden">
                    <div className="h-[30%] bg-brand-dark text-white p-[12mm] flex flex-col justify-between relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-serif tracking-widest text-brand-gold font-bold mb-4">STRATTON<br/>PRIME</h1>
                                <div className="w-16 h-0.5 bg-gray-600"></div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Memorandum</p>
                                <p className="text-sm font-bold">{today}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Podmiot Opracowania:</p>
                            <h2 className="text-3xl font-bold font-sans text-white mb-1">{firma.nazwa || "KLIENT"}</h2>
                            <p className="text-xs text-gray-400">ID: PL-2026-X892</p>
                        </div>
                    </div>
                    <div className="h-[70%] p-[12mm] flex flex-col justify-center bg-white relative">
                        <div className="absolute top-10 right-10 opacity-10 pointer-events-none">
                            <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="100" cy="100" r="80" stroke="#C59D5F" strokeWidth="2" fill="none"></circle>
                                <circle cx="100" cy="100" r="60" stroke="#050A18" strokeWidth="1" fill="none"></circle>
                            </svg>
                        </div>
                        <div className="mb-12 relative z-10 pt-8">
                            <p className="text-brand-gold uppercase tracking-widest text-xs font-bold mb-4">Raport Wdrożeniowy</p>
                            <h2 className="text-5xl font-serif text-brand-dark font-medium mb-6 leading-tight">Model<br/><span className="text-brand-gold">Eliton Prime™</span></h2>
                            <p className="text-lg text-gray-500 font-light leading-relaxed">Strategia optymalizacji kosztów pracy<br/>i retencji kapitału</p>
                        </div>
                        <div className="bg-orange-50/50 border-l-4 border-brand-gold p-8 mb-16 shadow-sm relative z-10">
                            <p className="text-xs font-bold text-brand-dark uppercase tracking-wide mb-2">Prognozowana Nadwyżka (Rocznie)</p>
                            <p className="text-5xl font-bold text-brand-dark mb-3 tracking-tight">{formatPLN(totalSavings)}</p>
                            <p className="text-brand-gold font-medium text-xs">przy zachowaniu pełnego bezpieczeństwa prawno-skarbowego</p>
                        </div>
                        <div className="mt-auto border-t border-gray-200 pt-6">
                            <div className="flex justify-between items-center text-[10px] text-gray-500">
                                <p>STRATTON PRIME SP. Z O.O.</p>
                                <p>CONFIDENTIAL • DOKUMENT POUFNY</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* PAGE 2: INTRO & GOALS */}
            <section className="a4-page flex flex-col">
                <div className="h-full bg-white relative flex flex-col p-[12mm] w-full box-border">
                    <div className="flex justify-between items-end border-b border-gray-200 pb-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <h2 className="text-2xl font-serif font-bold text-brand-dark uppercase tracking-wide">WSTĘP I CELE STRATEGICZNE</h2>
                            <span className="hidden md:block text-gray-300 text-2xl font-light">|</span>
                            <span className="text-lg text-gray-400 font-light uppercase tracking-wide">DIAGNOZA</span>
                        </div>
                        <div className="text-xs text-gray-400 font-mono hidden sm:block">Strona 2/6</div>
                    </div>
                    
                    <div className="flex-grow flex flex-col gap-6">
                        <div className="bg-slate-50 p-5 rounded-lg border-l-4 border-brand-gold shadow-sm">
                            <h3 className="text-base font-serif text-brand-dark font-bold mb-2 flex items-center gap-2">KONTEKST WSPÓŁPRACY</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                {firma.nazwa || "Klient"} mierzy się z rosnącą presją płacową, co przy obecnym klinie podatkowym istotnie obciąża rentowność. 
                                Celem zarządu jest utrzymanie konkurencyjności wynagrodzeń bez zwiększania budżetu ogólnego poprzez wdrożenie optymalizacji strukturalnej.
                            </p>
                        </div>

                        <div className="flex-grow">
                            <h3 className="text-base font-serif text-brand-dark font-bold mb-4 border-b border-gray-200 pb-2">KLUCZOWE CELE</h3>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-all bg-white">
                                    <div className="w-8 h-8 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 7h6v6"></path><path d="m22 7-8.5 8.5-5-5L2 17"></path></svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-brand-dark text-sm">OPTYMALIZACJA KOSZTÓW</h4>
                                        <p className="text-xs text-gray-500 mt-1">Obniżenie kosztów pracodawcy (narzuty ZUS) o min. 15%</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-all bg-white">
                                    <div className="w-8 h-8 bg-brand-light text-brand-gold rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-brand-dark text-sm">RETENCJA I WZROST PŁAC</h4>
                                        <p className="text-xs text-gray-500 mt-1">Zwiększenie wynagrodzenia netto pracowników (retencja)</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-all bg-white">
                                    <div className="w-8 h-8 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-brand-dark text-sm">BEZPIECZEŃSTWO</h4>
                                        <p className="text-xs text-gray-500 mt-1">Pełne bezpieczeństwo karno-skarbowe (Safe Harbour)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto bg-brand-dark text-white p-4 rounded-lg flex items-center gap-3">
                            <div className="text-brand-gold flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>
                            </div>
                            <div>
                                <p className="font-bold text-sm mb-0.5">Gwarancja Jakości</p>
                                <p className="text-[10px] text-gray-400 leading-tight">Analiza przygotowana w oparciu o dostarczone dane płacowe oraz wytyczne Ministerstwa Finansów. Zgodność z Polskim Ładem 3.0.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-8 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 uppercase tracking-widest">
                        <div>STRATTON PRIME SP. Z O.O.</div>
                        <div>STRONA 2 Z 6</div>
                    </div>
                </div>
            </section>

            {/* PAGE 3: ECONOMIC ANALYSIS */}
            <section className="a4-page flex flex-col">
                <div className="h-full bg-white relative flex flex-col p-[12mm] w-full box-border">
                    <div className="flex justify-between items-end border-b border-gray-200 pb-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <h2 className="text-2xl font-serif font-bold text-brand-dark uppercase tracking-wide">ANALIZA EKONOMICZNA</h2>
                            <span className="hidden md:block text-gray-300 text-2xl font-light">|</span>
                            <span className="text-lg text-gray-400 font-light uppercase tracking-wide">PROJEKCJA PRZEPŁYWÓW</span>
                        </div>
                        <div className="text-xs text-gray-400 font-mono hidden sm:block">Strona 3/6</div>
                    </div>

                    <div className="flex-grow flex flex-col gap-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                                <p className="text-[9px] uppercase text-slate-500 font-bold mb-1">Koszt As-Is</p>
                                <p className="text-sm font-bold text-slate-800">{formatPLN(stats.standard.kosztPracodawcy)}</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                                <p className="text-[9px] uppercase text-slate-500 font-bold mb-1">Eliton Standard</p>
                                <p className="text-sm font-bold text-slate-800">{formatPLN(stats.stratton.kosztPracodawcy)}</p>
                            </div>
                             <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                                <p className="text-[9px] uppercase text-slate-500 font-bold mb-1">Eliton Plus</p>
                                <p className="text-sm font-bold text-slate-800">{formatPLN(stats.plus?.kosztPracodawcy || 0)}</p>
                            </div>
                        </div>
                        
                        <div className="bg-brand-dark text-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                            <div>
                                <p className="text-[9px] uppercase text-gray-400 font-bold mb-1">Uwolnione Środki (Miesięcznie)</p>
                                <p className="text-xl font-bold text-brand-gold">{formatPLN(monthlySavings)}</p>
                            </div>
                            <div className="text-right hidden sm:block">
                                <p className="text-[9px] text-gray-300">Dodatkowy Cash Flow</p>
                            </div>
                        </div>

                        <div className="h-40 w-full mb-6">
                            <h4 className="text-[10px] font-bold uppercase text-slate-800 mb-2">Dekompozycja Kosztów</h4>
                            {/* CSS Bar Chart instead of complex SVG */}
                            <div className="flex items-end gap-8 h-32 border-b border-gray-200 pb-2 px-6">
                                <div className="flex flex-col items-center flex-1 h-full justify-end">
                                    <div className="text-[9px] font-bold mb-1">{formatPLN(stats.standard.kosztPracodawcy)}</div>
                                    <div className="w-12 bg-slate-400 rounded-t" style={{ height: `${hStandard}%` }}></div>
                                    <div className="text-[9px] uppercase mt-2 text-gray-500 text-center">Bazowy</div>
                                </div>
                                <div className="flex flex-col items-center flex-1 h-full justify-end">
                                    <div className="text-[9px] font-bold mb-1 text-brand-gold">{formatPLN(stats.stratton.kosztPracodawcy)}</div>
                                    <div className="w-12 bg-brand-gold rounded-t" style={{ height: `${hStratton}%` }}></div>
                                    <div className="text-[9px] uppercase mt-2 text-brand-dark font-bold text-center">Eliton Std</div>
                                </div>
                                 <div className="flex flex-col items-center flex-1 h-full justify-end">
                                    <div className="text-[9px] font-bold mb-1 text-brand-dark">{formatPLN(stats.plus?.kosztPracodawcy || 0)}</div>
                                    <div className="w-12 bg-brand-dark rounded-t" style={{ height: `${hPlus}%` }}></div>
                                    <div className="text-[9px] uppercase mt-2 text-brand-dark font-bold text-center">Eliton Plus</div>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden mt-2">
                            <h4 className="text-[10px] font-bold uppercase text-slate-800 mb-2 border-b border-gray-200 pb-1">Szczegółowa Kalkulacja</h4>
                            <div className="w-full">
                                <table className="w-full text-[9px]">
                                    <thead>
                                        <tr className="text-gray-600 uppercase">
                                            <th className="py-1 text-left font-bold w-[25%]">Kategoria</th>
                                            <th className="py-1 text-right w-[18%]">Bazowy</th>
                                            <th className="py-1 text-right w-[18%]">Eliton Std</th>
                                            <th className="py-1 text-right w-[18%]">Eliton Plus</th>
                                            <th className="py-1 text-right w-[21%]">Delta (Std)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        <tr className="hover:bg-gray-50">
                                            <td className="py-1.5 text-slate-700 font-medium truncate pr-1">Łączne Wynagrodzenia Brutto</td>
                                            <td className="py-1.5 text-right text-slate-600">{formatPLN(stats.standard.brutto)}</td>
                                            <td className="py-1.5 text-right font-semibold text-slate-800">{formatPLN(stats.stratton.brutto)}</td>
                                             <td className="py-1.5 text-right font-semibold text-brand-dark">{formatPLN(stats.plus?.brutto || 0)}</td>
                                            <td className="py-1.5 text-right font-bold text-slate-400">-</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50">
                                            <td className="py-1.5 text-slate-700 font-medium truncate pr-1">Narzuty Publicznoprawne</td>
                                            <td className="py-1.5 text-right text-slate-600">{formatPLN(stats.standard.zusPracodawca)}</td>
                                            <td className="py-1.5 text-right font-semibold text-slate-800">{formatPLN(stats.stratton.zusPracodawca)}</td>
                                            <td className="py-1.5 text-right font-semibold text-brand-dark">{formatPLN(stats.plus?.zusPracodawca || 0)}</td>
                                            <td className="py-1.5 text-right font-bold text-green-600">{formatPLN(deltaZusPracodawcy)}</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50">
                                            <td className="py-1.5 text-slate-700 font-medium truncate pr-1">Obciążenia Pracownika</td>
                                            <td className="py-1.5 text-right text-slate-600">{formatPLN(stats.standard.zusPracownik)}</td>
                                            <td className="py-1.5 text-right font-semibold text-slate-800">{formatPLN(stats.stratton.zusPracownik)}</td>
                                            <td className="py-1.5 text-right font-semibold text-brand-dark">{formatPLN(stats.plus?.zusPracownik || 0)}</td>
                                            <td className="py-1.5 text-right font-bold text-green-600">{formatPLN(deltaZusPracownika)}</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50">
                                            <td className="py-1.5 text-slate-700 font-medium truncate pr-1">Zaliczka PIT</td>
                                            <td className="py-1.5 text-right text-slate-600">{formatPLN(stats.standard.pit)}</td>
                                            <td className="py-1.5 text-right font-semibold text-slate-800">{formatPLN(stats.stratton.pit)}</td>
                                            <td className="py-1.5 text-right font-semibold text-brand-dark">{formatPLN(stats.plus?.pit || 0)}</td>
                                            <td className="py-1.5 text-right font-bold text-slate-800">{formatPLN(deltaPit)}</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50">
                                            <td className="py-1.5 text-slate-700 font-medium truncate pr-1">Efektywne Netto</td>
                                            <td className="py-1.5 text-right text-slate-600">{formatPLN(stats.standard.netto)}</td>
                                            <td className="py-1.5 text-right font-semibold text-slate-800">{formatPLN(stats.stratton.netto)}</td>
                                            <td className="py-1.5 text-right font-bold text-brand-dark bg-green-50">{formatPLN(stats.plus?.netto || 0)}</td>
                                            <td className="py-1.5 text-right font-bold text-green-600">+{formatPLN((stats.plus?.netto || 0) - stats.standard.netto)}</td>
                                        </tr>
                                        
                                        <tr className="h-1"></tr>
                                        
                                        <tr className="bg-blue-50/30">
                                            <td className="py-1.5 font-medium text-blue-700 truncate pr-1">Success Fee / Prowizja</td>
                                            <td className="py-1.5 text-right text-slate-400">-</td>
                                            <td className="py-1.5 text-right text-brand-gold">{formatPLN(successFee)}</td>
                                            <td className="py-1.5 text-right text-brand-gold">{formatPLN(successFee)}</td>
                                            <td className="py-1.5 text-right text-[8px] uppercase font-bold text-gray-400">FAKTURA</td>
                                        </tr>
                                    
                                        <tr className="bg-brand-light border-t-2 border-brand-gold/20">
                                            <td className="py-2 font-bold text-brand-dark">SUMA KOSZTÓW</td>
                                            <td className="py-2 text-right font-bold text-slate-800">{formatPLN(stats.standard.kosztPracodawcy)}</td>
                                            <td className="py-2 text-right font-bold text-brand-dark">{formatPLN(stats.stratton.kosztPracodawcy)}</td>
                                            <td className="py-2 text-right font-bold text-brand-dark">{formatPLN(stats.plus?.kosztPracodawcy || 0)}</td>
                                            <td className="py-2 text-right font-bold text-brand-gold">{formatPLN(monthlySavings * -1)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-8 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 uppercase tracking-widest">
                        <div>STRATTON PRIME SP. Z O.O.</div>
                        <div>STRONA 3 Z 6</div>
                    </div>
                </div>
            </section>

             {/* PAGE 4: LEGAL & COMPLIANCE */}
            <section className="a4-page flex flex-col">
                <div className="h-full bg-white relative flex flex-col p-[12mm] w-full box-border">
                    <div className="flex justify-between items-end border-b border-gray-200 pb-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <h2 className="text-2xl font-serif font-bold text-brand-dark uppercase tracking-wide">RAMY PRAWNO-PODATKOWE</h2>
                            <span className="hidden md:block text-gray-300 text-2xl font-light">|</span>
                            <span className="text-lg text-gray-400 font-light uppercase tracking-wide">COMPLIANCE</span>
                        </div>
                        <div className="text-xs text-gray-400 font-mono hidden sm:block">Strona 4/6</div>
                    </div>
                    
                    <div className="flex-grow flex flex-col gap-8">
                        <div>
                            <h3 className="text-lg font-serif text-brand-dark font-bold border-b border-brand-gold pb-2 mb-4">ARCHITEKTURA ROZWIĄZANIA</h3>
                            <div className="text-gray-600 text-sm leading-relaxed text-justify">
                                <p className="mb-4">Model Eliton Prime™ wykorzystuje legalny dualizm składników wynagrodzenia, operując w granicach wyznaczonych przez obowiązujący porządek prawny (tzw. Safe Harbour).</p>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="bg-slate-50 border-l-4 border-brand-dark p-4 shadow-sm">
                                        <p className="font-serif font-bold text-sm text-brand-dark mb-1">ART. 12 UST. 1 USTAWY O PIT</p>
                                        <p className="italic text-gray-500 font-serif text-xs">"Za przychody ze stosunku pracy uważa się wszelkiego rodzaju wypłaty pieniężne oraz wartość pieniężną świadczeń w naturze..."</p>
                                    </div>
                                    <div className="bg-slate-50 border-l-4 border-brand-dark p-4 shadow-sm">
                                        <p className="font-serif font-bold text-sm text-brand-dark mb-1">§2 UST. 1 PKT 26 ROZP. MPiPS</p>
                                        <p className="italic text-gray-500 font-serif text-xs">"Podstawy wymiaru składek nie stanowią (...) korzyści materialne wynikające z układów zbiorowych pracy..."</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex-grow">
                            <h3 className="text-lg font-serif text-brand-dark font-bold border-b border-brand-gold pb-2 mb-4">ZARZĄDZANIE RYZYKIEM</h3>
                            <div className="space-y-6">
                                <div className="flex gap-4 group">
                                    <div className="flex-shrink-0 pt-1">
                                        <span className="text-3xl font-serif font-bold text-brand-gold/40 group-hover:text-brand-gold transition-colors">01</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-brand-dark uppercase mb-1">TRANSPARENTNOŚĆ FISKALNA</h4>
                                        <p className="text-gray-600 leading-relaxed text-xs">Pełna jawność składników wynagrodzenia w deklaracjach ZUS RCA. Model wyklucza stosowanie struktur agresywnej optymalizacji podatkowej.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 group">
                                    <div className="flex-shrink-0 pt-1">
                                        <span className="text-3xl font-serif font-bold text-brand-gold/40 group-hover:text-brand-gold transition-colors">02</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-brand-dark uppercase mb-1">BAZA LEGISLACYJNA</h4>
                                        <p className="text-gray-600 leading-relaxed text-xs">Implementacja oparta o dedykowane Uchwały Zarządu oraz modyfikację Regulaminu Wynagradzania. Zmiany wprowadzane są w drodze porozumienia zmieniającego (Aneksu).</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 group">
                                    <div className="flex-shrink-0 pt-1">
                                        <span className="text-3xl font-serif font-bold text-brand-gold/40 group-hover:text-brand-gold transition-colors">03</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-brand-dark uppercase mb-1">MITYGACJA RYZYKA (OC)</h4>
                                        <p className="text-gray-600 leading-relaxed text-xs">Proces wdrożeniowy objęty jest ochroną ubezpieczeniową w zakresie doradztwa podatkowego.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                     <div className="mt-auto pt-8 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 uppercase tracking-widest">
                        <div>STRATTON PRIME SP. Z O.O.</div>
                        <div>STRONA 4 Z 6</div>
                    </div>
                </div>
            </section>

             {/* PAGE 5: TEAM (Static Content from provided template) */}
             <section className="a4-page flex flex-col">
                <div className="h-full bg-white relative flex flex-col p-[12mm] w-full box-border">
                    <div className="flex justify-between items-end border-b border-gray-200 pb-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <h2 className="text-2xl font-serif font-bold text-brand-dark uppercase tracking-wide">ZESPÓŁ I DOŚWIADCZENIE</h2>
                            <span className="hidden md:block text-gray-300 text-2xl font-light">|</span>
                            <span className="text-lg text-gray-400 font-light uppercase tracking-wide">ZAUFALI NAM</span>
                        </div>
                        <div className="text-xs text-gray-400 font-mono hidden sm:block">Strona 5/6</div>
                    </div>

                    <div className="flex-grow flex flex-col gap-8">
                       <div>
                            <h3 className="text-lg font-serif text-brand-dark font-bold mb-4 border-b border-gray-200 pb-2">OPINIE KLIENTÓW</h3>
                            <div className="flex flex-col gap-4">
                                <div className="bg-slate-50 p-5 rounded-xl relative">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute top-4 right-4 text-brand-gold/20"><path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"></path><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"></path></svg>
                                    <p className="text-gray-600 italic mb-3 relative z-10 font-serif text-sm leading-relaxed">"Wdrożenie modelu Eliton Prime pozwoliło nam zaoszczędzić ponad 350 tys. PLN rocznie. Profesjonalizm na każdym etapie."</p>
                                    <div className="border-t border-gray-200 pt-2">
                                        <p className="font-bold text-brand-dark text-xs">Marek Wiśniewski, CEO</p>
                                        <p className="text-[10px] text-brand-gold font-bold uppercase">Logistics Pro Sp. z o.o.</p>
                                    </div>
                                </div>
                            </div>
                       </div>
                    </div>
                     <div className="mt-auto pt-8 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 uppercase tracking-widest">
                        <div>STRATTON PRIME SP. Z O.O.</div>
                        <div>STRONA 5 Z 6</div>
                    </div>
                </div>
             </section>

             {/* PAGE 6: ROADMAP & SUMMARY */}
             <section className="a4-page flex flex-col">
                <div className="h-full bg-white relative flex flex-col p-[12mm] w-full box-border">
                    <div className="flex justify-between items-end border-b border-gray-200 pb-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <h2 className="text-2xl font-serif font-bold text-brand-dark uppercase tracking-wide">MAPA DROGOWA</h2>
                            <span className="hidden md:block text-gray-300 text-2xl font-light">|</span>
                            <span className="text-lg text-gray-400 font-light uppercase tracking-wide">HARMONOGRAM</span>
                        </div>
                        <div className="text-xs text-gray-400 font-mono hidden sm:block">Strona 6/6</div>
                    </div>
                    
                    <div className="mb-6">
                        <h3 className="text-lg font-serif text-brand-dark font-bold border-b border-brand-gold pb-2 mb-2">CYKL IMPLEMENTACYJNY (4 TYGODNIE)</h3>
                        <p className="text-gray-500 text-xs max-w-xl">Proces zoptymalizowany pod kątem minimalizacji obciążeń administracyjnych po stronie Klienta.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex flex-col items-start p-4 border border-gray-100 rounded-lg bg-slate-50/50">
                            <div className="w-8 h-8 rounded-full bg-white border-2 border-brand-dark flex items-center justify-center mb-2 shadow-sm">
                                <div className="w-2 h-2 bg-brand-dark rounded-full"></div>
                            </div>
                            <p className="text-brand-gold font-bold uppercase text-[10px] mb-1">TYDZIEŃ 1</p>
                            <h4 className="text-brand-dark font-bold text-sm mb-2">AUDYT I FORMALIZACJA</h4>
                            <p className="text-gray-500 text-[10px] leading-relaxed">Analiza struktury kosztowej (Due Diligence). Zawarcie umowy o współpracy.</p>
                        </div>
                        <div className="flex flex-col items-start p-4 border border-gray-100 rounded-lg bg-slate-50/50">
                             <div className="w-8 h-8 rounded-full bg-white border-2 border-brand-dark flex items-center justify-center mb-2 shadow-sm">
                                <div className="w-2 h-2 bg-brand-dark rounded-full"></div>
                            </div>
                            <p className="text-brand-gold font-bold uppercase text-[10px] mb-1">TYDZIEŃ 2</p>
                             <h4 className="text-brand-dark font-bold text-sm mb-2">PRZYGOTOWANIE PRAWNE</h4>
                            <p className="text-gray-500 text-[10px] leading-relaxed">Opracowanie dedykowanych aktów wewnątrzzakładowych (Uchwały, Regulaminy).</p>
                        </div>
                        <div className="flex flex-col items-start p-4 border border-gray-100 rounded-lg bg-slate-50/50">
                             <div className="w-8 h-8 rounded-full bg-white border-2 border-brand-dark flex items-center justify-center mb-2 shadow-sm">
                                <div className="w-2 h-2 bg-brand-dark rounded-full"></div>
                            </div>
                            <p className="text-brand-gold font-bold uppercase text-[10px] mb-1">TYDZIEŃ 3</p>
                             <h4 className="text-brand-dark font-bold text-sm mb-2">KOMUNIKACJA I WDROŻENIE</h4>
                            <p className="text-gray-500 text-[10px] leading-relaxed">Spotkania informacyjne z kadrą. Proces akceptacji zmian.</p>
                        </div>
                        <div className="flex flex-col items-start p-4 border border-gray-100 rounded-lg bg-slate-50/50">
                             <div className="w-8 h-8 rounded-full bg-white border-2 border-brand-dark flex items-center justify-center mb-2 shadow-sm">
                                <div className="w-2 h-2 bg-brand-dark rounded-full"></div>
                            </div>
                            <p className="text-brand-gold font-bold uppercase text-[10px] mb-1">TYDZIEŃ 4</p>
                             <h4 className="text-brand-dark font-bold text-sm mb-2">URUCHOMIENIE OPERACYJNE</h4>
                            <p className="text-gray-500 text-[10px] leading-relaxed">Pierwsze naliczenie listy płac w nowym modelu.</p>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <div className="bg-slate-50 border border-gray-100 p-5 rounded-lg mb-8 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <div>
                                    <p className="text-[10px] uppercase text-gray-500 font-bold mb-1 tracking-wide">MODEL ELITON PRIME™</p>
                                    <p className="text-xs text-brand-gold font-bold">Szacowana Oszczędność Roczna</p>
                                </div>
                                <h2 className="text-3xl font-bold text-brand-dark">{formatPLN(totalSavings)}</h2>
                            </div>
                            <p className="text-[10px] text-gray-400 italic border-t border-gray-200 pt-2 mt-2">Wariant PLUS: Retencja pracowników + Oszczędność</p>
                        </div>
                        <div className="grid grid-cols-1 gap-8">
                            <div className="flex justify-between items-end gap-8">
                                <div className="w-1/2">
                                    <div className="border-b border-dashed border-gray-400 pb-2 mb-2 h-8"></div>
                                    <p className="text-[8px] uppercase font-bold text-brand-dark tracking-widest">STRATTON PRIME</p>
                                    <p className="text-[8px] text-gray-400">Członek Zarządu</p>
                                </div>
                                <div className="w-1/2">
                                    <div className="border-b border-dashed border-gray-400 pb-2 mb-2 h-8"></div>
                                    <p className="text-[8px] uppercase font-bold text-brand-dark tracking-widest">KLIENT</p>
                                    <p className="text-[8px] text-gray-400">Reprezentacja (KRS)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                     <div className="mt-auto pt-8 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 uppercase tracking-widest">
                        <div>STRATTON PRIME SP. Z O.O.</div>
                        <div>STRONA 6 Z 6</div>
                    </div>
                </div>
             </section>

             </div>
        </body>
        </html>
    );
};
