import React, { useMemo, useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { OfferPdfDocument, PdfCustomContent, getDefaultPdfContent } from '../../../services/OfferPdfDocument';
import { useAppStore } from '../../../store/AppContext';
import { obliczWariantStandard, obliczWariantPodzial } from '../../tax-engine';
import { Input, Select } from '../../../shared/ui/Input';
import { ButtonSecondary, ButtonPrimary, ButtonDanger } from '../../../shared/ui/Button';
import { ChevronRight, Settings, FileText, Check, Trash, Plus, X } from '../../../common/Icons';

export const StepPdfDebug = ({ onClose }: { onClose?: () => void }) => {
    const { pracownicy, firma, config, prowizjaProc } = useAppStore();
    const isPlus = prowizjaProc === 26;
    
    // Stan edytora treści z domyślnymi wartościami
    const [content, setContent] = useState<PdfCustomContent>(getDefaultPdfContent(isPlus));
    const [activeTab, setActiveTab] = useState<'cover' | 'financial' | 'legal' | 'roadmap'>('cover');

    // Generic Handlers
    const update = (field: keyof PdfCustomContent, value: any) => {
        setContent(prev => ({ ...prev, [field]: value }));
    };

    const updateArrayItem = (arrayField: 'riskPoints' | 'roadmapSteps', index: number, field: string, value: string) => {
        setContent(prev => {
            const newArray = [...prev[arrayField]];
            newArray[index] = { ...newArray[index], [field]: value };
            return { ...prev, [arrayField]: newArray };
        });
    };

    const addArrayItem = (arrayField: 'riskPoints' | 'roadmapSteps') => {
        setContent(prev => {
            if (arrayField === 'riskPoints') {
                return { ...prev, riskPoints: [...prev.riskPoints, { title: 'Nowy Punkt', desc: 'Opis ryzyka...' }] };
            } else {
                return { ...prev, roadmapSteps: [...prev.roadmapSteps, { week: `Tydzień ${prev.roadmapSteps.length + 1}`, title: 'Nowy Etap', desc: 'Opis działań...' }] };
            }
        });
    };

    const removeArrayItem = (arrayField: 'riskPoints' | 'roadmapSteps', index: number) => {
        setContent(prev => ({ 
            ...prev, 
            [arrayField]: prev[arrayField].filter((_, i) => i !== index) 
        }));
    };

    // Przygotowanie danych (Mock engine)
    const stats = useMemo(() => {
        const tempProwizja = prowizjaProc || 28;
        const activePracownicy = pracownicy.length > 0 ? pracownicy : [];

        // Mock jeśli brak pracowników
        if (activePracownicy.length === 0) {
             return {
                standard: { kosztPracodawcy: 100000, zusPracodawca: 20000, brutto: 80000, netto: 55000, zusPracownik: 15000, pit: 8000 },
                stratton: { kosztPracodawcy: 90000, zusPracodawca: 10000, brutto: 80000, netto: 60000, zusPracownik: 15000, pit: 2000, prowizja: 5000 },
                oszczednoscRoczna: 120000,
                oszczednoscMiesieczna: 10000
            };
        }

        const details = activePracownicy.map((p: any) => {
            const standard = obliczWariantStandard(p, firma.stawkaWypadkowa, config);
            const podzial = obliczWariantPodzial(p, firma.stawkaWypadkowa, p.nettoZasadnicza, config);
            return { standard, podzial };
        });

        const sumaKosztStandard = details.reduce((acc: number, w: any) => acc + w.standard.kosztPracodawcy, 0);
        const sumaKosztPodzial = details.reduce((acc: number, w: any) => acc + w.podzial.kosztPracodawcy, 0);
        const sumaBruttoSwiadczen = details.reduce((acc: number, w: any) => acc + w.podzial.swiadczenie.brutto, 0);
        const oszczednoscBrutto = sumaKosztStandard - sumaKosztPodzial;
        const prowizja = sumaBruttoSwiadczen * (tempProwizja / 100);
        const oszczednoscNetto = oszczednoscBrutto - prowizja;

        return {
            standard: {
                kosztPracodawcy: sumaKosztStandard,
                zusPracodawca: details.reduce((acc: number, w: any) => acc + w.standard.zusPracodawca.suma, 0),
                brutto: details.reduce((acc: number, w: any) => acc + w.standard.brutto, 0),
                netto: details.reduce((acc: number, w: any) => acc + w.standard.netto, 0),
                zusPracownik: details.reduce((acc: number, w: any) => acc + w.standard.zusPracownik.suma + w.standard.zdrowotna, 0),
                pit: details.reduce((acc: number, w: any) => acc + w.standard.pit, 0)
            },
            stratton: {
                kosztPracodawcy: sumaKosztPodzial,
                zusPracodawca: details.reduce((acc: number, w: any) => acc + w.podzial.zasadnicza.zusPracodawca.suma, 0),
                brutto: details.reduce((acc: number, w: any) => acc + w.podzial.pit.lacznyPrzychod, 0),
                netto: details.reduce((acc: number, w: any) => acc + w.podzial.doWyplaty, 0),
                zusPracownik: details.reduce((acc: number, w: any) => acc + w.podzial.zasadnicza.zusPracownik.suma + w.podzial.zasadnicza.zdrowotna, 0),
                pit: details.reduce((acc: number, w: any) => acc + w.podzial.pit.kwota, 0),
                prowizja: prowizja
            },
            oszczednoscRoczna: oszczednoscNetto * 12,
            oszczednoscMiesieczna: oszczednoscNetto
        };
    }, [pracownicy, firma, config, prowizjaProc]);

    const TabButton = ({ id, label }: { id: typeof activeTab, label: string }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors
                ${activeTab === id ? 'border-blue-600 text-blue-900 bg-blue-50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
            `}
        >
            {label}
        </button>
    );

    return (
        <div className="fixed inset-0 z-50 flex h-screen w-full bg-slate-100 overflow-hidden animate-in fade-in duration-300">
            {/* LEFT: PREVIEW */}
            <div className="flex-1 h-full flex flex-col border-r border-slate-200">
                <div className="bg-slate-800 text-white p-3 flex justify-between items-center shadow-sm shrink-0">
                    <h1 className="font-bold text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-400" />
                        Edytor PDF <span className="text-slate-500 font-normal">| {firma.nazwa || 'Brak Firmy'}</span>
                    </h1>
                     <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-xs text-slate-300">Live Preview</span>
                        {onClose && (
                            <button onClick={onClose} className="ml-4 bg-slate-700 hover:bg-slate-600 p-1.5 rounded transition-colors text-slate-200">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                     </div>
                </div>
                <div className="flex-1 bg-slate-200/50 p-4 overflow-hidden relative flex justify-center">
                    <div className="h-full aspect-[1.414] shadow-2xl">
                        <PDFViewer width="100%" height="100%" className="rounded-sm border-none" showToolbar={true}>
                            <OfferPdfDocument 
                                firma={firma.nazwa ? firma : { ...firma, nazwa: "PRZYKŁADOWA FIRMA", nip: "000-000-00-00" }} 
                                stats={stats} 
                                prowizjaProc={prowizjaProc}
                                customContent={content}
                            />
                        </PDFViewer>
                    </div>
                </div>
            </div>

            {/* RIGHT: EDITOR */}
            <div className="w-[420px] bg-white h-full border-l border-slate-200 shadow-xl flex flex-col z-20 shrink-0">
                <div className="flex border-b border-slate-200 bg-white">
                    <TabButton id="cover" label="Okładka" />
                    <TabButton id="financial" label="Finanse" />
                    <TabButton id="legal" label="Prawne" />
                    <TabButton id="roadmap" label="Plan" />
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    
                    {/* --- TAB CONTENT --- */}
                    
                    {activeTab === 'cover' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Główny Nagłówek</label>
                                <Input value={content.coverTitle} onChange={(e) => update('coverTitle', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Nazwa Modelu</label>
                                <Input value={content.coverSubtitle} onChange={(e) => update('coverSubtitle', e.target.value)} />
                            </div>
                             <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Opis Strategii</label>
                                <textarea 
                                    className="w-full text-sm p-2 border border-slate-300 rounded" 
                                    rows={2}
                                    value={content.coverStrategyText} 
                                    onChange={(e) => update('coverStrategyText', e.target.value)} 
                                />
                            </div>
                            <div className="pt-4 border-t border-slate-100">
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Stopka Dokumentu</label>
                                <textarea 
                                    className="w-full text-xs p-2 border border-slate-300 rounded text-slate-500" 
                                    rows={2}
                                    value={content.footerText} 
                                    onChange={(e) => update('footerText', e.target.value)} 
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'financial' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                             <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Tytuł Strony</label>
                                <Input value={content.page2Title} onChange={(e) => update('page2Title', e.target.value)} />
                            </div>
                            
                            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded border border-slate-200">
                                <input 
                                    type="checkbox" 
                                    checked={content.page2ShowTable} 
                                    onChange={(e) => update('page2ShowTable', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <span className="text-sm text-slate-700">Pokaż tabelę szczegółową</span>
                            </div>

                            <p className="text-xs text-slate-400 italic mt-4">
                                * Dane liczbowe generowane są automatycznie na podstawie kalkulacji.
                            </p>
                        </div>
                    )}

                    {activeTab === 'legal' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                             <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Tytuł Strony</label>
                                <Input value={content.page3Title} onChange={(e) => update('page3Title', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Nagłówek Opisu</label>
                                <Input value={content.legalSectionTitle} onChange={(e) => update('legalSectionTitle', e.target.value)} />
                            </div>
                             <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Główny Opis Prawny</label>
                                <textarea 
                                    className="w-full text-sm p-2 border border-slate-300 rounded" 
                                    rows={4}
                                    value={content.legalText} 
                                    onChange={(e) => update('legalText', e.target.value)} 
                                />
                            </div>
                            
                            {/* Dynamic List: Risks */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-slate-700">Punkty Bezpieczeństwa ({content.riskPoints.length})</label>
                                    <button onClick={() => addArrayItem('riskPoints')} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Plus className="w-4 h-4" /></button>
                                </div>
                                <div className="space-y-3">
                                    {content.riskPoints.map((point, i) => (
                                        <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded relative group">
                                            <button 
                                                onClick={() => removeArrayItem('riskPoints', i)}
                                                className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash className="w-3.5 h-3.5" />
                                            </button>
                                            <div className="mb-2 pr-6">
                                                <Input 
                                                    value={point.title} 
                                                    onChange={(e) => updateArrayItem('riskPoints', i, 'title', e.target.value)}
                                                    className="font-bold text-xs mb-1"
                                                    placeholder="Tytuł punktu"
                                                />
                                            </div>
                                            <textarea 
                                                value={point.desc}
                                                onChange={(e) => updateArrayItem('riskPoints', i, 'desc', e.target.value)}
                                                className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                                                rows={2}
                                                placeholder="Opis..."
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'roadmap' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                             <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Tytuł Strony</label>
                                <Input value={content.page4Title} onChange={(e) => update('page4Title', e.target.value)} />
                            </div>
                            
                            {/* Dynamic List: Roadmap */}
                             <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-slate-700">Kroki Harmonogramu ({content.roadmapSteps.length})</label>
                                    <button onClick={() => addArrayItem('roadmapSteps')} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Plus className="w-4 h-4" /></button>
                                </div>
                                <div className="space-y-3">
                                    {content.roadmapSteps.map((step, i) => (
                                        <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded relative group">
                                            <button 
                                                onClick={() => removeArrayItem('roadmapSteps', i)}
                                                className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash className="w-3.5 h-3.5" />
                                            </button>
                                            <div className="grid grid-cols-2 gap-2 mb-2 pr-6">
                                                 <Input 
                                                    value={step.week} 
                                                    onChange={(e) => updateArrayItem('roadmapSteps', i, 'week', e.target.value)}
                                                    className="text-xs text-blue-600 font-bold"
                                                    placeholder="Np. Tydzień 1"
                                                />
                                                <Input 
                                                    value={step.title} 
                                                    onChange={(e) => updateArrayItem('roadmapSteps', i, 'title', e.target.value)}
                                                    className="font-bold text-xs"
                                                    placeholder="Tytuł etapu"
                                                />
                                            </div>
                                            <textarea 
                                                value={step.desc}
                                                onChange={(e) => updateArrayItem('roadmapSteps', i, 'desc', e.target.value)}
                                                className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                                                rows={2}
                                                placeholder="Opis działań..."
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
                
                <div className="p-4 border-t border-slate-200 bg-slate-50">
                    <ButtonSecondary onClick={() => setContent(getDefaultPdfContent(isPlus))} fullWidth size="sm">
                        Przywróć Domyślne
                    </ButtonSecondary>
                </div>
            </div>
        </div>
    );
};
