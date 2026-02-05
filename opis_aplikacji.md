
# THEMES KALKULATOR SP28 MVP SCRIPT DESCRIBE

## 1. Cel i Kontekst Systemu (System Purpose)
Aplikacja to zaawansowany **Kalkulator Optymalizacji Wynagrodzeń (Client-Side SPA)** zbudowany w oparciu o **React 19** i **TypeScript**. Narzędzie służy do symulacji kosztów zatrudnienia w dwóch modelach:
1.  **Model Standard (As-Is):** Tradycyjne zatrudnienie (UoP/UZ) z pełnym oskładkowaniem.
2.  **Model Podział/Stratton (To-Be):** Model optymalizowany, dzielący wynagrodzenie na część zasadniczą (pieniężną, stanowiącą podstawę ZUS) oraz świadczenie niepieniężne (tokeny/benefity), które jest zwolnione z ZUS, ale opodatkowane PIT (zgodnie z art. 12 i 22 ustawy o PIT na rok 2025).

Aplikacja działa w trybie **offline-first**, wykorzystując `localStorage` jako bazę danych oraz biblioteki `ExcelJS` i `SheetJS` do zaawansowanego importu i eksportu danych.

## 2. Stos Technologiczny (Tech Stack)
*   **Core:** React 19, TypeScript, Vite.
*   **Stylizacja:** Tailwind CSS (via CDN) + autorski system motywów w `common/theme.ts`.
*   **Zarządzanie Stanem:** `useState` + `useMemo` (do kosztownych obliczeń podatkowych).
*   **Przetwarzanie Danych:**
    *   `ExcelJS`: Generowanie sformatowanych raportów .xlsx.
    *   `XLSX` (SheetJS): Import danych z plików Excel/CSV z autodetekcją kolumn.
*   **Wydajność:** Wykorzystanie mikro-komponentów (`NettoZasadniczaCell`) z lokalnym stanem do edycji tabelarycznej bez przerenderowywania całego drzewa aplikacji.

## 3. Architektura Danych (Data Models)

### A. Pracownik (`Pracownik`)
Kluczowa entitja systemu. Zawiera:
*   **Dane personalne:** Imię, Nazwisko, Data urodzenia (auto-obliczanie wieku), Płeć.
*   **Parametry umowy:**
    *   `typUmowy`: 'UOP' (Umowa o pracę) | 'UZ' (Umowa Zlecenie).
    *   `trybSkladek`: Pełne, Student <26, Emeryt, Zbieg tytułów.
    *   `kupTyp`: Standard (250zł), Podwyższone (300zł), 20% (UZ), 50% (Autorskie).
    *   `pit2`: Kwota zmniejszająca podatek (300/150/100/0 zł).
    *   `ulgaMlodych`: Boolean (automatycznie true dla wieku < 26 lat).
    *   `skladkaFP`, `skladkaFGSP`: Flagi logiczne (automatycznie wyłączane dla kobiet 55+ i mężczyzn 60+).
*   **Finanse:**
    *   `nettoDocelowe`: Oczekiwana kwota "na rękę" (Input użytkownika).
    *   `nettoZasadnicza`: Kwota bazowa do oskładkowania w modelu Podział (Input użytkownika, domyślnie Min. Krajowa).
    *   `pitMode`: 'AUTO' | 'FLAT_0' | 'FLAT_12' | 'FLAT_32' (wymuszenie stawki zaliczki).

### B. Konfiguracja Globalna (`Config`)
Obiekt zawierający parametry podatkowe na rok 2025:
*   Progi podatkowe (120k zł), stawki PIT (12%/32%), Kwota wolna (30k zł).
*   Stawki ZUS (Pracownik/Pracodawca).
*   Limity (Ulga dla młodych: 85 528 zł).
*   Płaca minimalna (4666 zł brutto / 3510.92 zł netto).

## 4. Logika Biznesowa (Calculation Engine)

### Silnik Obliczeniowy (`calculations/taxEngine.ts`)
1.  **Algorytm "Reverse Gross-Up":** Funkcja `znajdzBruttoDlaNetto` iteracyjnie szuka kwoty Brutto na podstawie zadanego Netto, uwzględniając specyfikę umowy (KUP procentowe vs kwotowe, progi podatkowe).
2.  **Logika Wariantu Podział:**
    *   `Zasadnicza Netto` = Wartość wprowadzona przez użytkownika (np. 3510.92 zł).
    *   `Świadczenie Netto` = `Netto Docelowe` - `Zasadnicza Netto`.
    *   **ZUS:** Naliczany TYLKO od brutto wyliczonego z `Zasadnicza Netto`.
    *   **PIT:** Naliczany od sumy przychodów (`Brutto Zasadnicze` + `Świadczenie Brutto`).
    *   **Mechanizm:** Świadczenie jest ubruttawiane tylko o podatek PIT (brak ZUS), co generuje oszczędność.
    *   **Gross-up Świadczenia:** Iteracyjne wyliczenie kwoty brutto świadczenia tak, aby po potrąceniu zaliczki na PIT (liczonej wg krańcowej stopy podatkowej pracownika) pracownik otrzymał dokładnie `Świadczenie Netto`.

