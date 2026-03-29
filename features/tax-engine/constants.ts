import { Config } from '../../entities/company/model';

export const DEFAULT_CONFIG: Config = {
  _metadata: {
    version: '2026.1.0',
    validUntil: '2026-12-31',
    lastUpdated: '2026-03-29',
    description: 'Stawki podatkowe i składkowe obowiązujące w 2026 roku',
  },
  zus: {
    uop: {
      // Składki ZUS UoP 2026 — stawki ustawowe, niezmienne od lat
      pracownik: { emerytalna: 9.76, rentowa: 1.5, chorobowa: 2.45 },
      pracodawca: { emerytalna: 9.76, rentowa: 6.5, wypadkowa: 1.67, fp: 2.45, fgsp: 0.1 },
    },
    uz: {
      // Składki ZUS UZ 2026 — tożsame z UoP dla celów kalkulacji
      pracownik: { emerytalna: 9.76, rentowa: 1.5, chorobowa: 2.45 },
      pracodawca: { emerytalna: 9.76, rentowa: 6.5, wypadkowa: 1.67, fp: 2.45, fgsp: 0.1 },
    },
    // Składka zdrowotna 2026 — ustawa z dnia 27 sierpnia 2004 r., art. 79
    zdrowotna: 9.0,
  },
  pit: {
    // Próg podatkowy PIT 2026 — ustawa o PIT, art. 27 ust. 1
    // AKTUALIZACJA WYMAGANA: gdy zmiana skali podatkowej
    prog1Limit: 120000, // PLN — 2026, pierwszy próg
    prog1Stawka: 12, // % — 2026, stawka poniżej progu
    prog2Stawka: 32, // % — 2026, stawka powyżej progu
    // Kwota wolna od podatku 2026 — ustawa o PIT, art. 27 ust. 1a
    // AKTUALIZACJA WYMAGANA: 1 stycznia każdego roku (gdy zmiana)
    kwotaWolnaRoczna: 30000, // PLN — 2026
    kwotaZmniejszajacaMies: 300, // PLN — 2026 (30000 * 12% / 12)
    // KUP 2026 — ustawa o PIT, art. 22 ust. 2
    kupStandard: 250, // PLN/miesiąc — 2026
    kupPodwyzszone: 300, // PLN/miesiąc — 2026, dojazd do innej miejscowości
    // KUP UZ 2026 — ustawa o PIT, art. 22 ust. 9
    uzKupProc: 20, // % — 2026, standardowe
    uzKupAutorskie: 50, // % — 2026, prawa autorskie (limit 120 000 PLN/rok)
    // Ulga dla młodych 2026 — ustawa o PIT, art. 21 ust. 1 pkt 148
    // AKTUALIZACJA WYMAGANA: gdy zmiana limitu lub wieku
    ulgaMlodziMaxWiek: 26, // lat — 2026
    ulgaMlodziLimitRoczny: 85528, // PLN — 2026
    // Zwolnienie z FP 2026 — ustawa o promocji zatrudnienia, art. 104
    fpZwolnienieWiekKobieta: 55, // lat — 2026
    fpZwolnienieWiekMezczyzna: 60, // lat — 2026
  },
  // Płaca minimalna 2026 (Rozporządzenie RM z 2025-09-12)
  // AKTUALIZACJA WYMAGANA: 1 stycznia każdego roku
  placaMinimalna: {
    brutto: 4806, // PLN — 2026
    netto: 3605.85, // PLN — przybliżone, zależy od składek
  },
  // Minimalna kwota zasadnicza netto dla modelu UZ/Podział 2026
  // AKTUALIZACJA WYMAGANA: przy zmianie płacy minimalnej
  minimalnaKwotaUZ: {
    zasadniczaNetto: 2028.8, // PLN — 2026, waloryzacja proporcjonalna dla modelu Podział
  },
  // Stawki świadczenia pracowniczego 2026
  swiadczenie: {
    stawkaPit: 12, // % — 2026, zgodnie ze skalą PIT prog1
    odplatnosc: 1.0, // PLN/dzień — 2026
  },
  // Stawki prowizji 2026 — wartości wewnętrzne firmy
  // AKTUALIZACJA WYMAGANA: przy zmianie polityki prowizyjnej
  prowizja: {
    standard: 28, // % — 2026
    plus: 26, // % — 2026
  },
};
