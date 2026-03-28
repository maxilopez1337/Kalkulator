
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Firma, Config } from '../entities/company/model';
import { DEFAULT_CONFIG } from '../features/tax-engine/constants';
import { secureSetItem, secureGetItem } from '../shared/utils/storageEncryption';

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
  opiekunNazwa: '',
  opiekunEmail: '',
  opiekunTelefon: '',
  okres: new Date().toISOString().slice(0, 7),
  stawkaWypadkowa: 1.67
};

export const CompanyProvider = ({ children }: { children?: ReactNode }) => {
  const [firma, setFirma] = useState<Firma>(DEFAULT_FIRMA_STATE);
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [loaded, setLoaded] = useState(false);

  // Async load from encrypted localStorage on mount
  useEffect(() => {
    async function load() {
      try {
        // Load firma
        const savedFirma = await secureGetItem('kalkulator_firma');
        if (savedFirma) {
          try {
            setFirma(JSON.parse(savedFirma));
          } catch {
            if (import.meta.env.DEV) console.warn('Failed to parse saved firma, using default');
          }
        }

        // Load config
        const savedConfig = await secureGetItem('kalkulator_config');
        if (savedConfig) {
          try {
            const parsed = JSON.parse(savedConfig);
            // Deep merge with DEFAULT_CONFIG to ensure structure integrity
            // minimalnaKwotaUZ zawsze pochodzi z DEFAULT_CONFIG (parametr systemowy)
            setConfig({
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
              },
              minimalnaKwotaUZ: DEFAULT_CONFIG.minimalnaKwotaUZ,
              swiadczenie: {
                ...DEFAULT_CONFIG.swiadczenie,
                ...(parsed.swiadczenie || {})
              },
              prowizja: {
                ...DEFAULT_CONFIG.prowizja,
                ...(parsed.prowizja || {})
              }
            });
          } catch (e) {
            if (import.meta.env.DEV) console.warn('Failed to parse saved config, falling back to default', e);
          }
        }
      } finally {
        setLoaded(true);
      }
    }
    load();
  }, []);

  // Async persist to encrypted localStorage whenever state changes (skip before load)
  useEffect(() => {
    if (!loaded) return;
    async function save() {
      await secureSetItem('kalkulator_firma', JSON.stringify(firma));
    }
    save();
  }, [firma, loaded]);

  useEffect(() => {
    if (!loaded) return;
    async function save() {
      await secureSetItem('kalkulator_config', JSON.stringify(config));
    }
    save();
  }, [config, loaded]);

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
