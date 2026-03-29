
import React from 'react';
import { Users, Plus, FileText, ChevronRight } from '../../../../shared/icons/Icons';
import { Avatar } from '../../../../shared/ui/Avatar';
import { ButtonPrimary, ButtonSecondary } from '../../../../shared/ui/Button';
import { ContractBadge } from '../../../../shared/ui/ContractBadge';
import { formatPLN } from '../../../../shared/utils/formatters';
import { obliczWiek, czyZwolnionyZFpFgsp } from '../../../../shared/utils/dates';
import { Pracownik } from '../../../../entities/employee/model';
import { Config } from '../../../../entities/company/model';

interface EmployeeListProps {
  pracownicy: Pracownik[];
  filteredPracownicy: Pracownik[];
  selectedIds: Set<number>;
  activeId: number | null;
  searchQuery: string;
  config: Config;
  onToggleSelection: (id: number) => void;
  onToggleSelectAll: () => void;
  onSelectEmployee: (id: number) => void;
  onClearSearch: () => void;
  onAdd: () => void;
  onImportClick: () => void;
  onClearSelection: () => void;
}

export const EmployeeList = ({
  pracownicy,
  filteredPracownicy,
  selectedIds,
  activeId,
  searchQuery,
  config,
  onToggleSelection,
  onToggleSelectAll,
  onSelectEmployee,
  onClearSearch,
  onAdd,
  onImportClick,
  onClearSelection,
}: EmployeeListProps) => (
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
            onChange={onToggleSelectAll}
          />
        </div>
        <span className="text-[10px] font-bold text-[#605e5c] uppercase tracking-widest pl-1">Pracownik</span>
        <span className="text-[10px] font-bold text-[#605e5c] uppercase tracking-widest text-right pr-1">Netto</span>
      </div>
    )}

    {/* Empty state (no employees at all) */}
    {pracownicy.length === 0 ? (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="w-12 h-12 bg-white border border-[#edebe9] rounded-sm flex items-center justify-center mb-3 text-[#a19f9d]">
          <Users />
        </div>
        <p className="text-[13px] font-semibold text-[#201f1e] mb-1">Brak pracowników</p>
        <p className="text-[12px] text-[#605e5c] mb-4">Dodaj ręcznie lub importuj z Excela.</p>
        <div className="flex flex-col gap-2 w-full">
          <ButtonSecondary onClick={onImportClick} icon={<FileText />}>Importuj Excel</ButtonSecondary>
          <ButtonPrimary onClick={onAdd} icon={<Plus />}>Dodaj ręcznie</ButtonPrimary>
        </div>
      </div>
    ) : (
      /* Scrollable rows */
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredPracownicy.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <p className="text-[13px] text-[#605e5c]">Brak wyników dla "<strong>{searchQuery}</strong>"</p>
            <button onClick={onClearSearch} className="mt-2 text-[12px] text-[#0078d4] hover:underline">Wyczyść filtr</button>
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
                onClick={() => onSelectEmployee(p.id)}
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
                    onChange={() => onToggleSelection(p.id)}
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
        <button onClick={onClearSelection} className="text-[11px] text-[#0078d4] hover:underline">
          Odznacz wszystkie
        </button>
      )}
    </div>
  </div>
);
