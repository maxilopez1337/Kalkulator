import { ProposalData, RiskItem, TimelineStep } from './types';

const COMMON_RISK_ITEMS: RiskItem[] = [
  {
    id: "r1",
    number: "01",
    title: "TRANSPARENTNOŚĆ FISKALNA",
    content: "Pełna jawność składników wynagrodzenia w deklaracjach ZUS RCA. Model wyklucza stosowanie struktur agresywnej optymalizacji podatkowej oraz ukrytych przepływów kapitałowych."
  },
  {
    id: "r2",
    number: "02",
    title: "BAZA LEGISLACYJNA",
    content: "Implementacja oparta o dedykowane Uchwały Zarządu oraz modyfikację Regulaminu Wynagradzania. Zmiany wprowadzane są w drodze porozumienia zmieniającego (Aneksu), co gwarantuje stabilność stosunku pracy."
  },
  {
    id: "r3",
    number: "03",
    title: "MITYGACJA RYZYKA (OC)",
    content: "Proces wdrożeniowy objęty jest ochroną ubezpieczeniową w zakresie doradztwa podatkowego. Odpowiedzialność karno-skarbowa za konstrukcję modelu spoczywa na operatorze (Stratton Prime)."
  }
];

const COMMON_TIMELINE_STEPS: TimelineStep[] = [
  {
    week: 1,
    title: "AUDYT I FORMALIZACJA",
    description: "Analiza struktury kosztowej (Due Diligence). Zawarcie umowy o współpracy (NDA & Service Agreement)."
  },
  {
    week: 2,
    title: "PRZYGOTOWANIE PRAWNE",
    description: "Opracowanie dedykowanych aktów wewnątrzzakładowych (Uchwały, Regulaminy) oraz aneksów pracowniczych."
  },
  {
    week: 3,
    title: "KOMUNIKACJA I WDROŻENIE",
    description: "Spotkania informacyjne z kadrą. Proces akceptacji zmian (podpisywanie aneksów) przy wsparciu konsultantów."
  },
  {
    week: 4,
    title: "URUCHOMIENIE OPERACYJNE",
    description: "Pierwsze naliczenie listy płac w nowym modelu (Go-Live). Weryfikacja poprawności deklaracji ZUS DRA."
  }
];

export const PROPOSAL_JAKRA: ProposalData = {
  id: 'jakra',
  clientName: "Jakra Corporation",
  reportDate: "3.02.2026",
  reportVersion: "v2.6.1 (Legislacja 2026)",
  savingsYearly: 228789.12,
  savingsMonthly: 19065.76,
  financialData: [
    { category: "Łączne Wynagrodzenia Brutto", standard: 295338.09, eliton: 276556.13, diff: 0, highlight: false },
    { category: "Narzuty Publicznoprawne (ZUS Pracodawcy)", standard: 60485.32, eliton: 43420.34, diff: -17064.98, highlight: true },
    { category: "Obciążenia Składkowe Pracownika", standard: 63427.09, eliton: 45532.13, diff: -17894.96, highlight: true },
    { category: "Zaliczka na Podatek Dochodowy (PIT)", standard: 24311.00, eliton: 23430.00, diff: -881.00, highlight: false },
    { category: "Efektywne Wynagrodzenie Netto", standard: 207600.00, eliton: 207581.00, diff: 0, highlight: false },
  ],
  extraCosts: [
    { label: "Wynagrodzenie za Efekt (Success Fee)", value: 12908.60, type: "FAKTURA VAT" },
    { label: "Kapitał na Wzrost Płac (4%)", value: 2581.72, type: "BENEFIT PRACOWNIKA" },
    { label: "Koszty Operacyjne i Wdrożeniowe (2%)", value: 1290.86, type: "BUDŻET WEWN." },
  ],
  totalSummary: {
    standard: 355823.41,
    eliton: 336757.65,
    diff: -19065.76
  },
  riskItems: COMMON_RISK_ITEMS,
  timelineSteps: COMMON_TIMELINE_STEPS
};

export const PROPOSAL_NEXUS: ProposalData = {
  id: 'nexus',
  clientName: "Nexus Solutions",
  reportDate: "5.02.2026",
  reportVersion: "v2.6.2 (Legislacja 2026)",
  savingsYearly: 486500.00,
  savingsMonthly: 40541.67,
  financialData: [
    { category: "Łączne Wynagrodzenia Brutto", standard: 520000.00, eliton: 485000.00, diff: 0, highlight: false },
    { category: "Narzuty Publicznoprawne (ZUS Pracodawcy)", standard: 106600.00, eliton: 72400.00, diff: -34200.00, highlight: true },
    { category: "Obciążenia Składkowe Pracownika", standard: 111800.00, eliton: 76000.00, diff: -35800.00, highlight: true },
    { category: "Zaliczka na Podatek Dochodowy (PIT)", standard: 42000.00, eliton: 40500.00, diff: -1500.00, highlight: false },
    { category: "Efektywne Wynagrodzenie Netto", standard: 366200.00, eliton: 366150.00, diff: 0, highlight: false },
  ],
  extraCosts: [
    { label: "Wynagrodzenie za Efekt (Success Fee)", value: 24325.00, type: "FAKTURA VAT" },
    { label: "Kapitał na Wzrost Płac (4%)", value: 4865.00, type: "BENEFIT PRACOWNIKA" },
    { label: "Koszty Operacyjne i Wdrożeniowe (2%)", value: 2432.50, type: "BUDŻET WEWN." },
  ],
  totalSummary: {
    standard: 626600.00,
    eliton: 586058.33,
    diff: -40541.67
  },
  riskItems: COMMON_RISK_ITEMS,
  timelineSteps: COMMON_TIMELINE_STEPS
};