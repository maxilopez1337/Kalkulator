import React from 'react';
import { formatPLN } from '../../../../shared/utils/formatters';

interface KpiTotals {
    stdRocznyPit: number;
    eliRocznyPit: number;
    pitOszczednosc: number;
    stdIIProg: number;
    eliIIProg: number;
}

interface AnalizaGrandTotalsProps {
    totals: KpiTotals;
}

export const AnalizaGrandTotals = ({ totals }: AnalizaGrandTotalsProps) => (
    <tr className="bg-[#001433] text-white">
        <td></td>
        <td colSpan={2} className="py-3.5 px-3 text-[10px] font-bold uppercase tracking-wider opacity-70">SUMA FIRMA / ROK</td>
        <td colSpan={2}></td>
        <td className="py-3.5 px-3 text-right font-black text-rose-300 tabular-nums text-xs">{formatPLN(totals.stdRocznyPit)}</td>
        <td className="py-3.5 px-3 text-center border-r border-white/10">
            <span className="text-amber-300 text-[10px] font-bold">{totals.stdIIProg} w II progu</span>
        </td>
        <td colSpan={5}></td>
        <td className="py-3.5 px-3 text-right font-black text-emerald-300 tabular-nums text-xs">{formatPLN(totals.eliRocznyPit)}</td>
        <td className="py-3.5 px-3 text-center border-r border-white/10">
            <span className="text-amber-300 text-[10px] font-bold">{totals.eliIIProg} w II progu</span>
        </td>
        <td className="py-3.5 px-3 text-right font-black text-emerald-400 tabular-nums text-xs">
            +{formatPLN(totals.pitOszczednosc)}
        </td>
        <td></td>
    </tr>
);
