
import React from 'react';
import { Building, Users, Check, X, Search, ArrowRight, Info, LayoutGrid } from '../../../common/Icons';
import { Input } from '../../../shared/ui/Input';
import { ButtonSecondary } from '../../../shared/ui/Button';
import { formatPLN } from '../../../shared/utils/formatters';
import { useCompany } from '../../../store/CompanyContext';
import { useCompanyData } from '../../../hooks/useCompanyData';

// Compact label + children wrapper (replaces FormField for tight layouts)
const CompactField = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[11px] font-semibold text-[#605e5c] uppercase tracking-wide">{label}</label>
    {children}
    {hint && <span className="text-[10px] text-[#a19f9d]">{hint}</span>}
  </div>
);

export const StepFirma = () => {
  const { config } = useCompany();
  const { 
      firma, 
      setFirma, 
      nipValidation, 
      isFetching, 
      fetchStatus, 
      handleNipChange, 
      openGoogleSearch, 
      fetchGusData 
  } = useCompanyData();

  return (
    <div className="animate-in fade-in duration-200 flex flex-col -mx-3 md:-mx-6 lg:-mx-8 -mt-3 md:-mt-6 lg:-mt-8">

      {/* ── STICKY HEADER BAR ────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.10)] border-b border-[#edebe9]">
        <div className="px-6 py-3 flex flex-wrap items-center gap-4">
          {/* Icon + Title */}
          <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
            <div className="w-8 h-8 rounded-sm bg-[#eff6fc] flex items-center justify-center text-[#0078d4]">
              <Building />
            </div>
            <div>
              <div className="text-[15px] font-semibold text-[#201f1e] leading-tight">Dane Firmy</div>
              <div className="text-[11px] text-[#a19f9d]">Identyfikacja i kontakt organizacji</div>
            </div>
          </div>

          <div className="w-px h-8 bg-[#edebe9] hidden md:block flex-shrink-0" />

          {/* NIP field inline */}
          <div className="flex items-center gap-2 flex-1 min-w-[260px] max-w-[440px]">
            <div className="relative flex-1">
              <Input
                type="text"
                className={`font-mono font-semibold tracking-wide text-[14px] ${nipValidation.valid ? 'border-l-4 border-l-[#107c10]' : ''}`}
                success={nipValidation.valid === true}
                error={nipValidation.valid === false}
                value={firma.nip}
                onChange={(e) => handleNipChange(e.target.value)}
                placeholder="000-000-00-00"
                maxLength={13}
                autoFocus
              />
              {nipValidation.valid !== null && (
                <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${nipValidation.valid ? 'text-[#107c10]' : 'text-[#a80000]'}`}>
                  {nipValidation.valid ? <Check /> : <X />}
                </div>
              )}
            </div>
            <ButtonSecondary
              onClick={fetchGusData}
              disabled={!nipValidation.valid || isFetching}
              icon={!isFetching && <Search />}
            >
              {isFetching ? 'Pobieranie...' : 'Pobierz z GUS'}
            </ButtonSecondary>
            {firma.nip && (
              <ButtonSecondary onClick={openGoogleSearch}>Google <ArrowRight /></ButtonSecondary>
            )}
          </div>

          {/* GUS status inline */}
          {fetchStatus && (
            <span className={`text-[12px] font-medium px-3 py-1 rounded-sm flex-shrink-0 ${fetchStatus.type === 'success' ? 'bg-[#e6f3e6] text-[#107c10]' : 'bg-[#deecf9] text-[#0078d4]'}`}>
              {fetchStatus.type === 'success' ? <span className="mr-1">✓</span> : null}{fetchStatus.text}
            </span>
          )}

          {/* Params badge */}
          <div className="ml-auto hidden lg:flex items-center gap-2 text-[11px] text-[#605e5c] bg-[#fef3e6] border border-[#fde5c4] rounded-sm px-3 py-1.5 flex-shrink-0">
            <Info className="text-[#d47500] w-3.5 h-3.5 flex-shrink-0" />
            <span>Min. <strong className="text-[#201f1e]">{formatPLN(config.placaMinimalna.brutto)}</strong> · PIT 12% do <strong className="text-[#201f1e]">{formatPLN(config.pit.prog1Limit)}</strong></span>
          </div>
        </div>

        {/* NIP hint */}
        {nipValidation.message && (
          <div className={`px-6 pb-2 text-[11px] ${nipValidation.valid ? 'text-[#107c10]' : 'text-[#a80000]'}`}>
            {nipValidation.message}
          </div>
        )}
      </div>

      {/* ── MAIN 3-COLUMN BODY ───────────────────────────────────────────── */}
      <div className="flex-1 bg-[#f3f2f1] p-5 grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ─── COL 1: Dane Ewidencji ──────────────────────────────────────── */}
        <div className="bg-white border border-[#edebe9] rounded-sm flex flex-col">
          <div className="flex items-center gap-2.5 px-5 py-3 border-b border-[#edebe9] flex-shrink-0">
            <div className="text-[#0078d4]"><Building /></div>
            <span className="text-[13px] font-semibold text-[#201f1e]">Dane Ewidencji Gospodarczej</span>
          </div>
          <div className="px-5 py-4 flex flex-col gap-3.5 flex-1">
            <CompactField label="Pełna nazwa firmy">
              <Input
                type="text"
                value={firma.nazwa}
                onChange={(e) => setFirma({...firma, nazwa: e.target.value})}
                placeholder="Wprowadź nazwę lub pobierz z GUS"
                className="font-semibold"
              />
            </CompactField>
            <CompactField label="Ulica i numer">
              <Input
                type="text"
                value={firma.adres || ''}
                onChange={(e) => setFirma({...firma, adres: e.target.value})}
                placeholder="ul. Prosta 1/2"
              />
            </CompactField>
            <div className="grid grid-cols-2 gap-3">
              <CompactField label="Kod pocztowy">
                <Input
                  type="text"
                  value={firma.kodPocztowy || ''}
                  onChange={(e) => setFirma({...firma, kodPocztowy: e.target.value})}
                  placeholder="00-000"
                />
              </CompactField>
              <CompactField label="Miejscowość">
                <Input
                  type="text"
                  value={firma.miasto || ''}
                  onChange={(e) => setFirma({...firma, miasto: e.target.value})}
                  placeholder="Warszawa"
                />
              </CompactField>
            </div>
          </div>
          {/* Info strip */}
          <div className="mt-auto border-t border-[#edebe9] bg-[#fef9f0] px-5 py-3">
            <p className="text-[11px] font-bold text-[#d47500] mb-1">Parametry budżetowe na rok 2026:</p>
            <ul className="text-[11px] text-[#605e5c] space-y-0.5">
              <li>• Płaca minimalna: <strong className="text-[#201f1e]">{formatPLN(config.placaMinimalna.brutto)}</strong> ({formatPLN(config.placaMinimalna.netto)} netto)</li>
              <li>• I próg podatkowy: <strong className="text-[#201f1e]">{config.pit.prog1Stawka}%</strong> (limit {formatPLN(config.pit.prog1Limit)})</li>
            </ul>
          </div>
        </div>

        {/* ─── COL 2: Kontakt + Opiekun ───────────────────────────────────── */}
        <div className="bg-white border border-[#edebe9] rounded-sm flex flex-col">
          {/* Kontakt */}
          <div className="flex items-center gap-2.5 px-5 py-3 border-b border-[#edebe9] flex-shrink-0">
            <div className="text-[#0078d4]"><Users /></div>
            <span className="text-[13px] font-semibold text-[#201f1e]">Kontakt i Administracja</span>
          </div>
          <div className="px-5 py-4 flex flex-col gap-3.5">
            <CompactField label="Osoba kontaktowa">
              <Input type="text" value={firma.osobaKontaktowa || ''} onChange={(e) => setFirma({...firma, osobaKontaktowa: e.target.value})} placeholder="Imię i Nazwisko" />
            </CompactField>
            <CompactField label="E-mail">
              <Input type="email" value={firma.email || ''} onChange={(e) => setFirma({...firma, email: e.target.value})} placeholder="biuro@firma.pl" />
            </CompactField>
            <CompactField label="Telefon">
              <Input type="tel" value={firma.telefon || ''} onChange={(e) => setFirma({...firma, telefon: e.target.value})} placeholder="+48..." />
            </CompactField>
          </div>

          {/* Opiekun separator */}
          <div className="flex items-center gap-2.5 px-5 py-3 border-t border-b border-[#edebe9] bg-[#faf9f8] flex-shrink-0">
            <div className="text-[#0078d4]"><Users /></div>
            <span className="text-[13px] font-semibold text-[#201f1e]">Opiekun handlowy</span>
          </div>
          <div className="px-5 py-4 flex flex-col gap-3.5 flex-1">
            <CompactField label="Imię i Nazwisko opiekuna">
              <Input type="text" value={firma.opiekunNazwa || ''} onChange={(e) => setFirma({...firma, opiekunNazwa: e.target.value})} placeholder="np. Michał Zawadzki" />
            </CompactField>
            <CompactField label="E-mail opiekuna">
              <Input type="email" value={firma.opiekunEmail || ''} onChange={(e) => setFirma({...firma, opiekunEmail: e.target.value})} placeholder="m.nazwisko@stratton-prime.pl" />
            </CompactField>
            <CompactField label="Telefon opiekuna">
              <Input type="tel" value={firma.opiekunTelefon || ''} onChange={(e) => setFirma({...firma, opiekunTelefon: e.target.value})} placeholder="+48 000 000 000" />
            </CompactField>
          </div>
        </div>

        {/* ─── COL 3: Parametry ZUS ───────────────────────────────────────── */}
        <div className="bg-white border border-[#edebe9] rounded-sm flex flex-col">
          <div className="flex items-center gap-2.5 px-5 py-3 border-b border-[#edebe9] flex-shrink-0">
            <div className="text-[#0078d4]"><LayoutGrid /></div>
            <span className="text-[13px] font-semibold text-[#201f1e]">Parametry ZUS</span>
          </div>
          <div className="px-5 py-4 flex flex-col gap-3.5 flex-1">
            <CompactField label="Okres rozliczeniowy">
              <Input
                type="month"
                value={firma.okres}
                onChange={(e) => setFirma({...firma, okres: e.target.value})}
                className="font-medium"
              />
            </CompactField>
            <CompactField label="Stawka wypadkowa (%)" hint="Standard: 1.67%">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0.67"
                  max="3.33"
                  value={firma.stawkaWypadkowa}
                  onChange={(e) => setFirma({...firma, stawkaWypadkowa: parseFloat(e.target.value)})}
                  className="font-bold text-right"
                />
                <span className="text-sm text-[#605e5c] flex-shrink-0">%</span>
              </div>
            </CompactField>

            {/* KPI tiles */}
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <div className="bg-[#f3f2f1] rounded-sm px-3 py-2.5">
                <div className="text-[10px] text-[#a19f9d] uppercase font-bold tracking-wider mb-0.5">Składka emeryt.</div>
                <div className="text-[14px] font-bold text-[#201f1e]">{config.zus.uop.pracownik.emerytalna}%</div>
                <div className="text-[10px] text-[#605e5c]">pracownik</div>
              </div>
              <div className="bg-[#f3f2f1] rounded-sm px-3 py-2.5">
                <div className="text-[10px] text-[#a19f9d] uppercase font-bold tracking-wider mb-0.5">Składka rent.</div>
                <div className="text-[14px] font-bold text-[#201f1e]">{config.zus.uop.pracownik.rentowa}%</div>
                <div className="text-[10px] text-[#605e5c]">pracownik</div>
              </div>
              <div className="bg-[#f3f2f1] rounded-sm px-3 py-2.5">
                <div className="text-[10px] text-[#a19f9d] uppercase font-bold tracking-wider mb-0.5">Składka zdrow.</div>
                <div className="text-[14px] font-bold text-[#201f1e]">{config.zus.zdrowotna}%</div>
                <div className="text-[10px] text-[#605e5c]">pracownik</div>
              </div>
              <div className="bg-[#eff6fc] rounded-sm px-3 py-2.5 border border-[#c7e0f4]">
                <div className="text-[10px] text-[#0078d4] uppercase font-bold tracking-wider mb-0.5">Płaca min.</div>
                <div className="text-[14px] font-bold text-[#0078d4]">{formatPLN(config.placaMinimalna.brutto)}</div>
                <div className="text-[10px] text-[#605e5c]">brutto 2026</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};