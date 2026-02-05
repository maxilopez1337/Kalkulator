
import React, { useState, useMemo } from 'react';
import { Users, Plus, Copy, Trash, ChevronDown, ChevronUp, Search, X, List, Filter, FileText, Check } from '../../../common/Icons';
import { FormField } from '../../../shared/ui/Layout';
import { ButtonPrimary, ButtonSecondary, ButtonDanger } from '../../../shared/ui/Button';
import { Badge } from '../../../shared/ui/Badge';
import { Input, Select } from '../../../shared/ui/Input';
import { formatPLN } from '../../../shared/utils/formatters';
import { obliczWiek, czyZwolnionyZFpFgsp } from '../../../shared/utils/dates';
import { useAppStore } from '../../../store/AppContext';
import { useEmployeeActions } from '../../../hooks/useEmployeeActions';
import { theme } from '../../../common/theme';

interface Props {
  onImportClick: () => void;
}

// Avatar Component (Initials)
const UserAvatar = ({ name, surname }: { name: string, surname: string }) => {
    const initials = `${name?.[0] || ''}${surname?.[0] || ''}`.toUpperCase();
    const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-amber-600', 'bg-rose-600', 'bg-indigo-600'];
    // Simple hash for consistent color
    const colorIndex = (name.length + surname.length) % colors.length;
    
    return (
        <div className={`w-10 h-10 md:w-8 md:h-8 rounded-full ${colors[colorIndex]} text-white flex items-center justify-center text-xs font-bold tracking-wide border-2 border-white shadow-sm flex-shrink-0`}>
            {initials || '?'}
        </div>
    );
};

