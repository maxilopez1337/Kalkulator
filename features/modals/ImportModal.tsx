
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Pracownik } from '../../entities/employee/model';
import { Plus, ArrowDown, X, Trash, FileText, Check, ArrowRight, Filter } from '../../shared/icons/Icons';
import { useEmployees, useCompany, useConfirm } from '../../store/AppContext';
import { parseExcelData, ImportRow } from '../../shared/utils/excelParser';
import { obliczWiek } from '../../shared/utils/dates';
import { Modal } from '../../shared/ui/Modal';
import { excelGenerator } from '../../services/excelGenerator';
import { ButtonPrimary, ButtonSecondary } from '../../shared/ui/Button';
import { pl } from '../../shared/i18n/pl';
import { shadow } from '../../shared/config/theme';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ImportModal = ({ isOpen, onClose }: ImportModalProps) => {
    const { setPracownicy, pracownicy } = useEmployees();
    const { config } = useCompany();
    const { confirmDialog } = useConfirm();
    const [importRows, setImportRows] = useState<ImportRow[]>([]);
    const [fileName, setFileName] = useState<string>('');
    const [dragActive, setDragActive] = useState(false);
    const [stats, setStats] = useState({ valid: 0, invalid: 0, total: 0 });
    const [showErrorsOnly, setShowErrorsOnly] = useState(false);
    
    // Selection state for bulk delete
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [rowsToGenerate, setRowsToGenerate] = useState<number>(() => {
        const saved = localStorage.getItem('import_template_rows');
        return saved ? parseInt(saved, 10) : 10;
    });

    useEffect(() => {
        localStorage.setItem('import_template_rows', rowsToGenerate.toString());
    }, [rowsToGenerate]);

    useEffect(() => {
        const valid = importRows.filter(r => r.isValid).length;
        const invalid = importRows.length - valid;
        setStats({ valid, invalid, total: importRows.length });
    }, [importRows]);

    const filteredRowsDisplay = useMemo(() => {
        if (showErrorsOnly) {
            return importRows.map((row, idx) => ({ row, originalIdx: idx })).filter(item => !item.row.isValid);
        }
        return importRows.map((row, idx) => ({ row, originalIdx: idx }));
    }, [importRows, showErrorsOnly]);

    if (!isOpen) return null;

    const handleImport = (nowiPracownicy: Pracownik[]) => {
        setPracownicy([...pracownicy, ...nowiPracownicy]);
    };

    const handleUpdateRow = (index: number, field: keyof Pracownik, value: Pracownik[keyof Pracownik]) => {
        setImportRows(prev => {
            const newRows = [...prev];
            const currentRow = { ...newRows[index] }; 
            if (!currentRow.data) return prev;

            const newData = { ...currentRow.data, [field]: value };
            
            let newRaw = { ...currentRow.raw };
            if (field === 'dataUrodzenia') {
                const age = obliczWiek(value as string);
                newRaw.wiek = age;
            }

            const newErrors: string[] = [];
            if (newData.nettoDocelowe <= 0) newErrors.push('Netto <= 0');
            if (!newData.imie) newErrors.push('Brak imienia');
            if (!newData.nazwisko) newErrors.push('Brak nazwiska');

            currentRow.data = newData;
            currentRow.raw = newRaw;
            currentRow.isValid = newErrors.length === 0;
            currentRow.errors = newErrors;

            newRows[index] = currentRow;
            return newRows;
        });
    };

    const handleDeleteRow = (index: number) => {
        setImportRows(prev => prev.filter((_, i) => i !== index));
        setSelectedIndices(prev => {
            const newSet = new Set(prev);
            newSet.clear();
            return newSet;
        });
    };

    const handleDeleteSelected = async (): Promise<void> => {
        if (await confirmDialog(pl.confirms.deleteSelectedRows(selectedIndices.size), { variant: 'danger' })) {
            setImportRows(prev => prev.filter((_, i) => !selectedIndices.has(i)));
            setSelectedIndices(new Set());
        }
    };

    const toggleSelection = (index: number) => {
        setSelectedIndices(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) newSet.delete(index);
            else newSet.add(index);
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIndices.size === importRows.length) {
            setSelectedIndices(new Set());
        } else {
            const allIndices = new Set(importRows.map((_, i) => i));
            setSelectedIndices(allIndices);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        let file;
        if ('dataTransfer' in e) file = e.dataTransfer.files[0];
        else if ('target' in e && e.target.files) file = e.target.files[0];

        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (evt) => {
                const bstr = evt.target?.result;
                const wb = window.XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = window.XLSX.utils.sheet_to_json(ws, { header: 1, range: 0 });
                const parsed = parseExcelData(data, config);
                setImportRows(parsed);
                setSelectedIndices(new Set());
            };
            reader.readAsBinaryString(file);
        }
    };

    const handleConfirmImport = () => {
        const validRows = importRows.filter(r => r.isValid).map(r => r.data as Pracownik);
        handleImport(validRows);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[1400px]" height="md:h-[90vh]">
            <div className="flex flex-col h-full">
                
                {/* 1. Header Area */}
                <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-[#edebe9] bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-sm bg-[#0078d4] flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-semibold text-[#201f1e] leading-tight">Import Pracowników</h2>
                            <div className="text-[11px] text-[#a19f9d]">Kreator importu danych z Excel (XLSX, CSV)</div>
                        </div>
                    </div>

                    {importRows.length > 0 && (
                        <div className="hidden sm:flex items-center gap-2 text-xs font-medium bg-[#f3f2f1] p-1 rounded-sm border border-[#edebe9]">
                            <div className="px-2.5 py-1 bg-white rounded-sm border border-[#edebe9] text-[#323130]">
                                Razem: <strong>{stats.total}</strong>
                            </div>
                            <div className="px-2.5 py-1 rounded-sm text-[#107c10] bg-[#e6f3e6] border border-[#9fd89f]">
                                Poprawne: <strong>{stats.valid}</strong>
                            </div>
                            <div className={`px-2.5 py-1 rounded-sm border ${stats.invalid > 0 ? 'text-[#d83b01] bg-[#fde7e2] border-[#f0937a]' : 'text-[#a19f9d] border-transparent'}`}>
                                Błędy: <strong>{stats.invalid}</strong>
                            </div>
                        </div>
                    )}

                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-[#605e5c] hover:text-[#201f1e] hover:bg-[#f3f2f1] rounded-sm transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* 2. Main Content Area */}
                <div className="flex-1 bg-[#f3f2f1] overflow-hidden relative">
                    
                    {/* STATE A: EMPTY (ONBOARDING) */}
                    {importRows.length === 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                                
                                {/* CARD 1: DOWNLOAD */}
                                <div className={`bg-white p-6 rounded-md border border-[#edebe9] ${shadow.elevation4} hover:${shadow.elevation8} transition-all group flex flex-col items-center text-center`}>
                                    <div className="w-12 h-12 bg-[#eff6fc] text-[#0078d4] rounded-sm flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                        <ArrowDown />
                                    </div>
                                    <h3 className="text-[15px] font-semibold text-[#201f1e] mb-2">1. Pobierz Szablon</h3>
                                    <p className="text-[#605e5c] text-sm mb-6 leading-relaxed">
                                        Pobierz przygotowany plik Excel v2.6.1. <br/>
                                        Zawiera <strong className="text-[#323130]">automatyczne formuły</strong> i listy rozwijane, które ułatwiają wprowadzanie danych.
                                    </p>
                                    <div className="mt-auto w-full">
                                        <label className="text-[10px] font-bold text-[#a19f9d] uppercase tracking-wider mb-3 block">Liczba wierszy przykładowych</label>
                                        <div className="flex items-center justify-center gap-2 mb-4">
                                            {[10, 50, 100].map(n => (
                                                <button
                                                    key={n}
                                                    onClick={() => setRowsToGenerate(n)}
                                                    className={`px-3 py-1 text-xs font-bold rounded-sm border transition-colors ${rowsToGenerate === n ? 'bg-brand text-white border-brand' : 'bg-white text-[#605e5c] border-[#8a8886] hover:border-[#323130]'}`}
                                                >
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => excelGenerator.generateImportTemplate(rowsToGenerate)}
                                            className="w-full py-2.5 px-4 bg-white border border-[#8a8886] text-[#323130] font-semibold rounded-sm hover:border-[#0078d4] hover:text-[#0078d4] transition-all flex items-center justify-center gap-2 text-sm"
                                        >
                                            <FileText /> Pobierz .xlsx
                                        </button>
                                    </div>
                                </div>

                                {/* CARD 2: UPLOAD */}
                                <div
                                    onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                                    onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                    onDrop={handleFileUpload}
                                    className={`bg-white p-6 rounded-md border-2 border-dashed ${shadow.elevation4} transition-all flex flex-col items-center text-center relative overflow-hidden cursor-pointer
                                        ${dragActive ? 'border-[#0078d4] bg-[#eff6fc]' : 'border-[#c8c6c4] hover:border-[#0078d4]'}
                                    `}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input ref={fileInputRef} type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="hidden" />

                                    <div className={`w-12 h-12 rounded-sm flex items-center justify-center mb-5 transition-colors ${dragActive ? 'bg-[#eff6fc] text-[#0078d4]' : 'bg-[#f3f2f1] text-[#a19f9d]'}`}>
                                        <Plus />
                                    </div>
                                    <h3 className="text-[15px] font-semibold text-[#201f1e] mb-2">2. Wgraj wypełniony plik</h3>
                                    <p className="text-[#605e5c] text-sm mb-6 leading-relaxed">
                                        Przeciągnij plik tutaj lub kliknij, aby wybrać z dysku. <br/>
                                        Obsługujemy formaty <strong>.xlsx, .csv</strong>.
                                    </p>

                                    <div className="mt-auto w-full">
                                        <div className="py-2.5 px-4 bg-brand text-white font-semibold rounded-sm hover:bg-brandHover transition-all flex items-center justify-center gap-2 text-sm">
                                            Wybierz plik <ArrowRight />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* STATE B: DATA GRID (VERIFICATION) */}
                    {importRows.length > 0 && (
                        <div className="h-full flex flex-col">
                            {/* Toolbar */}
                            <div className="px-4 py-2.5 bg-white border-b border-[#edebe9] flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowErrorsOnly(!showErrorsOnly)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold transition-all border
                                            ${showErrorsOnly
                                                ? 'bg-[#fde7e2] text-[#d83b01] border-[#f0937a]'
                                                : 'bg-white text-[#605e5c] border-[#8a8886] hover:bg-[#f3f2f1]'}
                                        `}
                                    >
                                        <Filter />
                                        {showErrorsOnly ? 'Pokaż wszystkie' : 'Pokaż tylko błędy'}
                                    </button>

                                    {selectedIndices.size > 0 && (
                                        <button
                                            onClick={handleDeleteSelected}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d83b01] text-white rounded-sm text-xs font-bold hover:bg-[#a80000] transition-all"
                                        >
                                            <Trash /> Usuń zaznaczone ({selectedIndices.size})
                                        </button>
                                    )}
                                    {importRows.length > 0 && (
                                        <button
                                            onClick={async () => {
                                                if (await confirmDialog(pl.confirms.clearImportList, { variant: 'danger' })) {
                                                    setImportRows([]);
                                                    setSelectedIndices(new Set());
                                                }
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fde7e2] text-[#d83b01] rounded-sm text-xs font-bold hover:bg-[#fbd4c8] transition-all border border-[#f0937a]"
                                        >
                                            <Trash /> Usuń wszystkich
                                        </button>
                                    )}
                                </div>

                                <div className="text-xs text-[#a19f9d]">
                                    Plik: <span className="text-[#323130] font-medium">{fileName}</span>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="flex-1 overflow-auto bg-[#f3f2f1] p-3">
                                <div className="bg-white rounded-sm border border-[#edebe9] overflow-hidden min-h-full">
                                    <table className="w-full border-collapse text-xs">
                                        <thead className="bg-[#f8fafc] sticky top-0 z-10 border-b border-[#edebe9]">
                                            <tr>
                                                <th className="p-2 w-10 text-center bg-[#f3f2f1] sticky left-0 z-20 border-r border-[#edebe9]">
                                                    <input 
                                                        type="checkbox" 
                                                        className="rounded-sm border-[#c8c6c4] cursor-pointer"
                                                        checked={filteredRowsDisplay.length > 0 && selectedIndices.size === filteredRowsDisplay.length}
                                                        onChange={toggleSelectAll}
                                                    />
                                                </th>
                                                <th className="p-3 text-left font-bold text-[#605e5c] border-r border-[#edebe9]">Pracownik (Imię i Nazwisko)</th>
                                                <th className="p-3 text-left font-bold text-[#605e5c] border-r border-[#edebe9] w-32">Data Ur.</th>
                                                <th className="p-3 text-center font-bold text-[#605e5c] border-r border-[#edebe9] w-16">Płeć</th>
                                                <th className="p-3 text-left font-bold text-[#605e5c] border-r border-[#edebe9] w-32">Umowa</th>
                                                <th className="p-3 text-left font-bold text-[#605e5c] border-r border-[#edebe9]">Tryb ZUS</th>
                                                <th className="p-3 text-right font-bold text-[#605e5c] border-r border-[#edebe9] w-24">Netto</th>
                                                <th className="p-3 text-center font-bold text-[#605e5c] border-r border-[#edebe9] w-20">KUP</th>
                                                <th className="p-3 text-center font-bold text-[#605e5c] border-r border-[#edebe9] w-20">PIT-2</th>
                                                <th className="p-3 text-center font-bold text-[#605e5c] border-r border-[#edebe9] w-16">Ulga</th>
                                                <th className="p-3 text-center font-bold text-[#605e5c] border-r border-[#edebe9] w-20">Stawka PIT</th>
                                                <th className="p-3 text-center font-bold text-[#605e5c] w-12">Akcje</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#edebe9]">
                                            {filteredRowsDisplay.map(({ row, originalIdx }) => {
                                                const p = row.data;
                                                if (!p) return null;
                                                const hasError = !row.isValid;

                                                const cellClass = "p-0 h-full relative";
                                                const inputClass = "w-full h-full px-3 py-2 bg-transparent outline-none focus:bg-blue-50 focus:text-blue-700 transition-colors text-[#323130] placeholder-[#a19f9d] font-medium";
                                                const errorInputClass = "w-full h-full px-3 py-2 bg-rose-50 text-rose-700 outline-none focus:bg-rose-100 font-bold border-2 border-rose-300 inset-0 absolute";

                                                return (
                                                    <tr key={originalIdx} className={`group ${hasError ? 'bg-rose-50/30' : 'hover:bg-[#f3f2f1]'}`}>
                                                        <td className="p-2 text-center border-r border-[#edebe9] bg-inherit sticky left-0 z-10">
                                                            <input 
                                                                type="checkbox" 
                                                                className="rounded-sm border-[#c8c6c4] cursor-pointer"
                                                                checked={selectedIndices.has(originalIdx)}
                                                                onChange={() => toggleSelection(originalIdx)}
                                                            />
                                                        </td>
                                                        <td className={`${cellClass} border-r border-[#edebe9]`}>
                                                            <div className="flex">
                                                                <input type="text" value={p.imie} onChange={(e) => handleUpdateRow(originalIdx, 'imie', e.target.value)} className={`${!p.imie ? errorInputClass : inputClass} w-1/2 border-r border-dashed border-[#edebe9]`} placeholder="Imię" />
                                                                <input type="text" value={p.nazwisko} onChange={(e) => handleUpdateRow(originalIdx, 'nazwisko', e.target.value)} className={`${!p.nazwisko ? errorInputClass : inputClass} w-1/2`} placeholder="Nazwisko" />
                                                            </div>
                                                        </td>
                                                        <td className={`${cellClass} border-r border-[#edebe9]`}>
                                                            <input type="date" value={p.dataUrodzenia} onChange={(e) => handleUpdateRow(originalIdx, 'dataUrodzenia', e.target.value)} className={inputClass} />
                                                        </td>
                                                        <td className={`${cellClass} border-r border-[#edebe9]`}>
                                                            <select value={p.plec} onChange={(e) => handleUpdateRow(originalIdx, 'plec', e.target.value)} className={inputClass}>
                                                                <option value="M">M</option>
                                                                <option value="K">K</option>
                                                            </select>
                                                        </td>
                                                        <td className={`${cellClass} border-r border-[#edebe9]`}>
                                                            <select value={p.typUmowy} onChange={(e) => handleUpdateRow(originalIdx, 'typUmowy', e.target.value)} className={`${inputClass} ${p.typUmowy === 'UOP' ? 'text-blue-700' : 'text-amber-700'}`}>
                                                                <option value="UOP">Umowa o pracę</option>
                                                                <option value="UZ">Umowa zlecenie</option>
                                                            </select>
                                                        </td>
                                                        <td className={`${cellClass} border-r border-[#edebe9]`}>
                                                            <select value={p.trybSkladek} onChange={(e) => handleUpdateRow(originalIdx, 'trybSkladek', e.target.value)} className={inputClass}>
                                                                <option value="PELNE">Pełne składki</option>
                                                                <option value="BEZ_CHOROBOWEJ">Bez chor.</option>
                                                                <option value="STUDENT_UZ">Student &lt; 26</option>
                                                                <option value="INNY_TYTUL">Zbieg tytułów</option>
                                                                <option value="EMERYT_RENCISTA">Emeryt</option>
                                                            </select>
                                                        </td>
                                                        <td className={`${cellClass} border-r border-[#edebe9]`}>
                                                            <input type="number" value={p.nettoDocelowe} onChange={(e) => handleUpdateRow(originalIdx, 'nettoDocelowe', parseFloat(e.target.value))} className={`${p.nettoDocelowe <= 0 ? errorInputClass : inputClass} text-right font-bold`} />
                                                        </td>
                                                        <td className={`${cellClass} border-r border-[#edebe9]`}>
                                                             <select value={p.kupTyp} onChange={(e) => handleUpdateRow(originalIdx, 'kupTyp', e.target.value)} className={`${inputClass} text-center`}>
                                                                <option value="STANDARD">250 zł</option>
                                                                <option value="PODWYZSZONE">300 zł</option>
                                                                <option value="PROC_20">20%</option>
                                                                <option value="PROC_50">50%</option>
                                                            </select>
                                                        </td>
                                                        <td className={`${cellClass} border-r border-[#edebe9]`}>
                                                            <select value={p.pit2} onChange={(e) => handleUpdateRow(originalIdx, 'pit2', e.target.value)} className={`${inputClass} text-center`}>
                                                                <option value="300">300 zł</option>
                                                                <option value="150">150 zł</option>
                                                                <option value="100">100 zł</option>
                                                                <option value="0">0 zł</option>
                                                            </select>
                                                        </td>
                                                        <td className={`${cellClass} border-r border-[#edebe9] text-center`}>
                                                            <input type="checkbox" checked={p.ulgaMlodych} onChange={(e) => handleUpdateRow(originalIdx, 'ulgaMlodych', e.target.checked)} className="cursor-pointer w-4 h-4 mt-2" />
                                                        </td>
                                                        <td className={`${cellClass} border-r border-[#edebe9]`}>
                                                            <select value={p.pitMode || 'AUTO'} onChange={(e) => handleUpdateRow(originalIdx, 'pitMode', e.target.value)} className={`${inputClass} text-center`}>
                                                                <option value="AUTO">Auto</option>
                                                                <option value="FLAT_12">12%</option>
                                                                <option value="FLAT_32">32%</option>
                                                                <option value="FLAT_0">0%</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-2 text-center">
                                                            <button onClick={() => handleDeleteRow(originalIdx)} className="text-[#c8c6c4] hover:text-rose-600 transition-colors p-1">
                                                                <Trash />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* 3. Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-[#edebe9] bg-white shrink-0 z-30">
                    <div className="text-sm text-[#605e5c]">
                        {importRows.length > 0 && <span>Upewnij się, że dane są poprawne przed importem.</span>}
                    </div>
                    <div className="flex gap-4">
                        <ButtonSecondary onClick={onClose}>
                            {pl.buttons.cancel}
                        </ButtonSecondary>
                        <ButtonPrimary
                            onClick={handleConfirmImport}
                            disabled={stats.valid === 0}
                            icon={<Check />}
                        >
                            Importuj {stats.valid > 0 && `(${stats.valid})`}
                        </ButtonPrimary>
                    </div>
                </div>

            </div>
        </Modal>
    );
};
