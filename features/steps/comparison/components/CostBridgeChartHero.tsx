import React from 'react';
import { formatPLN } from '../../../../shared/utils/formatters';

interface CostBridgeChartHeroProps {
    sumaKosztStandard: number;
    oszczednoscNetto: number;
    isPrime: boolean;
}

export const CostBridgeChartHero: React.FC<CostBridgeChartHeroProps> = ({
    sumaKosztStandard,
    oszczednoscNetto,
    isPrime,
}) => (
    <div className="grid grid-cols-3 gap-0 border-b border-[#edebe9]">
        {/* PRZED */}
        <div className="p-4 sm:p-5 text-center border-r border-[#474645] bg-[#323130]">
            <div className="text-[9px] font-black text-[#c8c6c4] uppercase tracking-[.18em] mb-2">
                Koszt Przed Wdrożeniem
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tabular-nums leading-tight">
                {formatPLN(sumaKosztStandard)}
            </div>
            <div className="text-[9px] font-bold text-[#605e5c] mt-1.5 uppercase tracking-wider">miesięcznie</div>
        </div>

        {/* SAVINGS — centralny akcent */}
        <div className="p-4 sm:p-5 text-center border-r border-emerald-700 bg-emerald-600">
            <div className="text-[9px] font-black text-white uppercase tracking-[.18em] mb-2">
                ↓ Oszczędność Netto
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tabular-nums leading-tight">
                {formatPLN(oszczednoscNetto)}
            </div>
            <div className="text-[10px] font-black text-white mt-1.5 bg-emerald-800 px-2 py-0.5 inline-block">
                −{((oszczednoscNetto / sumaKosztStandard) * 100).toFixed(1)}%
            </div>
        </div>

        {/* PO */}
        <div className={`p-4 sm:p-5 text-center ${isPrime ? 'bg-amber-600' : 'bg-[#0078d4]'}`}>
            <div className="text-[9px] font-black text-white uppercase tracking-[.18em] mb-2">
                Koszt Po Wdrożeniu
            </div>
            <div className="text-xl sm:text-2xl font-black tabular-nums leading-tight text-white">
                {formatPLN(sumaKosztStandard - oszczednoscNetto)}
            </div>
            <div className="text-[9px] font-bold text-white/70 mt-1.5 uppercase tracking-wider">miesięcznie</div>
        </div>
    </div>
);
