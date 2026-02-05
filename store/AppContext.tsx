
import React, { ReactNode } from 'react';
import { ZapisanaKalkulacja } from '../entities/history/model';
import { offerPdfGenerator } from '../services/offerPdfGenerator';

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

// Main App Provider
export const AppProvider = ({ children }: { children?: ReactNode }) => {
  return (
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
  );
};

// Legacy/Bridge Hook
export const useAppStore = () => {
  const company = useCompany();
  const employees = useEmployees();
  const history = useHistory();
  const calculation = useCalculation();
  const notification = useNotification();

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

  const loadFromHistory = (item: ZapisanaKalkulacja): boolean => {
    if (confirm(`Wczytać kalkulację dla firmy ${item.nazwaFirmy}? Bieżące niezapisane zmiany zostaną utracone.`)) {
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
  const loadBackup = (data: any, skipConfirm: boolean = false): boolean => {
      try {
          // 1. Walidacja formatu 'ZapisanaKalkulacja' (Pełny stan z wrapperem 'dane')
          if (data && data.dane && data.dane.firma && Array.isArray(data.dane.pracownicy)) {
              if (!skipConfirm && !confirm(`Wczytać kopię zapasową dla firmy ${data.nazwaFirmy || 'Bez nazwy'}?`)) return false;
              
              company.setFirma(data.dane.firma);
              employees.setPracownicy(data.dane.pracownicy);
              if (data.dane.config) company.setConfig(data.dane.config);
              if (data.dane.prowizjaProc) calculation.setProwizjaProc(data.dane.prowizjaProc);
              
              notification.notify('Przywrócono kopię zapasową.', 'success');
              return true;
          }
          
          // 2. Walidacja formatu 'Surowa tablica pracowników' (Gdyby ktoś wgrał samą listę JSON)
          if (Array.isArray(data) && data.length > 0 && data[0].imie) {
               if (!skipConfirm && !confirm(`Plik wygląda na listę ${data.length} pracowników (bez ustawień firmy). Zaimportować?`)) return false;
               employees.setPracownicy(data);
               notification.notify(`Zaimportowano ${data.length} pracowników z pliku.`, 'success');
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

  // Uproszczona funkcja delegująca do serwisu
  const generateOffer = (item: ZapisanaKalkulacja) => {
      offerPdfGenerator.generateOfferPDF(item);
      notification.notify('Generowanie PDF...', 'info');
  };

  const generateExcelFromHistory = (item: ZapisanaKalkulacja) => {
      console.log("Export excel for", item.id);
      notification.notify('Funkcja eksportu historii w przygotowaniu.', 'info');
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
    generateOffer,
    generateExcelFromHistory,
    downloadCalculation
  };
};
