# Raport Analizy Aplikacji — Kalkulator Stratton

**Data raportu:** 2026-03-28
**Wersja projektu:** v2.6.1
**Autor analizy:** Claude Code (Sonnet 4.6)
**Status:** Aktywny projekt produkcyjny

---

## Executive Summary

Aplikacja Kalkulator Stratton to zaawansowane narzędzie kalkulacyjne oparte na React/TypeScript, wdrożone na Vercel, z silnikiem podatkowym obsługującym kontrakty UOP, UZ i B2B. Audyt ujawnił **dwa krytyczne zagrożenia bezpieczeństwa**: dane pracowników przechowywane jawnie w localStorage oraz eksponowany klucz API Gemini w `.env.local`. Silnik podatkowy jest dobrze zaprojektowany modularnie, jednak zawiera zakodowane na stałe wartości (płaca minimalna 2026), które spowodują błędy od 2027-01-01 bez interwencji. Jakość kodu jest obniżona przez 53+ użycia `as any`, brak testów dla 9 krytycznych plików oraz pliki przekraczające 500 linii. Infrastruktura DevOps wymaga pilnej uwagi: brak GitHub Actions, `strict: false` w TypeScript i brak hooków pre-commit oznaczają, że błędy mogą trafić na produkcję bez weryfikacji. Priorytetem bezwzględnym jest usunięcie klucza API z repozytorium i wdrożenie szyfrowania danych wrażliwych.

---

## 1. Bezpieczeństwo

### 1.1 Podsumowanie

| Poziom | Liczba | Opis skrócony |
|--------|--------|---------------|
| CRITICAL | 2 | Dane wrażliwe w localStorage, eksponowany klucz API |
| HIGH | 3 | Niebezpieczna deserializacja JSON, brak walidacji granic, 53+ `as any` |
| MEDIUM | 4 | Iniekcja formuł Excel, brak potwierdzenia importu, logowanie danych, brak rate limitingu |

### 1.2 Problemy krytyczne

| ID | Opis | Plik | Linia |
|----|------|------|-------|
| SEC-C1 | Jawne przechowywanie danych pracowników (imiona, pensje, daty urodzenia) w localStorage | `HistoryContext.tsx`, `EmployeeContext.tsx`, `CompanyContext.tsx` | 35-36, 43-44, 85-86 |
| SEC-C2 | Klucz API Gemini eksponowany w repozytorium | `.env.local` | 1 |

**Rekomendacja SEC-C1:** Zaszyfruj dane przed zapisem do localStorage (np. AES-256 przez `crypto-js`) lub przenieś wrażliwe dane do sessionStorage z TTL.

**Rekomendacja SEC-C2:** Natychmiast unieważnij klucz API, wygeneruj nowy i dodaj `.env.local` do `.gitignore`. Wszystkie klucze traktuj jako skompromitowane od momentu ich pojawienia się w repozytorium.

### 1.3 Problemy wysokiego priorytetu

| ID | Opis | Plik | Szczegóły |
|----|------|------|-----------|
| SEC-H1 | Niebezpieczna deserializacja JSON bez walidacji schematu w `loadBackup()` | `AppContext.tsx` | Linie 94-126, rzutowanie `as ZapisanaKalkulacja` bez walidacji runtime |
| SEC-H2 | Brak kontroli granic dla danych finansowych | `excelParser.ts` | Linie 36-120, brak weryfikacji zakresów wartości |
| SEC-H3 | 53+ użycia `as any` omijające bezpieczeństwo TypeScript | 26 plików | `services/excelGenerator.ts` (13×), `offerPdfV3Generator.ts` (19×) |

### 1.4 Problemy średniego priorytetu

| ID | Opis | Plik |
|----|------|------|
| SEC-M1 | Ryzyko iniekcji formuł Excel (nazwa firmy bez escapowania) | `generatePremiumExcel.ts:45-50` |
| SEC-M2 | Import pliku bez potwierdzenia użytkownika | `StepDashboard.tsx:68` |
| SEC-M3 | Logowanie danych wrażliwych w trybie DEV | `HistoryContext.tsx:23` |
| SEC-M4 | Brak rate limitingu dla generowania Excel/PDF | — |

---

## 2. Wydajność

### 2.1 Podsumowanie

