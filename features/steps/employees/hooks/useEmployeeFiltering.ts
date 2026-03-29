
import { useState, useMemo } from 'react';
import { Pracownik } from '../../../../entities/employee/model';

export const useEmployeeFiltering = (pracownicy: Pracownik[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const filteredPracownicy = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return pracownicy.filter(p =>
      p.imie.toLowerCase().includes(q) ||
      p.nazwisko.toLowerCase().includes(q) ||
      p.typUmowy.toLowerCase().includes(q)
    );
  }, [pracownicy, searchQuery]);

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

  const clearSelection = () => setSelectedIds(new Set());

  return {
    searchQuery,
    setSearchQuery,
    filteredPracownicy,
    selectedIds,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
  };
};
