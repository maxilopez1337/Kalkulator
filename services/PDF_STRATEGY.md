# Strategia Generowania PDF i Excel

## Biblioteki aktywne

### PDF — Puppeteer (serwer Node.js)

**Biblioteka:** `puppeteer@^21.0.0`
**Gdzie:** `server/index.js` (Express, port 3002)
**Jak wywołać:** `shared/utils/printPdf.ts` → `printHtmlAsPdf(html, fallbackUrl, filename)`

Każdy generator PDF tworzy HTML (string) i przekazuje do `printHtmlAsPdf`:

| Generator | Plik | Produkt |
|-----------|------|---------|
| Oferta Eliton Prime™ PLUS | `services/offerPdfV3Generator.ts` | 12-stronicowa oferta handlowa |
| Oferta Legalizacja Premii | `services/offerLegalizacjaPremii/generator.ts` | 4-stronicowa oferta alternatywna |
| Oferta Zgrubna V5 | `services/ofertaZgrubna/pages5/generatorV5.ts` | 6-stronicowe zestawienie wstępne |

**Flow:**
```
UI → generator.ts (HTML string)
  → printHtmlAsPdf()
    ├─ LOCAL (localhost/127.0.0.1): POST do http://localhost:3002/generate-pdf
    │    → Puppeteer renderuje A4 (794×1123px, 96 DPI)
    │    → zwraca binary PDF → pobieranie pliku
    └─ PRODUKCJA (Vercel): otwiera nowe okno z HTML
         → window.onload wywołuje window.print()
         → użytkownik drukuje do PDF
```

**Uruchomienie serwera lokalnie:**
```bash
npm run server   # Node: server/index.js na porcie 3002
npm run dev      # Vite: aplikacja React
```

---

### Excel — ExcelJS (CDN)

**Biblioteka:** ExcelJS 4.3.0 via CDN (`window.ExcelJS`)
**CDN:** `https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js`
**Typ globalny:** `shared/types/global.d.ts` → `Window.ExcelJS`

Używany do **generowania** plików `.xlsx`:

| Generator | Plik | Arkusze |
|-----------|------|---------|
| Premium Excel | `features/steps/summary/generatePremiumExcel.ts` | Dashboard KPI + Kalkulator Podwyżek |
| Historia pełna | `features/steps/summary/generateFullHistoryExcel.ts` | Pracownicy + Standard + Prime + Porównanie |
| Symulacja pracownika | `features/steps/simulation/generateEmployeeSimulationExcel.ts` | 5 arkuszy rocznej symulacji |
| Raport managementu | `features/steps/summary/reportGenerator.ts` | Podsumowanie + Kalkulator |
| Generator ogólny | `services/excelGenerator.ts` | Szablon importu pracowników |
| Hook generyczny | `hooks/useExcelExport.ts` | Dowolna tabela (Standard, Podział) |

---

### Excel — SheetJS/XLSX (CDN)

**Biblioteka:** SheetJS v0.20.0 via CDN (`window.XLSX`)
**CDN:** `https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js`
**Użycie:** **wyłącznie parsowanie** — odczyt plików `.xlsx` wgranych przez użytkownika

| Plik | Funkcja |
|------|---------|
| `shared/utils/excelParser.ts` | `parseExcelData()` — mapuje kolumny Excel na obiekty `Pracownik` |
| `features/modals/ImportModal.tsx` | UI importu — wywołuje `parseExcelData()` |

---

## Usunięte biblioteki (wcześniej w package.json)

| Biblioteka | Powód usunięcia |
|-----------|-----------------|
| `@react-pdf/renderer` | Zero importów w kodzie |
| `jspdf` | Zero importów w kodzie |
| `pdf-lib` | Zero importów w kodzie |

---

## Decyzja: CDN vs npm dla ExcelJS/SheetJS

Obie biblioteki pozostają **na CDN** — celowa decyzja:
- ExcelJS (~2.5 MB) i SheetJS (~1 MB) są zbyt duże do bundlowania przez Vite
- CDN ładuje je równolegle z aplikacją, nie blokując głównego bundle
- `window.ExcelJS` / `window.XLSX` są sprawdzane przed użyciem z czytelnym komunikatem błędu

---

## Przyszłe ulepszenia

- **Web Worker dla kalkulacji:** `CalculationContext.tsx` (linia 59) ma placeholder — wdrożyć przy >200 pracownikach
- **PDF na produkcji:** Rozważyć Vercel Function z Puppeteer (chromium) zamiast `window.print()`
