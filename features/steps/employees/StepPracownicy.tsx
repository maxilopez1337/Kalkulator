import React from 'react';
import { useEmployees, useCompany, useConfirm } from '../../../store/AppContext';
import { animations } from '../../../shared/config/theme';
import { useEmployeeActions } from '../../../hooks/useEmployeeActions';
import { pl } from '../../../shared/i18n/pl';
import { useEmployeeFiltering } from './hooks/useEmployeeFiltering';
import { useEmployeeSelection } from './hooks/useEmployeeSelection';
import { EmployeeToolbar } from './components/EmployeeToolbar';
import { EmployeeList } from './components/EmployeeList';
import { EmployeeDetailPanel } from './components/EmployeeDetailPanel';

interface Props {
  onImportClick: () => void;
}

export const StepPracownicy = ({ onImportClick }: Props) => {
  const { pracownicy } = useEmployees();
  const { config } = useCompany();
  const { confirmDialog } = useConfirm();
  const { addEmployee, removeEmployee, clearAllEmployees, duplicateEmployee, updateEmployee } =
    useEmployeeActions();

  const {
    searchQuery,
    setSearchQuery,
    filteredPracownicy,
    selectedIds,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
  } = useEmployeeFiltering(pracownicy);
  const { activeId, selectEmployee, deselectEmployee } = useEmployeeSelection();

  const activeEmployee = pracownicy.find((p) => p.id === activeId) ?? null;

  const handleBulkDelete = async (): Promise<void> => {
    if (
      await confirmDialog(pl.confirms.deleteSelectedEmployees(selectedIds.size), {
        variant: 'danger',
      })
    ) {
      const ids = Array.from(selectedIds);
      ids.forEach((id) => removeEmployee(id));
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
    <div
      className={`animate-in fade-in ${animations.quick} flex flex-col -mx-3 md:-mx-6 lg:-mx-8 -mt-3 md:-mt-6 lg:-mt-8 -mb-3 md:-mb-6 lg:-mb-8 h-[calc(100dvh-96px)]`}
    >
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

        <EmployeeDetailPanel
          activeId={activeId}
          activeEmployee={activeEmployee}
          onDeselect={deselectEmployee}
          onDuplicate={duplicateEmployee}
          onRemove={removeEmployee}
          onUpdate={updateEmployee}
          onConfirm={confirmDialog}
        />
      </div>
    </div>
  );
};
