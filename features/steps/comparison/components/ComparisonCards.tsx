import React from 'react';
import { Check, Users, Star, Settings, Check as CheckIcon } from '../../../../shared/icons/Icons';
import { formatPLN } from '../../../../shared/utils/formatters';
import { animations } from '../../../../shared/config/theme';
import { StandardCard } from './StandardCard';

interface ComparisonCardsProps {
    activeCard: 'STANDARD' | 'PRIME';
    customStandardRate: number;
    customPrimeRate: number;
    profitStandardCalc: number;
    profitPrimeCalc: number;
    raiseAmountDisplay: number;
    isCustomStandard: boolean;
    isCustomPrime: boolean;
    onSelectStandard: () => void;
    onSelectPrime: () => void;
    onChangeStandardRate: (val: number) => void;
    onChangePrimeRate: (val: number) => void;
}

export const ComparisonCards: React.FC<ComparisonCardsProps> = ({
    activeCard,
    customStandardRate,
    customPrimeRate,
    profitStandardCalc,
    profitPrimeCalc,
    raiseAmountDisplay,
    isCustomStandard,
    isCustomPrime,
    onSelectStandard,
    onSelectPrime,
    onChangeStandardRate,
    onChangePrimeRate,
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

            {/* OPTION A: STANDARD (BENCHMARK) */}
            <StandardCard
                activeCard={activeCard}
                customStandardRate={customStandardRate}
                profitStandardCalc={profitStandardCalc}
                isCustomStandard={isCustomStandard}
                onSelectStandard={onSelectStandard}
                onChangeStandardRate={onChangeStandardRate}
            />

            {/* OPTION B: PRIME PLUS (OFFER) */}
            <div
                onClick={onSelectPrime}
                className={`lg:col-span-7 relative rounded-md flex flex-col border cursor-pointer transition-all ${animations.standard} overflow-visible
                    ${activeCard === 'PRIME'
                        ? 'bg-gradient-to-b from-white to-[#FFF9E5] border-amber-400 ring-4 ring-amber-400/20 shadow-2xl scale-[1.01] z-10'
                        : 'bg-white border-[#edebe9] hover:border-amber-200 shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),0_0.3px_0.9px_0_rgba(0,0,0,0.11)] opacity-80 hover:opacity-100 hover:scale-[1.005]'
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
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider shadow-sm border ${activeCard === 'PRIME' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-[#f3f2f1] text-[#605e5c] border-[#edebe9]'}`}>
                                    <Star className="w-3 h-3" /> Rekomendowany
                                </div>
                            </div>
                            <h3 className="text-2xl font-extrabold text-[#201f1e]">
                                Eliton Prime™ <span className="text-amber-600">PLUS</span>
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
                                    onChange={(e) => onChangePrimeRate(Number(e.target.value))}
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
                            <p className="text-sm font-bold text-[#a19f9d] uppercase tracking-wide mb-2">Korzyści dla firmy</p>
                            <ul className="space-y-3 text-sm text-[#323130]">
                                <li className="flex gap-2.5 items-start">
                                    <div className="mt-0.5 p-0.5 rounded-full bg-amber-100 text-amber-600"><Check className="w-3 h-3" /></div>
                                    <span>Opłata serwisowa EBS: <strong>{customPrimeRate}%</strong></span>
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
                        <div className={`rounded-md p-5 border transition-colors shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),0_0.3px_0.9px_0_rgba(0,0,0,0.11)] ${activeCard === 'PRIME' ? 'bg-white border-amber-200' : 'bg-[#f3f2f1] border-[#edebe9]'}`}>
                            <p className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2 text-amber-700">
                                <Users className="w-4 h-4" /> Bezpośrednia korzyść dla pracownika
                            </p>
                            <div className="flex items-baseline gap-1.5 mb-2">
                                <span className="text-3xl font-black text-amber-500">+4%</span>
                                <span className="text-sm font-bold text-amber-700">netto</span>
                            </div>
                            <p className="text-xs text-[#605e5c] leading-snug">
                                Każdy pracownik otrzymuje realną podwyżkę netto, finansowaną przez Stratton Prime wyliczaną od wysokości opłaty za obsługę.
                            </p>
                        </div>
                    </div>

                    {/* Footer Stats */}
                    <div className="mt-auto pt-5 border-t border-[#edebe9]/60 flex items-end justify-between relative z-10">
                        <div>
                            <div className="text-xs text-[#a19f9d] mb-1 font-bold uppercase tracking-wide">Miesięczny zysk netto firmy</div>
                            <div className={`text-3xl font-extrabold tracking-tight ${activeCard === 'PRIME' ? 'text-[#201f1e]' : 'text-[#605e5c]'}`}>
                                {formatPLN(profitPrimeCalc)}
                            </div>
                        </div>
                        <div className="text-right hidden sm:block">
                            <div className="text-[10px] text-amber-600 font-bold uppercase mb-1">Reinwestycja w zespół</div>
                            <div className={`text-lg font-bold px-3 py-1 rounded-md border ${activeCard === 'PRIME' ? 'text-amber-700 bg-amber-100/50 border-amber-200' : 'text-[#605e5c] bg-[#f3f2f1] border-[#edebe9]'}`}>
                                +{formatPLN(raiseAmountDisplay)} / mc
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
