import React from 'react';
import { Calculator, Info, ChevronDown } from '../../../../shared/icons/Icons';
import { SummaryComparisonTable } from './SummaryComparisonTable';
import { WynikPracownika } from '../../../../entities/calculation/model';

interface Stats {
    standard: { kosztPracodawcy: number; brutto: number; zusPracodawca: number; zusSpoleczne: number; zdrowotna: number; pit: number; netto: number };
    stratton: { kosztPracodawcy: number; brutto: number; zusPracodawca: number; zusSpoleczne: number; zdrowotna: number; pit: number; netto: number; prowizja: number };
    count: number;
    excludedCount: number;
}

interface SummaryComparisonSectionProps {
    selectedPracownikId: number | 'ALL';
    setSelectedPracownikId: (val: number | 'ALL') => void;
    globalStats: Stats;
    wyniki: { szczegoly: WynikPracownika[] };
    displayedStats: Stats;
    activeModel: 'PRIME' | 'STANDARD';
    modelName: string;
    prowizjaProc: number;
    isCustomOffer: boolean;
    handleToggleModel: () => void;
}

export const SummaryComparisonSection = ({
    selectedPracownikId,
    setSelectedPracownikId,
    globalStats,
    wyniki,
    displayedStats,
    activeModel,
    modelName,
    prowizjaProc,
    isCustomOffer,
    handleToggleModel,
}: SummaryComparisonSectionProps) => (
    <div className="bg-white rounded-md shadow-[0_3.2px_7.2px_0_rgba(0,0,0,0.13),0_0.6px_1.8px_0_rgba(0,0,0,0.11)] border border-[#edebe9] overflow-hidden flex flex-col mt-2">

        {/* Header Filters */}
        <div className="px-5 py-3 border-b border-[#00245b] bg-brand rounded-t-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2.5">
                <Calculator className="w-4 h-4 text-[#a19f9d] shrink-0" />
                <div>
                    <div className="text-[11px] font-black uppercase tracking-widest text-white">Symulacja Szczegółowa</div>
                    <div className="text-[10px] text-[#a19f9d] mt-0.5">Porównanie kosztów i wyników finansowych</div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
                <div className="relative">
                    <select
                        value={selectedPracownikId}
                        onChange={(e) => {
                            const val = e.target.value;
                            setSelectedPracownikId(val === 'ALL' ? 'ALL' : Number(val));
                        }}
                        className="appearance-none w-full md:w-64 pl-3 pr-8 py-2 bg-white border border-[#8a8886] rounded-sm text-xs font-semibold text-[#201f1e] outline-none focus:border-[#0078d4] focus:border-2 focus:pl-[11px] transition-all cursor-pointer"
                    >
                        <option value="ALL">
                            Cała Firma ({globalStats.count} os.)
                        </option>
                        {wyniki.szczegoly.map((w: WynikPracownika) => {
                            const isStudent = w.pracownik.trybSkladek === 'STUDENT_UZ';
                            return (
                                <option key={w.pracownik.id} value={w.pracownik.id} disabled={isStudent} className={isStudent ? 'text-gray-400 bg-gray-100' : ''}>
                                    {w.pracownik.imie} {w.pracownik.nazwisko} {isStudent ? '(Student)' : ''}
                                </option>
                            );
                        })}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#605e5c]">
                        <ChevronDown className="w-4 h-4" />
                    </div>
                </div>

                {/* MODEL BADGE */}
                <div
                    onClick={handleToggleModel}
                    title={`Przełącz na ${activeModel === 'PRIME' ? 'Standard' : 'PLUS'}`}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-colors cursor-pointer select-none ${
                    activeModel === 'PRIME'
                    ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 hover:border-amber-300'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100 hover:border-indigo-300'
                }`}>
                    <div className="flex flex-col leading-none">
                        <span className="text-[9px] opacity-60 font-semibold uppercase tracking-wider mb-0.5">Model</span>
                        <span className="text-xs font-black tracking-tight">{modelName}</span>
                    </div>
                    <div className={`h-6 w-px mx-1 ${activeModel === 'PRIME' ? 'bg-amber-200' : 'bg-indigo-200'}`}></div>
                    <span className="text-sm font-mono font-bold">{prowizjaProc}%</span>
                </div>
            </div>
        </div>

        {/* Content */}
        <div>
            {selectedPracownikId !== 'ALL' && wyniki.szczegoly.find(w => w.pracownik.id === Number(selectedPracownikId))?.pracownik.trybSkladek === 'STUDENT_UZ' ? (
                <div className="text-center py-12 text-[#a19f9d]">
                    <Info className="w-8 h-8 mx-auto mb-2 text-[#c8c6c4]" />
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
            <div className="px-6 py-4 bg-[#f3f2f1] border-t border-[#edebe9] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                {isCustomOffer && (
                    <div className="text-[10px] text-[#605e5c] font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#a19f9d]"></span>
                        <span>Oferta Indywidualna</span>
                        <span className="bg-white border border-[#edebe9] px-1.5 rounded-sm font-mono text-[#201f1e]">{prowizjaProc}%</span>
                    </div>
                )}
                {globalStats.excludedCount > 0 && selectedPracownikId === 'ALL' && (
                    <div className="text-[10px] text-[#a19f9d] flex items-center gap-1.5 ml-auto">
                        <Info className="w-3 h-3" />
                        <span>Pominięto {globalStats.excludedCount} studentów</span>
                    </div>
                )}
            </div>
        </div>
    </div>
);
