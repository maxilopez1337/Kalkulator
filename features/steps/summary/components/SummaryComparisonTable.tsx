import React from 'react';
import { formatPLN } from '../../../../shared/utils/formatters';
import { Star, ShieldCheck } from '../../../../shared/icons/Icons';

interface Props {
  stats: {
    standard: {
      brutto: number;
      zusPracodawca: number;
      kosztPracodawcy: number;
      zusSpoleczne: number;
      zdrowotna: number;
      pit: number;
      netto: number;
    };
    stratton: {
      brutto: number;
      zusPracodawca: number;
      kosztPracodawcy: number;
      zusSpoleczne: number;
      zdrowotna: number;
      pit: number;
      netto: number;
      prowizja: number;
    };
    count: number;
  };
  prowizjaProc: number;
  activeModel: 'STANDARD' | 'PRIME';
}

export const SummaryComparisonTable = ({ stats, prowizjaProc, activeModel }: Props) => {
  // Obliczenia pomocnicze
  const stdZusPracownikaTotal = stats.standard.zusSpoleczne + stats.standard.zdrowotna;
  const strZusPracownikaTotal = stats.stratton.zusSpoleczne + stats.stratton.zdrowotna;
  const strKosztZProwizja = stats.stratton.kosztPracodawcy + stats.stratton.prowizja;

  const totalProvision = stats.stratton.prowizja;
  // Podstawa prowizji to suma świadczeń netto (nie brutto!)
  const baseBenefitNetto = prowizjaProc > 0 ? totalProvision / (prowizjaProc / 100) : 0;
  const includeRaises = activeModel === 'PRIME';

  // Podwyżka 4% i bonus 2% tylko dla PRIME (PLUS)
  const raiseAmount = includeRaises ? baseBenefitNetto * 0.04 : 0;
  const adminAmount = includeRaises ? baseBenefitNetto * 0.02 : 0;
  const feeAmount = includeRaises
    ? Math.max(0, totalProvision - raiseAmount - adminAmount)
    : totalProvision;

  // --- CONFIG MOTYWU ---
  const theme =
    activeModel === 'PRIME'
      ? {
          borderL: 'border-l-4 border-l-amber-400',
          bgHighlight: 'bg-amber-50/40',
          textHighlight: 'text-amber-900',
          iconColor: 'text-amber-500',
          headerText: 'Eliton Prime™ PLUS',
          badge: 'bg-amber-100 text-amber-700 border-amber-200',
        }
      : {
          borderL: 'border-l-4 border-l-blue-400',
          bgHighlight: 'bg-blue-50/40',
          textHighlight: 'text-blue-900',
          iconColor: 'text-blue-500',
          headerText: 'Eliton Prime™',
          badge: 'bg-blue-100 text-blue-700 border-blue-200',
        };

  // --- RENDERER WIERSZA (DESKTOP) ---
  const renderRow = (
    label: string,
    subLabel: string | null,
    valStd: number | null,
    valStr: number,
    isTotalLike: boolean = false,
    customDiffCalc?: (std: number, str: number) => number,
    customStrClass?: string,
    hideDiffBackground: boolean = false
  ) => {
    const std = valStd || 0;
    const diff = customDiffCalc
      ? customDiffCalc(std, valStr)
      : valStd !== null
        ? valStr - valStd
        : valStr;

    const borderClass = isTotalLike ? 'border-b-2 border-[#edebe9]' : 'border-b border-[#edebe9]';

    return (
      <div
        className={`group grid grid-cols-12 items-center hover:bg-[#f3f2f1] transition-colors ${borderClass}`}
      >
        {/* 1. LABEL (Col 1-4) */}
        <div className="col-span-4 pl-6 py-4 pr-4">
          <div
            className={`text-sm ${isTotalLike ? 'font-bold text-[#201f1e]' : 'font-medium text-[#323130]'}`}
          >
            {label}
          </div>
          {subLabel && (
            <div className="text-[10px] uppercase tracking-wider text-[#a19f9d] mt-0.5 font-semibold">
              {subLabel}
            </div>
          )}
        </div>

        {/* 2. STANDARD (Col 5-7) */}
        <div className="col-span-3 px-4 py-4 text-right">
          <div
            className={`font-mono tabular-nums tracking-tight ${isTotalLike ? 'text-[#605e5c] font-bold' : 'text-[#605e5c] text-sm'}`}
          >
            {valStd !== null ? formatPLN(valStd) : <span className="text-[#c8c6c4]">-</span>}
          </div>
        </div>

        {/* 3. NEW MODEL (Col 8-10) - HIGHLIGHTED */}
        <div
          className={`col-span-3 px-4 py-4 text-right relative ${theme.bgHighlight} ${theme.borderL}`}
        >
          <div
            className={`font-mono tabular-nums tracking-tight ${isTotalLike ? 'text-lg font-extrabold' : 'font-bold text-base'} ${customStrClass || 'text-[#201f1e]'}`}
          >
            {formatPLN(valStr)}
          </div>
        </div>

        {/* 4. DIFFERENCE (Col 11-12) */}
        <div className="col-span-2 px-4 py-4 text-right">
          {Math.abs(diff) > 0.01 ? (
            <div
              className={`inline-block px-2 py-1 rounded text-[11px] font-bold font-mono tabular-nums
                            ${
                              hideDiffBackground
                                ? 'text-emerald-600'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }
                        `}
            >
              {diff > 0 ? '+' : ''}
              {formatPLN(diff).replace(' zł', '')}
            </div>
          ) : (
            <span className="text-[#c8c6c4] text-xs">–</span>
          )}
        </div>
      </div>
    );
  };

  const renderSummaryFooter = () => {
    const valStd = stats.standard.kosztPracodawcy;
    const valStr = strKosztZProwizja;
    const diff = valStr - valStd;

    return (
      <div className="mt-auto bg-[#001433] text-white rounded-b-md overflow-hidden">
        <div className="grid grid-cols-12 items-center">
          <div className="col-span-4 pl-6 py-5">
            <div className="text-sm font-bold uppercase tracking-widest text-[#a19f9d]">
              Całkowity Koszt Brutto Pracodawcy
            </div>
            <div className="text-xs text-[#605e5c] mt-0.5">(Miesięcznie)</div>
          </div>

          <div className="col-span-3 px-4 py-5 text-right">
            <div className="text-[#605e5c] text-xs uppercase font-bold mb-1">Standard</div>
            <div className="font-mono text-lg text-[#a19f9d] line-through decoration-[#605e5c]">
              {formatPLN(valStd)}
            </div>
          </div>

          <div className={`col-span-3 px-4 py-5 text-right relative bg-white/5`}>
            <div
              className={`absolute inset-y-0 left-0 w-1 ${activeModel === 'PRIME' ? 'bg-amber-500' : 'bg-blue-500'}`}
            ></div>
            <div
              className={`text-xs uppercase font-bold mb-1 ${activeModel === 'PRIME' ? 'text-amber-500' : 'text-blue-400'}`}
            >
              Nowy Model
            </div>
            <div className="font-mono text-xl font-bold text-white">{formatPLN(valStr)}</div>
          </div>

          <div className="col-span-2 px-4 py-5 text-right">
            <div className="text-emerald-500 text-xs uppercase font-bold mb-1">Oszczędność</div>
            <div className="font-mono text-lg font-bold text-emerald-400">{formatPLN(diff)}</div>
          </div>
        </div>
      </div>
    );
  };

  // --- MOBILE CARDS (UNCHANGED LOGIC, JUST STYLING UPDATE) ---
  interface MobileRowCardProps {
    label: string;
    subLabel: string | null;
    valStd: number | null;
    valStr: number;
    customDiffCalc?: (std: number, str: number) => number;
    customStrClass?: string;
  }
  const MobileRowCard = ({
    label,
    subLabel,
    valStd,
    valStr,
    customDiffCalc,
    customStrClass,
  }: MobileRowCardProps) => {
    const std = valStd || 0;
    const diff = customDiffCalc
      ? customDiffCalc(std, valStr)
      : valStd !== null
        ? valStr - valStd
        : valStr;
    const isPos = diff <= 0.01 || label.includes('Netto') || label.includes('Podwyżka');

    return (
      <div className="bg-white border border-[#edebe9] rounded-md p-3 shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),0_0.3px_0.9px_0_rgba(0,0,0,0.11)] mb-2">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="font-bold text-[#201f1e] text-sm">{label}</div>
            <div className="text-[10px] text-[#a19f9d] uppercase font-bold">{subLabel}</div>
          </div>
          {Math.abs(diff) > 0.01 && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${isPos ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}
            >
              {formatPLN(diff)}
            </span>
          )}
        </div>
        <div className="flex justify-between items-end border-t border-[#edebe9] pt-2">
          <div className="text-xs text-[#a19f9d] font-mono">{valStd ? formatPLN(valStd) : '-'}</div>
          <div className={`text-sm font-bold font-mono ${customStrClass || 'text-[#201f1e]'}`}>
            {formatPLN(valStr)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-md shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),0_0.3px_0.9px_0_rgba(0,0,0,0.11)] border border-[#edebe9]">
      {/* DESKTOP HEADER */}
      <div className="hidden md:grid grid-cols-12 bg-[#f3f2f1] border-b border-[#edebe9] py-3 text-[10px] font-bold text-[#605e5c] uppercase tracking-wider">
        <div className="col-span-4 pl-6">Kategoria Kosztowa</div>
        <div className="col-span-3 text-right px-4">Obecnie (Standard)</div>
        <div
          className={`col-span-3 text-right px-4 flex items-center justify-end gap-2 ${theme.textHighlight}`}
        >
          {activeModel === 'PRIME' ? (
            <Star className="w-3 h-3 mb-0.5" />
          ) : (
            <ShieldCheck className="w-3 h-3 mb-0.5" />
          )}
          {theme.headerText}
        </div>
        <div className="col-span-2 text-right px-4">Zmiana</div>
      </div>

      {/* DESKTOP BODY */}
      <div className="hidden md:block flex-1 overflow-auto">
        {renderRow(
          'Wynagrodzenie pracowników Brutto',
          'Z UMOWY',
          stats.standard.brutto,
          stats.stratton.brutto
        )}
        {renderRow(
          'ZUS Pracodawcy',
          'EMERYTALNA, RENTOWA, WYP.',
          stats.standard.zusPracodawca,
          stats.stratton.zusPracodawca
        )}
        {renderRow(
          'ZUS Pracownika',
          'SPOŁECZNE + ZDROWOTNE',
          stdZusPracownikaTotal,
          strZusPracownikaTotal
        )}
        {renderRow(
          'Netto Pracownika',
          'DO WYPŁATY (NA RĘKĘ)',
          stats.standard.netto,
          stats.stratton.netto,
          true
        )}

        {/* Spacer */}
        <div className="h-4 bg-[#f3f2f1]/30 border-b border-[#edebe9]"></div>

        {renderRow(
          'Opłata serwisowa EBS',
          `${prowizjaProc}% wartości nominalnej świadczeń`,
          null,
          feeAmount,
          false,
          undefined,
          'text-[#605e5c] font-semibold',
          true
        )}

        {/* Bonus admina 2% zawsze pokazuj */}
        {adminAmount > 0 &&
          renderRow(
            'Bonus dla Działu Księgowo-Kadrowego wyliczany od świadczenia netto',
            '2% wypłacane przez STRATTON',
            0,
            adminAmount,
            true,
            (s, n) => n,
            'text-blue-700 font-bold'
          )}
        {/* Podwyżka 4% tylko dla PRIME */}
        {includeRaises &&
          raiseAmount > 0 &&
          renderRow(
            'Dodatkowa podwyżka wynagrodzenia dla pracowników, wyliczana od świadczenia netto',
            '+4% świadczeń rzeczowych EBS finansowane przez Stratton Prime',
            0,
            raiseAmount,
            true,
            (s, n) => n,
            'text-emerald-700 font-bold'
          )}
      </div>

      {/* DESKTOP FOOTER */}
      <div className="hidden md:block">{renderSummaryFooter()}</div>

      {/* MOBILE VIEW */}
      <div className="md:hidden p-3 space-y-2">
        <MobileRowCard
          label="Wynagrodzenie pracowników Brutto"
          subLabel="Z Umowy"
          valStd={stats.standard.brutto}
          valStr={stats.stratton.brutto}
        />
        <MobileRowCard
          label="ZUS Pracodawcy"
          subLabel="Koszt Firmy"
          valStd={stats.standard.zusPracodawca}
          valStr={stats.stratton.zusPracodawca}
        />
        <MobileRowCard
          label="ZUS Pracownika"
          subLabel="Społeczne"
          valStd={stdZusPracownikaTotal}
          valStr={strZusPracownikaTotal}
        />
        <MobileRowCard
          label="Netto Pracownika"
          subLabel="Na rękę"
          valStd={stats.standard.netto}
          valStr={stats.stratton.netto}
          customStrClass="text-blue-700"
        />

        <div className="my-2 border-t border-dashed border-[#edebe9]"></div>
        <MobileRowCard
          label="Opłata serwisowa EBS"
          subLabel={`${prowizjaProc}% wartości nominalnej świadczeń`}
          valStd={null}
          valStr={feeAmount}
        />
        {/* Bonus admina 2% zawsze pokazuj */}
        {adminAmount > 0 && (
          <MobileRowCard
            label="Bonus (2%)"
            subLabel="Dla działu księgowo-kadrowego"
            valStd={0}
            valStr={adminAmount}
            customStrClass="text-blue-700"
            customDiffCalc={(s, n) => n}
          />
        )}
        {/* Podwyżka 4% tylko dla PRIME */}
        {includeRaises && raiseAmount > 0 && (
          <MobileRowCard
            label="Podwyżka (4%)"
            subLabel="Dla pracownika"
            valStd={0}
            valStr={raiseAmount}
            customStrClass="text-emerald-700"
            customDiffCalc={(s, n) => n}
          />
        )}

        <div className="bg-[#001433] rounded-md p-4 text-white mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase text-[#a19f9d]">Koszt Całkowity</span>
            <span className="text-xs bg-[#323130] px-2 py-0.5 rounded-sm text-emerald-400">
              Oszcz. {formatPLN(stats.standard.kosztPracodawcy - strKosztZProwizja)}
            </span>
          </div>
          <div className="flex justify-between items-end">
            <div className="text-sm text-[#605e5c] line-through font-mono">
              {formatPLN(stats.standard.kosztPracodawcy)}
            </div>
            <div className="text-xl font-bold font-mono">{formatPLN(strKosztZProwizja)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
