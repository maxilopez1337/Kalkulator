
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Pracownik } from '../entities/employee/model';
import { secureSetItem, secureGetItem } from '../shared/utils/storageEncryption';

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
  const [pracownicy, setPracownicy] = useState<Pracownik[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Async load from encrypted localStorage on mount
  useEffect(() => {
    async function load() {
      try {
        const saved = await secureGetItem(EMPLOYEES_KEY);
        if (!saved) { setLoaded(true); return; }
        const storedVersion = await secureGetItem(`${EMPLOYEES_KEY}_v`);
        if (storedVersion && Number(storedVersion) !== SCHEMA_VERSION) {
          if (import.meta.env.DEV) console.warn('Employees schema version mismatch, clearing stored employees');
          setLoaded(true);
          return;
        }
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) { setLoaded(true); return; }
        // Migration v1: pracownicy UZ z starym defaultem 840 → 1680
        const migrated = (parsed as Pracownik[]).map(p =>
          p.typUmowy === 'UZ' && p.nettoZasadnicza === STARY_DEFAULT_UZ
            ? { ...p, nettoZasadnicza: NOWY_DEFAULT_UZ }
            : p
        );
        setPracownicy(migrated);
      } catch {
        if (import.meta.env.DEV) console.warn('Failed to load employees from localStorage');
      } finally {
        setLoaded(true);
      }
    }
    load();
  }, []);

  // Async persist to encrypted localStorage whenever pracownicy changes (skip before load)
  useEffect(() => {
    if (!loaded) return;
    async function save() {
      await secureSetItem(EMPLOYEES_KEY, JSON.stringify(pracownicy));
      await secureSetItem(`${EMPLOYEES_KEY}_v`, String(SCHEMA_VERSION));
    }
    save();
  }, [pracownicy, loaded]);

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
