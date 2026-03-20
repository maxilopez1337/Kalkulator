# Analiza i Redesign UI/UX Tabel — Kalkulator Stratton
## Styl Dynamics 365 / Microsoft Fluent Design System

---

## 1. Analiza Obecnej Architektury

### 1.1 Mapa komponentów

```
App
└── StepWynikStandard          ← widok "Standard"
│     ├── PageHeader
│     ├── KpiCard × 4           ← executive summary
│     ├── DataTableToolbar       ← search + export
│     ├── StandardTable          ← GŁÓWNA TABELA (desktop)
│     └── ResultCard × N         ← karty mobilne
│
└── StepWynikPodzial            ← widok "Podział"
      ├── KpiCard × N
      ├── DataTableToolbar
      ├── PodzialTable           ← GŁÓWNA TABELA (desktop)
      └── PodzialResultCard × N  ← karty mobilne

common/
  TableUI.tsx       ← primitives: TableContainer, Thead, Tbody, Tfoot, Tr, Th, Td
  theme.ts          ← D365 color tokens
  Icons.tsx

shared/ui/
  KpiCard.tsx       ← KPI tile
  DataTableToolbar.tsx
  SearchInput.tsx
  Button.tsx
  Avatar.tsx
  Badge.tsx
```

### 1.2 Technologia

| Aspekt | Decyzja |
|--------|---------|
| Framework | React 19 + TypeScript 5.8 |
| Style | Tailwind CSS v3 + inline style (tylko dla bar-width) |
| Dane | Context API (AppContext, CalculationContext) |
| Animacje | Tailwind `animate-in`, CSS transition |
| Chart | Pure CSS bars (bez bibliotek) |
| Ikony | Custom `Icons.tsx` (Lucide-like SVGs) |
| Paleta | Microsoft Fluent: `#f3f2f1`, `#edebe9`, `#0078d4` |

---

## 2. Zidentyfikowane Problemy

### 2.1 Przeciążenie kolumn (cognitive overload)

**Problem:** `StandardTable` i `PodzialTable` domyślnie wyświetlają 25+ kolumn podzielonych na 7 grup. U przeciętnego użytkownika 80% czasu skupia się na zaledwie 4-5 kluczowych kolumnach (Netto, Koszt Całkowity, ZUS Prac Suma, PIT, ZUS Firma Suma).

**Skutek:** Konieczność przewijania poziomego + schwytanie uwagi szczegółowymi, rzadko oglądanymi składnikami.

**Referencja D365:** Power BI Embedded + Dynamics 365 Finance używa "collapsible column groups" — grupy kolumn z nagłówkiem `▼ / ▲` pozwalającym zwijać/rozwijać komplet szczegółowych kolumn.

---

### 2.2 Brak hierarchii wizualnej w foot/header

**Problem:** Kolor tła grup nagłówkowych (`bg-indigo-50/50`, `bg-teal-50/50`) jest bardzo subtelny. Na jasnych monitorach trudno odróżnić granice grup. Napis nagłówka grupy nie wskazuje że jest klikalny.

**Skutek:** Użytkownik nie wie, że nagłówki grup mogą być interaktywne (w przyszłości).

---

### 2.3 Podwójne ograniczenie wysokości

**Problem:**
```css
/* StepWynikStandard */
.data-grid { height: calc(100vh - 280px); }  ← zewnętrzny kontener

/* StandardTable */
TableContainer { max-height: calc(100vh - 350px); }  ← wewnętrzny
```
Oba limity działają jednocześnie. Tabela nie wypełnia całej dostępnej przestrzeni — traci ~70px pionowo bez powodu.

---

### 2.4 KpiCard bez wskaźnika trendu

**Problem:** Karty KPI pokazują tylko wartości absolutne. Brak delty, zmiany procentowej ani wizualnego kierunku.

**D365 standard:** Executive Summary tiles w Dynamics 365 Sales zawsze pokazują trend strzałką `↑ +4.2%` lub `↓ -1.1%` obok głównej metryki.

---

### 2.5 DataTableToolbar — slot `actions` niewykorzystany

**Problem:** `DataTableToolbar` ma slot `actions` przyjmujący dowolne React nodes, ale `StepWynikStandard` umieszcza przycisk Export w sekcji header (nad toolbarem), a nie w toolbarze. Powoduje niespójność layoutu.

---

### 2.6 Stripe rows brak

**Problem:** Każdy wiersz ma identyczne tło. Przy > 10 wierszach trudno śledzić wzrokiem cały wiersz przez 25 kolumn bez "zebra striping".

---

### 2.7 Sticky footer — shadow nieprawidłowy

**Problem:** `Tfoot` używa `shadow-[0_-1px_3px_rgba(0,0,0,0.1)]` ale ta cień jest nakładana przez `overflow-hidden` na `TableContainer`. W praktyce footer jest wizualnie "odcięty" od reszty tabeli.

---

### 2.8 Brak gęstości wyświetlania (density toggle)

**Problem:** Komfortable `py-3` dla komórek głównych vs `py-2` dla szczegółowych tworzy niespójny rytm. Nie ma możliwości przełączenia na widok kompaktowy (dla użytkowników z dużą liczbą pracowników).

