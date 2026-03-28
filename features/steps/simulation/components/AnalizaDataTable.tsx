import React from 'react';
import { formatPLN } from '../../../../shared/utils/formatters';
import { Users, TrendingDown, Check, ChevronDown, ChevronUp } from '../../../../shared/icons/Icons';
import { AnalizaMonthDetail } from './AnalizaMonthDetail';
import { AnalizaTableHeader } from './AnalizaTableHeader';
import { AnalizaGrandTotals } from './AnalizaGrandTotals';

interface MonthRow {
    brutto: number;
    pit: number;
    netto: number;
    dochod: number;
    narastajace: number;
    isIIProg: boolean;
}

interface EliMonthRow extends MonthRow {
    s_brutto: number;
}

interface TableRow {
    id: string | number;
    imie: string;
    typ: string;
    student: boolean;
    kzp: number;
    std_brutto: number;
    std_netto: number;
    stdAvgPit: number;
    stdRocznyPit: number;
    stdIIProg: number | null;
    zasadniczaNetto: number;
    baseSwiadczenieNetto: number;
    totalSwNetto: number;
    eliNetto: number;
    swBruttoM1: number;
    eliAvgPit: number;
    eliRocznyPit: number;
    eliIIProg: number | null;
    pitOszczednosc: number;
    podEBS: number;
    podEmp: number;
    stdMonths: MonthRow[];
    eliMonths: EliMonthRow[];
}

interface KpiTotals {
    n: number;
    stdRocznyPit: number;
    eliRocznyPit: number;
    pitOszczednosc: number;
    stdIIProg: number;
    eliIIProg: number;
}

interface RaiseEntry { ebs: string; employer: string }

interface AnalizaDataTableProps {
    tableData: TableRow[];
    totals: KpiTotals;
    raises: Record<string | number, RaiseEntry>;
    setRaise: (id: string | number, field: 'ebs' | 'employer', val: string) => void;
    expanded: Set<string | number>;
    toggleRow: (id: string | number) => void;
    p1Limit: number;
}