export const StepPracownicy = ({ onImportClick }: Props) => {
  const { pracownicy, config } = useAppStore();
  const { addEmployee, removeEmployee, removeAllEmployees, clearAllEmployees, duplicateEmployee, updateEmployee } = useEmployeeActions();
  
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // --- ACTIONS ---

  const toggleExpand = (id: number) => {
      setExpandedIds(prev => ({...prev, [id]: !prev[id]}));
  };

  const toggleSelection = (id: number) => {
      setSelectedIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(id)) newSet.delete(id);
          else newSet.add(id);
          return newSet;
      });
  };

  const toggleSelectAll = () => {
      if (selectedIds.size === filteredPracownicy.length) {
          setSelectedIds(new Set());
      } else {
          setSelectedIds(new Set(filteredPracownicy.map(p => p.id)));
      }
  };

  const handleBulkDelete = () => {
      if (confirm(`Czy usunąć zaznaczonych pracowników (${selectedIds.size})?`)) {
          const idsToRemove = Array.from(selectedIds);
          idsToRemove.forEach(id => removeEmployee(id));
          setSelectedIds(new Set());
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

  // --- RENDERERS ---

  const renderEmptyState = () => (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-dashed border-slate-300 rounded-md">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <Users />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Brak pracowników w ewidencji</h3>
          <p className="text-sm text-slate-500 max-w-md mb-6">
              Dodaj pracowników ręcznie lub zaimportuj listę z Excela, aby rozpocząć kalkulację optymalizacji.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <ButtonSecondary onClick={onImportClick} icon={<FileText />} fullWidth>Importuj Excel</ButtonSecondary>
              <ButtonPrimary onClick={addEmployee} icon={<Plus />} fullWidth>Dodaj ręcznie</ButtonPrimary>
          </div>
      </div>
  );

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 flex flex-col gap-6">
        
        {/* TOP COMMAND BAR */}
        <div className="bg-white border border-[#edebe9] rounded-md shadow-sm p-3 flex flex-col md:flex-row gap-4 md:items-center justify-between sticky top-0 md:top-[50px] z-20">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 flex-1">
                <div className="relative w-full max-w-full md:max-w-md">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Search /></div>
                    <input 
                        type="text" 
                        placeholder="Szukaj (Imię, Nazwisko, Umowa)..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-sm outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4] transition-all"
                    />
                    {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X /></button>}
                </div>
                <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>
                <div className="text-xs text-slate-500 font-medium hidden md:block whitespace-nowrap">
                    {filteredPracownicy.length} rekordów
                </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                {selectedIds.size > 0 ? (
                    <ButtonDanger size="sm" icon={<Trash />} onClick={handleBulkDelete} className="whitespace-nowrap">
                        Usuń wybrane ({selectedIds.size})
                    </ButtonDanger>
                ) : (
                    <>
                        <ButtonSecondary size="sm" onClick={onImportClick} icon={<FileText />} className="whitespace-nowrap">Importuj</ButtonSecondary>
                        <ButtonPrimary size="sm" onClick={() => addEmployee()} icon={<Plus />} className="whitespace-nowrap">Nowy Pracownik</ButtonPrimary>
                        <ButtonDanger
                            size="sm"
                            icon={<Trash />}
                            className="whitespace-nowrap border border-red-300 ml-2"
                            onClick={() => {
                                if (window.confirm('Czy na pewno wyczyścić całą listę pracowników?')) {
                                    clearAllEmployees();
                                    setSelectedIds(new Set());
                                }
                            }}
                        >
                            Wyczyść całą listę
                        </ButtonDanger>
                    </>
                )}
            </div>
        </div>

        {/* CONTENT AREA */}
        {pracownicy.length === 0 ? renderEmptyState() : (
            <div className="bg-white border border-[#edebe9] rounded-md shadow-sm overflow-hidden flex flex-col">
                
                {/* --- DESKTOP TABLE VIEW (Visible only on MD+) --- */}
                <div className="hidden md:block w-full overflow-x-auto">
                    <div className="min-w-[900px] grid grid-cols-[40px_minmax(200px,1.5fr)_1fr_1fr_1fr_100px] gap-4 px-4 py-3 bg-[#f8f9fa] border-b border-[#edebe9] text-xs font-semibold text-slate-600 uppercase tracking-tight">
                        <div className="flex justify-center items-center">
                            <input type="checkbox" className="cursor-pointer" checked={selectedIds.size === filteredPracownicy.length && filteredPracownicy.length > 0} onChange={toggleSelectAll} />
                        </div>
                        <div>Pracownik</div>
                        <div>Umowa / Status</div>
                        <div className="text-right">Netto Docelowe</div>
                        <div className="text-center">Wiek / Płeć</div>
                        <div className="text-right">Akcje</div>
                    </div>
                </div>

                {/* --- ROWS (Responsive) --- */}
                <div className="divide-y divide-[#edebe9]">
                    {filteredPracownicy.map((p) => {
                        const isExpanded = expandedIds[p.id];
                        const isSelected = selectedIds.has(p.id);
                        const wiek = obliczWiek(p.dataUrodzenia);
                        const zwolniony = czyZwolnionyZFpFgsp(p.dataUrodzenia, p.plec, config);

                        return (
                            <div key={p.id} className={`group transition-all ${isExpanded ? 'bg-slate-50' : 'bg-white hover:bg-[#fbfbfb]'}`}>
                                
                                {/* 1. ROW CONTENT: DESKTOP (Table) vs MOBILE (Card) */}
                                <div 
                                    onClick={() => toggleExpand(p.id)}
                                    className="cursor-pointer"
                                >
                                    {/* DESKTOP LAYOUT */}
                                    <div className="hidden md:grid min-w-[900px] grid-cols-[40px_minmax(200px,1.5fr)_1fr_1fr_1fr_100px] gap-4 px-4 py-3 items-center">
                                        <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                                            <input type="checkbox" checked={isSelected} onChange={() => toggleSelection(p.id)} className="cursor-pointer" />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <UserAvatar name={p.imie} surname={p.nazwisko} />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-[#201f1e] leading-tight group-hover:text-[#0078d4] transition-colors">
                                                    {p.imie || '(Brak imienia)'} {p.nazwisko}
                                                </span>
                                                <span className="text-[11px] text-slate-500">ID: {p.id}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={p.typUmowy === 'UOP' ? 'primary' : 'warning'}>{p.typUmowy}</Badge>
                                                {p.trybSkladek !== 'PELNE' && <span className="text-[10px] bg-slate-100 text-slate-600 px-1 rounded border border-slate-200 truncate max-w-[100px]" title={p.trybSkladek}>Specjalny</span>}
                                            </div>
                                        </div>
                                        <div className="text-right font-mono font-medium text-slate-900">{formatPLN(p.nettoDocelowe)}</div>
                                        <div className="flex flex-col items-center justify-center text-xs text-slate-500">
                                            <span>{wiek} lat ({p.plec})</span>
                                            {zwolniony && <span className="text-[9px] text-emerald-600 font-bold">Zwolniony FP</span>}
                                        </div>
                                        <div className="flex justify-end items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => toggleExpand(p.id)} className="p-1.5 text-slate-400 hover:text-[#0078d4] rounded-sm transition-colors">
                                                {isExpanded ? <ChevronUp /> : <ChevronDown />}
                                            </button>
                                            <div className="h-4 w-px bg-slate-200 mx-1"></div>
                                            <button onClick={() => removeEmployee(p.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-sm transition-colors" title="Usuń">
                                                <Trash />
                                            </button>
                                        </div>
                                    </div>

                                    {/* MOBILE LAYOUT (Card) */}
                                    <div className="md:hidden p-4 flex flex-col gap-3 relative">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <UserAvatar name={p.imie} surname={p.nazwisko} />
                                                <div>
                                                    <div className="font-bold text-slate-900 text-base">{p.imie || 'Nowy'} {p.nazwisko || 'Pracownik'}</div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                        <span>{wiek} lat</span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                        <span>{p.plec === 'M' ? 'Mężczyzna' : 'Kobieta'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => removeEmployee(p.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-full transition-colors">
                                                    <Trash />
                                                </button>
                                                <button onClick={() => toggleExpand(p.id)} className={`p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                                    <ChevronDown />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-3 mt-1">
                                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex flex-col">
                                                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wide mb-1">Umowa</div>
                                                <div className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                                                    {p.typUmowy}
                                                    {p.trybSkladek !== 'PELNE' && <span className="w-2 h-2 rounded-full bg-amber-400" title="Specjalny ZUS"></span>}
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex flex-col text-right">
                                                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wide mb-1">Netto</div>
                                                <div className="text-sm font-bold text-slate-900">{formatPLN(p.nettoDocelowe)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. EXPANDED EDIT FORM (Responsive Grid) */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 md:px-14 md:pb-6 animate-in slide-in-from-top-2 duration-200 border-t border-[#edebe9] bg-slate-50/50">
                                        <div className="bg-white md:border md:border-[#edebe9] rounded-sm pt-4 md:p-5 md:shadow-sm relative">
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
                                                
                                                {/* SECTION: PERSONAL */}
                                                <div className="col-span-1 md:col-span-2 lg:col-span-4 border-b border-slate-100 pb-2 mb-2">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dane Osobowe</span>
                                                </div>

                                                <FormField label="Imię">
                                                    <Input value={p.imie} onChange={(e) => updateEmployee(p.id, 'imie', e.target.value)} />
                                                </FormField>
                                                <FormField label="Nazwisko">
                                                    <Input value={p.nazwisko} onChange={(e) => updateEmployee(p.id, 'nazwisko', e.target.value)} />
                                                </FormField>
                                                <FormField label="Data urodzenia">
                                                    <Input type="date" value={p.dataUrodzenia} onChange={(e) => updateEmployee(p.id, 'dataUrodzenia', e.target.value)} />
                                                </FormField>
                                                <FormField label="Płeć">
                                                    <Select value={p.plec} onChange={(e) => updateEmployee(p.id, 'plec', e.target.value)}>
                                                        <option value="M">Mężczyzna</option>
                                                        <option value="K">Kobieta</option>
                                                    </Select>
                                                </FormField>

                                                {/* SECTION: CONTRACT */}
                                                <div className="col-span-1 md:col-span-2 lg:col-span-4 border-b border-slate-100 pb-2 mb-2 mt-2">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Parametry Umowy</span>
                                                </div>

                                                <FormField label="Rodzaj umowy">
                                                    <Select value={p.typUmowy} onChange={(e) => updateEmployee(p.id, 'typUmowy', e.target.value)}>
                                                        <option value="UOP">Umowa o Pracę</option>
                                                        <option value="UZ">Umowa Zlecenie</option>
                                                    </Select>
                                                </FormField>
                                                <FormField label="Wynagrodzenie Netto">
                                                    <Input 
                                                        type="number" 
                                                        value={p.nettoDocelowe} 
                                                        onChange={(e) => updateEmployee(p.id, 'nettoDocelowe', parseFloat(e.target.value))} 
                                                        className="font-bold text-right"
                                                    />
                                                </FormField>
                                                <FormField label="Tryb ZUS">
                                                    <Select value={p.trybSkladek} onChange={(e) => updateEmployee(p.id, 'trybSkladek', e.target.value)}>
                                                        <option value="PELNE">Pełne składki</option>
                                                        <option value="BEZ_CHOROBOWEJ">Bez chorobowej</option>
                                                        <option value="STUDENT_UZ">Student &lt; 26 lat</option>
                                                        <option value="INNY_TYTUL">Inny tytuł (tylko zdrowotna)</option>
                                                        <option value="EMERYT_RENCISTA">Emeryt/Rencista</option>
                                                    </Select>
                                                </FormField>
                                                <FormField label="Koszty Uzyskania (KUP)">
                                                    <Select value={p.kupTyp} onChange={(e) => updateEmployee(p.id, 'kupTyp', e.target.value)}>
                                                        <option value="STANDARD">Standardowe (250 zł)</option>
                                                        <option value="PODWYZSZONE">Podwyższone (300 zł)</option>
                                                        <option value="PROC_20">Ryczałtowe 20%</option>
                                                        <option value="PROC_50">Autorskie 50%</option>
                                                    </Select>
                                                </FormField>

                                                {/* SECTION: TAX DETAILS */}
                                                <div className="col-span-1 md:col-span-2 lg:col-span-4 border-b border-slate-100 pb-2 mb-2 mt-2">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Podatki i Ulgi</span>
                                                </div>

                                                <FormField label="Kwota wolna (PIT-2)">
                                                    <Select value={p.pit2} onChange={(e) => updateEmployee(p.id, 'pit2', e.target.value)}>
                                                        <option value="300">300 zł (1/12)</option>
                                                        <option value="150">150 zł (1/24)</option>
                                                        <option value="100">100 zł (1/36)</option>
                                                        <option value="0">Brak (0 zł)</option>
                                                    </Select>
                                                </FormField>
                                                <FormField label="Zaliczka PIT">
                                                    <Select value={p.pitMode || 'AUTO'} onChange={(e) => updateEmployee(p.id, 'pitMode', e.target.value)}>
                                                        <option value="AUTO">Automatycznie (Progi)</option>
                                                        <option value="FLAT_12">Liniowo 12%</option>
                                                        <option value="FLAT_32">Liniowo 32%</option>
                                                        <option value="FLAT_0">Zwolnienie (0%)</option>
                                                    </Select>
                                                </FormField>
                                                
                                                <div className="flex items-end pb-2">
                                                    <label className="flex items-center gap-2 cursor-pointer select-none group">
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${p.ulgaMlodych ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'}`}>
                                                            {p.ulgaMlodych && <Check />}
                                                        </div>
                                                        <input type="checkbox" className="hidden" checked={p.ulgaMlodych} onChange={(e) => updateEmployee(p.id, 'ulgaMlodych', e.target.checked)} />
                                                        <span className="text-sm text-slate-700 group-hover:text-blue-700 font-medium">Ulga dla młodych (&lt;26)</span>
                                                    </label>
                                                </div>

                                                <div className="flex items-end pb-2">
                                                    <label className="flex items-center gap-2 cursor-pointer select-none group">
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${!p.skladkaFP ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300'}`}>
                                                            {!p.skladkaFP && <Check />}
                                                        </div>
                                                        <input type="checkbox" className="hidden" checked={!p.skladkaFP} onChange={(e) => updateEmployee(p.id, 'skladkaFP', !e.target.checked)} />
                                                        <span className="text-sm text-slate-700 group-hover:text-emerald-700 font-medium">Zwolnienie FP/FGŚP</span>
                                                    </label>
                                                </div>

                                            </div>
                                            
                                            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
                                                <ButtonSecondary size="sm" onClick={() => duplicateEmployee(p.id)} icon={<Copy />}>Duplikuj</ButtonSecondary>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        )}
    </div>
  );
};