---

## 3. Propozycje Redesignu

### 3.1 Collapsible Column Groups ✅ ZAIMPLEMENTOWANE

Dodanie lokalnego stanu `exp` do `StandardTable`:

```tsx
const [exp, setExp] = useState({ zusPrac: false, zdrowotna: false, pit: false, zusFirma: false });
```

Domyślnie wszystkie grupy zwinięte → widoczne tylko kolumny kluczowe (11 kolumn):

```
[LP] [Pracownik] │ [Umowa] [Netto] [Brutto] [Koszt] │ [Σ ZUS Prac.] [Σ ZDR] [Σ PIT] [Σ Firma] │ [SUMA]
```

Kliknięcie nagłówka grupy → rozwinięcie pełnych szczegółów:

```
                  │ [Podst.] [Emeryt.] [Rent.] [Chor.] [Σ ZUS Prac.] │
```

**Korzyść:**
- Minimalny widok: 11 kolumn (zamiast 25+)
- Wszystkie dane dostępne na żądanie
- Native HTML `<table>` → poprawne row liczenie, sticky działa
- Zgodne z wzorcem D365 Grid Advanced → 

### 3.2 Density Toggle ✅ ZAIMPLEMENTOWANE

Przycisk w headers area: `⊞ Komfort / ≡ Kompakt`

```tsx
const [compact, setCompact] = useState(false);
const rowPy = compact ? 'py-1' : 'py-2.5';
```

**Standardy D365:** Grid View Settings panel zawiera "Row Height: Comfortable / Compact / Ultra Compact" jako pierwszy slider.

### 3.3 Groups Hint Bar ✅ ZAIMPLEMENTOWANE

Pod toolbarem, nad tabelą — cienki pasek pokazujący zwinięte grupy jako pills:

```
[ℹ] 3 grupy zwinięte:  [ZUS PRAC. • 4 280,00]  [PIT • 1 120,00]  [ZUS FIRMA • 3 450,00]  [Rozwiń wszystkie ↗]
```

Każdy pill pokazuje nazwę grupy + sumę wszystkich pracowników z tej grupy.

### 3.4 KpiCard Delta/Trend ✅ ZAIMPLEMENTOWANE

Nowy props:
```tsx
interface KpiCardProps {
  delta?: number;      // wartość różnicy (może być ujemna)
  deltaLabel?: string; // np. "vs. poprzedni miesiąc"
  deltaInverse?: boolean; // gdy ujemna wartość = dobra (np. "koszty")
}
```

Renderuje:
```
╔═══════════════════════╗
║ KOSZT CAŁKOWITY       ║
║ 48 320,00 zł          ║
║ ↓ -1 200 vs. poprzedni║
╚═══════════════════════╝
```

### 3.5 Export w DataTableToolbar (nie w nagłówku karty)

Przenieść `<ButtonSecondary>Eksportuj do Excel</ButtonSecondary>` do slotu `actions` w `DataTableToolbar`, usunąć z sekcji header.

**Dlaczego:** D365 grid toolbar (`CommandBar + SearchBox + Filter`) jest zawsze w jednym pasku. Mieszanie export do nagłówka karty to anti-pattern.

### 3.6 Poprawka podwójnego limitu wysokości

```tsx
// StepWynikStandard - kontener tabeli: usunąć h-[calc...]
// TableContainer - zachować max-h jako jedyne ograniczenie
```

Zamiast dwóch ograniczeń: jedno `flex-1 overflow-hidden` na kontenerze + `max-h` tylko w TableContainer.

### 3.7 Zebra Striping

