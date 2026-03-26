
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ZapisanaKalkulacja } from '../entities/history/model';

interface HistoryContextType {
  historia: ZapisanaKalkulacja[];
  setHistoria: React.Dispatch<React.SetStateAction<ZapisanaKalkulacja[]>>;
  deleteFromHistory: (id: string) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

const SCHEMA_VERSION = 1;
const HISTORY_KEY = 'kalkulator_historia';

export const HistoryProvider = ({ children }: { children?: ReactNode }) => {
  const [historia, setHistoria] = useState<ZapisanaKalkulacja[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (!saved) return [];
      const storedVersion = localStorage.getItem(`${HISTORY_KEY}_v`);
      if (storedVersion && Number(storedVersion) !== SCHEMA_VERSION) {
        if (import.meta.env.DEV) console.warn('History schema version mismatch, clearing stored history');
        return [];
      }
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      if (import.meta.env.DEV) console.warn('Failed to load history from localStorage');
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(historia));
    localStorage.setItem(`${HISTORY_KEY}_v`, String(SCHEMA_VERSION));
  }, [historia]);

  const deleteFromHistory = (id: string) => {
    setHistoria(prev => prev.filter(h => h.id !== id));
  };

  return (
    <HistoryContext.Provider value={{ historia, setHistoria, deleteFromHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) throw new Error('useHistory must be used within HistoryProvider');
  return context;
};