| Poziom | Liczba | Obszar |
|--------|--------|--------|
| HIGH | 2 | Eager loading komponentów, nadmierne rerendery |
| MEDIUM | 3 | Brakujące useMemo, brak Web Worker, React.memo |
| GOOD | 2 | Poprawne memoizacje, biblioteki z CDN |

### 2.2 Problemy wysokiego priorytetu

| ID | Opis | Plik | Wpływ |
|----|------|------|-------|
| PERF-H1 | Brak lazy loading — wszystkie 8 komponentów kroków importowanych eagerly | `App.tsx:8-16` | Zwiększony czas pierwszego ładowania (TTI) |
| PERF-H2 | `useAppStore()` agreguje 5 kontekstów — każda zmiana stanu powoduje rerender wszystkich konsumentów | `AppContext.tsx:47` | Nadmierne rerendery przy każdej aktualizacji |

**Rekomendacja PERF-H1:** Zastosuj `React.lazy` + `Suspense` dla wszystkich kroków. Redukcja początkowego bundle o ~40-60%.

**Rekomendacja PERF-H2:** Rozdziel `useAppStore()` na wyspecjalizowane hooki (`useEmployees`, `useCalculations`, `useCompany`) z selektorami.

### 2.3 Problemy średniego priorytetu

| ID | Opis | Plik |
|----|------|------|
| PERF-M1 | `offerPayload`, `topSavers`, `steps` tworzone inline w JSX bez `useMemo` | `StepPodsumowanie:96`, `App.tsx:37`, `StepPorownanie:120` |
| PERF-M2 | Brak Web Worker dla kalkulacji podatkowych przy 300+ pracownikach | `CalculationContext.tsx:56` |
| PERF-M3 | Komponent `NavItem` bez `React.memo` | `App.tsx:100` |

### 2.4 Mocne strony wydajnościowe

- Kalkulacje podatkowe poprawnie memoizowane przez `useMemo` — `StepAnalizaPracownika:53`, `CalculationContext:56`
- Zewnętrzne biblioteki Excel/PDF ładowane z CDN (nie bundlowane) — poprawna strategia

---

## 3. Jakość Kodu

### 3.1 Podsumowanie

| Poziom | Liczba | Kategoria |
|--------|--------|-----------|
| CRITICAL | 3 | Naruszenia SRP, brak separacji, brak testów |
| HIGH | 3 | Typowanie `any`, duplikacja kodu, brak obsługi błędów |
| MEDIUM | 3 | Duże pliki, brakujące hooki |

### 3.2 Problemy krytyczne

| ID | Opis | Plik | Linie |
|----|------|------|-------|
| QA-C1 | `StepPracownicy.tsx` ~600 linii — naruszenie SRP: CRUD + walidacja + UI + logika biznesowa | `StepPracownicy.tsx` | ~600 |
| QA-C2 | Hook `useAppStore()` agreguje 25+ właściwości — brak separacji odpowiedzialności | `AppContext.tsx` | — |
| QA-C3 | 9 krytycznych plików bez żadnych testów | `AppContext`, `CalculationContext`, `pit.ts`, `zus.ts`, `grossUp.ts` + 4 inne | — |

### 3.3 Problemy wysokiego priorytetu

| ID | Opis | Pliki | Szczegóły |
|----|------|-------|-----------|
| QA-H1 | 53+ użycia `any` w 26 plikach | `services/excelGenerator.ts` (13×), `offerPdfV3Generator.ts` (19×) | Całkowite ominięcie systemu typów |
| QA-H2 | Wzorzec `reduce()` zduplikowany 7× w 4 plikach | `useSummaryData`, `AppContext`, `offerPdfV3Generator`, `offerLegalizacjaPremii` | Kandydat do ekstrakcji jako utility |
| QA-H3 | Brak obsługi błędów w eksporcie Excel | `useExcelExport.ts` | Cichy błąd bez informacji dla użytkownika |

### 3.4 Problemy średniego priorytetu

| ID | Opis | Plik |
|----|------|------|
| QA-M1 | `App.tsx` 382 linie — kandydat do podziału | `App.tsx` |
| QA-M2 | `generateFullHistoryExcel.ts` ~750 linii — masywny plik generujący Excel | `generateFullHistoryExcel.ts` |
| QA-M3 | 5 brakujących custom hooków możliwych do ekstrakcji | `StepPracownicy.tsx`, `StepPorownanie.tsx` |

---

## 4. Silnik Podatkowy

