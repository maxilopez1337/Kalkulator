
import React, { useState, useMemo } from 'react';
import { Database, Folder, FileText, Trash, Search, X, Calculator, Users, Wallet, Download } from '../../common/Icons';
import { ZapisanaKalkulacja } from '../../entities/history/model';
import { formatPLN } from '../../shared/utils/formatters';
import { useAppStore } from '../../store/AppContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoad?: () => void;
}

export const DatabaseModal = ({ isOpen, onClose, onLoad }: Props) => {
  const { historia, loadFromHistory, deleteFromHistory, generateOffer, generateExcelFromHistory } = useAppStore();
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

  const totalFilteredCount = Object.values(groupedHistory).reduce((acc, curr: any) => acc + curr.length, 0);

  if (!isOpen) return null;

  const handleLoad = (item: ZapisanaKalkulacja) => {
      const success = loadFromHistory(item);
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
    <div className="fixed inset-0 bg-slate-900/60 flex items-end md:items-center justify-center z-50 p-0 md:p-4 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div className="bg-white w-full md:max-w-6xl h-[100dvh] md:h-[85vh] flex flex-col shadow-2xl overflow-hidden md:rounded-xl" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between px-4 md:px-6 py-4 border-b border-slate-200 bg-white z-10 shrink-0 gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
             <div className="flex items-center gap-3 md:gap-4">
                 <div className="p-2 md:p-2.5 bg-indigo-50 text-indigo-700 rounded-lg">
                    <Database className="w-5 h-5 md:w-6 md:h-6" />
                 </div>
                 <div>
                    <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Baza Ofert</h2>
                    <div className="text-xs text-slate-500 hidden md:block">Historia kalkulacji i wygenerowanych propozycji</div>
                 </div>
             </div>
             {/* Mobile Close Button */}
             <button onClick={onClose} className="md:hidden w-8 h-8 flex items-center justify-center text-slate-400 bg-slate-100 rounded-full">
                <X className="w-5 h-5" />
             </button>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Search /></div>
                 <input 
                    type="text" 
                    placeholder="Szukaj po nazwie firmy..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                 />
              </div>
              {/* Desktop Close Button */}
              <button 
                onClick={onClose}
                className="hidden md:flex w-9 h-9 items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
              >
                <X />
              </button>
          </div>
        </div>
        
        {/* BODY (Split View / Mobile Flex Col) */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            
            {/* SIDEBAR (Timeline) - Horizontal scroll on mobile, vertical on desktop */}
            <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex-shrink-0 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto no-scrollbar">
                <div className="p-2 md:p-4 flex md:flex-col gap-2 min-w-max md:min-w-0">
                    <div className="hidden md:block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Oś czasu</div>
                    
                    <button
                        onClick={() => setSelectedMonth('ALL')}
                        className={`flex-shrink-0 flex items-center gap-2 md:justify-between px-3 py-2 text-xs md:text-sm font-medium rounded-lg transition-colors border md:border-transparent ${
                            selectedMonth === 'ALL' 
                            ? 'bg-white text-blue-700 shadow-sm border-slate-200 md:ring-1 md:ring-slate-200' 
                            : 'text-slate-600 hover:bg-slate-100 border-transparent'
                        }`}
                    >
                        <span>Wszystkie</span>
                        <span className="bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full">{historia.length}</span>
                    </button>
                    
                    {sortedMonths.map(monthKey => (
                        <button
                            key={monthKey}
                            onClick={() => setSelectedMonth(monthKey)}
                            className={`flex-shrink-0 flex items-center gap-2 md:justify-between px-3 py-2 text-xs md:text-sm font-medium rounded-lg transition-colors capitalize border md:border-transparent ${
                                selectedMonth === monthKey 
                                ? 'bg-white text-blue-700 shadow-sm border-slate-200 md:ring-1 md:ring-slate-200' 
                                : 'text-slate-600 hover:bg-slate-100 border-transparent'
                            }`}
                        >
                            <span>{formatMonthLabel(monthKey)}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedMonth === monthKey ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                                {groupedHistory[monthKey]?.length || 0}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* MAIN CONTENT (Grid) */}
            <div className="flex-1 bg-slate-100/50 p-4 md:p-6 overflow-y-auto custom-scrollbar">
                {totalFilteredCount === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Folder />
                        </div>
                        <p className="text-lg font-medium text-slate-600">Brak ofert</p>
                        <p className="text-sm">Zmień filtry wyszukiwania.</p>
                    </div>
                ) : (
                    <div className="space-y-6 md:space-y-8 pb-10">
                        {Object.keys(groupedHistory).map(monthKey => {
                            const items = groupedHistory[monthKey];
                            if (items.length === 0) return null;

                            return (
                                <div key={monthKey}>
                                    <h3 className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 md:mb-4 flex items-center gap-2 sticky top-0 bg-slate-100/95 backdrop-blur py-2 z-10 md:static md:bg-transparent">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                        {formatMonthLabel(monthKey)}
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                                        {items.map(item => (
                                            <div key={item.id} className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 flex flex-col overflow-hidden">
                                                
                                                {/* Card Header */}
                                                <div className="p-4 border-b border-slate-50 flex justify-between items-start bg-gradient-to-br from-white to-slate-50/50">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                                                            {item.nazwaFirmy.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-bold text-slate-900 text-sm md:text-base leading-tight truncate" title={item.nazwaFirmy}>
                                                                {item.nazwaFirmy || 'Bez nazwy'}
                                                            </div>
                                                            <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-1">
                                                                <span className="truncate max-w-[100px]">NIP: {item.dane.firma.nip || 'Brak'}</span>
                                                                <span className="text-slate-300">•</span>
                                                                <span>{new Date(item.dataUtworzenia).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <button 
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            if(window.confirm(`Usunąć ofertę dla ${item.nazwaFirmy}?`)) deleteFromHistory(item.id); 
                                                        }}
                                                        className="text-slate-300 hover:text-rose-500 p-1.5 hover:bg-rose-50 rounded transition-colors"
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Card Body - KPIs */}
                                                <div className="p-4 flex-1">
                                                    <div className="flex justify-between gap-4 mb-4">
                                                        <div className="space-y-0.5">
                                                            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pracownicy</div>
                                                            <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-sm">
                                                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                                                {item.liczbaPracownikow}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-0.5 text-right">
                                                            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Prowizja</div>
                                                            <div className="flex items-center justify-end gap-1.5 text-slate-700 font-semibold text-sm">
                                                                <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                                                                    {item.dane.prowizjaProc || 28}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 flex items-center justify-between">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-emerald-600 font-bold uppercase">Oszczędność Roczna</span>
                                                            <span className="text-base md:text-lg font-bold text-emerald-700 leading-none mt-0.5">
                                                                {formatPLN(item.oszczednoscRoczna)}
                                                            </span>
                                                        </div>
                                                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                                                            <Wallet className="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Card Footer - Actions */}
                                                <div className="p-2 bg-slate-50 border-t border-slate-200 grid grid-cols-3 gap-2">
                                                    <button 
                                                        onClick={() => handleLoad(item)}
                                                        className="flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs font-medium text-slate-600 hover:bg-white hover:text-blue-700 hover:shadow-sm transition-all active:scale-95"
                                                    >
                                                        <Calculator className="w-4 h-4 mb-1 opacity-70" />
                                                        Wczytaj
                                                    </button>
                                                    <button 
                                                        onClick={() => generateOffer(item)}
                                                        className="flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs font-medium text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all active:scale-95"
                                                    >
                                                        <FileText className="w-4 h-4 mb-1 opacity-70" />
                                                        PDF
                                                    </button>
                                                    <button 
                                                        onClick={() => generateExcelFromHistory(item)}
                                                        className="flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs font-medium text-slate-600 hover:bg-white hover:text-emerald-700 hover:shadow-sm transition-all active:scale-95"
                                                    >
                                                        <Download className="w-4 h-4 mb-1 opacity-70" />
                                                        Excel
                                                    </button>
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
