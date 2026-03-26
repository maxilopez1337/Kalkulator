
import React from 'react';
import { Check, Home, ArrowRight, Save, Download } from '../../shared/icons/Icons';
import { Modal } from '../../shared/ui/Modal';

interface Props {
    isOpen: boolean;
    onClose: () => void;        // Zostań tutaj
    onExit: () => void;         // Wróć do pulpitu
    onDownload?: () => void;    // Pobierz plik
}

export const SaveSuccessModal = ({ isOpen, onClose, onExit, onDownload }: Props) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="small" maxWidth="max-w-md" zIndex="z-[100]">
                
                <div className="bg-emerald-500 p-6 text-white flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg text-emerald-600 animate-in zoom-in spin-in-12 duration-500">
                        <Check className="w-8 h-8" strokeWidth={3} />
                    </div>
                    <h2 className="text-2xl font-bold">Zapisano pomyślnie!</h2>
                    <p className="text-emerald-100 text-sm mt-1">
                        Kalkulacja została bezpiecznie dodana do Bazy Ofert.
                    </p>
                </div>

                <div className="p-6">
                    <p className="text-slate-600 text-center mb-6 font-medium">
                        Co chcesz teraz zrobić?
                    </p>

                    <div className="space-y-3">
                        {onDownload && (
                            <button 
                                onClick={onDownload}
                                className="w-full flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl hover:bg-emerald-100 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-1 bg-white rounded-full text-emerald-600">
                                        <Download className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-sm">Pobierz plik bazy (.json)</div>
                                        <div className="text-[10px] text-emerald-600/70">Zapisz na dysku / w repozytorium</div>
                                    </div>
                                </div>
                            </button>
                        )}

                        <button 
                            onClick={onExit}
                            className="w-full flex items-center justify-between p-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all group shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <div className="flex items-center gap-3">
                                <Home className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                                <div className="text-left">
                                    <div className="font-bold text-sm">Zakończ analizę</div>
                                    <div className="text-[10px] text-slate-400">Wróć do Pulpitu Startowego</div>
                                </div>
                            </div>
                            <ArrowRight className="text-slate-500 group-hover:text-white transition-colors" />
                        </button>

                        <button 
                            onClick={onClose}
                            className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <Save className="w-5 h-5 text-slate-400" />
                                <div className="text-left">
                                    <div className="font-bold text-sm">Zostań tutaj</div>
                                    <div className="text-[10px] text-slate-400">Kontynuuj przeglądanie wyników</div>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
        </Modal>
    );
};
