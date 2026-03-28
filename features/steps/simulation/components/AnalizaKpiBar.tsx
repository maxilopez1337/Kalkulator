import React from 'react';
import { formatPLN } from '../../../../shared/utils/formatters';

interface KpiTotals {
    n: number;
    stdRocznyPit: number;
    eliRocznyPit: number;
    pitOszczednosc: number;
    stdIIProg: number;
    eliIIProg: number;
}

interface AnalizaKpiBarProps {
    totals: KpiTotals;
}

export const AnalizaKpiBar = ({ totals }: AnalizaKpiBarProps) => (
    <div className="shrink-0 px-4 md:px-6 py-3">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {[
                { label: 'Pracownicy', val: totals.n, cls: 'bg-white border-[#edebe9] text-[#201f1e]', valCls: 'text-[#201f1e]' },
                { label: 'PIT/rok – Tradycyjny', val: formatPLN(totals.stdRocznyPit), cls: 'bg-white border-rose-100', valCls: 'text-rose-700' },
                { label: 'PIT/rok – Eliton Prime™', val: formatPLN(totals.eliRocznyPit), cls: 'bg-white border-emerald-100', valCls: 'text-emerald-700' },
                { label: 'Oszczędność PIT (roczna)', val: `+${formatPLN(totals.pitOszczednosc)}`, cls: 'bg-emerald-50 border-emerald-200', valCls: 'text-emerald-800 font-black' },
                { label: 'W II progu – Tradycyjny', val: `${totals.stdIIProg} os.`, cls: 'bg-amber-50 border-amber-200', valCls: 'text-amber-800' },
                { label: 'W II progu – Eliton', val: `${totals.eliIIProg} os.`, cls: 'bg-white border-blue-200', valCls: 'text-blue-700' },
            ].map(kpi => (
                <div key={kpi.label} className={`border rounded-md px-3 py-2 shadow-sm ${kpi.cls}`}>
                    <div className="text-[9px] text-[#605e5c] font-bold uppercase tracking-wider mb-0.5">{kpi.label}</div>
                    <div className={`text-sm font-bold tabular-nums ${kpi.valCls}`}>{kpi.val}</div>
                </div>
            ))}
        </div>
    </div>
);