## 5. Przepływ Użytkownika (User Journey)

### Krok 1: Firma (`StepFirma`)
*   Walidacja NIP (suma kontrolna, formatowanie XXX-XXX-XX-XX).
*   Mock-up pobierania danych z GUS (automatyczne uzupełnianie danych dla znanych NIP-ów).

### Krok 2: Pracownicy (`StepPracownicy`)
*   CRUD (Dodaj, Usuń, Duplikuj).
*   Import z Excela (Parser heurystyczny - rozpoznaje kolumny po nagłówkach).
*   Dashboard statystyk (Liczba pracowników, podział umów, średnie netto).

### Krok 3: Wynik Standard (`StepWynikStandard`)
*   Tabela szczegółowa wyliczeń "Standard".
*   **Kluczowa Funkcjonalność: Konfiguracja Podziału (Bulk Edit):**
    *   Dedykowana kolumna "Kwota do ZUS" z mikro-komponentem `NettoZasadniczaCell`.
    *   **Optymalizacja:** Edycja inputa nie powoduje re-renderu całej tabeli (użycie lokalnego stanu + `onBlur`).
    *   **Live Feedback:** Pod inputem wyświetla się "na żywo" prognozowana oszczędność (np. na zielono "Oszcz: +1200 zł").
    *   Panel masowej zmiany: Przyciski "Ustaw Min. Krajową", "Ustaw Min. UZ" (aktualizują tylko widoczne wiersze).

### Krok 4: Wynik Podział (`StepWynikPodzial`)
*   Szczegółowa tabela mechaniki podziału.
*   Sekcje collapsible: "Objaśnienie kolumn", "Obliczanie składek", "Ustawienia indywidualne".
*   Wizualizacja przepływu pieniądza (Netto -> Brutto -> Koszt).

### Krok 5: Porównanie (`StepPorownanie`)
*   Zestawienie kosztów Standard vs Podział.
*   Konfiguracja prowizji (Suwak/Input: Standard 28% / Plus 25%).
*   Wyliczenie ROI i oszczędności netto dla firmy.

### Krok 6: Podsumowanie (`StepPodsumowanie`)
*   Manager Dashboard: Kafelki z kluczowymi KPI (Miesięczna oszczędność, % redukcji kosztów).
*   Wykresy paskowe CSS (struktura kosztów).
*   **Baza Ofert:** Zapisywanie kalkulacji do `localStorage`.
*   Generowanie PDF (Oferta handlowa) i Excel (Zestawienie zbiorcze).

## 6. Wytyczne UI/UX (Themes)
*   **Kolorystyka:**
    *   Primary: Granat (`#0f172a` - Slate 900).
    *   Accent/Success: Szmaragdowy (`#10b981` - Emerald 500) - używany do oznaczania oszczędności i zysków.
    *   Secondary: Błękit (`#3b82f6` - Blue 500).
    *   Background: Jasne szarości (`#f8fafc`).
*   **Komponenty:**
    *   Karty z cieniem (`box-shadow`), zaokrąglenia (`border-radius: 12px`).
    *   Tabele z "sticky header" i podświetlaniem wierszy.
    *   Responsywność (obsługa mobile poprzez `overflow-x: auto` dla tabel).

## 7. Wymagania Funkcjonalne dla Dewelopera (Developer Instructions)
Podczas modyfikacji kodu należy przestrzegać:
1.  **Optymalizacja Tabel:** Przy dużej liczbie wierszy (50-100) inputy w tabelach muszą działać w trybie `uncontrolled` lub z lokalnym stanem (`onBlur`), aby uniknąć lagów przy pisaniu.
2.  **Matematyka:** Wszystkie operacje na walutach muszą być precyzyjne (zaokrąglenia groszowe). Obliczenia podatkowe (PIT) zawsze zaokrąglane do pełnych złotych (`Math.round`).
3.  **Spójność Stanu:** Główna tablica `pracownicy` w `App.tsx` jest "Single Source of Truth". Zmiana w jednym kroku musi być widoczna we wszystkich innych.
4.  **Typowanie:** Ścisłe typowanie TypeScript (`interface Pracownik`, `interface Wynik`).
