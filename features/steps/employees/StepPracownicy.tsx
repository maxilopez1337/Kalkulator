
import React, { useState, useRef, useEffect } from 'react';
import { Users, Copy, Trash, Check, X, ChevronLeft } from '../../../shared/icons/Icons';
import { Avatar } from '../../../shared/ui/Avatar';
import { FormField } from '../../../shared/ui/Layout';
import { ButtonSecondary, ButtonDanger } from '../../../shared/ui/Button';
import { ContractBadge } from '../../../shared/ui/ContractBadge';
import { Input, Select } from '../../../shared/ui/Input';
import { formatPLN } from '../../../shared/utils/formatters';
import { useEmployees, useCompany, useConfirm } from '../../../store/AppContext';
import { animations } from '../../../shared/config/theme';
import { useEmployeeActions } from '../../../hooks/useEmployeeActions';
import { pl } from '../../../shared/i18n/pl';
import { useEmployeeFiltering } from './hooks/useEmployeeFiltering';
import { useEmployeeSelection } from './hooks/useEmployeeSelection';
import { EmployeeToolbar } from './components/EmployeeToolbar';
import { EmployeeList } from './components/EmployeeList';

interface Props {
  onImportClick: () => void;
}

// Controlled numeric input that doesn't reformat while user is typing
const NettoInput = ({ value, onCommit, className }: { value: number; onCommit: (v: number) => void; className?: string }) => {
  const [localValue, setLocalValue] = useState(String(value));
  const isFocused = useRef(false);

  useEffect(() => {
    if (!isFocused.current) {
      setLocalValue(Number(value).toFixed(2));
    }
  }, [value]);

  return (
    <input
      type="text"
      inputMode="decimal"
      className={`${className ?? ''} w-full`}
      value={localValue}
      onFocus={() => {
        isFocused.current = true;
        setLocalValue(String(value));
      }}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => {
        isFocused.current = false;
        const parsed = parseFloat(localValue.replace(',', '.'));
        const safe = isNaN(parsed) ? 0 : parsed;
        onCommit(safe);
        setLocalValue(Number(safe).toFixed(2));
      }}
    />
  );
};

