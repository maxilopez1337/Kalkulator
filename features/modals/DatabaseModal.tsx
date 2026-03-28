
import React, { useState, useMemo } from 'react';
import { Database, Folder, Trash, X, Calculator, Users, Wallet, Download } from '../../shared/icons/Icons';
import { EmptyState } from '../../shared/ui/EmptyState';
import { ZapisanaKalkulacja } from '../../entities/history/model';
import { formatPLN } from '../../shared/utils/formatters';
import { Modal } from '../../shared/ui/Modal';
import { SectionLabel } from '../../shared/ui/SectionLabel';
import { SearchInput } from '../../shared/ui/SearchInput';
import { useAppStore, useConfirm } from '../../store/AppContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoad?: () => void;
}

export const DatabaseModal = ({ isOpen, onClose, onLoad }: Props) => {
  const { historia, loadFromHistory, deleteFromHistory, generateExcelFromHistory } = useAppStore();
  const { confirmDialog } = useConfirm();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string | 'ALL'>('ALL');

  // Group by Month (YYYY-MM)
  const { groupedHistory, sortedMonths } = useMemo(() => {
    const groups: Record<string, ZapisanaKalkulacja[]> = {};
    const monthsSet = new Set<string>();

    const sorted = [...historia].sort((a, b) => new Date(b.dataUtworzenia).getTime() - new Date(a.dataUtworzenia).getTime());

    sorted.forEach(item => {
      const date = new Date(item.dataUtworzenia);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
      monthsSet.add(key);

      // Filter by search
      if (searchQuery && !item.nazwaFirmy.toLowerCase().includes(searchQuery.toLowerCase())) return;
      
      // Filter by month selection
      if (selectedMonth !== 'ALL' && key !== selectedMonth) return;

      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    return { 
        groupedHistory: groups,
        sortedMonths: Array.from(monthsSet).sort().reverse() 
    };
  }, [historia, searchQuery, selectedMonth]);

  const totalFilteredCount = (Object.values(groupedHistory) as ZapisanaKalkulacja[][]).reduce((acc: number, curr) => acc + curr.length, 0);

  if (!isOpen) return null;

  const handleLoad = async (item: ZapisanaKalkulacja): Promise<void> => {
      const success = await loadFromHistory(item);
      if (success) {
          onClose();
          // Opóźnienie dla upewnienia się, że stan został zaktualizowany przed nawigacją
          setTimeout(() => {
              if (onLoad) onLoad();
          }, 100);
      }
  };

  const formatMonthLabel = (key: string) => {
      const [year, month] = key.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleString('pl-PL', { month: 'long', year: 'numeric' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md:max-w-[1360px]" height="md:h-[92vh]">
      <div className="flex flex-col h-full bg-[#faf9f8] overflow-hidden">

        {/* ── M365 COMMAND BAR ─────────────────────────────────────────────── */}
        <div className="flex flex-col px-4 md:px-6 py-3 md:py-3.5 border-b border-[#edebe9] bg-white shrink-0 gap-2">
          {/* Row 1: icon + title + close */}
          <div className="flex items-center gap-3">
            {/* Left: icon + title block */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-sm bg-[#0078d4] flex items-center justify-center flex-shrink-0 shadow-sm">
                <Database className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-[15px] md:text-[16px] font-semibold text-[#201f1e] leading-tight">Baza Ofert</h2>
                  <span className="text-[11px] text-[#a19f9d] font-medium">
                    {historia.length} {historia.length === 1 ? 'kalkulacja' : 'kalkulacji'}
                  </span>
                </div>
                <p className="hidden md:block text-[11px] text-[#a19f9d] leading-none mt-0.5">Historia kalkulacji i wygenerowanych propozycji</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-[#605e5c] hover:bg-[#f3f2f1] rounded-sm transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Row 2: search (always visible) */}
          <div className="w-full">
            <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Szukaj po nazwie firmy..." />
          </div>
        </div>

        {/* ── BODY ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">

          {/* LEFT NAV — timeline pivot: horizontal on mobile, vertical on desktop */}
          <div className="md:w-[200px] bg-white border-b md:border-b-0 md:border-r border-[#edebe9] shrink-0 overflow-x-auto md:overflow-y-auto">
            {/* Mobile: horizontal chip strip */}
            <div className="flex md:hidden flex-row gap-1 px-3 py-2">
              <button
                onClick={() => setSelectedMonth('ALL')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-full whitespace-nowrap transition-colors font-medium ${
                  selectedMonth === 'ALL' ? 'bg-[#0078d4] text-white' : 'bg-[#f3f2f1] text-[#605e5c]'
                }`}
              >
                Wszystkie
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  selectedMonth === 'ALL' ? 'bg-white/30 text-white' : 'bg-[#edebe9] text-[#605e5c]'
                }`}>{historia.length}</span>
              </button>
              {sortedMonths.map(monthKey => (
                <button
                  key={monthKey}
                  onClick={() => setSelectedMonth(monthKey)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-full whitespace-nowrap transition-colors font-medium capitalize ${
                    selectedMonth === monthKey ? 'bg-[#0078d4] text-white' : 'bg-[#f3f2f1] text-[#605e5c]'
                  }`}
                >
                  {formatMonthLabel(monthKey)}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    selectedMonth === monthKey ? 'bg-white/30 text-white' : 'bg-[#edebe9] text-[#605e5c]'
                  }`}>{groupedHistory[monthKey]?.length || 0}</span>
                </button>
              ))}
            </div>
            {/* Desktop: vertical nav */}
            <div className="hidden md:flex flex-col px-3 pt-4 pb-3 space-y-0.5">
              <p className="text-[10px] font-bold text-[#a19f9d] uppercase tracking-widest px-3 pb-2">Oś czasu</p>

              <button
                onClick={() => setSelectedMonth('ALL')}
                className={`flex items-center justify-between w-full px-3 py-2.5 text-[13px] rounded-sm transition-colors text-left ${
                  selectedMonth === 'ALL'
                    ? 'bg-[#deecf9] text-[#0078d4] font-semibold'
                    : 'text-[#323130] hover:bg-[#f3f2f1] font-normal'
                }`}
              >
                <span>Wszystkie</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center ${
                  selectedMonth === 'ALL' ? 'bg-[#0078d4] text-white' : 'bg-[#edebe9] text-[#605e5c]'
                }`}>{historia.length}</span>
              </button>

              {sortedMonths.map(monthKey => (
                <button
                  key={monthKey}
                  onClick={() => setSelectedMonth(monthKey)}
                  className={`flex items-center justify-between w-full px-3 py-2.5 text-[13px] rounded-sm transition-colors text-left capitalize ${
                    selectedMonth === monthKey
                      ? 'bg-[#deecf9] text-[#0078d4] font-semibold'
                      : 'text-[#323130] hover:bg-[#f3f2f1] font-normal'
                  }`}
                >
                  <span className="truncate">{formatMonthLabel(monthKey)}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center flex-shrink-0 ml-1 ${
                    selectedMonth === monthKey ? 'bg-[#0078d4] text-white' : 'bg-[#edebe9] text-[#605e5c]'
                  }`}>{groupedHistory[monthKey]?.length || 0}</span>
                </button>
              ))}
            </div> {/* end desktop nav */}
          </div>

          {/* MAIN CANVAS */}
          <div className="flex-1 bg-[#f3f2f1] overflow-y-auto custom-scrollbar">
            {totalFilteredCount === 0 ? (
              <div className="h-full flex items-center justify-center">
                <EmptyState
                  icon={<Folder />}
                  title="Brak ofert"
                  description="Zmień filtry lub dodaj nową kalkulację."
                />
              </div>
            ) : (
              <div className="p-5 space-y-6 pb-10">
                {Object.keys(groupedHistory).map(monthKey => {
                  const items = groupedHistory[monthKey];
                  if (items.length === 0) return null;

                  return (
                    <div key={monthKey}>
                      {/* Month section header */}
                      <div className="flex items-center gap-3 mb-4 sticky top-0 bg-[#f3f2f1] py-1.5 z-10">
                        <span className="text-[11px] font-bold text-[#605e5c] uppercase tracking-widest capitalize">
                          {formatMonthLabel(monthKey)}
                        </span>
                        <div className="flex-1 h-px bg-[#edebe9]" />
                        <span className="text-[11px] text-[#a19f9d]">{items.length} {items.length === 1 ? 'oferta' : 'ofert'}</span>
                      </div>

                      {/* Cards grid — auto-fill to use all horizontal space */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                        {items.map(item => {
                          const uzCount = item.dane.pracownicy.filter(p => p.typUmowy === 'UZ').length;
                          const uopCount = item.dane.pracownicy.filter(p => p.typUmowy === 'UOP').length;
                          const miesieczna = item.oszczednoscRoczna / 12;

                          return (
                            <div
                              key={item.id}
                              className="bg-white border border-[#edebe9] rounded-sm hover:border-[#0078d4] hover:shadow-[0_4px_16px_rgba(0,120,212,0.12)] transition-all duration-150 flex flex-col overflow-hidden group"
                            >
                              {/* Top accent stripe */}
                              <div className="h-[3px] bg-[#0078d4] flex-shrink-0" />

                              {/* Card header */}
                              <div className="px-4 pt-3 pb-2.5 flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2.5 min-w-0">
                                  <div className="w-9 h-9 rounded-sm bg-[#0078d4] text-white flex items-center justify-center font-bold text-[13px] flex-shrink-0 select-none">
                                    {item.nazwaFirmy.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-semibold text-[#201f1e] text-[13px] leading-snug truncate" title={item.nazwaFirmy}>
                                      {item.nazwaFirmy || 'Bez nazwy'}
                                    </div>
                                    <div className="text-[11px] text-[#605e5c] mt-0.5 flex items-center gap-1 flex-wrap leading-none">
                                      <span className="truncate max-w-[90px]">NIP: {item.dane.firma.nip || '—'}</span>
                                      <span className="text-[#c8c6c4]">·</span>
                                      <span className="whitespace-nowrap">{new Date(item.dataUtworzenia).toLocaleDateString('pl-PL')}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                      {item.dane.firma.okres && (
                                        <span className="bg-[#deecf9] text-[#0078d4] px-1.5 py-0.5 rounded text-[10px] font-semibold">{item.dane.firma.okres}</span>
                                      )}
                                      {item.dane.firma.opiekunNazwa && (
                                        <span className="text-[10px] text-[#a19f9d] truncate max-w-[100px]" title={item.dane.firma.opiekunNazwa}>
                                          {item.dane.firma.opiekunNazwa}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={async (e) => { e.stopPropagation(); if (await confirmDialog(`Usunąć ofertę dla ${item.nazwaFirmy}?`)) deleteFromHistory(item.id); }}
                                  className="text-[#c8c6c4] hover:text-[#d83b01] hover:bg-[#fde7e2] p-1.5 rounded-sm transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                                  title="Usuń"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="mx-4 border-t border-[#f3f2f1]" />

                              {/* KPIs row */}
                              <div className="px-4 py-2.5 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-[12px] text-[#323130]">
                                  <Users className="w-3.5 h-3.5 text-[#a19f9d]" />
                                  <span className="font-semibold">{item.liczbaPracownikow}</span>
                                  <span className="text-[#a19f9d] text-[11px]">prac.</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {uopCount > 0 && (
                                    <span className="text-[10px] bg-[#f3f2f1] text-[#605e5c] px-1.5 py-0.5 rounded font-semibold">UoP·{uopCount}</span>
                                  )}
                                  {uzCount > 0 && (
                                    <span className="text-[10px] bg-[#deecf9] text-[#0078d4] px-1.5 py-0.5 rounded font-semibold">UZ·{uzCount}</span>
                                  )}
                                  <span className="text-[10px] bg-[#f3f2f1] text-[#605e5c] px-1.5 py-0.5 rounded font-semibold ml-1">{item.dane.prowizjaProc ?? '—'}%</span>
                                </div>
                              </div>

                              {/* Savings highlight */}
                              <div className="mx-4 mb-3 bg-[#e6f3e6] rounded-sm px-3 py-2.5 flex items-center justify-between flex-1">
                                <div>
                                  <p className="text-[9px] font-bold text-[#107c10] uppercase tracking-widest mb-0.5">Oszczędność Roczna</p>
                                  <p className="text-[16px] font-bold text-[#107c10] leading-tight">{formatPLN(item.oszczednoscRoczna)}</p>
                                  <p className="text-[10px] text-[#107c10] opacity-70 mt-0.5">{formatPLN(miesieczna)}/mies.</p>
                                </div>
                                <Wallet className="w-5 h-5 text-[#107c10] opacity-40 flex-shrink-0" />
                              </div>

                              {/* Footer actions */}
                              <div className="border-t border-[#edebe9] flex mt-auto shrink-0">
                                <button
                                  onClick={() => handleLoad(item)}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-semibold text-[#0078d4] hover:bg-[#deecf9] transition-colors border-r border-[#edebe9]"
                                >
                                  <Calculator className="w-3.5 h-3.5" />
                                  Wczytaj
                                </button>
                                <button
                                  onClick={() => generateExcelFromHistory(item)}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-semibold text-[#107c10] hover:bg-[#e6f3e6] transition-colors"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Excel
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── STATUS BAR ───────────────────────────────────────────────────── */}
        <div className="shrink-0 bg-white border-t border-[#edebe9] px-6 py-1.5 flex items-center justify-between">
          <span className="text-[11px] text-[#a19f9d]">
            {totalFilteredCount > 0
              ? `${totalFilteredCount} ${totalFilteredCount === 1 ? 'oferta' : 'ofert'}${searchQuery ? ` · filtr: "${searchQuery}"` : ''}`
              : 'Brak wyników'}
          </span>
          <span className="text-[11px] text-[#a19f9d]">Stratton Prime · Baza Ofert</span>
        </div>

      </div>
    </Modal>
  );
};