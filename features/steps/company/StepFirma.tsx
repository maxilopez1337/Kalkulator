
import React from 'react';
import { Building, Users, Check, X, Search, ArrowRight, Info, LayoutGrid } from '../../../common/Icons';
import { FormField, Section } from '../../../shared/ui/Layout';
import { Card } from '../../../shared/ui/Card';
import { Input } from '../../../shared/ui/Input';
import { ButtonPrimary, ButtonSecondary } from '../../../shared/ui/Button';
import { formatPLN } from '../../../shared/utils/formatters';
import { useCompany } from '../../../store/CompanyContext';
import { useCompanyData } from '../../../hooks/useCompanyData';
import { theme } from '../../../common/theme';

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
    <div className="animate-in fade-in zoom-in-95 duration-300 space-y-6">
      
      {/* SEKCJA 1: IDENTYFIKACJA (NIP & GUS) - "Master Key" Section */}
      <div className="bg-white p-6 rounded-md shadow-sm border border-[#edebe9]">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
            <div className="w-full md:w-1/3">
                <FormField label="Numer Identyfikacji Podatkowej (NIP)" hint={nipValidation.message}>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Input 
                                type="text" 
                                className={`pr-10 font-mono font-medium text-lg tracking-wide ${nipValidation.valid ? 'border-l-4 border-l-[#107c10]' : ''}`}
                                success={nipValidation.valid === true}
                                error={nipValidation.valid === false}
                                value={firma.nip} 
                                onChange={(e) => handleNipChange(e.target.value)} 
                                placeholder="000-000-00-00" 
                                maxLength={13}
                                autoFocus
                            />
                            {nipValidation.valid !== null && (
                                <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center ${nipValidation.valid ? 'text-[#107c10]' : 'text-[#a80000]'}`}>
                                    {nipValidation.valid ? <Check /> : <X />}
                                </div>
                            )}
                        </div>
                    </div>
                </FormField>
            </div>

            <div className="flex-1 flex flex-col md:flex-row gap-3 w-full">
                 <ButtonSecondary 
                    onClick={fetchGusData}
                    disabled={!nipValidation.valid || isFetching}
                    icon={!isFetching && <Search />}
                    className="h-[42px]" // Match input height
                >
                    {isFetching ? 'Pobieranie danych...' : 'Pobierz z GUS'}
                </ButtonSecondary>
                
                {firma.nip && (
                    <ButtonSecondary 
                        onClick={openGoogleSearch}
                        className="h-[42px]"
                    >
                        Google <ArrowRight />
                    </ButtonSecondary>
                )}
            </div>
        </div>

        {fetchStatus && (
            <div className={`mt-3 text-sm px-3 py-2 rounded-sm border flex items-center gap-2 ${
                fetchStatus.type === 'success' 
                    ? 'bg-[#dff6dd] text-[#107c10] border-[#bad80a]' 
                    : 'bg-[#eff6fc] text-[#0078d4] border-[#c7e0f4]'
            }`}>
                {fetchStatus.type === 'success' && <Check />}
                {fetchStatus.text}
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SEKCJA 2: DANE EWIDENCYJNE (LEWA KOLUMNA - SZEROKA) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
              <Card title="Dane Ewidencji Gospodarczej" icon={<Building />}>
                  <div className="space-y-5">
                      <FormField label="Pełna nazwa firmy">
                          <Input 
                              type="text" 
                              value={firma.nazwa}
                              onChange={(e) => setFirma({...firma, nazwa: e.target.value})} 
                              placeholder="Wprowadź nazwę lub pobierz z GUS" 
                              className="font-semibold"
                          />
                      </FormField>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="md:col-span-2">
                              <FormField label="Ulica i numer">
                                  <Input 
                                      type="text" 
                                      value={firma.adres || ''}
                                      onChange={(e) => setFirma({...firma, adres: e.target.value})} 
                                      placeholder="ul. Prosta 1/2" 
                                  />
                              </FormField>
                          </div>
                          <FormField label="Kod pocztowy">
                              <Input 
                                  type="text" 
                                  value={firma.kodPocztowy || ''}
                                  onChange={(e) => setFirma({...firma, kodPocztowy: e.target.value})} 
                                  placeholder="00-000" 
                              />
                          </FormField>
                          <FormField label="Miejscowość">
                              <Input 
                                  type="text" 
                                  value={firma.miasto || ''}
                                  onChange={(e) => setFirma({...firma, miasto: e.target.value})} 
                                  placeholder="Warszawa" 
                              />
                          </FormField>
                      </div>
                  </div>
              </Card>

              {/* Informacja prawna (Footer lewej kolumny) */}
              <div className="p-4 bg-[#fff4ce] border border-[#fde7e9] rounded-md flex gap-3 text-sm text-[#323130]">
                  <div className="text-[#797775] mt-0.5"><Info /></div>
                  <div>
                      <strong>Parametry budżetowe na rok 2026:</strong>
                      <ul className="list-disc pl-4 mt-1 space-y-0.5 text-xs opacity-90">
                          <li>Płaca minimalna: <strong>{formatPLN(config.placaMinimalna.brutto)} brutto</strong> ({formatPLN(config.placaMinimalna.netto)} netto)</li>
                          <li>I próg podatkowy: {config.pit.prog1Stawka}% (limit {formatPLN(config.pit.prog1Limit)})</li>
                      </ul>
                  </div>
              </div>
          </div>

          {/* SEKCJA 3: DANE OPERACYJNE (PRAWA KOLUMNA - WĄSKA) */}
          <div className="space-y-6">
              
              <Card title="Kontakt i Administracja" icon={<Users />}>
                  <div className="space-y-4">
                      <FormField label="Osoba kontaktowa">
                          <Input 
                              type="text" 
                              value={firma.osobaKontaktowa || ''}
                              onChange={(e) => setFirma({...firma, osobaKontaktowa: e.target.value})} 
                              placeholder="Imię i Nazwisko" 
                          />
                      </FormField>
                      <FormField label="E-mail">
                          <Input 
                              type="email" 
                              value={firma.email || ''}
                              onChange={(e) => setFirma({...firma, email: e.target.value})} 
                              placeholder="biuro@firma.pl" 
                          />
                      </FormField>
                      <FormField label="Telefon">
                          <Input 
                              type="tel" 
                              value={firma.telefon || ''}
                              onChange={(e) => setFirma({...firma, telefon: e.target.value})} 
                              placeholder="+48..." 
                          />
                      </FormField>
                  </div>
              </Card>

              <Card title="Parametry ZUS" icon={<LayoutGrid />}>
                  <div className="space-y-4">
                      <FormField label="Okres rozliczeniowy">
                          <Input 
                              type="month" 
                              value={firma.okres} 
                              onChange={(e) => setFirma({...firma, okres: e.target.value})} 
                              className="font-medium"
                          />
                      </FormField>

                      <FormField label="Stawka wypadkowa (%)" hint="Standard: 1.67%">
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
                              <span className="text-sm text-gray-500">%</span>
                          </div>
                      </FormField>
                  </div>
              </Card>

          </div>
      </div>
    </div>
  );
};