// ── D365 Section header ──────────────────────────────────────────────────────
const SectionHeader = ({ label }: { label: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="text-[10px] font-bold text-[#0078d4] uppercase tracking-widest whitespace-nowrap">{label}</span>
    <div className="flex-1 h-px bg-[#edebe9]" />
  </div>
);

export const StepPracownicy = ({ onImportClick }: Props) => {
  const { pracownicy } = useEmployees();
  const { config } = useCompany();
  const { confirmDialog } = useConfirm();
  const { addEmployee, removeEmployee, clearAllEmployees, duplicateEmployee, updateEmployee } = useEmployeeActions();

  const { searchQuery, setSearchQuery, filteredPracownicy, selectedIds, toggleSelection, toggleSelectAll, clearSelection } =
    useEmployeeFiltering(pracownicy);
  const { activeId, selectEmployee, deselectEmployee } = useEmployeeSelection();

  const activeEmployee = pracownicy.find(p => p.id === activeId) ?? null;

  const handleBulkDelete = async (): Promise<void> => {
    if (await confirmDialog(pl.confirms.deleteSelectedEmployees(selectedIds.size), { variant: 'danger' })) {
      const ids = Array.from(selectedIds);
      ids.forEach(id => removeEmployee(id));
      clearSelection();
      if (activeId !== null && ids.includes(activeId)) deselectEmployee();
    }
  };

  const handleClearAll = async () => {
    if (await confirmDialog(pl.confirms.clearAllEmployees, { variant: 'danger' })) {
      clearAllEmployees();
      clearSelection();
      deselectEmployee();
    }
  };

  return (
    <div className={`animate-in fade-in ${animations.quick} flex flex-col -mx-3 md:-mx-6 lg:-mx-8 -mt-3 md:-mt-6 lg:-mt-8 -mb-3 md:-mb-6 lg:-mb-8 h-[calc(100dvh-96px)]`}>

      <EmployeeToolbar
        totalCount={pracownicy.length}
        filteredCount={filteredPracownicy.length}
        selectedIds={selectedIds}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAdd={addEmployee}
        onImportClick={onImportClick}
        onClearAll={handleClearAll}
        onBulkDelete={handleBulkDelete}
        onClearSelection={clearSelection}
      />

      {/* ── BODY: LIST + DETAIL ───────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        <EmployeeList
          pracownicy={pracownicy}
          filteredPracownicy={filteredPracownicy}
          selectedIds={selectedIds}
          activeId={activeId}
          searchQuery={searchQuery}
          config={config}
          onToggleSelection={toggleSelection}
          onToggleSelectAll={toggleSelectAll}
          onSelectEmployee={selectEmployee}
          onClearSearch={() => setSearchQuery('')}
          onAdd={addEmployee}
          onImportClick={onImportClick}
          onClearSelection={clearSelection}
        />

        {/* ── DETAIL PANEL — full width on mobile, flex-1 on md+ ────────── */}
        <div className={[
          'flex-1 flex-col bg-[#faf9f8] overflow-hidden',
          activeId !== null ? 'flex' : 'hidden md:flex',
        ].join(' ')}>
          {activeEmployee === null ? (
            /* Placeholder when nothing selected */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none">
              <div className="w-16 h-16 rounded-sm bg-white border border-[#edebe9] flex items-center justify-center mb-4 text-[#c7c6c5]">
                <Users />
              </div>
              <p className="text-[14px] font-semibold text-[#201f1e] mb-1">Brak wybranego rekordu</p>
              <p className="text-[13px] text-[#a19f9d] max-w-xs">Kliknij pracownika na liście aby wyświetlić i edytować jego dane.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-150">

              {/* Detail header */}
              <div className="shrink-0 bg-white border-b border-[#edebe9] px-3 md:px-6 py-3 flex items-center justify-between gap-2 sm:gap-4">
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <button
                    onClick={deselectEmployee}
                    className="md:hidden flex items-center justify-center w-8 h-8 rounded-sm hover:bg-[#f3f2f1] text-[#605e5c] flex-shrink-0 transition-colors"
                    title="Wróć do listy"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <Avatar name={activeEmployee.imie} surname={activeEmployee.nazwisko} className="w-9 h-9 text-[13px] flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[15px] font-semibold text-[#201f1e] leading-tight truncate">
                      {activeEmployee.imie || '(Brak imienia)'} {activeEmployee.nazwisko}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <ContractBadge typUmowy={activeEmployee.typUmowy} />
                      <span className="text-[12px] text-[#605e5c] font-mono">{formatPLN(activeEmployee.nettoDocelowe)}</span>
                      {activeEmployee.trybSkladek !== 'PELNE' && (
                        <span className="text-[10px] bg-[#fff4ce] text-[#d47500] px-1.5 py-0.5 rounded-sm border border-[#fde5c4]">Specjalny tryb ZUS</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <ButtonSecondary size="sm" onClick={() => duplicateEmployee(activeEmployee.id)} icon={<Copy />} title="Duplikuj">
                    <span className="hidden sm:inline">Duplikuj</span>
                  </ButtonSecondary>
                  <ButtonDanger size="sm" icon={<Trash />} title="Usuń" onClick={async () => {
                    if (await confirmDialog(pl.confirms.deleteSelectedEmployees(1), { variant: 'danger' })) {
                      removeEmployee(activeEmployee.id);
                      deselectEmployee();
                    }
                  }}>
                    <span className="hidden sm:inline">Usuń</span>
                  </ButtonDanger>
                  <button
                    onClick={deselectEmployee}
                    className="ml-1 p-1.5 text-[#605e5c] hover:text-[#201f1e] hover:bg-[#f3f2f1] rounded-sm transition-colors"
                    title="Zamknij"
                  >
                    <X />
                  </button>
                </div>
              </div>

              {/* Scrollable form body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5">

                {/* Section 1: Dane Osobowe */}
                <SectionHeader label="Dane Osobowe" />
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-x-5 gap-y-3 mb-5">
                  <FormField label="Imię">
                    <Input value={activeEmployee.imie} onChange={(e) => updateEmployee(activeEmployee.id, 'imie', e.target.value)} />
                  </FormField>
                  <FormField label="Nazwisko">
                    <Input value={activeEmployee.nazwisko} onChange={(e) => updateEmployee(activeEmployee.id, 'nazwisko', e.target.value)} />
                  </FormField>
                  <FormField label="Data urodzenia">
                    <Input type="date" value={activeEmployee.dataUrodzenia} onChange={(e) => updateEmployee(activeEmployee.id, 'dataUrodzenia', e.target.value)} />
                  </FormField>
                  <FormField label="Płeć">
                    <Select value={activeEmployee.plec} onChange={(e) => updateEmployee(activeEmployee.id, 'plec', e.target.value)}>
                      <option value="M">Mężczyzna</option>
                      <option value="K">Kobieta</option>
                    </Select>
                  </FormField>
                </div>

                {/* Section 2: Parametry Umowy */}
                <SectionHeader label="Parametry Umowy" />
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-x-5 gap-y-3 mb-5">
                  <FormField label="Rodzaj umowy">
                    <Select value={activeEmployee.typUmowy} onChange={(e) => updateEmployee(activeEmployee.id, 'typUmowy', e.target.value)}>
                      <option value="UOP">Umowa o Pracę</option>
                      <option value="UZ">Umowa Zlecenie</option>
                    </Select>
                  </FormField>
                  <FormField label="Wynagrodzenie Netto">
                    <NettoInput
                      value={activeEmployee.nettoDocelowe}
                      onCommit={(v) => updateEmployee(activeEmployee.id, 'nettoDocelowe', v)}
                      className="font-semibold text-right border border-[#8a8886] rounded-sm px-3 py-2 text-sm bg-white focus:outline-none focus:border-2 focus:border-[#0078d4]"
                    />
                  </FormField>
                  <FormField label="Tryb ZUS">
                    <Select value={activeEmployee.trybSkladek} onChange={(e) => updateEmployee(activeEmployee.id, 'trybSkladek', e.target.value)}>
                      <option value="PELNE">Pełne składki</option>
                      <option value="BEZ_CHOROBOWEJ">Bez chorobowej</option>
                      <option value="STUDENT_UZ">Student &lt; 26 lat</option>
                      <option value="INNY_TYTUL">Inny tytuł (tylko zdrowotna)</option>
                      <option value="EMERYT_RENCISTA">Emeryt/Rencista</option>
                    </Select>
                  </FormField>
                  <FormField label="Koszty Uzyskania (KUP)">
                    <Select value={activeEmployee.kupTyp} onChange={(e) => updateEmployee(activeEmployee.id, 'kupTyp', e.target.value)}>
                      <option value="STANDARD">Standardowe (250 zł)</option>
                      <option value="PODWYZSZONE">Podwyższone (300 zł)</option>
                      <option value="PROC_20">Ryczałtowe 20%</option>
                      <option value="PROC_50">Autorskie 50%</option>
                    </Select>
                  </FormField>
                </div>

                {/* Section 3: Podatki i Ulgi */}
                <SectionHeader label="Podatki i Ulgi" />
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-x-5 gap-y-3">
                  <FormField label="Kwota wolna (PIT-2)">
                    <Select value={activeEmployee.pit2} onChange={(e) => updateEmployee(activeEmployee.id, 'pit2', e.target.value)}>
                      <option value="300">300 zł (1/12)</option>
                      <option value="150">150 zł (1/24)</option>
                      <option value="100">100 zł (1/36)</option>
                      <option value="0">Brak (0 zł)</option>
                    </Select>
                  </FormField>
                  <FormField label="Zaliczka PIT">
                    <Select value={activeEmployee.pitMode || 'AUTO'} onChange={(e) => updateEmployee(activeEmployee.id, 'pitMode', e.target.value)}>
                      <option value="AUTO">Automatycznie (Progi)</option>
                      <option value="FLAT_12">Liniowo 12%</option>
                      <option value="FLAT_32">Liniowo 32%</option>
                      <option value="FLAT_0">Zwolnienie (0%)</option>
                    </Select>
                  </FormField>
                  <div className="flex flex-col gap-3 pt-5">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none group/cb">
                      <div className={`w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 transition-colors text-white ${activeEmployee.ulgaMlodych ? 'bg-[#0078d4] border-[#0078d4]' : 'bg-white border-[#8a8886] group-hover/cb:border-[#0078d4]'}`}>
                        {activeEmployee.ulgaMlodych && <Check />}
                      </div>
                      <input type="checkbox" className="hidden" checked={activeEmployee.ulgaMlodych} onChange={(e) => updateEmployee(activeEmployee.id, 'ulgaMlodych', e.target.checked)} />
                      <span className="text-[13px] text-[#323130]">Ulga dla młodych (&lt;26)</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer select-none group/cb">
                      <div className={`w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 transition-colors text-white ${!activeEmployee.skladkaFP ? 'bg-[#107c10] border-[#107c10]' : 'bg-white border-[#8a8886] group-hover/cb:border-[#107c10]'}`}>
                        {!activeEmployee.skladkaFP && <Check />}
                      </div>
                      <input type="checkbox" className="hidden" checked={!activeEmployee.skladkaFP} onChange={(e) => updateEmployee(activeEmployee.id, 'skladkaFP', !e.target.checked)} />
                      <span className="text-[13px] text-[#323130]">Zwolnienie FP/FGŚP</span>
                    </label>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
