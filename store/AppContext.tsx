
import React, { ReactNode } from 'react';
import { ZapisanaKalkulacja } from '../entities/history/model';
import { Pracownik } from '../entities/employee/model';
import { offerPdfV3Generator } from '../services/offerPdfV3Generator';
import { offerLegalizacjaPremiiGenerator } from '../services/offerLegalizacjaPremii/generator';
import { obliczWariantStandard, obliczWariantPodzial } from '../features/tax-engine';
import { generateFullHistoryExcel } from '../features/steps/summary/generateFullHistoryExcel';
import { ConfirmProvider, useConfirm } from './ConfirmContext';

// Import Contexts using explicit relative paths
import { CompanyProvider, useCompany } from './CompanyContext';
import { EmployeeProvider, useEmployees } from './EmployeeContext';
import { HistoryProvider, useHistory } from './HistoryContext';
import { CalculationProvider, useCalculation } from './CalculationContext';
import { NotificationProvider, useNotification } from './NotificationContext';

// Export hooks
export { useCompany } from './CompanyContext';
export { useEmployees } from './EmployeeContext';
export { useHistory } from './HistoryContext';
export { useCalculation } from './CalculationContext';
export { useNotification } from './NotificationContext';
export { useConfirm } from './ConfirmContext';

// Main App Provider
export const AppProvider = ({ children }: { children?: ReactNode }) => {
  return (
    <ConfirmProvider>
      <NotificationProvider>
        <CompanyProvider>
          <EmployeeProvider>
            <HistoryProvider>
              {/* CalculationProvider depends on Company and Employee contexts */}
              <CalculationProvider>
                {children}
              </CalculationProvider>
            </HistoryProvider>
          </EmployeeProvider>
        </CompanyProvider>
      </NotificationProvider>
    </ConfirmProvider>
  );
};

