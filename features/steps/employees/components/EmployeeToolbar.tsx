
import React from 'react';
import { Users, Plus, Trash, FileText } from '../../../../shared/icons/Icons';
import { SearchInput } from '../../../../shared/ui/SearchInput';
import { ButtonPrimary, ButtonSecondary, ButtonDanger } from '../../../../shared/ui/Button';
import { pl } from '../../../../shared/i18n/pl';

interface EmployeeToolbarProps {
  totalCount: number;
  filteredCount: number;
  selectedIds: Set<number>;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAdd: () => void;
  onImportClick: () => void;
  onClearAll: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

export const EmployeeToolbar = ({
  totalCount,
  filteredCount,
  selectedIds,
  searchQuery,
  onSearchChange,
  onAdd,
  onImportClick,
  onClearAll,
  onBulkDelete,
  onClearSelection,
}: EmployeeToolbarProps) => (
  <div className="shrink-0 bg-white border-b border-[#edebe9] shadow-[0_1px_4px_rgba(0,0,0,0.08)] px-3 md:px-5 h-[52px] flex items-center justify-between gap-2 md:gap-4">
    {/* Left: identity */}
    <div className="flex items-center gap-2 md:gap-3 min-w-0">
      <div className="w-7 h-7 rounded-sm bg-[#eff6fc] flex items-center justify-center flex-shrink-0 text-[#0078d4]">
        <Users />
      </div>
      <span className="text-[13px] md:text-[14px] font-semibold text-[#201f1e] whitespace-nowrap hidden sm:inline">Ewidencja Pracowników</span>
      <span className="text-[11px] font-medium text-white bg-[#0078d4] rounded-full px-2 py-0.5 leading-none tabular-nums">
        {totalCount}
      </span>
      {totalCount !== filteredCount && (
        <span className="text-[11px] text-[#a19f9d] whitespace-nowrap hidden md:inline">
          ({filteredCount} widocznych)
        </span>
      )}
    </div>
    {/* Right: search + buttons */}
    <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
      <div className="w-36 sm:w-48 md:w-60">
        <SearchInput value={searchQuery} onChange={onSearchChange} placeholder="Szukaj..." />
      </div>
      <div className="w-px h-5 bg-[#edebe9] hidden sm:block" />
      {selectedIds.size > 0 ? (
        <>
          <ButtonDanger size="sm" icon={<Trash />} onClick={onBulkDelete}>
            <span className="hidden sm:inline">Usuń zaznaczone ({selectedIds.size})</span>
            <span className="sm:hidden">({selectedIds.size})</span>
          </ButtonDanger>
          <button
            onClick={onClearSelection}
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
          <ButtonPrimary size="sm" onClick={onAdd} icon={<Plus />}>
            <span className="hidden sm:inline">Nowy pracownik</span>
          </ButtonPrimary>
          <div className="w-px h-5 bg-[#edebe9] hidden md:block" />
          <ButtonDanger size="sm" icon={<Trash />} onClick={onClearAll} className="hidden md:flex">Wyczyść</ButtonDanger>
        </>
      )}
    </div>
  </div>
);
