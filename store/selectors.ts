// Granular selectors for individual contexts.
// Use these instead of useAppStore() to avoid unnecessary re-renders
// when unrelated context values change.
//
// useAppStore() is intentionally left intact for backward compatibility.

import { useCompany } from './CompanyContext';
import { useEmployees } from './EmployeeContext';
import { useCalculation } from './CalculationContext';
import { useHistory } from './HistoryContext';
import { useNotification } from './NotificationContext';

// --- Company ---
// Exposes: firma, setFirma, config, setConfig
export const useCompanySelector = () => {
  const { firma, setFirma, config, setConfig } = useCompany();
  return { firma, setFirma, config, setConfig };
};

// --- Employees ---
// Exposes: pracownicy, setPracownicy
export const useEmployeesSelector = () => {
  const { pracownicy, setPracownicy } = useEmployees();
  return { pracownicy, setPracownicy };
};

// --- Calculation ---
// Exposes: wyniki, prowizjaProc, setProwizjaProc, comparisonState, setComparisonState
export const useCalculationSelector = () => {
  const { wyniki, prowizjaProc, setProwizjaProc, comparisonState, setComparisonState } =
    useCalculation();
  return { wyniki, prowizjaProc, setProwizjaProc, comparisonState, setComparisonState };
};

// --- History ---
// Exposes: historia, setHistoria, deleteFromHistory
export const useHistorySelector = () => {
  const { historia, setHistoria, deleteFromHistory } = useHistory();
  return { historia, setHistoria, deleteFromHistory };
};

// --- Notifications ---
// Exposes: notification, notify, clearNotification
export const useNotificationSelector = () => {
  const { notification, notify, clearNotification } = useNotification();
  return { notification, notify, clearNotification };
};
