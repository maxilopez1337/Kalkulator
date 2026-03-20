import React, { useState, useMemo } from 'react';
import { Pracownik } from '../../../../entities/employee/model';
import { Config } from '../../../../entities/company/model';
import { obliczWariantStandard } from '../../../tax-engine';
import { Info, Calculator, TrendingUp } from '../../../../common/Icons';

interface TaxSimulationProps {
  pracownik: Pracownik;
  config: Config;
  stawkaWypadkowa: number;
}

export const TaxSimulation = ({ pracownik, config, stawkaWypadkowa }: TaxSimulationProps) => {
  const [enabled, setEnabled] = useState(false);

  // Wyliczenie rocznej symulacji podatkowej
  const symulacja = useMemo(() => {
    if (!enabled) return null;

    // 1. Uruchamiamy silnik, by dostać pełną kalkulację STANDARDOWĄ na 1 miesiąc
    const wynik = obliczWariantStandard(pracownik, stawkaWypadkowa, config);

    // Parametry podatkowe z konfiguracji
    const PROG_PODATKOWY = config.pit.prog1Limit;
    const KWOTA_WOLNA_ROCZNIE = config.pit.kwotaWolnaRoczna;
    
    // Obliczamy miesięczną kwotę zmniejszającą wziętą prosto z deklaracji pracownika
    const kwotaZmniejszajacaMiesiac = parseFloat(pracownik.pit2) || 0; 
    const kwotaZmniejszajacaRocznie = kwotaZmniejszajacaMiesiac * 12;

    // Podstawa opodatkowania w skali roku (przychód minus ZUS społeczny minus KUP)
    const rocznaPodstawa = wynik.podstawaPit * 12;

    // Separacja dochodów dla dwóch progów
    const kwotaDoProgu = Math.min(rocznaPodstawa, PROG_PODATKOWY);
    const kwotaPowyzejProgu = Math.max(0, rocznaPodstawa - PROG_PODATKOWY);

    const przekroczenieProgu = rocznaPodstawa > PROG_PODATKOWY;

    // Kwoty wpadające odpowiednio w stawkę I i II progu (przed odjęciem ulgi)
    const pit12 = kwotaDoProgu * (config.pit.prog1Stawka / 100);
    const pit32 = kwotaPowyzejProgu * (config.pit.prog2Stawka / 100);

    return {
      miesiecznaMaksym: wynik.brutto,
      podstawaPit: wynik.podstawaPit,
      rocznaPodstawa,
      kwotaDoProgu,
      kwotaPowyzejProgu,
      pit12,
      pit32,
      przekroczenieProgu,
      kwotaZmniejszajacaMiesiac,
      kwotaZmniejszajacaRocznie,
      kwotaWolna: KWOTA_WOLNA_ROCZNIE,
      rocznyPodatekZakladany: Math.max(0, pit12 + pit32 - kwotaZmniejszajacaRocznie)
    };
  }, [enabled, pracownik, config, stawkaWypadkowa]);

  const formatPLN = (val: number) => {
    return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(val);
  };

  return (
    <div className="mt-6 pt-4 border-t border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-800">
            <Calculator className="w-5 h-5 text-indigo-500" />
            <span className="font-semibold text-sm">Symulacja podatkowa (Roczna)</span>
            {enabled && <span className="text-[10px] ml-2 bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-in fade-in">Aktywna</span>}
        </div>
        
        {/* Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          <span className="ml-3 text-xs font-medium text-slate-500">{enabled ? 'Włączona' : 'Wyłączona'}</span>
        </label>
      </div>

      {enabled && symulacja && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 fade-in duration-300">
            
            {/* Lewa kolumna: Parametry wejściowe & Wolne od podatku */}
            <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-col gap-3">
                
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-xs text-slate-500">Miesięczna podstawa (PIT)</span>
                    <span className="text-sm font-bold">{formatPLN(symulacja.podstawaPit)}</span>
                </div>
                
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 tooltip-trigger relative group">
                        <span className="text-xs text-slate-500">Roczna kwota wolna</span>
                        <Info className="w-3.5 h-3.5 text-slate-400" />
                        <div className="absolute hidden group-hover:block bottom-full left-0 mb-1 w-48 bg-slate-800 text-white text-[10px] p-2 rounded z-10">
                            Każdy podatnik na skali ma do dyspozycji 30 000 zł całkowicie zwolnione z podatku.
                        </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">{formatPLN(symulacja.kwotaWolna)}</span>
                </div>

                <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500">Zmniejszenie podatku (Mies./Rok)</span>
                        <span className="text-[10px] text-slate-400">Na podst. złożonego PIT-2</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-bold">{formatPLN(symulacja.kwotaZmniejszajacaMiesiac)}</span>
                        <span className="text-[10px] text-slate-400 font-mono">x 12 = {formatPLN(symulacja.kwotaZmniejszajacaRocznie)}</span>
                    </div>
                </div>
            </div>

            {/* Prawa kolumna: Detekcja Progów i suma */}
            <div className={`border rounded-lg p-3 shadow-sm flex flex-col gap-3 ${symulacja.przekroczenieProgu ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-700 font-semibold mb-0.5">Skumulowana podstawa PIT (Rok)</span>
                        {symulacja.przekroczenieProgu ? (
                            <span className="text-[10px] text-rose-600 font-bold flex items-center gap-1"><TrendingUp size={12}/> Przekroczono II próg podatkowy!</span>
                        ) : (
                            <span className="text-[10px] text-emerald-600 font-medium">Bezpieczny w I progu podatkowym</span>
                        )}
                    </div>
                    <span className={`text-sm font-bold ${symulacja.przekroczenieProgu ? 'text-rose-700' : 'text-slate-900'}`}>
                        {formatPLN(symulacja.rocznaPodstawa)}
                    </span>
                </div>

                <table className="w-full text-xs text-slate-600">
                    <tbody>
                        <tr>
                            <td className="py-1">Opodatkowanie 12%</td>
                            <td className="text-right py-1 font-mono">{formatPLN(symulacja.pit12)}</td>
                        </tr>
                        {symulacja.przekroczenieProgu && (
                            <tr className="text-rose-700 font-medium">
                                <td className="py-1">Opodatkowanie 32%</td>
                                <td className="text-right py-1 font-mono">+ {formatPLN(symulacja.pit32)}</td>
                            </tr>
                        )}
                        <tr>
                            <td className="py-1 text-[10px] text-slate-400">Ulga zmniejszająca (PIT-2)</td>
                            <td className="text-right py-1 text-[10px] text-slate-400 font-mono">- {formatPLN(symulacja.kwotaZmniejszajacaRocznie)}</td>
                        </tr>
                    </tbody>
                </table>
                
                <div className="w-full h-px bg-slate-200 my-0.5"></div>
                
                <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-tight">Roczna Zaliczka Podatkowa</span>
                    <span className="text-base font-black text-slate-900 leading-none">
                        {pracownik.ulgaMlodych ? formatPLN(0) : formatPLN(symulacja.rocznyPodatekZakladany)}
                        {pracownik.ulgaMlodych && <span className="block text-[9px] text-right font-normal text-emerald-600 mt-1">Status: Ulga dla młodych (Zwolnienie)</span>}
                    </span>
                </div>

            </div>

        </div>
      )}
    </div>
  );
};
