
import React, { useMemo, useRef } from 'react';
import { ArrowRight, FileText, Database, Settings, Clock, Users, Building, Calculator, Plus, ShieldCheck, Check, Save, Layers, Download } from '../../../common/Icons';
import { ButtonPrimary, ButtonSecondary } from '../../../shared/ui/Button';
import { ActionCard } from '../../../shared/ui/ActionCard';
import { useAppStore, useConfirm } from '../../../store/AppContext';
import { animations } from '../../../common/theme';
import { DEFAULT_FIRMA_STATE } from '../../../store/CompanyContext';
import { formatPLN } from '../../../shared/utils/formatters';
import { pl } from '../../../shared/i18n/pl';
import { ZapisanaKalkulacja } from '../../../entities/history/model';

interface Props {
    onNavigate: (step: number) => void;
    onImport: () => void;
    onHistory: () => void;
    onConfig: () => void;
}

export const StepDashboard = ({ onNavigate, onImport, onHistory, onConfig }: Props) => {
    const { pracownicy, firma, historia, config, setPracownicy, setFirma, setProwizjaProc, loadFromHistory, loadBackup } = useAppStore();
    const { confirmDialog } = useConfirm();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Logika sprawdzania, czy bieżąca sesja jest tożsama z ostatnim zapisem
    const isSessionSaved = useMemo(() => {
        if (pracownicy.length === 0) return false;
        const lastSaved = historia.length > 0 ? historia[0] : null;
        if (!lastSaved) return false;

        // Sprawdzamy kluczowe parametry
        return lastSaved.nazwaFirmy === firma.nazwa && 
               lastSaved.liczbaPracownikow === pracownicy.length;
    }, [pracownicy.length, firma.nazwa, historia]);

    const handleNewCalculation = async (): Promise<void> => {
        if (pracownicy.length > 0 && !isSessionSaved) {
            if (!await confirmDialog(pl.confirms.newCalculation)) {
                return;
            }
        }
        setPracownicy([]);
        setFirma({
            ...DEFAULT_FIRMA_STATE,
            okres: new Date().toISOString().slice(0, 7)
        }); 
        setProwizjaProc(config.prowizja.plus); // Default to Prime Plus
        onNavigate(0);
    };

    const handleDirectLoad = async (item: ZapisanaKalkulacja): Promise<void> => {
        const success = await loadFromHistory(item);
        if (success) {
            setTimeout(() => {
                onNavigate(5);
            }, 200);
        }
    };

    // Obsługa wczytywania pliku JSON
    const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const json = JSON.parse(evt.target?.result as string);
                // Przekazujemy 'true' jako drugi argument, aby pomnąć okno dialogowe confirm()
                const success = await loadBackup(json, true); 
                if (success) {
                    setTimeout(() => {
                        onNavigate(5); // Przejście do podsumowania
                    }, 300); // Nieco dłuższy timeout dla pewności przeliczenia
                }
            } catch (err) {
                console.error("JSON Parse Error", err);
                alert(pl.errors.jsonParseFailed);
            }
        };
        reader.readAsText(file);
    };

    const hasActiveSession = pracownicy.length > 0;
    const recentHistory = historia.slice(0, 3);

    return (
        <div className={`animate-in fade-in zoom-in-95 ${animations.slow} h-full flex flex-col gap-3 md:gap-4 w-full overflow-hidden`}>
            
            {/* HIDDEN INPUT FOR JSON LOAD */}
            <input 
                type="file" 
                ref={fileInputRef}
                accept=".json"
                className="hidden"
                onChange={handleJsonUpload}
                onClick={(e) => (e.currentTarget.value = '')} 
            />

            {/* 1. HERO SECTION (BENTO GRID) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
                
                {/* A. WELCOME / START CARD (2/3 width) */}
                <div className="col-span-1 md:col-span-2 bg-slate-900 rounded-md px-4 py-3 md:px-7 md:py-5 flex flex-col justify-between relative overflow-hidden shadow-[0_6.4px_14.4px_0_rgba(0,0,0,0.13),0_1.2px_3.6px_0_rgba(0,0,0,0.10)] group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"></div>
                    
                    <div className="relative z-10 flex items-center gap-2 md:gap-4">
                        <div className="hidden md:flex p-2 bg-white/10 rounded-md backdrop-blur-sm border border-white/10 flex-shrink-0 items-center justify-center">
                            <ShieldCheck className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-white font-bold tracking-widest uppercase text-xs">STRATTON PRIME</span>
                                <span className="hidden md:inline text-[10px] text-slate-500 uppercase tracking-wide">Business Solutions</span>
                            </div>
                            <h1 className="text-[15px] leading-tight md:text-3xl font-bold text-white tracking-tight mt-0.5">
                                System Optymalizacji Wynagrodzeń
                            </h1>
                            <p className="hidden md:block text-slate-400 mt-1 text-xs md:text-sm max-w-xl">
                                Profesjonalne narzędzie do analizy kosztów pracy i struktury wynagrodzeń w oparciu o Model Eliton Prime™.
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 mt-2 md:mt-4">
                        <button 
                            onClick={handleNewCalculation}
                            className="bg-white text-slate-900 hover:bg-blue-50 px-3 py-2 md:px-5 md:py-2.5 rounded-md font-bold flex items-center gap-1.5 md:gap-2.5 transition-all shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13)] hover:shadow-[0_3.2px_7.2px_0_rgba(0,0,0,0.13)] hover:-translate-y-0.5 group/btn text-xs md:text-sm"
                        >
                            <div className="p-1 bg-slate-900 rounded-full text-white group-hover/btn:scale-110 transition-transform">
                                <Plus className="w-3 h-3" />
                            </div>
                            Rozpocznij nową analizę
                        </button>
                    </div>
                </div>

                {/* B. ACTIVE SESSION STATUS (1/3 width) */}
                <div className={`col-span-1 bg-white rounded-md px-3 py-2.5 md:px-5 md:py-4 border border-[#edebe9] shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),0_0.3px_0.9px_0_rgba(0,0,0,0.11)] flex flex-col justify-between transition-all 
                    ${isSessionSaved ? 'ring-2 ring-blue-500/20' : hasActiveSession ? 'ring-2 ring-emerald-500/20' : ''}`}
                >
                    <div>
                        <div className="flex items-center justify-between mb-2 md:mb-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Sesji</span>
                            
                            {hasActiveSession ? (
                                isSessionSaved ? (
                                    <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        <span className="text-[10px] font-bold text-blue-600 uppercase">Zapisano</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase">W toku</span>
                                    </div>
                                )
                            ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                            )}
                        </div>
                        
                        {hasActiveSession ? (
                            <div className="space-y-2.5">
                                <div>
                                    <div className="text-xl font-bold text-slate-900">{pracownicy.length}</div>
                                    <div className="text-[11px] text-slate-500">Wczytanych pracowników</div>
                                </div>
                                {firma.nazwa && (
                                    <div className={`px-3 py-2 rounded border transition-colors flex items-center justify-between ${isSessionSaved ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
                                        <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs truncate">
                                            <Building className={`w-3.5 h-3.5 flex-shrink-0 ${isSessionSaved ? 'text-blue-400' : 'text-slate-400'}`} />
                                            {firma.nazwa}
                                        </div>
                                        {isSessionSaved && <Check className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-20 text-slate-300">
                                <Calculator className="w-8 h-8 mb-1 opacity-50" />
                                <span className="text-xs font-medium">Brak aktywnych danych</span>
                            </div>
                        )}
                    </div>

                    {hasActiveSession && (
                        <div className="mt-2 md:mt-3">
                            {isSessionSaved ? (
                                <ButtonSecondary
                                    className="w-full justify-center"
                                    onClick={() => onNavigate(5)}
                                    icon={<FileText className="w-4 h-4" />}
                                >
                                    Przeglądaj ofertę
                                </ButtonSecondary>
                            ) : (
                                <ButtonPrimary
                                    className="w-full justify-center"
                                    onClick={() => onNavigate(1)}
                                    icon={<ArrowRight className="w-4 h-4" />}
                                >
                                    Wznów pracę
                                </ButtonPrimary>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 2. SECOND ROW ACTIONS */}
            <div className="grid grid-cols-4 gap-2 flex-shrink-0">
                
                <ActionCard
                    onClick={onImport}
                    icon={<FileText />}
                    iconClass="bg-blue-50 text-blue-600"
                    title="Import Excel"
                    subtitle="Wczytaj dane z pliku"
                    hoverBorderClass="hover:border-[#0078d4]"
                />

                <ActionCard
                    onClick={() => fileInputRef.current?.click()}
                    icon={<Download className="rotate-180" />}
                    iconClass="bg-emerald-50 text-emerald-600"
                    title="Wczytaj Kopię"
                    subtitle="Przywróć z pliku .json"
                    hoverBorderClass="hover:border-[#107c10]"
                />

                <ActionCard
                    onClick={onHistory}
                    icon={<Database />}
                    iconClass="bg-purple-50 text-purple-600"
                    title="Baza Ofert"
                    subtitle="Przeglądaj historię"
                    hoverBorderClass="hover:border-purple-400"
                />

                <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-2 md:p-4 rounded-md text-white shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13)] flex flex-col justify-between">
                    <div className="text-[9px] md:text-[10px] font-bold uppercase opacity-70">Rok Podatkowy</div>
                    <div className="text-xl md:text-2xl font-bold">2026</div>
                    <div className="hidden md:block text-[10px] opacity-80">Parametry zwaloryzowane</div>
                </div>
            </div>

            {/* 3. RECENT ACTIVITY */}
            <div className="bg-white rounded-md border border-[#edebe9] shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),0_0.3px_0.9px_0_rgba(0,0,0,0.11)] flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[#edebe9] flex-shrink-0">
                    <Clock className="text-slate-400 w-4 h-4" />
                    <h3 className="text-sm font-bold text-slate-900">Ostatnia Aktywność</h3>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {recentHistory.length > 0 ? (
                        <div className="divide-y divide-[#f3f2f1]">
                            {recentHistory.map((item) => (
                                <div 
                                    key={item.id} 
                                    onClick={() => handleDirectLoad(item)}
                                    className="flex items-center justify-between px-5 py-3.5 hover:bg-[#f3f2f1] transition-colors group cursor-pointer"
                                    title="Kliknij, aby wczytać ofertę"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 bg-[#0078d4] rounded text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                                            {item.nazwaFirmy.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-semibold text-[#323130] text-sm group-hover:text-[#0078d4] transition-colors truncate">{item.nazwaFirmy}</div>
                                            <div className="text-[11px] text-[#a19f9d] flex items-center gap-1.5">
                                                <span>{new Date(item.dataUtworzenia).toLocaleDateString('pl-PL')}</span>
                                                <span>·</span>
                                                <span>{item.liczbaPracownikow} prac.</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <div className="text-right hidden sm:block">
                                            <div className="text-[9px] text-[#a19f9d] uppercase font-bold tracking-wider">Oszczędność</div>
                                            <div className="font-bold text-[#107c10] text-sm">{formatPLN(item.oszczednoscRoczna)}</div>
                                        </div>
                                        <div className="p-1.5 rounded text-[#c8c6c4] group-hover:text-[#0078d4] group-hover:bg-[#deecf9] transition-colors">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-[#a19f9d] text-sm">
                            Brak zapisanych kalkulacji w historii.
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};