### 4.1 Architektura

Silnik podatkowy jest zaprojektowany modularnie z podziałem na:
- `zus.ts` — obliczenia składek ZUS
- `pit.ts` — obliczenia podatku dochodowego PIT
- `grossUp.ts` — algorytm odwrotny netto→brutto

### 4.2 Ryzyka wysokiego priorytetu

| ID | Opis | Plik | Termin krytyczny |
|----|------|------|-----------------|
| TAX-H1 | Płaca minimalna 2026 (4806 PLN) zakodowana na stałe — BŁĘDNA od 2027-01-01 | `constants.ts:32-33` | 2027-01-01 |
| TAX-H2 | Niewyjaśniony `doWyplatyGotowka - 1` bez komentarza — możliwy bug zaokrąglenia | `tax-engine/index.ts:174` | — |
| TAX-H3 | Brak testów dla kalkulacji KUP przy umowach UZ (odliczenia 20%/50%) | — | — |

### 4.3 Ryzyka średniego priorytetu

| ID | Opis | Plik |
|----|------|------|
| TAX-M1 | Ulga dla młodych bez sprawdzenia rocznego limitu (85 528 PLN) | `pit.ts` |
| TAX-M2 | Brak wersjonowania konfiguracji podatkowej i dat wygaśnięcia | `constants.ts` |
| TAX-M3 | Brak wsparcia dla mieszanych kontraktów UOP+UZ (obejście: dwa oddzielne rekordy) | — |

### 4.4 Mocne strony silnika podatkowego

- Modularny design: osobne pliki `zus.ts`, `pit.ts`, `grossUp.ts`
- Wyszukiwanie binarne + skan liniowy dla odwrotnej kalkulacji netto→brutto
- Zaokrąglanie składek ZUS per komponent zgodne z regulacjami
- Poprawna obsługa kontraktu STUDENT_UZ i flagi `choroboweAktywne`

---

## 5. DevOps i Narzędzia

### 5.1 Podsumowanie

| Poziom | Liczba | Kategoria |
|--------|--------|-----------|
| CRITICAL | 2 | Brak CI/CD, błędna konfiguracja zależności |
| HIGH | 4 | TypeScript bez strict, brak ESLint/Prettier, brak progów pokrycia |
| MEDIUM | 3 | Brak Husky, minimalna konfiguracja Vercel, brak `.env.example` |

### 5.2 Problemy krytyczne

| ID | Opis | Plik | Konsekwencja |
|----|------|------|-------------|
| DEV-C1 | Brak GitHub Actions — zero automatycznego testowania/budowania przy push | `.github/` | Błędy trafiają na produkcję bez weryfikacji |
| DEV-C2 | `vitest` w `dependencies` zamiast `devDependencies` | `package.json` | Testowy framework w bundlu produkcyjnym |

### 5.3 Problemy wysokiego priorytetu

| ID | Opis | Plik |
|----|------|------|
| DEV-H1 | `strict: false` w TypeScript — brak `strictNullChecks`, `noImplicitAny` | `tsconfig.json` |
| DEV-H2 | Brak konfiguracji ESLint | — |
| DEV-H3 | Brak konfiguracji Prettier | — |
| DEV-H4 | Pokrycie testami bez skonfigurowanych progów minimalnych | `vitest.config.ts` |

### 5.4 Problemy średniego priorytetu

| ID | Opis |
|----|------|
| DEV-M1 | Brak Husky pre-commit hooks |
| DEV-M2 | Minimalne `vercel.json` — brak reguł przekierowania i zarządzania env |
| DEV-M3 | Brak `.env.example` dla innych deweloperów |

---

## 6. Plan Działania

### Faza 1 — Tydzień 1 (Krytyczne zagrożenia)

| Priorytet | Zadanie | Pliki | Effort |
|-----------|---------|-------|--------|
| P0 | Unieważnienie i rotacja klucza API Gemini | `.env.local`, `.gitignore` | 1h |
| P0 | Dodanie `.env.local` do `.gitignore` i czyszczenie historii git | `.gitignore` | 2h |
| P1 | Szyfrowanie danych pracowników w localStorage (AES-256) | `HistoryContext.tsx`, `EmployeeContext.tsx`, `CompanyContext.tsx` | 4h |
| P1 | Walidacja schematu JSON przy `loadBackup()` (Zod/Yup) | `AppContext.tsx:94-126` | 3h |
| P1 | Skonfigurowanie GitHub Actions (CI: test + build) | `.github/workflows/ci.yml` | 3h |
| P1 | Przeniesienie `vitest` do `devDependencies` | `package.json` | 0.5h |

