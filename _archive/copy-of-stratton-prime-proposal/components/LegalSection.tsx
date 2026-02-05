import React from 'react';
import PageHeader from './ui/PageHeader';
import PageFooter from './ui/PageFooter';
import { ProposalData } from '../types';

interface Props {
  data: ProposalData;
}

const LegalSection: React.FC<Props> = ({ data }) => {
  return (
    // Reduced padding from p-16 to p-10 to prevent content cut-off
    <div className="h-full bg-white relative flex flex-col p-10 max-w-7xl mx-auto box-border">
      <PageHeader
        title="RAMY PRAWNO-PODATKOWE"
        subtitle="COMPLIANCE & RISK MANAGEMENT"
        pageInfo="Strona 3/4 • 3.02.2026"
      />

      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-16 mt-8 items-start">
        {/* Left Column: Legal Construction */}
        <div>
          <h3 className="text-xl font-serif text-brand-dark font-bold border-b-2 border-brand-gold pb-3 mb-6 inline-block pr-8">
            ARCHITEKTURA ROZWIĄZANIA
          </h3>
          <div className="text-gray-600 leading-relaxed text-justify space-y-6 text-base">
            <p>
              Model Eliton Prime™ wykorzystuje legalny dualizm składników wynagrodzenia, operując w granicach wyznaczonych przez obowiązujący porządek prawny (tzw. Safe Harbour). 
              Mechanizm polega na zastosowaniu ustawowych wyłączeń z podstawy wymiaru składek ZUS dla określonych kategorii przychodów, przy jednoczesnym zachowaniu pełnej wymagalności podatkowej (PIT).
            </p>

            <div className="bg-slate-50 border-l-4 border-brand-dark p-6 mt-4 shadow-sm">
              <p className="font-serif font-bold text-base text-brand-dark mb-2">ART. 12 UST. 1 USTAWY O PIT</p>
              <p className="italic text-gray-500 font-serif text-sm">
                "Za przychody ze stosunku pracy uważa się wszelkiego rodzaju wypłaty pieniężne oraz wartość pieniężną świadczeń w naturze..."
              </p>
            </div>

            <div className="bg-slate-50 border-l-4 border-brand-dark p-6 shadow-sm">
              <p className="font-serif font-bold text-base text-brand-dark mb-2">§2 UST. 1 PKT 26 ROZP. MPiPS</p>
              <p className="italic text-gray-500 font-serif text-sm">
                "Podstawy wymiaru składek nie stanowią (...) korzyści materialne wynikające z układów zbiorowych pracy, regulaminów wynagradzania..."
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Risk Management */}
        <div>
          <h3 className="text-xl font-serif text-brand-dark font-bold border-b-2 border-brand-gold pb-3 mb-6 inline-block pr-8">
            ZARZĄDZANIE RYZYKIEM
          </h3>

          <div className="space-y-10">
            {data.riskItems.map((item) => (
              <div key={item.id} className="flex gap-6 group">
                <div className="flex-shrink-0">
                  <span className="text-5xl font-serif font-bold text-brand-gold/40 group-hover:text-brand-gold transition-colors">
                    {item.number}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-brand-dark uppercase mb-2">{item.title}</h4>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {item.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PageFooter pageNumber="3 Z 4" />
    </div>
  );
};

export default LegalSection;