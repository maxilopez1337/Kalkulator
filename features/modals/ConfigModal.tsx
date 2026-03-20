
import React from 'react';
import { Settings, X, Refresh, Wallet, ShieldCheck, FileText, Layers, Save, Calculator } from '../../common/Icons';
import { ButtonPrimary, ButtonSecondary } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { Modal } from '../../shared/ui/Modal';
import { DEFAULT_CONFIG } from '../../features/tax-engine/constants';
import { useCompany, useConfirm } from '../../store/AppContext';
import { pl } from '../../shared/i18n/pl';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface ConfigInputProps {
  label: string;
  path: string;
  suffix?: string;
  type?: "currency" | "percent";
  value: number;
  onChange: (path: string, value: number) => void;
}

const ConfigInput = ({ label, path, suffix, type = "percent", value, onChange }: ConfigInputProps) => (
    <div className="relative group">
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 group-hover:text-blue-600 transition-colors">{label}</label>
        <div className="relative">
            <input
              type="number"
              step={type === "percent" ? "0.01" : "1"}
              value={value}
              onChange={(e) => onChange(path, parseFloat(e.target.value))}
              className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-md text-sm font-mono font-medium text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium pointer-events-none">
                {suffix || (type === "percent" ? "%" : "zł")}
            </div>
        </div>
    </div>
);

