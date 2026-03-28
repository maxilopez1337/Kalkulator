
import React from 'react';
import { Settings, X, Refresh, Wallet, ShieldCheck, FileText, Layers, Save, Calculator } from '../../shared/icons/Icons';
import { ButtonPrimary, ButtonSecondary } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { Modal } from '../../shared/ui/Modal';
import { DEFAULT_CONFIG } from '../../features/tax-engine/constants';
import { useCompany, useConfirm } from '../../store/AppContext';
import { pl } from '../../shared/i18n/pl';
import { shadow } from '../../shared/config/theme';

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
        <label className="block text-[10px] font-bold text-[#605e5c] uppercase tracking-wider mb-1 group-hover:text-[#0078d4] transition-colors">{label}</label>
        <div className="relative">
            <input
              type="number"
              step={type === "percent" ? "0.01" : "1"}
              value={value}
              onChange={(e) => onChange(path, parseFloat(e.target.value))}
              className="w-full pl-3 pr-8 py-2 bg-white border border-[#8a8886] rounded-sm text-sm font-mono font-medium text-[#201f1e] outline-none transition-all hover:border-[#323130] focus:border-[#0078d4] focus:border-2 focus:pl-[11px] focus:pr-[31px] focus:py-[7px]"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#a19f9d] font-medium pointer-events-none">
                {suffix || (type === "percent" ? "%" : "zł")}
            </div>
        </div>
    </div>
);

// Sekcja header — ikona + tytuł + linia
const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <div className="flex items-center gap-2 mb-4">
        <div className="text-[#a19f9d]">{icon}</div>
        <h3 className="text-[11px] font-bold text-[#605e5c] uppercase tracking-widest">{title}</h3>
        <div className="h-px bg-[#edebe9] flex-1 ml-4 hidden sm:block" />
    </div>
);

