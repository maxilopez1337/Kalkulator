
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Firma, Config } from '../entities/company/model';
import { DEFAULT_CONFIG } from '../features/tax-engine/constants';

interface CompanyContextType {
  firma: Firma;
  setFirma: React.Dispatch<React.SetStateAction<Firma>>;
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const DEFAULT_FIRMA_STATE: Firma = {
  nazwa: '',
  nip: '',
  adres: '',
  kodPocztowy: '',
  miasto: '',
  email: '',
  telefon: '',
  osobaKontaktowa: '',
  okres: new Date().toISOString().slice(0, 7),
  stawkaWypadkowa: 1.67
};

export const CompanyProvider = ({ children }: { children?: ReactNode }) => {
  const [firma, setFirma] = useState<Firma>(() => {
    const saved = localStorage.getItem('kalkulator_firma');
    return saved ? JSON.parse(saved) : DEFAULT_FIRMA_STATE;
  });

  const [config, setConfig] = useState<Config>(() => {
    const saved = localStorage.getItem('kalkulator_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Deep merge with DEFAULT_CONFIG to ensure structure integrity
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          zus: {
            ...DEFAULT_CONFIG.zus,
            ...(parsed.zus || {}),
            uop: {
              ...DEFAULT_CONFIG.zus.uop,
              ...(parsed.zus?.uop || {})
            },
            uz: {
              ...DEFAULT_CONFIG.zus.uz,
              ...(parsed.zus?.uz || {})
            }
          },
          pit: {
            ...DEFAULT_CONFIG.pit,
            ...(parsed.pit || {})
          }
        };
      } catch (e) {
        console.warn('Failed to parse saved config, falling back to default', e);
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  });

  useEffect(() => { localStorage.setItem('kalkulator_firma', JSON.stringify(firma)); }, [firma]);
  useEffect(() => { localStorage.setItem('kalkulator_config', JSON.stringify(config)); }, [config]);

  return (
    <CompanyContext.Provider value={{ firma, setFirma, config, setConfig }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) throw new Error('useCompany must be used within CompanyProvider');
  return context;
};
