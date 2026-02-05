
import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { GlobalneWyniki } from '../entities/calculation/model';
import { useCompany } from './CompanyContext';
import { useEmployees } from './EmployeeContext';
import { obliczWariantStandard, obliczWariantPodzial } from '../features/tax-engine';

// Nowy interfejs dla stanu widoku porównania
interface ComparisonState {
    activeCard: 'STANDARD' | 'PRIME';
    customStandardRate: number;
    customPrimeRate: number;
}

interface CalculationContextType {
  wyniki: GlobalneWyniki | null;
  prowizjaProc: number;
  setProwizjaProc: React.Dispatch<React.SetStateAction<number>>;
  
  // Nowe pola do trwałego stanu widoku
  comparisonState: ComparisonState;
  setComparisonState: React.Dispatch<React.SetStateAction<ComparisonState>>;
  
  isCalculating: boolean;
}

const CalculationContext = createContext<CalculationContextType | undefined>(undefined);

export const CalculationProvider = ({ children }: { children?: ReactNode }) => {
  const { firma, config } = useCompany();
  const { pracownicy } = useEmployees();
  
  // ZMIANA: Domyślna prowizja globalna ustawiona na 26% (zgodnie z domyślną kartą PRIME)
  // To zapobiega nadpisaniu wartości inputa Prime (26%) wartością Standard (28%) przy synchronizacji.
  const [prowizjaProc, setProwizjaProc] = useState(26);
  
  // Inicjalizacja stanu UI - domyślnie Prime 26%
  const [comparisonState, setComparisonState] = useState<ComparisonState>({
      activeCard: 'PRIME',
      customStandardRate: 28,
      customPrimeRate: 26
  });

  const [isCalculating, setIsCalculating] = useState(false);

  // Główna logika obliczeniowa - automatycznie reaguje na zmiany w innych kontekstach
  const wyniki = useMemo<GlobalneWyniki | null>(() => {
    if (pracownicy.length === 0) return null;
    
    // Opcjonalnie: Tutaj można wpiąć WebWorkera dla dużej liczby pracowników
    // setIsCalculating(true);

    const szczegoly = pracownicy.map(p => {
        const standard = obliczWariantStandard(p, firma.stawkaWypadkowa, config);
        const podzial = obliczWariantPodzial(p, firma.stawkaWypadkowa, p.nettoZasadnicza, config);
        return { 
            pracownik: p, 
            standard, 
            podzial, 
            oszczednosc: standard.kosztPracodawcy - podzial.kosztPracodawcy 
        };
    });

    const sumaKosztStandard = szczegoly.reduce((acc, w) => acc + w.standard.kosztPracodawcy, 0);
    const sumaKosztPodzial = szczegoly.reduce((acc, w) => acc + w.podzial.kosztPracodawcy, 0);
    const sumaBruttoSwiadczen = szczegoly.reduce((acc, w) => acc + w.podzial.swiadczenie.brutto, 0);
    const oszczednoscBrutto = sumaKosztStandard - sumaKosztPodzial;
    const prowizja = sumaBruttoSwiadczen * (prowizjaProc / 100);
    const oszczednoscNetto = oszczednoscBrutto - prowizja;

    const podsumowanie = {
        sumaKosztStandard,
        sumaKosztPodzial,
        sumaBruttoSwiadczen,
        oszczednoscBrutto,
        prowizja,
        oszczednoscNetto,
        oszczednoscRoczna: oszczednoscNetto * 12,
        sredniaOszczednoscNaEtat: pracownicy.length > 0 ? oszczednoscNetto / pracownicy.length : 0
    };

    // setIsCalculating(false);
    return { szczegoly, podsumowanie };
  }, [pracownicy, firma, config, prowizjaProc]);

  return (
    <CalculationContext.Provider value={{ 
        wyniki, 
        prowizjaProc, 
        setProwizjaProc, 
        comparisonState, 
        setComparisonState, 
        isCalculating 
    }}>
      {children}
    </CalculationContext.Provider>
  );
};

export const useCalculation = () => {
  const context = useContext(CalculationContext);
  if (!context) throw new Error('useCalculation must be used within CalculationProvider');
  return context;
};