// Legacy/Bridge Hook
export const useAppStore = () => {
  const company = useCompany();
  const employees = useEmployees();
  const history = useHistory();
  const calculation = useCalculation();
  const notification = useNotification();
  const { confirmDialog } = useConfirm();

  const saveToHistory = (): ZapisanaKalkulacja | null => {
    if (employees.pracownicy.length === 0) {
      notification.notify('Brak pracowników do zapisania.', 'error');
      return null;
    }
    if (!calculation.wyniki) return null;

    const newEntry: ZapisanaKalkulacja = {
      id: Date.now().toString(),
      dataUtworzenia: new Date().toISOString(),
      nazwaFirmy: company.firma.nazwa || 'Bez nazwy',
      liczbaPracownikow: employees.pracownicy.length,
      oszczednoscRoczna: calculation.wyniki.podsumowanie.oszczednoscRoczna,
      dane: { 
        firma: company.firma, 
        pracownicy: employees.pracownicy, 
        config: company.config, 
        prowizjaProc: calculation.prowizjaProc 
      }
    };

    history.setHistoria(prev => [newEntry, ...prev]);
    notification.notify('Kalkulacja została pomyślnie zapisana w bazie.', 'success');
    return newEntry;
  };

  const loadFromHistory = async (item: ZapisanaKalkulacja): Promise<boolean> => {
    if (await confirmDialog(`Wczytać kalkulację dla firmy ${item.nazwaFirmy}? Bieżące niezapisane zmiany zostaną utracone.`)) {
      company.setFirma(item.dane.firma);
      employees.setPracownicy(item.dane.pracownicy);
      company.setConfig(item.dane.config);
      calculation.setProwizjaProc(item.dane.prowizjaProc || 28);
      notification.notify(`Wczytano ofertę: ${item.nazwaFirmy}`, 'info');
      return true;
    }
    return false;
  };

  // Nowa funkcja do ładowania z pliku JSON (z opcją pominięcia confirm dla uploadu pliku)
  const loadBackup = async (data: ZapisanaKalkulacja | Pracownik[] | unknown, skipConfirm: boolean = false): Promise<boolean> => {
      try {
          // 1. Walidacja formatu 'ZapisanaKalkulacja'
          const asKalkulacja = data as ZapisanaKalkulacja;
          if (asKalkulacja && asKalkulacja.dane && asKalkulacja.dane.firma && Array.isArray(asKalkulacja.dane.pracownicy)) {
              if (!skipConfirm && !await confirmDialog(`Wczytać kopię zapasową dla firmy ${asKalkulacja.nazwaFirmy || 'Bez nazwy'}?`)) return false;
              
              company.setFirma(asKalkulacja.dane.firma);
              employees.setPracownicy(asKalkulacja.dane.pracownicy);
              if (asKalkulacja.dane.config) company.setConfig(asKalkulacja.dane.config);
              if (asKalkulacja.dane.prowizjaProc) calculation.setProwizjaProc(asKalkulacja.dane.prowizjaProc);
              
              notification.notify('Przywrócono kopię zapasową.', 'success');
              return true;
          }
          
          // 2. Walidacja formatu 'Surowa tablica pracowników'
          const asPracownicy = data as Pracownik[];
          if (Array.isArray(asPracownicy) && asPracownicy.length > 0 && asPracownicy[0].imie) {
               if (!skipConfirm && !await confirmDialog(`Plik wygląda na listę ${asPracownicy.length} pracowników (bez ustawień firmy). Zaimportować?`)) return false;
               employees.setPracownicy(asPracownicy);
               notification.notify(`Zaimportowano ${asPracownicy.length} pracowników z pliku.`, 'success');
               return true;
          }

          notification.notify('Nieprawidłowy format pliku JSON. Wymagana struktura kopii zapasowej.', 'error');
          return false;
      } catch (error) {
          console.error(error);
          notification.notify('Błąd krytyczny podczas przetwarzania pliku.', 'error');
          return false;
      }
  };

  const generateOfferElitonPrimePlus = (item: ZapisanaKalkulacja) => {
      offerPdfV3Generator.generateOfferPDF(item);
      notification.notify('Generowanie oferty Eliton Prime™ PLUS...', 'info');
  };

  const generateLegalizacjaPremii = (item: ZapisanaKalkulacja) => {
      offerLegalizacjaPremiiGenerator.generateOfferPDF(item);
      notification.notify('Generowanie oferty Legalizacja Premii...', 'info');
  };

  const generateExcelFromHistory = (item: ZapisanaKalkulacja) => {
      const { firma, pracownicy, config, prowizjaProc } = item.dane;
      const szczegoly = pracownicy.map(p => {
          const standard = obliczWariantStandard(p, firma.stawkaWypadkowa, config);
          const podzial = obliczWariantPodzial(p, firma.stawkaWypadkowa, p.nettoZasadnicza, config);
          return { pracownik: p, standard, podzial, oszczednosc: standard.kosztPracodawcy - podzial.kosztPracodawcy };
      });
      const sumaNettoSwiadczen = szczegoly.reduce((acc, w) => acc + w.podzial.swiadczenie.netto, 0);
      const sumaKosztStandard = szczegoly.reduce((acc, w) => acc + w.standard.kosztPracodawcy, 0);
      const sumaKosztPodzial = szczegoly.reduce((acc, w) => acc + w.podzial.kosztPracodawcy, 0);
      const oszczednoscBrutto = sumaKosztStandard - sumaKosztPodzial;
      const prowizja = sumaNettoSwiadczen * (prowizjaProc / 100);
      const oszczednoscNetto = oszczednoscBrutto - prowizja;
      const wyniki = {
          szczegoly,
          podsumowanie: {
              sumaKosztStandard,
              sumaKosztPodzial,
              sumaBruttoSwiadczen: szczegoly.reduce((acc, w) => acc + w.podzial.swiadczenie.brutto, 0),
              sumaNettoSwiadczen,
              oszczednoscBrutto,
              prowizja,
              oszczednoscNetto,
              oszczednoscRoczna: oszczednoscNetto * 12,
              sredniaOszczednoscNaEtat: pracownicy.length > 0 ? oszczednoscNetto / pracownicy.length : 0
          }
      };
      generateFullHistoryExcel({ firma, pracownicy, wyniki, prowizjaProc, activeModel: 'PRIME' });
      notification.notify('Generowanie Excel z historii...', 'info');
  };

  // Funkcja tworząca plik JSON (baza plikowa)
  const downloadCalculation = (item: ZapisanaKalkulacja) => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(item, null, 2));
      const downloadAnchorNode = document.createElement('a');
      const fileName = `Kalkulacja_${item.nazwaFirmy.replace(/[^a-z0-9]/gi, '_')}_${item.dataUtworzenia.slice(0,10)}.json`;
      
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", fileName);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      notification.notify('Pobrano plik archiwum JSON.', 'info');
  };

  return {
    ...company,
    ...employees,
    ...history,
    ...calculation,
    ...notification,
    saveToHistory,
    loadFromHistory,
    loadBackup,
    generateOfferElitonPrimePlus,
    generateLegalizacjaPremii,
    generateExcelFromHistory,
    downloadCalculation
  };
};
