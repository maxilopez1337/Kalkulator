
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Pracownik } from '../entities/employee/model';

interface EmployeeContextType {
  pracownicy: Pracownik[];
  setPracownicy: React.Dispatch<React.SetStateAction<Pracownik[]>>;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

const STARY_DEFAULT_UZ = 840;
const NOWY_DEFAULT_UZ = 1680;

const SCHEMA_VERSION = 1;
const EMPLOYEES_KEY = 'kalkulator_pracownicy';

export const EmployeeProvider = ({ children }: { children?: ReactNode }) => {
  const [pracownicy, setPracownicy] = useState<Pracownik[]>(() => {
    try {
      const saved = localStorage.getItem(EMPLOYEES_KEY);
      if (!saved) return [];
      const storedVersion = localStorage.getItem(`${EMPLOYEES_KEY}_v`);
      if (storedVersion && Number(storedVersion) !== SCHEMA_VERSION) {
        console.warn('Employees schema version mismatch, clearing stored employees');
        return [];
      }
      const parsed: Pracownik[] = JSON.parse(saved);
      // Migration v1: pracownicy UZ z starym defaultem 840 → 1680
      return parsed.map(p =>
        (p.typUmowy === 'UZ' || p.typUmowy === 'MIX') && p.nettoZasadnicza === STARY_DEFAULT_UZ
          ? { ...p, nettoZasadnicza: NOWY_DEFAULT_UZ }
          : p
      );
    } catch {
      console.warn('Failed to load employees from localStorage');
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(pracownicy));
    localStorage.setItem(`${EMPLOYEES_KEY}_v`, String(SCHEMA_VERSION));
  }, [pracownicy]);

  return (
    <EmployeeContext.Provider value={{ pracownicy, setPracownicy }}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployees = () => {
  const context = useContext(EmployeeContext);
  if (!context) throw new Error('useEmployees must be used within EmployeeProvider');
  return context;
};