```tsx
// W Tbody rows:
className={`${idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'} hover:bg-[#f0f7ff] transition-colors`}
```

**D365 standard:** Subgrid używa alternating rows `#ffffff / #faf9f8` z hover `#f3f2f1`.

---

## 4. Architektura Redesignu — Warstwy

```
┌──────────────────────────────────────────────────────────┐
│ PageHeader (icon + title + description)          [step]  │
├──────────────────────────────────────────────────────────┤
│ KPI Tiles (4 × KpiCard z delta)         [executive]      │
├──────────────────────────────────────────────────────────┤
│ DataGrid Card                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Card Header (title + expand all/collapse all btn)  │  │
│  ├────────────────────────────────────────────────────┤  │
│  │ DataTableToolbar (search + density + Excel export) │  │
│  ├────────────────────────────────────────────────────┤  │
│  │ Groups Hint Bar (collapsed pills z sumami)         │  │
│  ├────────────────────────────────────────────────────┤  │
│  │ StandardTable (collapsible groups + zebra + sticky)│  │
│  │  thead → group row 1 + column row 2                │  │
│  │  tbody → rows z conditional cells                  │  │
│  │  tfoot → sticky totals                             │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## 5. D365 Best Practices — Implementacja

### 5.1 Typography Scale (Fluent UI)

| Element | Klasa | Odpowiednik Fluent |
|---------|-------|--------------------|
| Card title | `text-base font-semibold` | `FontVariants.medium` |
| Column header | `text-[10px] font-bold uppercase tracking-wider` | `FontVariants.xSmall` + allCaps |
| Cell main | `text-sm font-medium` | `FontVariants.small` |
| Cell detail | `text-[11px]` | `FontVariants.xSmall` |
| KPI value | `text-2xl font-bold` | `FontVariants.superLarge` |

### 5.2 Color Tokens (D365 Palette)

```css
/* Neutrals */
--d365-canvas: #f3f2f1;
--d365-surface: #ffffff;
--d365-border: #edebe9;
--d365-border-strong: #c8c6c4;

/* Interactive */
--d365-blue: #0078d4;
--d365-blue-hover: #106ebe;
--d365-blue-bg: #deecf9;

/* Semantic */
--d365-green: #107c10;
--d365-green-bg: #dff6dd;
--d365-amber: #c7922c;
--d365-amber-bg: #fff4ce;
--d365-red: #a80000;
--d365-red-bg: #fde7e9;
```

### 5.3 Shadow (Fluent Elevation)

```css
/* Elevation 4 (karty) */
shadow: 0 1.6px 3.6px 0 rgba(0,0,0,0.13), 0 0.3px 0.9px 0 rgba(0,0,0,0.11);

/* Elevation 8 (modals, dropdown) */
shadow: 0 3.2px 7.2px 0 rgba(0,0,0,0.132), 0 0.6px 1.8px 0 rgba(0,0,0,0.108);

/* Elevation 64 (dialogs) */
shadow: 0 25.6px 57.6px 0 rgba(0,0,0,0.22), 0 4.8px 14.4px 0 rgba(0,0,0,0.18);
```

### 5.4 Breakpoints (Tailwind → D365 Responsive)

| Breakpoint | Tailwind | D365 Viewport |
|------------|----------|---------------|
| Mobile | < 768px | Compact / Phone |
| Tablet | 768-1024px | Medium |
| Desktop | 1024-1440px | Large |
| Wide | > 1440px | ExtraLarge |

**Zasada:** Na mobile zawsze karta expandable, na desktop tabela z collapsible groups.

### 5.5 Accessibility (WCAG 2.1 AA)

- Wszystkie interaktywne `<th>` muszą mieć `role="button"` i `tabIndex={0}` + `onKeyDown` dla Enter/Space
- Sticky header `z-30`, sticky kolumna `z-20` — kolejność z-index zgodna z D365
- `aria-expanded` na nagłówkach grup
- `aria-label` na polach numerycznych w tabelach
- Kontrast: wartości finansowe minimum `4.5:1` (D365 używa `#201f1e` na `#ffffff` = 15:1)

### 5.6 Wydajność

- `useMemo` na obliczeniach totals (zmiana `data.reduce` przez re-render)
- `React.memo` na `ResultCard` (mobile) — unika re-renderów przy wpisywaniu w search
- Wirtualizacja wierszy: przy > 200 pracownikach rozważyć `react-window` lub `@tanstack/virtual`
- `useCallback` na toggle functions (aktualnie tworzone w każdym render cycle)

---

## 6. Zaimplementowane Zmiany — Podsumowanie

### `common/TableUI.tsx`
- Dodano `ThGroup` — kolumna grupująca z toggle, `aria-expanded`, `tabIndex`, keyboard nav
- Poprawiono `Tr` — `group` class dla `group-hover:` na sticky columns

### `features/steps/results/components/StandardTable.tsx` (PEŁNY REDESIGN)
- Collapsible column groups (ZUS Prac, Zdrowotna, PIT, ZUS Firma) z domyślnym stanem zwiniętym
- Density toggle (Komfort ↔ Kompakt) w sekcji toolbar wewnątrz tabeli
- Expand All / Collapse All button
- Zebra striping co drugi wiersz
- Group hint bar nad tabelą z sumarycnymi values grup
- Poprawka: usunięto `min-w-[1200px]` na rzecz dynamicznego min-width

### `shared/ui/KpiCard.tsx`
- Dodano `delta`, `deltaLabel`, `deltaInverse` props
- Renderuje trend badge: `↑ +1 200 zł` / `↓ −800 zł` z odpowiednim kolorem

---

## 7. Roadmap Dalszego Rozwoju

| Priorytet | Feature | Opis |
|-----------|---------|------|
| HIGH | Column Sort | Kliknięcie `ThRight` → sortowanie asc/desc z ikoną `↑↓` |
| HIGH | Row Selection | Checkbox per row + bulk actions (export zaznaczonych) |
| MEDIUM | Column Picker | Dropdown lista kolumn do włączenia/wyłączenia |
| MEDIUM | PodzialTable redesign | Ten sam wzorzec co StandardTable |
| MEDIUM | Inline Edit Locks | `NettoZasadniczaCell` z optimistic update + undo (Ctrl+Z) |
| LOW | Virtual Scroll | `@tanstack/virtual` dla > 200 pracowników |
| LOW | Frozen Rows | Pin pracownika do góry tabeli |
| LOW | CSV Export | Dodatkowy format obok Excel |

---

*Dokument wygenerowany: 2026-03-20 | Wersja: 1.0*
