import React from 'react';
import { ProposalData } from '../types';
import { formatCurrency } from '../utils/format';

interface Props {
  data: ProposalData;
}

const CoverPage: React.FC<Props> = ({ data }) => {
  return (
    <div className="flex flex-col md:flex-row h-full bg-white relative overflow-hidden">
      {/* Sidebar / Left Panel */}
      <div className="w-full md:w-1/3 bg-brand-dark text-white p-12 flex flex-col justify-between relative z-10">
        <div>
          <h1 className="text-3xl lg:text-4xl font-serif tracking-widest text-brand-gold font-bold mb-12">
            STRATTON<br />PRIME
          </h1>
          <div className="w-20 h-0.5 bg-gray-600 mb-8"></div>
          <p className="text-sm lg:text-base uppercase tracking-widest text-gray-400 leading-relaxed">
            Memorandum Strategiczne:<br />Efektywność Kosztowa
          </p>
        </div>

        <div className="mt-20 md:mt-0">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Podmiot Opracowania:</p>
          <h2 className="text-3xl lg:text-4xl font-bold font-sans text-white mb-2">{data.clientName}</h2>
          <p className="text-sm text-gray-400">ID Klienta: PL-2026-{data.id === 'jakra' ? 'X892' : 'N421'}</p>
        </div>

        <div className="mt-20 text-xs text-gray-600">
          <p>© 2026 Stratton Prime Sp. z o.o.</p>
          <p>DOKUMENT POUFNY (CONFIDENTIAL).<br/>Wyłącznie do użytku Zarządu.</p>
        </div>
      </div>

      {/* Main Content / Right Panel */}
      <div className="w-full md:w-2/3 p-12 md:p-20 flex flex-col justify-center bg-white relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <svg width="300" height="300" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="80" stroke="#C59D5F" strokeWidth="2" fill="none"/>
                <circle cx="100" cy="100" r="60" stroke="#050A18" strokeWidth="1" fill="none"/>
            </svg>
        </div>

        <div className="mb-12 relative z-10">
          <p className="text-brand-gold uppercase tracking-widest text-sm font-bold mb-4">Raport Wdrożeniowy (Executive Summary)</p>
          <h2 className="text-6xl xl:text-7xl font-serif text-brand-dark font-medium mb-6 leading-tight">
            Model<br />
            <span className="text-brand-gold">Eliton Prime™</span>
          </h2>
          <p className="text-2xl text-gray-500 font-light max-w-2xl">
            Strategia optymalizacji kosztów pracy i retencji kapitału
          </p>
        </div>

        <div className="bg-orange-50/50 border-l-4 border-brand-gold p-10 mb-20 shadow-sm relative z-10">
            <p className="text-sm font-bold text-brand-dark uppercase tracking-wide mb-2">Prognozowana Nadwyżka Finansowa (Rocznie)</p>
            <p className="text-5xl md:text-7xl font-bold text-brand-dark mb-4 tracking-tight">
                {formatCurrency(data.savingsYearly)}
            </p>
            <p className="text-brand-gold font-medium text-lg">
                przy zachowaniu pełnego bezpieczeństwa prawno-skarbowego
            </p>
        </div>

        <div className="border-t border-gray-200 pt-8 flex justify-between text-sm text-gray-500 relative z-10">
            <div>
                <p className="uppercase text-xs text-gray-400 mb-1">Data Opracowania:</p>
                <p className="font-semibold text-brand-dark text-lg">{data.reportDate}</p>
            </div>
            <div className="text-right">
                <p className="uppercase text-xs text-gray-400 mb-1">Standard Raportowania:</p>
                <p className="font-semibold text-brand-dark text-lg">{data.reportVersion}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CoverPage;