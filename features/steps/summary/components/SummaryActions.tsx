import React from 'react';
import { FileText, Printer, Download } from '../../../../shared/icons/Icons';
import { animations } from '../../../../shared/config/theme';

interface SummaryActionsProps {
    onGenerateOfferElitonPrimePlus: () => void;
    onGenerateLegalizacjaPremii: () => void;
    onExportKalkulatorNadwyzek: () => void;
    onExportZestawienieKrokow: () => void;
}

export const SummaryActions = ({
    onGenerateOfferElitonPrimePlus,
    onGenerateLegalizacjaPremii,
    onExportKalkulatorNadwyzek,
    onExportZestawienieKrokow,
}: SummaryActionsProps) => {
    return (
        <div className="space-y-3">
            <button
                onClick={onGenerateOfferElitonPrimePlus}
                className={`w-full flex items-center justify-between p-4 bg-brand text-white rounded-sm hover:bg-[#002a66] hover:shadow-lg transition-all ${animations.quick} group mb-3`}
            >
                <div className="flex flex-col items-start">
                    <span className="font-bold text-sm">Generuj Ofertę Eliton Prime™ PLUS</span>
                    <span className="text-[10px] text-blue-200 group-hover:text-blue-100">Oferta indywidualna · szablon Premium</span>
                </div>
                <Printer />
            </button>

            <button
                onClick={onGenerateLegalizacjaPremii}
                className={`w-full flex items-center justify-between p-4 bg-[#005a4e] text-white rounded-sm hover:bg-[#004a40] hover:shadow-lg transition-all ${animations.quick} group`}
            >
                <div className="flex flex-col items-start">
                    <span className="font-bold text-sm">Legalizacja Premii — Eliton Prime™</span>
                    <span className="text-[10px] text-teal-200 group-hover:text-teal-100">PDF · 4 strony · indywidualna</span>
                </div>
                <Printer />
            </button>

            <button
                onClick={onExportKalkulatorNadwyzek}
                className={`w-full flex items-center justify-between p-4 bg-[#f3f2f1] text-[#107c10] border border-[#edebe9] rounded-sm hover:bg-[#edebe9] transition-all ${animations.quick} group`}
            >
                <div className="flex flex-col items-start">
                    <span className="font-bold text-sm">Eksportuj Kalkulator Nadwyżek i Podwyżek</span>
                    <span className="text-[10px] text-emerald-600/70">XLSX · Pełny raport analityczny</span>
                </div>
                <Download />
            </button>

            <button
                onClick={onExportZestawienieKrokow}
                className={`w-full flex items-center justify-between p-4 bg-[#f3f2f1] text-[#107c10] border border-[#edebe9] rounded-sm hover:bg-[#edebe9] transition-all ${animations.quick} group`}
            >
                <div className="flex flex-col items-start">
                    <span className="font-bold text-sm">Zestawienie Wszystkich Kroków</span>
                    <span className="text-[10px] text-emerald-600/70">XLSX · Historia pełna · wszystkie etapy</span>
                </div>
                <Download />
            </button>
        </div>
    );
};