export const AnalizaDataTable = ({ tableData, totals, raises, setRaise, expanded, toggleRow, p1Limit }: AnalizaDataTableProps) => (
    <div className="flex-1 min-h-0 px-4 md:px-6 pb-4 md:pb-6 overflow-hidden">
        <div className="h-full bg-white rounded-md border border-[#edebe9] shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-auto flex-1 custom-scrollbar">
                <table className="w-full border-collapse text-xs whitespace-nowrap">
                    <AnalizaTableHeader />
                    <tbody className="divide-y divide-[#edebe9]">
                        {tableData.length === 0 && (
                            <tr>
                                <td colSpan={16} className="py-16 text-center text-[#a19f9d]">
                                    <div className="flex flex-col items-center gap-2">
                                        <Users className="w-8 h-8 opacity-30" />
                                        <span className="text-sm font-medium">Brak danych. Przeprowadź kalkulację w poprzednich krokach.</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {tableData.map((row, i) => (
                            <React.Fragment key={row.id}>
                                {/* Main row */}
                                <tr className={`transition-colors ${expanded.has(row.id) ? 'bg-blue-50/40' : 'hover:bg-[#f8f9fa]'}`}>
                                    {/* Expand */}
                                    <td className="py-2.5 px-2 border-r border-[#edebe9] text-center">
                                        <button onClick={() => toggleRow(row.id)}
                                            className="w-6 h-6 flex items-center justify-center rounded text-[#a19f9d] hover:text-[#0078d4] hover:bg-[#eff6fc] transition-colors mx-auto">
                                            {expanded.has(row.id) ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                        </button>
                                    </td>
                                    {/* Name */}
                                    <td className="py-2.5 px-3 border-r border-[#edebe9]">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-[#a19f9d] font-bold w-4 shrink-0">{i + 1}</span>
                                            <span className="font-semibold text-[#201f1e]">{row.imie}</span>
                                            {row.student && <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.5 rounded font-bold border border-amber-200">STU</span>}
                                        </div>
                                    </td>
                                    {/* Typ */}
                                    <td className="py-2.5 px-3 text-center border-r border-[#edebe9]">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${row.typ === 'UOP' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-teal-50 text-teal-700 border-teal-200'}`}>
                                            {row.typ}
                                        </span>
                                    </td>
                                    {/* Standard */}
                                    <td className="py-2.5 px-3 text-right text-[#605e5c] tabular-nums">{formatPLN(row.std_brutto)}</td>
                                    <td className="py-2.5 px-3 text-right text-[#323130] font-medium tabular-nums">{formatPLN(row.std_netto)}</td>
                                    <td className="py-2.5 px-3 text-right font-bold text-rose-700 bg-rose-50/40 tabular-nums">{formatPLN(row.stdAvgPit)}</td>
                                    <td className="py-2.5 px-3 text-center bg-amber-50/30 border-r border-[#edebe9]">
                                        {row.stdIIProg
                                            ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold border border-amber-200"><TrendingDown className="w-2.5 h-2.5" />Mies&nbsp;{row.stdIIProg}</span>
                                            : <span className="text-[#c8c6c4] text-[10px] font-bold">— I próg —</span>}
                                    </td>
                                    {/* Eliton */}
                                    <td className="py-2.5 px-3 text-right text-[#605e5c] bg-blue-50/20 tabular-nums">{formatPLN(row.zasadniczaNetto)}</td>
                                    <td className="py-2.5 px-3 text-right text-blue-700 font-medium bg-blue-50/30 tabular-nums">{formatPLN(row.baseSwiadczenieNetto)}</td>
                                    {/* Podwyżka EBS input */}
                                    <td className="py-1.5 px-2 bg-blue-100/40">
                                        <div>
                                            <input
                                                type="number"
                                                value={raises[row.id]?.ebs || ''}
                                                onChange={e => setRaise(row.id, 'ebs', e.target.value)}
                                                placeholder="0"
                                                className="w-24 text-center py-1.5 px-2 bg-white border border-blue-200 rounded text-xs font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            {row.podEBS > 0 && (
                                                <div className="text-[9px] text-blue-500 mt-0.5 text-center">netto: {formatPLN(row.podEBS)}</div>
                                            )}
                                        </div>
                                    </td>
                                    {/* Podwyżka Pracodawcy input */}
                                    <td className="py-1.5 px-2 bg-emerald-50/40">
                                        <div>
                                            <input
                                                type="number"
                                                value={raises[row.id]?.employer || ''}
                                                onChange={e => setRaise(row.id, 'employer', e.target.value)}
                                                placeholder="0"
                                                className="w-24 text-center py-1.5 px-2 bg-white border border-emerald-200 rounded text-xs font-bold text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            {row.podEmp > 0 && (
                                                <div className="text-[9px] text-emerald-600 mt-0.5 text-center">netto: {formatPLN(row.podEmp)}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-bold text-amber-800 bg-yellow-50 tabular-nums">{formatPLN(row.eliNetto)}</td>
                                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700 bg-emerald-50/40 tabular-nums">{formatPLN(row.eliAvgPit)}</td>
                                    <td className="py-2.5 px-3 text-center bg-amber-50/30 border-r border-[#edebe9]">
                                        {row.eliIIProg
                                            ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold border border-amber-200"><TrendingDown className="w-2.5 h-2.5" />Mies&nbsp;{row.eliIIProg}</span>
                                            : <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold border border-emerald-200"><Check className="w-2.5 h-2.5" />I próg</span>}
                                    </td>
                                    {/* Result */}
                                    <td className={`py-2.5 px-3 text-right font-black tabular-nums ${row.pitOszczednosc >= 0 ? 'text-emerald-800 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                                        {row.pitOszczednosc >= 0 ? '+' : ''}{formatPLN(row.pitOszczednosc)}
                                    </td>
                                    <td className="py-2.5 px-3 text-right text-[#605e5c] tabular-nums">
                                        <div>{formatPLN(row.swBruttoM1)}</div>
                                        {(row.podEBS + row.podEmp) > 0 && (
                                            <div className="text-[9px] text-blue-500">+{formatPLN(row.swBruttoM1 - row.baseSwiadczenieNetto)} vs baza</div>
                                        )}
                                    </td>
                                </tr>

                                {/* 12-month detail */}
                                {expanded.has(row.id) && (
                                    <tr className="bg-[#f8fbff]">
                                        <td colSpan={16} className="p-0 border-b-2 border-blue-200">
                                            <AnalizaMonthDetail row={row} p1Limit={p1Limit} />
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}

                        {/* Grand totals */}
                        {tableData.length > 0 && <AnalizaGrandTotals totals={totals} />}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);