// Karta sekcji — spójny container
const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-md border border-[#edebe9] ${shadow.elevation4} ${className}`}>
        {children}
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
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md:max-w-5xl" height="md:h-[90vh]" panelBg="bg-[#f3f2f1]">
      <div className="flex flex-col h-full">

        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-[#edebe9] bg-white shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-sm bg-brand flex items-center justify-center flex-shrink-0">
                <Settings className="w-4 h-4 text-white" />
             </div>
             <div>
                <h2 className="text-[15px] font-semibold text-[#201f1e] leading-tight">Parametry systemu</h2>
                <div className="text-[11px] text-[#a19f9d] flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    Aktywna konfiguracja · Rok 2026
                </div>
             </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#605e5c] hover:text-[#201f1e] hover:bg-[#f3f2f1] rounded-sm transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-[#f3f2f1]">
            <div className="max-w-5xl mx-auto space-y-6 pb-10">

                {/* SEKCJA 1: PARAMETRY BAZOWE */}
                <section>
                    <SectionHeader icon={<Wallet />} title="Parametry Budżetowe (Minimalne)" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <SectionCard className="p-4 flex flex-col gap-4 border-l-4 border-l-emerald-500">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-[#201f1e]">Płaca Minimalna</span>
                                <Badge variant="success">2026</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <ConfigInput label="Brutto" path="placaMinimalna.brutto" type="currency" value={getVal('placaMinimalna.brutto')} onChange={updateConfig} />
                                <ConfigInput label="Netto (Ręcznie)" path="placaMinimalna.netto" type="currency" value={getVal('placaMinimalna.netto')} onChange={updateConfig} />
                            </div>
                        </SectionCard>

                        <SectionCard className="p-4 flex flex-col gap-4 border-l-4 border-l-amber-500">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-[#201f1e]">Min. UZ (Do Podziału)</span>
                                <Badge variant="warning">Baza</Badge>
                            </div>
                            <ConfigInput label="Podstawa ZUS (Netto)" path="minimalnaKwotaUZ.zasadniczaNetto" type="currency" value={getVal('minimalnaKwotaUZ.zasadniczaNetto')} onChange={updateConfig} />
                        </SectionCard>

                        <SectionCard className="p-4 flex flex-col gap-4 border-l-4 border-l-[#0078d4] sm:col-span-2 md:col-span-1">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-[#201f1e]">Składka Zdrowotna</span>
                                <Badge variant="primary">Global</Badge>
                            </div>
                            <ConfigInput label="Stawka (%)" path="zus.zdrowotna" type="percent" value={getVal('zus.zdrowotna')} onChange={updateConfig} />
                        </SectionCard>
                    </div>
                </section>

                {/* SEKCJA 2: ZUS UOP */}
                <section>
                    <SectionHeader icon={<ShieldCheck />} title="ZUS – Umowa o Pracę (UoP)" />
                    <SectionCard className="overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#edebe9]">
                            <div className="p-4 md:p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-2 h-2 rounded-full bg-[#0078d4]" />
                                    <h4 className="font-bold text-[#201f1e] text-sm">Składki Pracownika</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    <ConfigInput label="Emerytalna" path="zus.uop.pracownik.emerytalna" value={getVal('zus.uop.pracownik.emerytalna')} onChange={updateConfig} />
                                    <ConfigInput label="Rentowa" path="zus.uop.pracownik.rentowa" value={getVal('zus.uop.pracownik.rentowa')} onChange={updateConfig} />
                                    <ConfigInput label="Chorobowa" path="zus.uop.pracownik.chorobowa" value={getVal('zus.uop.pracownik.chorobowa')} onChange={updateConfig} />
                                </div>
                            </div>
                            <div className="p-4 md:p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-2 h-2 rounded-full bg-purple-600" />
                                    <h4 className="font-bold text-[#201f1e] text-sm">Składki Pracodawcy</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    <ConfigInput label="Emerytalna" path="zus.uop.pracodawca.emerytalna" value={getVal('zus.uop.pracodawca.emerytalna')} onChange={updateConfig} />
                                    <ConfigInput label="Rentowa" path="zus.uop.pracodawca.rentowa" value={getVal('zus.uop.pracodawca.rentowa')} onChange={updateConfig} />
                                    <ConfigInput label="Wypadkowa" path="zus.uop.pracodawca.wypadkowa" value={getVal('zus.uop.pracodawca.wypadkowa')} onChange={updateConfig} />
                                    <ConfigInput label="Fundusz Pracy" path="zus.uop.pracodawca.fp" value={getVal('zus.uop.pracodawca.fp')} onChange={updateConfig} />
                                    <ConfigInput label="FGŚP" path="zus.uop.pracodawca.fgsp" value={getVal('zus.uop.pracodawca.fgsp')} onChange={updateConfig} />
                                </div>
                            </div>
                        </div>
                    </SectionCard>
                </section>

                {/* SEKCJA 3: ZUS UZ */}
                <section>
                    <SectionHeader icon={<Layers />} title="ZUS – Umowa Zlecenie (UZ)" />
                    <SectionCard className="overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#edebe9]">
                            <div className="p-4 md:p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                                    <h4 className="font-bold text-[#201f1e] text-sm">Składki Pracownika (UZ)</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    <ConfigInput label="Emerytalna" path="zus.uz.pracownik.emerytalna" value={getVal('zus.uz.pracownik.emerytalna')} onChange={updateConfig} />
                                    <ConfigInput label="Rentowa" path="zus.uz.pracownik.rentowa" value={getVal('zus.uz.pracownik.rentowa')} onChange={updateConfig} />
                                    <ConfigInput label="Chorobowa (Dobrow.)" path="zus.uz.pracownik.chorobowa" value={getVal('zus.uz.pracownik.chorobowa')} onChange={updateConfig} />
                                </div>
                            </div>
                            <div className="p-4 md:p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-2 h-2 rounded-full bg-amber-600" />
                                    <h4 className="font-bold text-[#201f1e] text-sm">Składki Pracodawcy (UZ)</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    <ConfigInput label="Emerytalna" path="zus.uz.pracodawca.emerytalna" value={getVal('zus.uz.pracodawca.emerytalna')} onChange={updateConfig} />
                                    <ConfigInput label="Rentowa" path="zus.uz.pracodawca.rentowa" value={getVal('zus.uz.pracodawca.rentowa')} onChange={updateConfig} />
                                    <ConfigInput label="Wypadkowa" path="zus.uz.pracodawca.wypadkowa" value={getVal('zus.uz.pracodawca.wypadkowa')} onChange={updateConfig} />
                                    <ConfigInput label="Fundusz Pracy" path="zus.uz.pracodawca.fp" value={getVal('zus.uz.pracodawca.fp')} onChange={updateConfig} />
                                    <ConfigInput label="FGŚP" path="zus.uz.pracodawca.fgsp" value={getVal('zus.uz.pracodawca.fgsp')} onChange={updateConfig} />
                                </div>
                            </div>
                        </div>
                    </SectionCard>
                </section>

                {/* SEKCJA 4: PIT */}
                <section>
                    <SectionHeader icon={<FileText />} title="Podatek Dochodowy (PIT)" />
                    <SectionCard className="p-4 md:p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <ConfigInput label="I Próg (Stawka)" path="pit.prog1Stawka" type="percent" value={getVal('pit.prog1Stawka')} onChange={updateConfig} />
                            <ConfigInput label="II Próg (Stawka)" path="pit.prog2Stawka" type="percent" value={getVal('pit.prog2Stawka')} onChange={updateConfig} />
                            <ConfigInput label="Limit I Progu" path="pit.prog1Limit" type="currency" value={getVal('pit.prog1Limit')} onChange={updateConfig} />
                            <ConfigInput label="Kwota Wolna (Rok)" path="pit.kwotaWolnaRoczna" type="currency" value={getVal('pit.kwotaWolnaRoczna')} onChange={updateConfig} />
                            <div className="col-span-1 sm:col-span-2 md:col-span-4 h-px bg-[#edebe9] hidden sm:block" />
                            <ConfigInput label="Kwota Zmniejszająca (Msc)" path="pit.kwotaZmniejszajacaMies" type="currency" value={getVal('pit.kwotaZmniejszajacaMies')} onChange={updateConfig} />
                            <ConfigInput label="KUP Standard (Msc)" path="pit.kupStandard" type="currency" value={getVal('pit.kupStandard')} onChange={updateConfig} />
                            <ConfigInput label="KUP Podwyższone" path="pit.kupPodwyzszone" type="currency" value={getVal('pit.kupPodwyzszone')} onChange={updateConfig} />
                            <ConfigInput label="KUP UZ Standard" path="pit.uzKupProc" type="percent" value={getVal('pit.uzKupProc')} onChange={updateConfig} />
                            <ConfigInput label="KUP UZ Autorskie" path="pit.uzKupAutorskie" type="percent" value={getVal('pit.uzKupAutorskie')} onChange={updateConfig} />
                        </div>
                    </SectionCard>
                </section>

                {/* SEKCJA 5: ULGI I ZWOLNIENIA */}
                <section>
                    <SectionHeader icon={<ShieldCheck />} title="Ulgi i Zwolnienia" />
                    <SectionCard className="p-4 md:p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <ConfigInput label="Ulga Młodych — Max Wiek" path="pit.ulgaMlodziMaxWiek" type="currency" suffix="lat" value={getVal('pit.ulgaMlodziMaxWiek')} onChange={updateConfig} />
                            <ConfigInput label="Ulga Młodych — Limit Roczny" path="pit.ulgaMlodziLimitRoczny" type="currency" value={getVal('pit.ulgaMlodziLimitRoczny')} onChange={updateConfig} />
                            <ConfigInput label="Zwolnienie FP/FGŚP — Kobiety (wiek)" path="pit.fpZwolnienieWiekKobieta" type="currency" suffix="lat" value={getVal('pit.fpZwolnienieWiekKobieta')} onChange={updateConfig} />
                            <ConfigInput label="Zwolnienie FP/FGŚP — Mężczyźni (wiek)" path="pit.fpZwolnienieWiekMezczyzna" type="currency" suffix="lat" value={getVal('pit.fpZwolnienieWiekMezczyzna')} onChange={updateConfig} />
                        </div>
                    </SectionCard>
                </section>

                {/* SEKCJA 6: ŚWIADCZENIE POZAPŁACOWE */}
                <section>
                    <SectionHeader icon={<Layers />} title="Świadczenie Pozapłacowe (EBS)" />
                    <SectionCard className="p-4 md:p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <ConfigInput label="Stawka PIT Świadczenia" path="swiadczenie.stawkaPit" type="percent" value={getVal('swiadczenie.stawkaPit')} onChange={updateConfig} />
                            <ConfigInput label="Odpłatność Pracownika" path="swiadczenie.odplatnosc" type="currency" value={getVal('swiadczenie.odplatnosc')} onChange={updateConfig} />
                        </div>
                    </SectionCard>
                </section>

                {/* SEKCJA 7: PROWIZJA EBS */}
                <section>
                    <SectionHeader icon={<Calculator />} title="Prowizja EBS" />
                    <SectionCard className="p-4 md:p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <ConfigInput label="Prowizja — Standard (%)" path="prowizja.standard" type="percent" value={getVal('prowizja.standard')} onChange={updateConfig} />
                            <ConfigInput label="Prowizja — Plus (%)" path="prowizja.plus" type="percent" value={getVal('prowizja.plus')} onChange={updateConfig} />
                        </div>
                    </SectionCard>
                </section>

            </div>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between px-4 py-3 md:px-6 md:py-4 border-t border-[#edebe9] bg-white gap-3 shrink-0">
          <div className="w-full sm:w-auto">
              <ButtonSecondary
                onClick={async () => {
                    if(await confirmDialog(pl.confirms.resetConfig)) {
                        setConfig(DEFAULT_CONFIG);
                    }
                }}
                className="w-full sm:w-auto"
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
