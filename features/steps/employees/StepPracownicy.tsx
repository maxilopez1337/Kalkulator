
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Users, Plus, Copy, Trash, FileText, Check, X, ChevronRight } from '../../../common/Icons';
import { Avatar } from '../../../shared/ui/Avatar';
import { FormField } from '../../../shared/ui/Layout';
import { SearchInput } from '../../../shared/ui/SearchInput';
import { ButtonPrimary, ButtonSecondary, ButtonDanger } from '../../../shared/ui/Button';
import { ContractBadge } from '../../../shared/ui/ContractBadge';
import { Input, Select } from '../../../shared/ui/Input';
import { formatPLN } from '../../../shared/utils/formatters';
import { obliczWiek, czyZwolnionyZFpFgsp } from '../../../shared/utils/dates';
import { useEmployees, useCompany, useConfirm } from '../../../store/AppContext';
import { useEmployeeActions } from '../../../hooks/useEmployeeActions';
import { pl } from '../../../shared/i18n/pl';

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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [activeId, setActiveId] = useState<number | null>(null);

  // --- ACTIONS ---

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredPracownicy.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPracownicy.map(p => p.id)));
    }
  };

  const handleBulkDelete = async (): Promise<void> => {
    if (await confirmDialog(pl.confirms.deleteSelectedEmployees(selectedIds.size), { variant: 'danger' })) {
      const ids = Array.from(selectedIds);
      ids.forEach(id => removeEmployee(id));
      setSelectedIds(new Set());
      if (activeId !== null && ids.includes(activeId)) setActiveId(null);
    }
  };

  const filteredPracownicy = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return pracownicy.filter(p =>
      p.imie.toLowerCase().includes(q) ||
      p.nazwisko.toLowerCase().includes(q) ||
      p.typUmowy.toLowerCase().includes(q)
    );
  }, [pracownicy, searchQuery]);

  const activeEmployee = pracownicy.find(p => p.id === activeId) ?? null;

  return (
    <div className="animate-in fade-in duration-200 flex flex-col -mx-3 md:-mx-6 lg:-mx-8 -mt-3 md:-mt-6 lg:-mt-8 -mb-3 md:-mb-6 lg:-mb-8 h-[calc(100dvh-96px)]">

      {/* ── COMMAND BAR ───────────────────────────────────────────────────── */}
      <div className="shrink-0 bg-white border-b border-[#edebe9] shadow-[0_1px_4px_rgba(0,0,0,0.08)] px-3 md:px-5 h-[52px] flex items-center justify-between gap-2 md:gap-4">
        {/* Left: identity */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="w-7 h-7 rounded-sm bg-[#eff6fc] flex items-center justify-center flex-shrink-0 text-[#0078d4]">
            <Users />
          </div>
          <span className="text-[13px] md:text-[14px] font-semibold text-[#201f1e] whitespace-nowrap hidden sm:inline">Ewidencja Pracowników</span>
          <span className="text-[11px] font-medium text-white bg-[#0078d4] rounded-full px-2 py-0.5 leading-none tabular-nums">
            {pracownicy.length}
          </span>
          {pracownicy.length !== filteredPracownicy.length && (
            <span className="text-[11px] text-[#a19f9d] whitespace-nowrap hidden md:inline">
              ({filteredPracownicy.length} widocznych)
            </span>
          )}
        </div>
        {/* Right: search + buttons */}
        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
          <div className="w-36 sm:w-48 md:w-60">
            <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Szukaj..." />
          </div>
          <div className="w-px h-5 bg-[#edebe9] hidden sm:block" />
          {selectedIds.size > 0 ? (
            <>
              <ButtonDanger size="sm" icon={<Trash />} onClick={handleBulkDelete}>
                <span className="hidden sm:inline">Usuń zaznaczone ({selectedIds.size})</span>
                <span className="sm:hidden">({selectedIds.size})</span>
              </ButtonDanger>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-[12px] text-[#0078d4] hover:underline px-1 hidden sm:inline"
              >
                Odznacz
              </button>
            </>
          ) : (
            <>
              <ButtonSecondary size="sm" onClick={onImportClick} icon={<FileText />}>
                <span className="hidden md:inline">Importuj</span>
              </ButtonSecondary>
              <ButtonPrimary size="sm" onClick={() => addEmployee()} icon={<Plus />}>
                <span className="hidden sm:inline">Nowy pracownik</span>
              </ButtonPrimary>
              <div className="w-px h-5 bg-[#edebe9] hidden md:block" />
              <ButtonDanger size="sm" icon={<Trash />} onClick={async () => {
                if (await confirmDialog(pl.confirms.clearAllEmployees, { variant: 'danger' })) {
                  clearAllEmployees();
                  setSelectedIds(new Set());
                  setActiveId(null);
                }
              }} className="hidden md:flex">Wyczyść</ButtonDanger>
            </>
          )}
        </div>
      </div>

      {/* ── BODY: LIST + DETAIL ───────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── LIST PANEL — full width on mobile, fixed on md+ ─────────────── */}
        {/* On mobile: show list when no active employee, hide when detail open */}
        <div className={[
          'flex flex-col bg-white border-r border-[#edebe9] shrink-0',
          'w-full md:w-[360px] xl:w-[420px]',
          activeId !== null ? 'hidden md:flex' : 'flex',
        ].join(' ')}>

          {/* Column headers */}
          {pracownicy.length > 0 && (
            <div className="shrink-0 grid grid-cols-[28px_1fr_100px] bg-[#f3f2f1] border-b border-[#edebe9] px-3 py-1.5 items-center">
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  className="cursor-pointer accent-[#0078d4]"
                  checked={selectedIds.size === filteredPracownicy.length && filteredPracownicy.length > 0}
                  onChange={toggleSelectAll}
                />
              </div>
              <span className="text-[10px] font-bold text-[#605e5c] uppercase tracking-widest pl-1">Pracownik</span>
              <span className="text-[10px] font-bold text-[#605e5c] uppercase tracking-widest text-right pr-1">Netto</span>
            </div>
          )}

          {/* Empty state (no employees at all) */}
          {pracownicy.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="w-12 h-12 bg-[#f3f2f1] rounded-full flex items-center justify-center mb-3 text-[#a19f9d]">
                <Users />
              </div>
              <p className="text-[13px] font-semibold text-[#201f1e] mb-1">Brak pracowników</p>
              <p className="text-[12px] text-[#605e5c] mb-4">Dodaj ręcznie lub importuj z Excela.</p>
              <div className="flex flex-col gap-2 w-full">
                <ButtonSecondary onClick={onImportClick} icon={<FileText />}>Importuj Excel</ButtonSecondary>
                <ButtonPrimary onClick={() => addEmployee()} icon={<Plus />}>Dodaj ręcznie</ButtonPrimary>
              </div>
            </div>
          ) : (
            /* Scrollable rows */
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredPracownicy.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <p className="text-[13px] text-[#605e5c]">Brak wyników dla "<strong>{searchQuery}</strong>"</p>
                  <button onClick={() => setSearchQuery('')} className="mt-2 text-[12px] text-[#0078d4] hover:underline">Wyczyść filtr</button>
                </div>
              ) : (
                filteredPracownicy.map((p) => {
                  const isActive = activeId === p.id;
                  const isSelected = selectedIds.has(p.id);
                  const wiek = obliczWiek(p.dataUrodzenia);
                  const zwolniony = czyZwolnionyZFpFgsp(p.dataUrodzenia, p.plec, config);

                  return (
                    <div
                      key={p.id}
                      onClick={() => setActiveId(prev => prev === p.id ? null : p.id)}
                      className={[
                        'group grid grid-cols-[28px_1fr_100px] px-3 py-2 items-center cursor-pointer border-b border-[#edebe9] border-l-[3px] transition-colors',
                        isActive
                          ? 'bg-[#eff6fc] border-l-[#0078d4]'
                          : isSelected
                          ? 'bg-[#faf9f8] border-l-[#c7e0f4] hover:bg-[#f0f6fd]'
                          : 'bg-white border-l-transparent hover:bg-[#f5f4f3]',
                      ].join(' ')}
                    >
                      {/* Checkbox */}
                      <div className="flex justify-center" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="cursor-pointer accent-[#0078d4]"
                          checked={isSelected}
                          onChange={() => toggleSelection(p.id)}
                        />
                      </div>

                      {/* Name + meta */}
                      <div className="flex items-center gap-2 min-w-0 pl-1">
                        <Avatar name={p.imie} surname={p.nazwisko} className="w-7 h-7 text-[11px] flex-shrink-0" />
                        <div className="min-w-0">
                          <div className={`text-[13px] font-semibold leading-tight truncate transition-colors ${isActive ? 'text-[#0078d4]' : 'text-[#201f1e] group-hover:text-[#0078d4]'}`}>
                            {p.imie || '(Brak imienia)'} {p.nazwisko}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <ContractBadge typUmowy={p.typUmowy} />
                            {wiek > 0 && <span className="text-[10px] text-[#a19f9d]">{wiek} lat · {p.plec}</span>}
                            {zwolniony && <span className="text-[10px] text-[#107c10] font-bold">Zw.FP</span>}
                            {p.trybSkladek !== 'PELNE' && (
                              <span className="text-[10px] bg-[#fff4ce] text-[#d47500] px-1 rounded-sm">spec.</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Netto + chevron */}
                      <div className="flex items-center justify-end gap-1">
                        <span className="font-mono text-[12px] font-semibold text-[#201f1e] tabular-nums text-right">
                          {formatPLN(p.nettoDocelowe)}
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${isActive ? 'text-[#0078d4]' : 'text-[#c7c6c5]'}`} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Status bar */}
          <div className="shrink-0 bg-[#f3f2f1] border-t border-[#edebe9] px-3 py-1.5 flex items-center justify-between">
            <span className="text-[11px] text-[#605e5c]">
              {selectedIds.size > 0
                ? `${selectedIds.size} z ${filteredPracownicy.length} zaznaczonych`
                : `${filteredPracownicy.length} rekordów${pracownicy.length !== filteredPracownicy.length ? ` · filtr aktywny` : ''}`
              }
            </span>
            {selectedIds.size > 0 && (
              <button onClick={() => setSelectedIds(new Set())} className="text-[11px] text-[#0078d4] hover:underline">
                Odznacz wszystkie
              </button>
            )}
          </div>
        </div>

        {/* ── DETAIL PANEL — full width on mobile, flex-1 on md+ ────────── */}
        {/* On mobile: show detail only when active employee is selected */}
        <div className={[
          'flex-1 flex-col bg-[#faf9f8] overflow-hidden',
          activeId !== null ? 'flex' : 'hidden md:flex',
        ].join(' ')}>
          {activeEmployee === null ? (
            /* Placeholder when nothing selected */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none">
              <div className="w-16 h-16 rounded-full bg-[#f3f2f1] flex items-center justify-center mb-4 text-[#c7c6c5]">
                <Users />
              </div>
              <p className="text-[14px] font-semibold text-[#201f1e] mb-1">Brak wybranego rekordu</p>
              <p className="text-[13px] text-[#a19f9d] max-w-xs">Kliknij pracownika na liście aby wyświetlić i edytować jego dane.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-150">

              {/* Detail header */}
              <div className="shrink-0 bg-white border-b border-[#edebe9] px-3 md:px-6 py-3 flex items-center justify-between gap-2 sm:gap-4">
                {/* Mobile back button */}
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <button
                    onClick={() => setActiveId(null)}
                    className="md:hidden flex items-center justify-center w-8 h-8 rounded-sm hover:bg-[#f3f2f1] text-[#605e5c] flex-shrink-0 transition-colors"
                    title="Wróć do listy"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
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
                      setActiveId(null);
                    }
                  }}>
                    <span className="hidden sm:inline">Usuń</span>
                  </ButtonDanger>
                  <button
                    onClick={() => setActiveId(null)}
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
