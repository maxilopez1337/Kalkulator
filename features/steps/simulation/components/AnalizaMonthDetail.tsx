import React from 'react';
import { formatPLN } from '../../../../shared/utils/formatters';

const MO = ['Sty','Lut','Mar','Kwi','Maj','Cze','Lip','Sie','Wrz','Paź','Lis','Gru'];

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

interface AnalizaMonthDetailProps {
    row: {
        imie: string;
        kzp: number;
        stdMonths: MonthRow[];
        eliMonths: EliMonthRow[];
        stdRocznyPit: number;
        eliRocznyPit: number;
        pitOszczednosc: number;
    };
    p1Limit: number;
}

export const AnalizaMonthDetail = ({ row, p1Limit }: AnalizaMonthDetailProps) => (
    <div className="px-6 py-4">
        <div className="text-[10px] font-bold text-[#0078d4] uppercase tracking-widest mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#0078d4]"></div>
            Zestawienie Miesiąc po Miesiącu – {row.imie}
            <span className="ml-2 text-[#a19f9d] font-normal normal-case">KZP (PIT-2): {formatPLN(row.kzp)}/mies &nbsp;·&nbsp; Próg II: {formatPLN(p1Limit)} dochodu narastająco</span>
        </div>
        <div className="overflow-x-auto rounded-md border border-[#cce1f5]">
            <table className="w-full border-collapse text-[11px] whitespace-nowrap">
                <thead>
                    <tr>
                        <th className="py-2 px-3 text-left bg-[#001d40] text-white font-semibold w-14">Mies.</th>
                        <th colSpan={4} className="py-2 px-3 text-center bg-[#002855] text-white font-semibold border-l border-white/10">
                            MODEL TRADYCYJNY
                        </th>
                        <th colSpan={5} className="py-2 px-3 text-center bg-[#004e96] text-white font-semibold border-l border-white/20">
                            ELITON PRIME™
                        </th>
                        <th className="py-2 px-3 text-center bg-emerald-800 text-white font-semibold border-l border-white/20">
                            Δ PIT
                        </th>
                    </tr>
                    <tr className="bg-[#f3f2f1] border-b border-[#edebe9] text-[#605e5c] font-semibold">
                        <th className="py-2 px-3 text-left">#</th>
                        <th className="py-2 px-3 text-right">Brutto std</th>
                        <th className="py-2 px-3 text-right text-rose-700">PIT std</th>
                        <th className="py-2 px-3 text-right">Netto std</th>
                        <th className="py-2 px-3 text-right text-[#a19f9d] border-r border-[#edebe9]">Narastające</th>
                        <th className="py-2 px-3 text-right bg-blue-50/50 text-blue-700">Brutto łącz.</th>
                        <th className="py-2 px-3 text-right bg-blue-50/50 text-blue-600">Świad. brutto</th>
                        <th className="py-2 px-3 text-right bg-blue-50/50 text-emerald-700">PIT eli</th>
                        <th className="py-2 px-3 text-right bg-blue-50/50">Netto eli</th>
                        <th className="py-2 px-3 text-right bg-blue-50/50 text-[#a19f9d] border-r border-[#edebe9]">Narastające</th>
                        <th className="py-2 px-3 text-right bg-emerald-50 text-emerald-700">Oszczędność</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#edebe9]">
                    {row.stdMonths.map((sm, mi) => {
                        const em = row.eliMonths[mi];
                        const delta = sm.pit - em.pit;
                        const stdCrossed = sm.isIIProg && !row.stdMonths[mi - 1]?.isIIProg;
                        const eliCrossed = em.isIIProg && !row.eliMonths[mi - 1]?.isIIProg;
                        return (
                            <tr key={mi} className={`transition-colors ${(sm.isIIProg || em.isIIProg) ? 'bg-amber-50/30' : 'hover:bg-[#f3f2f1]/60'}`}>
                                <td className="py-2 px-3 font-bold text-[#323130]">
                                    {MO[mi]}
                                    {stdCrossed && <span className="ml-1 text-[9px] bg-amber-200 text-amber-900 px-1 rounded font-bold">32%^</span>}
                                    {eliCrossed && <span className="ml-1 text-[9px] bg-blue-200 text-blue-900 px-1 rounded font-bold">32%^</span>}
                                </td>
                                <td className="py-2 px-3 text-right text-[#605e5c] tabular-nums">{formatPLN(sm.brutto)}</td>
                                <td className="py-2 px-3 text-right font-bold text-rose-700 tabular-nums">{formatPLN(sm.pit)}</td>
                                <td className="py-2 px-3 text-right text-[#323130] tabular-nums">{formatPLN(sm.netto)}</td>
                                <td className={`py-2 px-3 text-right text-[10px] tabular-nums border-r border-[#edebe9] ${sm.isIIProg ? 'text-amber-700 font-bold' : 'text-[#a19f9d]'}`}>
                                    {formatPLN(sm.narastajace)}
                                </td>
                                <td className="py-2 px-3 text-right text-[#605e5c] bg-blue-50/30 tabular-nums">{formatPLN(em.brutto)}</td>
                                <td className="py-2 px-3 text-right text-blue-700 bg-blue-50/30 tabular-nums">{formatPLN(em.s_brutto)}</td>
                                <td className="py-2 px-3 text-right font-bold text-emerald-700 bg-blue-50/30 tabular-nums">{formatPLN(em.pit)}</td>
                                <td className="py-2 px-3 text-right text-[#323130] bg-blue-50/30 tabular-nums">{formatPLN(em.netto)}</td>
                                <td className={`py-2 px-3 text-right text-[10px] tabular-nums bg-blue-50/30 border-r border-[#edebe9] ${em.isIIProg ? 'text-amber-700 font-bold' : 'text-[#a19f9d]'}`}>
                                    {formatPLN(em.narastajace)}
                                </td>
                                <td className={`py-2 px-3 text-right font-bold tabular-nums ${delta >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                                    {delta >= 0 ? '+' : ''}{formatPLN(delta)}
                                </td>
                            </tr>
                        );
                    })}
                    {/* Totals row */}
                    <tr className="bg-[#001433] text-white font-bold">
                        <td className="py-2.5 px-3 text-[10px] uppercase tracking-wider">RAZEM</td>
                        <td className="py-2.5 px-3 text-right text-[#c8c6c4] tabular-nums">{formatPLN(row.stdMonths.reduce((a, x) => a + x.brutto, 0))}</td>
                        <td className="py-2.5 px-3 text-right text-rose-300 tabular-nums">{formatPLN(row.stdRocznyPit)}</td>
                        <td className="py-2.5 px-3 text-right tabular-nums">{formatPLN(row.stdMonths.reduce((a, x) => a + x.netto, 0))}</td>
                        <td className="py-2.5 px-3 border-r border-white/10"></td>
                        <td className="py-2.5 px-3 text-right text-[#c8c6c4] tabular-nums">{formatPLN(row.eliMonths.reduce((a, x) => a + x.brutto, 0))}</td>
                        <td className="py-2.5 px-3 text-right text-blue-300 tabular-nums">{formatPLN(row.eliMonths.reduce((a, x) => a + x.s_brutto, 0))}</td>
                        <td className="py-2.5 px-3 text-right text-emerald-300 tabular-nums">{formatPLN(row.eliRocznyPit)}</td>
                        <td className="py-2.5 px-3 text-right tabular-nums">{formatPLN(row.eliMonths.reduce((a, x) => a + x.netto, 0))}</td>
                        <td className="py-2.5 px-3 border-r border-white/10"></td>
                        <td className={`py-2.5 px-3 text-right tabular-nums font-black ${row.pitOszczednosc >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                            {row.pitOszczednosc >= 0 ? '+' : ''}{formatPLN(row.pitOszczednosc)}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        {/* Info notes */}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[#605e5c]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-400 shrink-0"></span>Podświetlenie amber = miesiąc w II progu PIT (dochód narastająco &gt; {formatPLN(p1Limit)})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-400 shrink-0"></span>Świadczenie brutto = ekwiwalent brutto utrzymujący zadane netto po PIT (binary search)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-400 shrink-0"></span>Δ PIT &gt; 0 = mniejszy podatek w Eliton Prime™ (oszczędność pracownika)</span>
        </div>
    </div>
);
