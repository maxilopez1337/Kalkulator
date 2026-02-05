import React from 'react';
import PageHeader from './ui/PageHeader';
import PageFooter from './ui/PageFooter';
import { ProposalData } from '../types';
import { formatCurrency } from '../utils/format';

interface Props {
  data: ProposalData;
}

const ActionPlan: React.FC<Props> = ({ data }) => {
  return (
    // Reduced padding for better fit
    <div className="h-full bg-white relative flex flex-col p-10 max-w-7xl mx-auto box-border">
      <PageHeader
        title="MAPA DROGOWA WDROŻENIA"
        subtitle="HARMONOGRAM I DECYZJE OPERACYJNE"
        pageInfo="Strona 4/4 • 3.02.2026"
      />

      <div className="mt-8 mb-8">
        <h3 className="text-xl font-serif text-brand-dark font-bold border-b-2 border-brand-gold pb-3 mb-4 inline-block pr-8">
            CYKL IMPLEMENTACYJNY (4 TYGODNIE)
        </h3>
        <p className="text-gray-500 text-base max-w-3xl">
            Proces zoptymalizowany pod kątem minimalizacji obciążeń administracyjnych po stronie Klienta. Pełna obsługa dokumentacyjna i prawna w gestii Stratton Prime.
        </p>
      </div>

      {/* Timeline Visual */}
      <div className="relative py-8 mb-8 flex-grow">
        {/* Horizontal Line */}
        <div className="absolute top-[68px] left-0 w-full h-0.5 bg-gray-200 -z-10 hidden md:block"></div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {data.timelineSteps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center text-center relative group">
                    <div className="w-16 h-16 rounded-full bg-white border-4 border-brand-dark flex items-center justify-center mb-6 z-10 transition-transform group-hover:scale-110 duration-300 shadow-lg">
                        <div className="w-4 h-4 bg-brand-dark rounded-full"></div>
                    </div>
                    <p className="text-brand-gold font-bold uppercase tracking-widest text-xs mb-2">TYDZIEŃ {step.week}</p>
                    <h4 className="text-brand-dark font-bold text-lg mb-2">{step.title}</h4>
                    <p className="text-gray-500 text-xs leading-relaxed px-1">
                        {step.description}
                    </p>
                </div>
            ))}
        </div>
      </div>

      {/* Summary Box & Signatures Container */}
      <div className="mt-auto">
        <div className="bg-slate-50 border border-gray-100 p-6 rounded-lg flex flex-col md:flex-row justify-between items-center mb-12 shadow-sm">
            <div className="mb-4 md:mb-0">
                <p className="text-xs uppercase text-gray-500 font-bold mb-1 tracking-wide">REKAPITULACJA WARTOŚCI BIZNESOWEJ</p>
                <h2 className="text-3xl font-serif text-brand-dark font-bold">Model Eliton Prime™</h2>
                <p className="text-gray-600 mt-1 text-base">Wariant PLUS: Retencja pracowników + Oszczędność</p>
            </div>
            <div className="text-center md:text-right">
                <p className="text-xs uppercase text-gray-500 font-bold mb-1 tracking-wide">SZACOWANA OSZCZĘDNOŚĆ ROCZNA</p>
                <p className="text-4xl font-bold text-brand-dark">{formatCurrency(data.savingsYearly)}</p>
            </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
            <div>
                <p className="text-[10px] uppercase font-bold text-brand-dark tracking-widest mb-8">REPREZENTACJA STRATTON PRIME:</p>
                <div className="border-b border-dashed border-gray-400 pb-2">
                    <p className="text-transparent select-none">.</p>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">Data i Podpis Członka Zarządu / Prokurenta</p>
            </div>
            <div>
                <p className="text-[10px] uppercase font-bold text-brand-dark tracking-widest mb-8">REPREZENTACJA KLIENTA:</p>
                <div className="border-b border-dashed border-gray-400 pb-2">
                    <p className="text-transparent select-none">.</p>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">Data i Podpis Osób Upoważnionych (KRS)</p>
            </div>
        </div>
      </div>

      <PageFooter pageNumber="4 Z 4" />
    </div>
  );
};

export default ActionPlan;