
import React, { useMemo, useRef } from 'react';
import { ArrowRight, FileText, Database, Settings, Clock, Users, Building, Calculator, Plus, ShieldCheck, Check, Save, Layers, Download } from '../../../common/Icons';
import { useAppStore } from '../../../store/AppContext';
import { DEFAULT_FIRMA_STATE } from '../../../store/CompanyContext';
import { formatPLN } from '../../../shared/utils/formatters';
import { ZapisanaKalkulacja } from '../../../entities/history/model';

interface Props {
    onNavigate: (step: number) => void;
    onImport: () => void;
    onHistory: () => void;
    onConfig: () => void;
}

export const StepDashboard = ({ onNavigate, onImport, onHistory, onConfig }: Props) => {
    const { pracownicy, firma, historia, setPracownicy, setFirma, setProwizjaProc, loadFromHistory, loadBackup } = useAppStore();
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

    const handleNewCalculation = () => {
        if (pracownicy.length > 0 && !isSessionSaved) {
            if (!confirm('Masz niezapisane zmiany w aktywnej sesji. Czy na pewno chcesz rozpocząć nową kalkulację? Obecne dane zostaną utracone.')) {
                return;
            }
        }
        setPracownicy([]);
        setFirma({
            ...DEFAULT_FIRMA_STATE,
            okres: new Date().toISOString().slice(0, 7)
        }); 
        setProwizjaProc(26); // Default to Prime Plus 26%
        onNavigate(0);
    };

    const handleDirectLoad = (item: ZapisanaKalkulacja) => {
        const success = loadFromHistory(item);
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
        reader.onload = (evt) => {
            try {
                const json = JSON.parse(evt.target?.result as string);
                // Przekazujemy 'true' jako drugi argument, aby pominąć okno dialogowe confirm()
                const success = loadBackup(json, true); 
                if (success) {
                    setTimeout(() => {
                        onNavigate(5); // Przejście do podsumowania
                    }, 300); // Nieco dłuższy timeout dla pewności przeliczenia
                }
            } catch (err) {
                console.error("JSON Parse Error", err);
                alert("Błąd odczytu pliku. Upewnij się, że to poprawny plik JSON wygenerowany przez ten system.");
            }
        };
        reader.readAsText(file);
    };

    const hasActiveSession = pracownicy.length > 0;
    const recentHistory = historia.slice(0, 3);

    return (
        <div className="animate-in fade-in zoom-in-95 duration-500 p-4 md:p-8 max-w-7xl mx-auto space-y-8 w-full overflow-hidden">
            
            {/* HIDDEN INPUT FOR JSON LOAD */}
            {/* Added onClick handler to reset value allowing re-upload of the same file */}
            <input 
                type="file" 
                ref={fileInputRef}
                accept=".json"
                className="hidden"
                onChange={handleJsonUpload}
                onClick={(e) => (e.currentTarget.value = '')} 
            />

            {/* 1. HERO SECTION (BENTO GRID) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:min-h-[380px]">
                
                {/* A. WELCOME / START CARD (2/3 width) */}
                <div className="col-span-1 md:col-span-2 bg-slate-900 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col items-start">
                        <div className="mb-6 flex items-center gap-3">
                             <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                                <ShieldCheck className="h-10 w-auto text-white" />
                             </div>
                             <div className="flex flex-col">
                                 <span className="text-white font-bold tracking-widest uppercase text-sm">STRATTON PRIME</span>
                                 <span className="text-[10px] text-slate-400 uppercase tracking-wide">Business Solutions</span>
                             </div>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight leading-tight">
                            System Optymalizacji<br/>Wynagrodzeń
                        </h1>
                        <p className="text-slate-400 max-w-lg mt-2 text-sm md:text-base">
                            Profesjonalne narzędzie do analizy kosztów pracy i struktury wynagrodzeń w oparciu o Model Eliton Prime™.
                        </p>
                    </div>

                    <div className="relative z-10 mt-8">
                        <button 
                            onClick={handleNewCalculation}
                            className="bg-white text-slate-900 hover:bg-blue-50 px-6 py-3.5 rounded-xl font-bold flex items-center gap-3 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 group/btn"
                        >
                            <div className="p-1 bg-slate-900 rounded-full text-white group-hover/btn:scale-110 transition-transform">
                                <Plus className="w-3 h-3" />
                            </div>
                            Rozpocznij nową analizę
                        </button>
                    </div>
                </div>

                {/* B. ACTIVE SESSION STATUS (1/3 width) */}
                <div className={`col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between transition-all 
                    ${isSessionSaved ? 'ring-2 ring-blue-500/20' : hasActiveSession ? 'ring-2 ring-emerald-500/20' : ''}`}
                >
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Sesji</span>
                            
                            {hasActiveSession ? (
                                isSessionSaved ? (
                                    <div className="flex items-center gap-2 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        <span className="text-[10px] font-bold text-blue-600 uppercase">Zapisano</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase">W toku</span>
                                    </div>
                                )
                            ) : (
                                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                            )}
                        </div>
                        
                        {hasActiveSession ? (
                            <div className="space-y-4">
                                <div>
                                    <div className="text-2xl font-bold text-slate-900">{pracownicy.length}</div>
                                    <div className="text-sm text-slate-500">Wczytanych pracowników</div>
                                </div>
                                {firma.nazwa && (
                                    <div className={`p-3 rounded-lg border transition-colors flex items-center justify-between ${isSessionSaved ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
                                        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm truncate">
                                            <Building className={`w-4 h-4 ${isSessionSaved ? 'text-blue-400' : 'text-slate-400'}`} />
                                            {firma.nazwa}
                                        </div>
                                        {isSessionSaved && <Check className="w-4 h-4 text-blue-500" />}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-32 text-slate-300">
                                <Calculator className="w-12 h-12 mb-2 opacity-50" />
                                <span className="text-sm font-medium">Brak aktywnych danych</span>
                            </div>
                        )}
                    </div>

                    {hasActiveSession && (
                        <button 
                            onClick={() => onNavigate(isSessionSaved ? 5 : 1)}
                            className={`w-full mt-4 py-2.5 font-bold rounded-lg transition-colors flex items-center justify-center gap-2
                                ${isSessionSaved 
                                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                }`}
                        >
                            {isSessionSaved ? (
                                <>Przeglądaj ofertę <FileText className="w-4 h-4" /></>
                            ) : (
                                <>Wznów pracę <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* 2. SECOND ROW ACTIONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Action: Import Excel */}
                <button onClick={onImport} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all group text-left">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FileText />
                    </div>
                    <div className="font-bold text-slate-900">Import Excel</div>
                    <div className="text-xs text-slate-500 mt-1">Wczytaj dane z pliku</div>
                </button>

                {/* Action: Load Backup (NEW) */}
                <button onClick={() => fileInputRef.current?.click()} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all group text-left">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Download className="rotate-180" /> {/* Upload Icon (Rotated Download) */}
                    </div>
                    <div className="font-bold text-slate-900">Wczytaj Kopię</div>
                    <div className="text-xs text-slate-500 mt-1">Przywróć z pliku .json</div>
                </button>

                {/* Action: History */}
                <button onClick={onHistory} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-400 hover:shadow-md transition-all group text-left">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Database />
                    </div>
                    <div className="font-bold text-slate-900">Baza Ofert</div>
                    <div className="text-xs text-slate-500 mt-1">Przeglądaj historię</div>
                </button>

                {/* Info Widget */}
                <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-5 rounded-2xl text-white shadow-lg flex flex-col justify-between">
                    <div className="text-xs font-bold uppercase opacity-70">Rok Podatkowy</div>
                    <div className="text-3xl font-bold">2026</div>
                    <div className="text-xs opacity-80 mt-1">Parametry zwaloryzowane</div>
                </div>
            </div>

            {/* 3. RECENT ACTIVITY */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <Clock className="text-slate-400" />
                    <h3 className="text-lg font-bold text-slate-900">Ostatnia Aktywność</h3>
                </div>

                {recentHistory.length > 0 ? (
                    <div className="space-y-4">
                        {recentHistory.map((item) => (
                            <div 
                                key={item.id} 
                                onClick={() => handleDirectLoad(item)}
                                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all group cursor-pointer"
                                title="Kliknij, aby wczytać ofertę"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-700 font-bold shadow-sm border border-slate-100 group-hover:border-blue-100 transition-colors">
                                        {item.nazwaFirmy.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{item.nazwaFirmy}</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-2">
                                            <span>{new Date(item.dataUtworzenia).toLocaleDateString()}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <span>{item.liczbaPracownikow} prac.</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-xs text-slate-400 uppercase font-bold">Oszczędność</div>
                                        <div className="font-bold text-emerald-600">{formatPLN(item.oszczednoscRoczna)}</div>
                                    </div>
                                    <div className="p-2 rounded-lg text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                                        <ArrowRight />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-slate-400">
                        Brak zapisanych kalkulacji w historii.
                    </div>
                )}
            </div>

        </div>
    );
};
