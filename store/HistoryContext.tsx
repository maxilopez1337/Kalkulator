
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ZapisanaKalkulacja } from '../entities/history/model';

interface HistoryContextType {
  historia: ZapisanaKalkulacja[];
  setHistoria: React.Dispatch<React.SetStateAction<ZapisanaKalkulacja[]>>;
  deleteFromHistory: (id: string) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider = ({ children }: { children?: ReactNode }) => {
  const [historia, setHistoria] = useState<ZapisanaKalkulacja[]>(() => {
    const saved = localStorage.getItem('kalkulator_historia');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { localStorage.setItem('kalkulator_historia', JSON.stringify(historia)); }, [historia]);

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
