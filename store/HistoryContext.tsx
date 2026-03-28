
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ZapisanaKalkulacja } from '../entities/history/model';
import { secureSetItem, secureGetItem } from '../shared/utils/storageEncryption';

interface HistoryContextType {
  historia: ZapisanaKalkulacja[];
  setHistoria: React.Dispatch<React.SetStateAction<ZapisanaKalkulacja[]>>;
  deleteFromHistory: (id: string) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

const SCHEMA_VERSION = 1;
const HISTORY_KEY = 'kalkulator_historia';

export const HistoryProvider = ({ children }: { children?: ReactNode }) => {
  const [historia, setHistoria] = useState<ZapisanaKalkulacja[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Async load from encrypted localStorage on mount
  useEffect(() => {
    async function load() {
      try {
        const saved = await secureGetItem(HISTORY_KEY);
        if (!saved) { setLoaded(true); return; }
        const storedVersion = await secureGetItem(`${HISTORY_KEY}_v`);
        if (storedVersion && Number(storedVersion) !== SCHEMA_VERSION) {
          if (import.meta.env.DEV) console.warn('History schema version mismatch, clearing stored history');
          setLoaded(true);
          return;
        }
        const parsed = JSON.parse(saved);
        setHistoria(Array.isArray(parsed) ? parsed : []);
      } catch {
        if (import.meta.env.DEV) console.warn('Failed to load history from localStorage');
      } finally {
        setLoaded(true);
      }
    }
    load();
  }, []);

  // Async persist to encrypted localStorage whenever historia changes (skip before load)
  useEffect(() => {
    if (!loaded) return;
    async function save() {
      await secureSetItem(HISTORY_KEY, JSON.stringify(historia));
      await secureSetItem(`${HISTORY_KEY}_v`, String(SCHEMA_VERSION));
    }
    save();
  }, [historia, loaded]);

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
