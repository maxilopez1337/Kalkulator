
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Pracownik } from '../entities/employee/model';

interface EmployeeContextType {
  pracownicy: Pracownik[];
  setPracownicy: React.Dispatch<React.SetStateAction<Pracownik[]>>;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const EmployeeProvider = ({ children }: { children?: ReactNode }) => {
  const [pracownicy, setPracownicy] = useState<Pracownik[]>(() => {
    const saved = localStorage.getItem('kalkulator_pracownicy');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { localStorage.setItem('kalkulator_pracownicy', JSON.stringify(pracownicy)); }, [pracownicy]);

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