### Faza 2 — Tydzień 2-3 (Jakość i stabilność)

| Priorytet | Zadanie | Pliki | Effort |
|-----------|---------|-------|--------|
| P2 | Włączenie `strict: true` w TypeScript i eliminacja `any` (priorytet: 53 przypadki) | `tsconfig.json`, 26 plików | 8h |
| P2 | Konfiguracja ESLint + Prettier z regułami dla projektu | `.eslintrc`, `.prettierrc` | 2h |
| P2 | Podział `StepPracownicy.tsx` na mniejsze komponenty + hooki | `StepPracownicy.tsx` | 6h |
| P2 | Testy jednostkowe dla `pit.ts`, `zus.ts`, `grossUp.ts` | `tests/` | 8h |
| P2 | Lazy loading dla 8 komponentów kroków | `App.tsx:8-16` | 2h |
| P2 | Ekstrakcja duplikatu `reduce()` do utility | 4 pliki | 2h |
| P2 | Dodanie obsługi błędów w `useExcelExport.ts` | `useExcelExport.ts` | 1h |

### Faza 3 — Miesiąc 1 (Ulepszenia długoterminowe)

| Priorytet | Zadanie | Pliki | Effort |
|-----------|---------|-------|--------|
| P3 | Wersjonowanie konfiguracji podatkowej z datami wygaśnięcia | `constants.ts` | 4h |
| P3 | Mechanizm aktualizacji płacy minimalnej (config zamiast hardcode) | `constants.ts:32-33` | 3h |
| P3 | Ulga dla młodych: dodanie sprawdzenia rocznego limitu 85 528 PLN | `pit.ts` | 2h |
| P3 | Wyjaśnienie i naprawa `doWyplatyGotowka - 1` | `tax-engine/index.ts:174` | 2h |
| P3 | Web Worker dla kalkulacji przy 300+ pracownikach | `CalculationContext.tsx` | 6h |
| P3 | Husky pre-commit hooks (lint + test) | `.husky/` | 1h |
| P3 | Rozdzielenie `useAppStore()` na selektory | `AppContext.tsx` | 6h |
| P3 | `.env.example` z dokumentacją zmiennych | `.env.example` | 0.5h |

---

## 7. Metryki Obecnego Stanu

| Metryka | Wartość | Ocena |
|---------|---------|-------|
| Testy przechodzące | 107 / 107 | Pozytywna |
| Błędy TypeScript (tsc) | 0 | Pozytywna |
| Pliki >500 linii PRZED refaktoryzacją | 4 | Do poprawy |
| Pliki >500 linii PO refaktoryzacji | 0 | Cel |
| Użycia `as any` | 53+ w 26 plikach | Krytyczna |
| Pliki bez testów (krytyczne) | 9 | Krytyczna |
| Pokrycie testami (% szacunkowy) | ~30-40% | Niewystarczające |
| GitHub Actions (CI/CD) | Brak | Krytyczna |
| Szyfrowanie danych localStorage | Brak | Krytyczna |

---

## 8. Podsumowanie Ryzyk

```
RYZYKO BIZNESOWE:
  - Od 2027-01-01: błędne kalkulacje płacy minimalnej (bez aktualizacji constants.ts)
  - Dane RODO pracowników niezaszyfrowane w localStorage — ryzyko wycieku

RYZYKO TECHNICZNE:
  - Skompromitowany klucz API Gemini wymaga natychmiastowej rotacji
  - Brak CI/CD = możliwość wdrożenia regresji bez wykrycia
  - strict:false = ukryte błędy null/undefined w produkcji

RYZYKO UTRZYMANIA:
  - StepPracownicy.tsx 600 linii — trudny w utrzymaniu i testowaniu
  - generateFullHistoryExcel.ts 750 linii — jeden plik obsługuje zbyt wiele
  - Brak testów dla silnika podatkowego = ryzyko przy każdej zmianie regulacji
```

---

*Raport wygenerowany automatycznie przez Claude Code na podstawie analizy statycznej kodu.*
*Kalkulator Stratton — wersja v2.6.1 — 2026-03-28*