export const ConfigModal = ({ isOpen, onClose }: Props) => {
  const { config, setConfig } = useCompany();
  const { confirmDialog } = useConfirm();

  if (!isOpen) return null;

  const updateConfig = (path: string, value: number) => {
    const newConfig = JSON.parse(JSON.stringify(config));
    const keys = path.split('.');
    let current = newConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setConfig(newConfig);
  };

  const getVal = (path: string): number => {
    const keys = path.split('.');
    let val = config as any;
    keys.forEach(k => val = val[k]);
    return val;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md:max-w-5xl" height="md:h-[90vh]" panelBg="bg-[#f8fafc]">
      <div className="flex flex-col h-full">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-4 md:px-8 md:py-5 border-b border-slate-200 bg-white shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
             <div className="p-2 md:p-2.5 bg-slate-900 text-white rounded-lg shadow-md">
                <Settings className="w-5 h-5 md:w-6 md:h-6" />
             </div>
             <div>
                <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Parametry</h2>
                <div className="text-xs font-medium text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="hidden sm:inline">Aktywna konfiguracja: </span>Rok 2026
                </div>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
          >
            <X />
          </button>
        </div>
        
        {/* BODY (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-slate-50">
            
            <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 pb-10">

                {/* SEKCJA 1: PARAMETRY BAZOWE */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Wallet className="text-slate-400" />
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Parametry Budżetowe (Minimalne)</h3>
                        <div className="h-px bg-slate-200 flex-1 ml-4 hidden sm:block"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                        <div className="bg-white p-4 md:p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-4 border-l-4 border-l-emerald-500">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-bold text-slate-900">Płaca Minimalna</span>
                                <Badge variant="success">2026</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <ConfigInput label="Brutto" path="placaMinimalna.brutto" type="currency" value={getVal('placaMinimalna.brutto')} onChange={updateConfig} />
                                <ConfigInput label="Netto (Ręcznie)" path="placaMinimalna.netto" type="currency" value={getVal('placaMinimalna.netto')} onChange={updateConfig} />
                            </div>
                        </div>

                        <div className="bg-white p-4 md:p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-4 border-l-4 border-l-amber-500">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-bold text-slate-900">Min. UZ (Do Podziału)</span>
                                <Badge variant="warning">Baza</Badge>
                            </div>
                            <ConfigInput label="Podstawa ZUS (Netto)" path="minimalnaKwotaUZ.zasadniczaNetto" type="currency" value={getVal('minimalnaKwotaUZ.zasadniczaNetto')} onChange={updateConfig} />
                        </div>

                        <div className="bg-white p-4 md:p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-4 border-l-4 border-l-blue-500 sm:col-span-2 md:col-span-1">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-bold text-slate-900">Składka Zdrowotna</span>
                                <Badge variant="primary">Global</Badge>
                            </div>
                            <ConfigInput label="Stawka (%)" path="zus.zdrowotna" type="percent" value={getVal('zus.zdrowotna')} onChange={updateConfig} />
                        </div>
                    </div>
                </section>

                {/* SEKCJA 2: ZUS UOP */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <ShieldCheck className="text-slate-400" />
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">ZUS – Umowa o Pracę (UoP)</h3>
                        <div className="h-px bg-slate-200 flex-1 ml-4 hidden sm:block"></div>
                    </div>

                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                            {/* PRACOWNIK */}
                            <div className="p-4 md:p-6 bg-blue-50/10">
                                <div className="flex items-center gap-2 mb-4 md:mb-6">
                                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                    <h4 className="font-bold text-blue-900 text-sm">Składki Pracownika</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                                    <ConfigInput label="Emerytalna" path="zus.uop.pracownik.emerytalna" value={getVal('zus.uop.pracownik.emerytalna')} onChange={updateConfig} />
                                    <ConfigInput label="Rentowa" path="zus.uop.pracownik.rentowa" value={getVal('zus.uop.pracownik.rentowa')} onChange={updateConfig} />
                                    <ConfigInput label="Chorobowa" path="zus.uop.pracownik.chorobowa" value={getVal('zus.uop.pracownik.chorobowa')} onChange={updateConfig} />
                                </div>
                            </div>

                            {/* PRACODAWCA */}
                            <div className="p-4 md:p-6 bg-purple-50/10">
                                <div className="flex items-center gap-2 mb-4 md:mb-6">
                                    <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                                    <h4 className="font-bold text-purple-900 text-sm">Składki Pracodawcy</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                                    <ConfigInput label="Emerytalna" path="zus.uop.pracodawca.emerytalna" value={getVal('zus.uop.pracodawca.emerytalna')} onChange={updateConfig} />
                                    <ConfigInput label="Rentowa" path="zus.uop.pracodawca.rentowa" value={getVal('zus.uop.pracodawca.rentowa')} onChange={updateConfig} />
                                    <ConfigInput label="Wypadkowa" path="zus.uop.pracodawca.wypadkowa" value={getVal('zus.uop.pracodawca.wypadkowa')} onChange={updateConfig} />
                                    <ConfigInput label="Fundusz Pracy" path="zus.uop.pracodawca.fp" value={getVal('zus.uop.pracodawca.fp')} onChange={updateConfig} />
                                    <ConfigInput label="FGŚP" path="zus.uop.pracodawca.fgsp" value={getVal('zus.uop.pracodawca.fgsp')} onChange={updateConfig} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SEKCJA 3: ZUS UZ */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Layers className="text-slate-400" />
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">ZUS – Umowa Zlecenie (UZ)</h3>
                        <div className="h-px bg-slate-200 flex-1 ml-4 hidden sm:block"></div>
                    </div>

                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                            {/* PRACOWNIK */}
                            <div className="p-4 md:p-6 bg-amber-50/10">
                                <div className="flex items-center gap-2 mb-4 md:mb-6">
                                    <div className="w-2 h-2 rounded-full bg-amber-600"></div>
                                    <h4 className="font-bold text-amber-900 text-sm">Składki Pracownika (UZ)</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                                    <ConfigInput label="Emerytalna" path="zus.uz.pracownik.emerytalna" value={getVal('zus.uz.pracownik.emerytalna')} onChange={updateConfig} />
                                    <ConfigInput label="Rentowa" path="zus.uz.pracownik.rentowa" value={getVal('zus.uz.pracownik.rentowa')} onChange={updateConfig} />
                                    <ConfigInput label="Chorobowa (Dobrow.)" path="zus.uz.pracownik.chorobowa" value={getVal('zus.uz.pracownik.chorobowa')} onChange={updateConfig} />
                                </div>
                            </div>

                            {/* PRACODAWCA */}
                            <div className="p-4 md:p-6 bg-amber-50/10">
                                <div className="flex items-center gap-2 mb-4 md:mb-6">
                                    <div className="w-2 h-2 rounded-full bg-amber-600"></div>
                                    <h4 className="font-bold text-amber-900 text-sm">Składki Pracodawcy (UZ)</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                                    <ConfigInput label="Emerytalna" path="zus.uz.pracodawca.emerytalna" value={getVal('zus.uz.pracodawca.emerytalna')} onChange={updateConfig} />
                                    <ConfigInput label="Rentowa" path="zus.uz.pracodawca.rentowa" value={getVal('zus.uz.pracodawca.rentowa')} onChange={updateConfig} />
                                    <ConfigInput label="Wypadkowa" path="zus.uz.pracodawca.wypadkowa" value={getVal('zus.uz.pracodawca.wypadkowa')} onChange={updateConfig} />
                                    <ConfigInput label="Fundusz Pracy" path="zus.uz.pracodawca.fp" value={getVal('zus.uz.pracodawca.fp')} onChange={updateConfig} />
                                    <ConfigInput label="FGŚP" path="zus.uz.pracodawca.fgsp" value={getVal('zus.uz.pracodawca.fgsp')} onChange={updateConfig} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SEKCJA 4: PIT */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="text-slate-400" />
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Podatek Dochodowy (PIT)</h3>
                        <div className="h-px bg-slate-200 flex-1 ml-4 hidden sm:block"></div>
                    </div>

                    <div className="bg-white p-4 md:p-6 rounded-lg border border-slate-200 shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            <ConfigInput label="I Próg (Stawka)" path="pit.prog1Stawka" type="percent" value={getVal('pit.prog1Stawka')} onChange={updateConfig} />
                            <ConfigInput label="II Próg (Stawka)" path="pit.prog2Stawka" type="percent" value={getVal('pit.prog2Stawka')} onChange={updateConfig} />
                            <ConfigInput label="Limit I Progu" path="pit.prog1Limit" type="currency" value={getVal('pit.prog1Limit')} onChange={updateConfig} />
                            <ConfigInput label="Kwota Wolna (Rok)" path="pit.kwotaWolnaRoczna" type="currency" value={getVal('pit.kwotaWolnaRoczna')} onChange={updateConfig} />
                            
                            <div className="col-span-1 sm:col-span-2 md:col-span-4 h-px bg-slate-100 my-2 hidden sm:block"></div>
                            
                            <ConfigInput label="Kwota Zmniejszająca (Msc)" path="pit.kwotaZmniejszajacaMies" type="currency" value={getVal('pit.kwotaZmniejszajacaMies')} onChange={updateConfig} />
                            <ConfigInput label="KUP Standard (Msc)" path="pit.kupStandard" type="currency" value={getVal('pit.kupStandard')} onChange={updateConfig} />
                            <ConfigInput label="KUP Podwyższone" path="pit.kupPodwyzszone" type="currency" value={getVal('pit.kupPodwyzszone')} onChange={updateConfig} />
                            <ConfigInput label="KUP UZ Standard" path="pit.uzKupProc" type="percent" value={getVal('pit.uzKupProc')} onChange={updateConfig} />
                            <ConfigInput label="KUP UZ Autorskie" path="pit.uzKupAutorskie" type="percent" value={getVal('pit.uzKupAutorskie')} onChange={updateConfig} />
                        </div>
                    </div>
                </section>

                {/* SEKCJA 5: ULGI I ZWOLNIENIA */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <ShieldCheck className="text-slate-400" />
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Ulgi i Zwolnienia</h3>
                        <div className="h-px bg-slate-200 flex-1 ml-4 hidden sm:block"></div>
                    </div>
                    <div className="bg-white p-4 md:p-6 rounded-lg border border-slate-200 shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            <ConfigInput label="Ulga Młodych — Max Wiek" path="pit.ulgaMlodziMaxWiek" type="currency" suffix="lat" value={getVal('pit.ulgaMlodziMaxWiek')} onChange={updateConfig} />
                            <ConfigInput label="Ulga Młodych — Limit Roczny" path="pit.ulgaMlodziLimitRoczny" type="currency" value={getVal('pit.ulgaMlodziLimitRoczny')} onChange={updateConfig} />
                            <ConfigInput label="Zwolnienie FP/FGŚP — Kobiety (wiek)" path="pit.fpZwolnienieWiekKobieta" type="currency" suffix="lat" value={getVal('pit.fpZwolnienieWiekKobieta')} onChange={updateConfig} />
                            <ConfigInput label="Zwolnienie FP/FGŚP — Mężczyźni (wiek)" path="pit.fpZwolnienieWiekMezczyzna" type="currency" suffix="lat" value={getVal('pit.fpZwolnienieWiekMezczyzna')} onChange={updateConfig} />
                        </div>
                    </div>
                </section>

                {/* SEKCJA 6: ŚWIADCZENIE POZAPŁACOWE */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Layers className="text-slate-400" />
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Świadczenie Pozapłacowe (EBS)</h3>
                        <div className="h-px bg-slate-200 flex-1 ml-4 hidden sm:block"></div>
                    </div>
                    <div className="bg-white p-4 md:p-6 rounded-lg border border-slate-200 shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            <ConfigInput label="Stawka PIT Świadczenia" path="swiadczenie.stawkaPit" type="percent" value={getVal('swiadczenie.stawkaPit')} onChange={updateConfig} />
                            <ConfigInput label="Odpłatność Pracownika" path="swiadczenie.odplatnosc" type="currency" value={getVal('swiadczenie.odplatnosc')} onChange={updateConfig} />
                        </div>
                    </div>
                </section>

                {/* SEKCJA 7: PROWIZJA EBS */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Calculator className="text-slate-400" />
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Prowizja EBS</h3>
                        <div className="h-px bg-slate-200 flex-1 ml-4 hidden sm:block"></div>
                    </div>
                    <div className="bg-white p-4 md:p-6 rounded-lg border border-slate-200 shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            <ConfigInput label="Prowizja — Standard (%)" path="prowizja.standard" type="percent" value={getVal('prowizja.standard')} onChange={updateConfig} />
                            <ConfigInput label="Prowizja — Plus (%)" path="prowizja.plus" type="percent" value={getVal('prowizja.plus')} onChange={updateConfig} />
                        </div>
                    </div>
                </section>

            </div>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between px-4 py-4 md:px-8 md:py-5 border-t border-slate-200 bg-white z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] gap-3 shrink-0">
          <div className="w-full sm:w-auto">
              <ButtonSecondary 
                onClick={async () => { 
                    if(await confirmDialog(pl.confirms.resetConfig)) {
                        setConfig(DEFAULT_CONFIG); 
                    }
                }}
                className="text-slate-500 hover:text-slate-700 w-full sm:w-auto"
                icon={<Refresh />}
              >
                  Przywróć domyślne
              </ButtonSecondary>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
              <ButtonSecondary onClick={onClose} className="flex-1 sm:flex-none justify-center">{pl.buttons.cancel}</ButtonSecondary>
              <ButtonPrimary onClick={onClose} icon={<Save />} className="flex-1 sm:flex-none justify-center">{pl.buttons.save}</ButtonPrimary>
          </div>
        </div>
      </div>
    </Modal>
  );
};
