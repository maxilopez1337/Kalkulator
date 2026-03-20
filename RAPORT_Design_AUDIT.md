# Raport Design Audit — Kalkulator Stratton
*Wygenerowano: pełna analiza kodu po skanowaniu 15 plików komponentów*

---

## Streszczenie Wykonawcze

Aplikacja używa Fluent UI / Dynamics 365 jako docelowego systemu designu. Tokenizacja jest dobrze zdefiniowana w `common/theme.ts`, ale ok. **40-50% plików widoków nie stosuje się do niej** — używają zamiast tego bezpośrednich klas Tailwind spoza systemu (gradients, zaokrąglone rogi `rounded-xl/2xl`, cienie `shadow-sm/md/xl/2xl`). To powoduje niespójny wygląd między ekranami. Naprawy są wyłącznie kosmetyczne — zero zmian w logice biznesowej.

**Priorytet napraw:**
| Priorytet | Plik | Skala problemu |
|-----------|------|----------------|
| 🔴 P0 | `SearchInput.tsx` (shared) | Wpływa na 4 ekrany |
| 🔴 P0 | `Alert.tsx` (shared) | Wpływa na 5 ekranów |
| 🟠 P1 | `StepPorownanie.tsx` | Największa niespójność |
| 🟠 P1 | `StepDashboard.tsx` | Gradients, błędne cieniowanie |
| 🟠 P1 | `StepPodsumowanie.tsx` | Gradients, rounded-xl |
| 🟡 P2 | `StepPracownicy.tsx` | rounded-lg, bg-slate-50 |
| 🟡 P2 | `StepWynikPodzial.tsx` | rounded-xl, shadow-md |
| 🟡 P2 | `App.tsx` | Mieszane cienie w nawigacji |
| 🟢 P3 | `StepAnalizaPracownika.tsx` | Drobne |

---

# FAZA 1: Analiza i Inwentaryzacja

## 1.1 Rejestr Systemu Designu (co jest prawidłowe)

Token zdefiniowane w `common/theme.ts`:

```
Border-radius:
  rounded-sm  (4px)  → badges, inputs, buttons
  rounded-md  (6px)  → cards, panels, modals
  rounded-full       → avatary, ikony okrągłe

Shadows (Fluent Elevation):
  elevation4  → shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),...]   ← karty
  elevation8  → shadow-[0_3.2px_7.2px_0_rgba(0,0,0,0.13),...]   ← dropdown/menu
  elevation16 → shadow-[0_6.4px_14.4px_0_rgba(0,0,0,0.13),...]  ← modale

Kolory:
  #f3f2f1  → tło strony
  #ffffff  → tło karty
  #eff6fc  → tło ikon (niebieski pill)
  #edebe9  → border neutralny
  #0078d4  → brand / akcent (Dynamics Blue)
  #201f1e  → tekst główny (primary)
  #323130  → tekst nagłówków
  #605e5c  → tekst pomocniczy (secondary)
  #8a8886  → tekst trzeciorzędny (muted)
  #107c10  → sukces
  #a80000  → błąd
  #fff4ce  → tło ostrzeżenia

Typography:
  h1 → text-lg font-bold text-[#201f1e]
  h2 → text-base font-bold text-[#323130]
  label → text-[14px] font-semibold text-[#323130]
  hint → text-xs text-[#605e5c]
```

---

## 1.2 Pełna Tabela Niespójności — Border Radius

| Plik | Klasa (błędna) | Poprawna zamiana | Liczba wystąpień |
|------|----------------|------------------|-----------------|
| `Alert.tsx` | `rounded-lg` | `rounded-md` | ~3 |
| `SearchInput.tsx` | `rounded-lg` | `rounded-sm` | 1 |
| `StepPorownanie.tsx` | `rounded-xl`, `rounded-2xl`, `rounded-lg` | `rounded-md` | ~12 |
| `StepWynikPodzial.tsx` | `rounded-lg`, `rounded-xl` | `rounded-md` | ~5 |
| `StepPodsumowanie.tsx` | `rounded-xl` | `rounded-md` | ~4 |
| `StepPracownicy.tsx` | `rounded-lg` | `rounded-md` | ~3 |
| `StepAnalizaPracownika.tsx` | `rounded-lg`, `rounded-xl` | `rounded-md` | ~4 |
| `App.tsx` | `rounded-lg` (nav) | `rounded-md` | ~2 |

**Dozwolone wyjątki `rounded-full`:** Avatar, ikony kołowe, wskaźnik kroku (step dot) — pozostają.

---

## 1.3 Pełna Tabela Niespójności — Shadows

| Plik | Klasa (błędna) | Poprawna zamiana |
|------|----------------|-----------------|
| `StepDashboard.tsx` | `shadow-sm`, `shadow-xl`, `shadow-2xl` | `elevation4`, `elevation16` |
| `StepPorownanie.tsx` | `shadow-xl`, `shadow-sm`, `shadow-2xl`, `shadow-md` | `elevation4` lub `elevation8` |
| `StepWynikPodzial.tsx` | `shadow-md` | `elevation4` |
| `StepPodsumowanie.tsx` | `shadow-sm` | `elevation4` |
| `StepPracownicy.tsx` | `shadow-sm` | `elevation4` |
| `App.tsx` | `shadow-sm`, `shadow-2xl`, `shadow-lg`, `shadow-md` | `elevation4` / `elevation16` (modal) |
| `KpiCard.tsx` | `shadow-sm` (w niektórych branch) | `elevation4` |

---

## 1.4 Pełna Tabela Niespójności — Kolory Tła

| Plik | Klasa (błędna) | Problem | Poprawna zamiana |
|------|----------------|---------|-----------------|
| `StepDashboard.tsx` | `bg-blue-50`, `bg-emerald-50`, `bg-purple-50` | Kolorowe tła kart | `bg-white border-[#edebe9]` |
| `StepDashboard.tsx` | `bg-gradient-to-br from-indigo-500 to-blue-600` | Gradient hero | `bg-[#0078d4]` lub `bg-slate-900` |
| `StepPorownanie.tsx` | `bg-gradient-to-b from-white to-[#FFF9E5]` | Gradient karta | `bg-white border-[#edebe9]` |
| `StepPorownanie.tsx` | `bg-amber-100/50`, `bg-amber-100/80` | Amber w kartach | `bg-[#fff4ce]` (token warning) |
| `StepPodsumowanie.tsx` | `bg-blue-50`, `bg-emerald-50`, `bg-indigo-50` | Kolorowe tła sekcji | `bg-white border-[#edebe9]` |
| `StepPodsumowanie.tsx` | `bg-gradient-to-br from-amber-50 to-orange-50` | Gradient | `bg-[#fff4ce]` |
| `StepPracownicy.tsx` | `bg-slate-50`, `bg-[#fbfbfb]`, `bg-slate-100` | Alternatywne tła | `bg-white` lub `bg-[#f3f2f1]` |
| `StepWynikPodzial.tsx` | `bg-indigo-50`, `bg-amber-50` | Kolorowe tła | `bg-white` |
| `App.tsx` | `bg-[#f8fafc]` | Tło main (za jasne) | `bg-[#f3f2f1]` |

---

## 1.5 Pełna Tabela Niespójności — Kolory Tekstu

| Klasa (błędna) | Opis problemu | Poprawna zamiana |
|----------------|---------------|-----------------|
| `text-slate-900` | Zamiast token | `text-[#201f1e]` |
| `text-slate-500`, `text-slate-600` | Zamiast token | `text-[#605e5c]` |
| `text-slate-400` | Zamiast token | `text-[#8a8886]` |
| `text-blue-600`, `text-blue-700` | Zamiast Dynamics Blue | `text-[#0078d4]` |
| `text-emerald-600`, `text-emerald-700` | Zamiast Fluent Green | `text-[#107c10]` |
| `text-amber-800`, `text-amber-700` | Warning text | `text-amber-800` ← dopuszczalny |
| `text-indigo-600`, `text-indigo-800` | Poza systemem | `text-[#0078d4]` lub `text-[#201f1e]` |
| `focus:ring-blue-500` | Focus ring kolory | `focus:ring-[#0078d4]` |

---

## 1.6 Pełna Tabela Niespójności — Borders

| Plik | Klasa (błędna) | Poprawna zamiana |
|------|----------------|-----------------|
| `SearchInput.tsx` | `border-slate-200` | `border-[#8a8886]` |
| `SearchInput.tsx` | `focus:border-blue-500` | `focus:border-[#0078d4]` |
| `StepDashboard.tsx` | `border-blue-500/20`, `border-emerald-500/20`, `border-slate-100` | `border-[#edebe9]` |
| `StepPorownanie.tsx` | `border-2 border-blue-500` | `border border-[#0078d4]` |
| `StepPorownanie.tsx` | `border-amber-400`, `border-yellow-500` | `border-[#fde5c4]` (warning token) |
| `StepPorownanie.tsx` | `border-slate-200/60`, `border-slate-200` | `border-[#edebe9]` |
| `StepPracownicy.tsx` | `border-slate-300`, `border-slate-200`, `border-red-300` | `border-[#edebe9]` / `border-[#a80000]` |
| `StepAnalizaPracownika.tsx` | `border-slate-200`, `border-blue-200`, `border-amber-200` | `border-[#edebe9]` |

---

## 1.7 Pełna Tabela Niespójności — Typography

| Problem | Przykład lokalizacji | Naprawa |
|---------|---------------------|---------|
| `font-extrabold`, `font-black` | StepPorownanie, StepPodsumowanie | Max `font-bold` |
| `text-[9px]`, `text-[10px]` | StepPracownicy, StepWynikPodzial | Min `text-[11px]` / `text-xs` (12px) |
| `tracking-widest` na dużych blokach | StepPorownanie, StepPodsumowanie | Maks. `tracking-wider` |
| `leading-none` na multi-line | StepPodsumowanie | `leading-tight` minimum |
| Mieszanie `text-xl/2xl/3xl/4xl/5xl` | StepPodsumowanie | Max `text-3xl` dla nagłówków |

---

## 1.8 Komponenty Współdzielone — Status

| Komponent | Status | Problem |
|-----------|--------|---------|
| `Button.tsx` | ✅ Poprawny | `rounded-sm`, tokeny |
| `Input.tsx` | ✅ Poprawny | Fluent styles |
| `KpiCard.tsx` | ⚠️ Drobne | `rounded-lg` w jednym wariancie |
| `Badge.tsx` | ✅ Poprawny | `rounded-sm`, tokeny |
| `Modal.tsx` | ✅ Poprawny | `rounded-md`, elevation16 |
| `Card.tsx` | ✅ Poprawny | Tokeny z theme |
| `Alert.tsx` | ❌ `rounded-lg` | Zmienić na `rounded-md` |
| `SearchInput.tsx` | ❌ Wiele | `rounded-lg`, kolory spoza systemu |
| `Avatar.tsx` | ✅ OK | `rounded-full` — celowe |
| `DataTableToolbar.tsx` | ✅ Poprawny | `border-[#edebe9]`, `bg-[#f8f9fa]` |
| `PageHeader.tsx` | ✅ Poprawny | `rounded-md`, Dynamics Blue |
| `StepIndicator.tsx` | ✅ OK | `rounded-full` celowe dla kroków |
| `ConfirmDialog.tsx` | ✅ Poprawny | elevation16, `rounded-md` |
| `ActionCard.tsx` | ✅ Poprawny | Tokeny, `rounded-md` |

---

# FAZA 2: Ujednolicenie Designu

## 2.1 Typografia — Rekomendacja

### Aktualny stan
Aplikacja de-facto używa systemowego font-stack Segoe UI (zdefiniowany jako `font-sans` w tailwind). To **poprawny wybór** dla Fluent/Dynamics feel.

### Officialna para fontów dla tej aplikacji

```
Główny:  Segoe UI Variable, Segoe UI, system-ui, sans-serif
Kod/num: Consolas, "Cascadia Code", "Courier New", monospace (tabular-nums na liczbach)
```

Nie zmieniaj fontu — Segoe UI jest idealny dla tej aplikacji.

### Skala Typograficzna (zdefiniuj w theme.ts)

```typescript
typography: {
  // Stronowe nagłówki
  pageTitle:    'text-xl font-bold text-[#201f1e]',        // 20px
  sectionTitle: 'text-base font-semibold text-[#323130]',  // 16px
  cardTitle:    'text-sm font-semibold text-[#323130]',    // 14px

  // Tekst
  body:         'text-sm text-[#201f1e]',                  // 14px
  bodySmall:    'text-xs text-[#605e5c]',                  // 12px
  caption:      'text-[11px] text-[#8a8886]',              // 11px (MIN)

  // Dane liczbowe
  kpiValue:     'text-2xl font-bold text-[#201f1e] tabular-nums',  // 24px
  kpiValueLg:   'text-3xl font-bold text-[#201f1e] tabular-nums',  // 30px (MAX)

  // Etykiety
  label:        'text-[14px] font-semibold text-[#323130] mb-1.5 block',
  hint:         'text-xs text-[#605e5c] mt-1 block',
  sectionLabel: 'text-[10px] font-bold uppercase tracking-wider text-[#8a8886]',
}
```

**Reguła:** Nigdy nie używaj `text-4xl`, `text-5xl` ani `font-extrabold/font-black` — max to `text-3xl` + `font-bold`.

---

## 2.2 Paleta Kolorów — Pełna Specyfikacja

### Kolory Neutralne (Fluent Neutral Palette)

| Token | HEX | RGB | HSL | Zastosowanie |
|-------|-----|-----|-----|-------------|
| page-bg | `#f3f2f1` | 243,242,241 | 30°,11%,95% | Tło strony |
| card-bg | `#ffffff` | 255,255,255 | — | Tło kart |
| subtle-bg | `#f8f9fa` | 248,249,250 | 210°,14%,98% | Tła tabel (header) |
| border | `#edebe9` | 237,235,233 | 30°,10%,92% | Bordery domyślne |
| border-strong | `#8a8886` | 138,136,134 | 30°,2%,53% | Inputy (przed focusem) |
| text-primary | `#201f1e` | 32,31,30 | 30°,3%,12% | Tekst główny |
| text-secondary | `#323130` | 50,49,48 | 30°,2%,19% | Nagłówki |
| text-muted | `#605e5c` | 96,94,92 | 30°,2%,37% | Tekst pomocniczy |
| text-placeholder | `#8a8886` | 138,136,134 | 30°,2%,53% | Placeholder |
| text-disabled | `#a19f9d` | 161,159,157 | 30°,2%,62% | Disabled |

### Kolory Akcentowe (Dynamics Brand)

| Token | HEX | RGB | HSL | Zastosowanie |
|-------|-----|-----|-----|-------------|
| brand | `#0078d4` | 0,120,212 | 206°,100%,42% | Primary action, aktywne ikony |
| brand-hover | `#005fa3` | 0,95,163 | 206°,100%,32% | Hover stanu primary |
| brand-light | `#eff6fc` | 239,246,252 | 206°,67%,96% | Icon bg, info badge bg |
| brand-border | `#c7e0f4` | 199,224,244 | 206°,67%,87% | Info badge border |

### Kolory Statusów

| Token | HEX | Zastosowanie |
|-------|-----|-------------|
| success-bg | `#dff6dd` | Badge/Alert sukces tło |
| success-text | `#107c10` | Tekst sukcesu |
| success-border | `#bad80a` | Granica badge sukcesu |
| warning-bg | `#fff4ce` | Alert ostrzeżenia tło |
| warning-text | `#323130` | Tekst ostrzeżenia (ciemny) |
| warning-border | `#fde5c4` | Granica ostrzeżenia |
| error-bg | `#fde7e9` | Alert błędu tło |
| error-text | `#a80000` | Tekst błędu |
| error-border | `#a80000` | Granica błędu |

### Dark Panel (Nawigacja + Left Panel)

| Token | HEX | Zastosowanie |
|-------|-----|-------------|
| dark-bg | `#0f1117` | bg-slate-900 — Left panel/sidebar |
| dark-surface | `#1e2028` | bg-slate-800 — Karty w dark panel |
| dark-border | `#374151` | border-slate-800 — Bordery w dark |
| dark-text | `#f1f5f9` | text-slate-100 — Główny tekst w dark |
| dark-muted | `#94a3b8` | text-slate-400 — Muted tekst w dark |

**REGUŁA:** Nie używaj `bg-blue-50`, `bg-emerald-50`, `bg-purple-50`, `bg-indigo-50` na kartach/sekcjach. Używaj tylko `bg-white` + `border-[#edebe9]`. Jedyny wyjątek to tło ikony (`#eff6fc`) lub status badges.

---

## 2.3 Skala Przestrzeni (Spacing)

```
Spacing tokeny (zachowaj jako stałe):
  gap-2  = 8px   — inline elementy, small clusters
  gap-3  = 12px  — małe sekcje
  gap-4  = 16px  — standardowy gap kart
  gap-6  = 24px  — duże sekcje/gridy
  gap-8  = 32px  — sekcje na stronie

Padding kart:
  p-4    = 16px  — compact card
  p-5    = 20px  — standardowa karta
  p-6    = 24px  — duża karta

Zbędne wartości do usunięcia:
  p-8 na kartach wewnętrznych
  gap-8 wewnątrz sekcji
```

---

## 2.4 Specyfikacja Komponentów — Stany

### Card (karty danych)
```
Domyślny:  bg-white | border border-[#edebe9] | rounded-md | elevation4
Hover:     border-[#c7e0f4] | elevation8
Aktywny:   border-[#0078d4] | elevation4
Disabled:  opacity-60
```

### Button Primary
```
Domyślny:  bg-[#0078d4] text-white | rounded-sm | no shadow
Hover:     bg-[#005fa3]
Active:    scale-[0.98]
Disabled:  opacity-50 cursor-not-allowed
```

### Button Secondary
```
Domyślny:  bg-white text-[#201f1e] border border-[#8a8886] | rounded-sm
Hover:     bg-[#f3f2f1]
Active:    scale-[0.98]
```

### Input
```
Domyślny:    border border-[#8a8886] | rounded-sm | bg-white
Hover:       border-[#323130]
Focus:       border-2 border-[#0078d4] | ring-0 (no focus ring, border is enough)
Error:       border-[#a80000]
Disabled:    bg-[#f3f2f1] text-[#a19f9d]
```

### KpiCard
```
Light variant:  bg-white border border-[#edebe9] rounded-md elevation4
Dark variant:   bg-slate-900 border border-slate-700 rounded-md elevation4
Accent bar:     w-1 bg-[#0078d4] | absolute left-0 top-0 bottom-0
```

---

## 2.5 Plik `common/theme.ts` — Uzupełnienia do Dodania

Dodaj do theme.ts następujące brakujące tokeny:

```typescript
// Dodaj do exports:
export const colors = {
  // Neutralne
  pageBg: '#f3f2f1',
  cardBg: '#ffffff',
  subtleBg: '#f8f9fa',
  border: '#edebe9',
  borderStrong: '#8a8886',
  // Tekst
  textPrimary: '#201f1e',
  textSecondary: '#323130',
  textMuted: '#605e5c',
  textPlaceholder: '#8a8886',
  // Brand
  brand: '#0078d4',
  brandHover: '#005fa3',
  brandLight: '#eff6fc',
  // Status
  successBg: '#dff6dd',
  successText: '#107c10',
  warningBg: '#fff4ce',
  warningBorder: '#fde5c4',
  errorBg: '#fde7e9',
  errorText: '#a80000',
} as const;
```

---

# FAZA 3: Redesign Ekranów

## 3.1 StepDashboard — Dashboard Główny

### Aktualna analiza
- Hero section z gradientem `from-indigo-500 to-blue-600` i dekoracyjnym `blur-[100px]` — niezgodny z Fluent
- Karty akcji z kolorowymi tłami `bg-blue-50`, `bg-emerald-50`, `bg-purple-50` i kolorowymi borderami
- `shadow-xl`, `shadow-2xl` — za mocne cienie
- `md:min-h-[380px]` hero — marnotrawstwo przestrzeni

### Wizja Redesignu — Layout

```
┌────────────────────────────────────────────────────────┐
│  [👋 Nagłówek PageHeader]                              │
│  Kalkulator Stratton | Subtitle                        │
├────────────┬───────────┬───────────┬───────────────────┤
│ KARTA:     │ KARTA:    │ KARTA:    │ KARTA:            │
│ Firma      │ Pracow.   │ Wyniki    │ Szybka Sym.       │
│ bg-white   │ bg-white  │ bg-white  │ bg-white          │
│ border     │ border    │ border    │ border            │
│ elevation4 │ elevation4│ elevation4│ elevation4        │
└────────────┴───────────┴───────────┴───────────────────┘
│  [Historia kalkulacji — DataTable]                     │
│  bg-white border rounded-md                            │
└────────────────────────────────────────────────────────┘
```

### Zmiany kodu (Dashboard)

| Element | Przed | Po |
|---------|-------|-----|
| Hero gradient | `bg-gradient-to-br from-indigo-500 to-blue-600` | `bg-[#0078d4]` (flat) |
| hero blur | `blur-[100px]` dekoracja | Usuń całkowicie |
| `shadow-xl` | Hero shadow | `shadow-[0_6.4px_14.4px_0_rgba(0,0,0,0.13),...]` |
| Action cards bg | `bg-blue-50`, `bg-emerald-50`, `bg-purple-50` | `bg-white` |
| Action cards border | `border-blue-500/20` itp. | `border-[#edebe9]` |
| Action cards shadow | `shadow-sm` | `shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),...]` |
| History items border | `border-slate-100` | `border-[#edebe9]` |
| Gradient icon bg | `from-indigo-500 to-blue-600` | `bg-[#0078d4]` |

---

## 3.2 StepFirma — Dane Firmy

### Aktualna analiza
- ✅ Używa `Section`, `FormField` z Layout.tsx — poprawnie
- ✅ `border-l-4 border-l-[#107c10]` na karcie sukcesu — akceptowalne
- ⚠️ `bg-blue-50` sporadycznie
- ⚠️ Drobne niekonsekwencje w `rounded-*`

### Wymagane zmiany (minimalne)
- Zastąp `bg-blue-50` → `bg-white border-[#eff6fc]` lub `bg-[#eff6fc]`
- Upewnij się, że wszystkie `rounded-lg` → `rounded-md`

### ASCII Diagram (bez zmian strukturalnych potrzebnych)
```
┌─────────────────────────────────────────────────────────┐
│  [PageHeader — Dane Firmy]                              │
├─────────────────────────────────────────────────────────┤
│  Section: Podstawowe dane                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Nazwa firmy  │  │ NIP          │  │ Miejscowość   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
├─────────────────────────────────────────────────────────┤
│  Section: Parametry kalkulacji                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │ [Alerty sukcesu bg-[#dff6dd] border-l-[#107c10]]   ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## 3.3 StepPracownicy — Lista Pracowników

### Aktualna analiza
- `rounded-lg` na rozwijanych kartach pracownika
- `bg-slate-50`, `bg-[#fbfbfb]` na tłach — niespójna
- `shadow-sm` na kartach
- `focus:ring-blue-500` na przyciskach accordion
- `border-dashed border-slate-300` na "dodaj pracownika" — akceptowalne
- `border-red-300` (do naprawy → `border-[#a80000]`)

### Wizja Redesignu

```
┌─────────────────────────────────────────────────────────┐
│  [PageHeader] + [SearchInput] + [ButtonPrimary + Dodaj] │
├─────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────┐  │
│  │ 👤 Jan Kowalski  [UOP]  45 000 zł   [Edytuj ▾]   │  │
│  │   bg-white | border-[#edebe9] | rounded-md         │  │
│  ├───────────────────────────────────────────────────┤  │
│  │ [Rozwinięty accordion — Formularz danych]          │  │
│  │   bg-[#f3f2f1] (subtelny odcień)                  │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │  + Dodaj pracownika  [dashed border-[#edebe9]]    │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
└─────────────────────────────────────────────────────────┘
```

### Zmiany kodu

| Element | Przed | Po |
|---------|-------|-----|
| Karta pracownika | `rounded-lg shadow-sm` | `rounded-md elevation4` |
| Tło rozwinięte | `bg-slate-50/50` | `bg-[#f3f2f1]` |
| Tło wewnętrzne | `bg-[#fbfbfb]` | `bg-white` lub `bg-[#f3f2f1]` |
| Focus ring | `focus:ring-blue-500` | `focus:ring-[#0078d4]` |
| Błąd border | `border-red-300` | `border-[#a80000]` |

---

## 3.4 StepPorownanie — Porównanie Wariantów (NAJWIĘKSZA PRACA)

### Aktualna analiza
Ten ekran jest najbardziej odległy od systemu designu:
- Używa `rounded-xl`, `rounded-2xl`, `rounded-lg` na kartach
- `shadow-xl`, `shadow-2xl`, `shadow-md` — za mocne
- Gradient na amber karcie: `bg-gradient-to-b from-white to-[#FFF9E5]`
- `border-2 border-blue-500` na wybranej opcji — zbyt agresywne
- `font-extrabold`, `font-black` na cenach
- `blur-[100px]` dekoracje
- `opacity-80`, `opacity-60`, `opacity-50` na nieaktywnych elementach

### Wizja Redesignu

```
┌─────────────────────────────────────────────────────────┐
│  [PageHeader — Porównanie wariantów]                    │
├──────────────────────────┬──────────────────────────────┤
│  STANDARD                │  PODZIAŁ (Premium)           │
│  bg-white                │  bg-white                    │
│  border-[#edebe9]        │  border-[#0078d4]  ← selected│
│  rounded-md elevation4   │  rounded-md elevation8       │
│                          │                              │
│  120 000 zł              │  134 500 zł                  │
│  text-2xl font-bold      │  text-2xl font-bold          │
│                          │  [Badge POLECANE / OPTIMAL]  │
│                          │  bg-[#eff6fc] text-[#0078d4] │
├──────────────────────────┴──────────────────────────────┤
│  [Tabela porównawcza — divide-[#edebe9]]                │
│  row hover: bg-[#f3f2f1]                               │
└─────────────────────────────────────────────────────────┘
```

### Zmiany kodu (Porównanie — kluczowe)

| Element | Przed | Po |
|---------|-------|-----|
| Karta Standard | `rounded-xl shadow-md` | `rounded-md elevation4` |
| Karta Premium/PODZIAŁ | `rounded-xl shadow-2xl` | `rounded-md elevation8` |
| Gradient amber | `bg-gradient-to-b from-white to-[#FFF9E5]` | `bg-white` z `border-[#fde5c4]` |
| Zaznaczona karta | `border-2 border-blue-500` | `border-2 border-[#0078d4]` |
| Badge "POLECANE" | `bg-amber-100/80 rounded-full` | `bg-[#eff6fc] text-[#0078d4] border-[#c7e0f4] rounded-sm` |
| Blur dekoracje | `blur-[100px]` | Usuń |
| Ceny font | `font-black`, `font-extrabold` | `font-bold` |
| Nieaktywne el. | `opacity-60/50` | `opacity-50` (uniform) |
| Checkmarki | `bg-emerald-50`, `text-emerald-600` | `bg-[#dff6dd] text-[#107c10]` |

---

## 3.5 StepWynikStandard — Wyniki Standard

### Aktualna analiza
- ✅ Już używa `rounded-md`
- ✅ Używa `border-[#edebe9]`
- ✅ `bg-white`, `bg-slate-100/50` na wierszach tabeli
- ⚠️ `h-[calc(100vh-280px)]` — hardcoded height
- ⚠️ `border-slate-100` sporadycznie (zamiast `border-[#edebe9]`)

### Wymagane zmiany (minimalne)
```
border-slate-100 → border-[#edebe9]
bg-slate-100/50 → bg-[#f3f2f1] (na wyróżnionych wierszach)
```

### ASCII Diagram
```
┌─────────────────────────────────────────────────────────┐
│  [PageHeader]                                           │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  ← KpiCards     │
│  │ 4 KPI│ │      │ │      │ │      │    elevation4    │
│  └──────┘ └──────┘ └──────┘ └──────┘                  │
├─────────────────────────────────────────────────────────┤
│  [DataTableToolbar] bg-[#f8f9fa] border-b-[#edebe9]    │
│  [StandardTable]                                        │
│   thead: bg-[#f8f9fa] border-[#edebe9]                 │
│   tbody row: hover bg-[#f3f2f1]                        │
│   total row: bg-[#f3f2f1] font-bold                    │
└─────────────────────────────────────────────────────────┘
```

---

## 3.6 StepWynikPodzial — Wyniki Podział

### Aktualna analiza
- `rounded-lg`, `rounded-xl` na sekcjach
- `bg-indigo-50`, `bg-amber-50` na kartach
- `shadow-md` zamiast elevation token
- `text-indigo-600/700`, `text-emerald-700` zamiast tokenów
- `text-[9px]` — poniżej minimum dostępności!
- Dark variant sekcja OK (`bg-slate-900`)

### Wizja Redesignu

```
┌─────────────────────────────────────────────────────────┐
│  [PageHeader] + [KPI Cards x4]                        │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │  Sekcja wyjaśniająca podział                    │   │
│  │  bg-white | border-l-4 border-l-[#0078d4]       │   │
│  │  rounded-md elevation4                          │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  [DataTableToolbar]                                     │
│  [PodzialTable]                                         │
│   Zasadnicza kol: bg-[#eff6fc] text-[#0078d4]          │
│   Premia kol: bg-[#fff4ce] text-amber-800              │
└─────────────────────────────────────────────────────────┘
```

### Zmiany kodu (Podział)

| Element | Przed | Po |
|---------|-------|-----|
| bg-indigo-50 karty | `bg-indigo-50 border-indigo-100` | `bg-white border-[#edebe9]` |
| bg-amber-50 karty | `bg-amber-50 border-amber-200` | `bg-[#fff4ce] border-[#fde5c4]` |
| rounded-xl/lg | `rounded-xl`, `rounded-lg` | `rounded-md` |
| shadow-md | `shadow-md` | `elevation4` |
| text-[9px] | `text-[9px]` | `text-[11px]` (MANDATORY) |
| text-indigo-600 | `text-indigo-600` | `text-[#0078d4]` |
| text-emerald-700 | `text-emerald-700` | `text-[#107c10]` |
| border-indigo-200 | `border-indigo-200` | `border-[#c7e0f4]` |

---

## 3.7 StepPodsumowanie — Podsumowanie

### Aktualna analiza
- Gradient tła: `bg-gradient-to-br from-amber-50 to-orange-50`
- `rounded-xl` na kartach
- `bg-blue-50`, `bg-emerald-50`, `bg-indigo-50` na sekcjach
- `shadow-sm` zamiast elevation
- `font-extrabold`, `font-black` na dużych liczbach
- `text-[9px]`, `text-[10px]` do naprawy
- Dark CTA panel (`bg-slate-900`) — zachowaj

### Wizja Redesignu

```
┌─────────────────────────────────────────────────────────┐
│  [PageHeader]                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ KPI karta1  │  │ KPI karta2  │  │ KPI karta3  │    │
│  │ bg-white    │  │ bg-white    │  │ bg-[#0078d4]│    │
│  │ elevation4  │  │ elevation4  │  │ text-white  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
├─────────────────────────────────────────────────────────┤
│  [Tabela porównawcza] bg-white rounded-md elevation4   │
├─────────────────────────────────────────────────────────┤
│  [Dark CTA Panel bg-slate-900]                         │
│  [Eksport do PDF] [Zapisz] [Wyślij]                    │
└─────────────────────────────────────────────────────────┘
```

### Zmiany kodu (Podsumowanie)

| Element | Przed | Po |
|---------|-------|-----|
| Gradient sekcja | `from-amber-50 to-orange-50` | `bg-[#fff4ce] border-[#fde5c4]` |
| bg-blue-50 | `bg-blue-50` | `bg-white border-[#edebe9]` |
| bg-emerald-50 | `bg-emerald-50` | `bg-white border-[#edebe9]` lub `bg-[#dff6dd]` |
| rounded-xl | `rounded-xl` | `rounded-md` |
| shadow-sm | `shadow-sm` na kartach | `elevation4` |
| font-black/extrabold | Grote liczby | `font-bold` |
| text-[9px]/[10px] | Micro labels | `text-[11px]` |

---

## 3.8 StepSzybkaSymulacja — Szybka Symulacja

### Stan
✅ **Już zmodernizowany** w tej sesji. Zgodny z Fluent.

Drobne sprawdzenia do weryfikacji:
- `shadow-md` na prawym panelu → `elevation4`
- `shadow-2xl` na jednym elemencie → `elevation16` lub usuń

---

## 3.9 StepAnalizaPracownika — Analiza Pracownika

### Aktualna analiza
- `rounded-lg`, `rounded-xl` na kartach
- `border-slate-200`, `border-blue-200`, `border-amber-200` zamiast tokenów
- `bg-blue-50`, `bg-amber-50` na alertach/sekcjach
- `focus:ring-blue-500` zamiast `[#0078d4]`
- `text-pink-600` (!) — całkowicie spoza systemu
- `text-[9px]` do naprawy
- Dark bottom panel (`bg-slate-900`) — zachowaj

### Wizja Redesignu

```
┌─────────────────────────────────────────────────────────┐
│  [PageHeader — Analiza Pracownika]                     │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ← KpiCards  │
│  │ KPI  │  │ KPI  │  │ KPI  │  │ KPI  │              │
│  └──────┘  └──────┘  └──────┘  └──────┘              │
├─────────────────────────────────────────────────────────┤
│  [Input: Wynagrodzenie brutto]                         │
│  [Slider / Select: Typ umowy]                          │
├─────────────────────────────────────────────────────────┤
│  [Tabela szczegółów — divide-[#edebe9]]               │
│  row hover: bg-[#f3f2f1]                              │
├─────────────────────────────────────────────────────────┤
│  [Dark ekspansja bg-slate-900]                         │
│  [ButtonPrimary: Eksportuj]                            │
└─────────────────────────────────────────────────────────┘
```

### Zmiany kodu (Analiza Pracownika)

| Element | Przed | Po |
|---------|-------|-----|
| rounded-lg/xl | `rounded-lg`, `rounded-xl` | `rounded-md` |
| border-slate-200 | `border-slate-200` | `border-[#edebe9]` |
| border-blue-200 | `border-blue-200` | `border-[#c7e0f4]` (info) lub `border-[#edebe9]` |
| border-amber-200 | `border-amber-200` | `border-[#fde5c4]` |
| bg-blue-50 | info bg | `bg-[#eff6fc]` |
| bg-amber-50 | warning bg | `bg-[#fff4ce]` |
| text-pink-600 | NIEZNANE | `text-[#a80000]` lub `text-[#605e5c]` |
| focus:ring-blue-500 | focus rings | `focus:ring-[#0078d4]` |
| text-[9px] | micro text | `text-[11px]` |

---

# FAZA 4: Plan Implementacji

## 4.1 Priorytety i Kolejność

```
SPRINT 1 — Komponenty Współdzielone (1-2h)
  ☐  Fix Alert.tsx          rounded-lg → rounded-md
  ☐  Fix SearchInput.tsx    border, bg, focus colors
  
SPRINT 2 — StepPorownanie (2-3h)
  ☐  Fix rounded-xl/2xl → rounded-md
  ☐  Usuń gradienty, blur-[100px]
  ☐  Fix shadows → elevation tokens
  ☐  Fix kolory tekstu (indigo → brand)
  ☐  Fix amber badge → system token
  
SPRINT 3 — StepDashboard (1-2h)
  ☐  Hero: gradient → flat bg-[#0078d4]
  ☐  Action cards: kolorowe tła → bg-white
  ☐  Border doclean: wszystko → border-[#edebe9]
  ☐  Shadows → elevation tokens
  
SPRINT 4 — StepPodsumowanie (1-2h)
  ☐  rounded-xl → rounded-md
  ☐  Usuń gradienty
  ☐  bg-blue/emerald/indigo-50 → bg-white
  ☐  font-black/extrabold → font-bold
  ☐  text-[9px/10px] → min text-[11px]
  
SPRINT 5 — StepWynikPodzial (1h)
  ☐  rounded-xl/lg → rounded-md
  ☐  bg-indigo/amber-50 → system tokens
  ☐  shadow-md → elevation4
  ☐  text-[9px] → text-[11px]
  
SPRINT 6 — StepPracownicy + StepAnalizaPracownika (1h)
  ☐  rounded-lg → rounded-md
  ☐  Fix bg colors
  ☐  Fix border colors
  ☐  Fix focus rings
  ☐  text-pink-600 → odpowiedni token
  
SPRINT 7 — App.tsx nawigacja (0.5h)
  ☐  shadow-sm/2xl/lg → elevation tokens
  ☐  bg-[#f8fafc] → bg-[#f3f2f1]
  ☐  rounded-lg → rounded-md
```

---

## 4.2 Przykłady Kodu — Przed/Po

### Alert.tsx — Naprawa rounded

```tsx
// PRZED
<div className={`rounded-lg border-l-4 p-4 ${variantClasses}`}>

// PO
<div className={`rounded-md border-l-4 p-4 ${variantClasses}`}>
```

### SearchInput.tsx — Pełna naprawa

```tsx
// PRZED
<div className="relative w-full">
  <input
    className="w-full rounded-lg border border-slate-200 bg-slate-50 
               px-9 py-2 text-sm text-slate-600 
               focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
               outline-none transition-all"
  />

// PO
<div className="relative w-full">
  <input
    className="w-full rounded-sm border border-[#8a8886] bg-white
               px-9 py-2 text-sm text-[#201f1e]
               hover:border-[#323130]
               focus:border-[#0078d4] focus:border-2 focus:px-[calc(theme(spacing.9)-1px)] focus:py-[calc(theme(spacing.2)-1px)]
               outline-none transition-all placeholder:text-[#8a8886]"
  />
```

### StepPorownanie.tsx — Karta wariantu

```tsx
// PRZED
<div className={`rounded-xl shadow-2xl border-2 bg-gradient-to-b 
     ${selected ? 'border-blue-500 from-white to-[#FFF9E5]' : 'border-slate-200'}`}>
  <p className="text-4xl font-black">134 500 zł</p>

// PO
<div className={`rounded-md border bg-white
     shadow-[0_3.2px_7.2px_0_rgba(0,0,0,0.13),0_0.6px_1.8px_0_rgba(0,0,0,0.11)]
     ${selected ? 'border-[#0078d4]' : 'border-[#edebe9]'}`}>
  <p className="text-2xl font-bold text-[#201f1e] tabular-nums">134 500 zł</p>
```

### StepDashboard.tsx — Hero section

```tsx
// PRZED
<div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-blue-600 
     rounded-xl md:min-h-[380px] shadow-2xl">
  <div className="absolute inset-0 blur-[100px] opacity-50 bg-blue-500" />

// PO
<div className="relative overflow-hidden bg-[#0078d4] rounded-md
     shadow-[0_6.4px_14.4px_0_rgba(0,0,0,0.13),0_1.2px_3.6px_0_rgba(0,0,0,0.10)]">
  {/* Brak dekoracyjnych blur elementów */}
```

### StepPodsumowanie.tsx — Naprawa gradientu

```tsx
// PRZED
<div className="bg-gradient-to-br from-amber-50 to-orange-50 
     rounded-xl border border-amber-200 shadow-sm p-6">

// PO
<div className="bg-[#fff4ce] rounded-md border border-[#fde5c4]
     shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),0_0.3px_0.9px_0_rgba(0,0,0,0.11)] p-6">
```

### StepWynikPodzial.tsx — Naprawa kart

```tsx
// PRZED
<div className="bg-indigo-50 rounded-xl border border-indigo-100 p-5 shadow-md">
  <span className="text-indigo-700 text-[9px] font-bold">

// PO
<div className="bg-white rounded-md border border-[#edebe9] p-5
     shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),0_0.3px_0.9px_0_rgba(0,0,0,0.11)]">
  <span className="text-[#0078d4] text-[11px] font-bold">
```

---

## 4.3 Global Find-Replace — Przepis

Wykonaj te wyszukiwania globalnie w plikach `features/steps/**/*.tsx`:

```
ROUNDING:
  rounded-2xl       →  rounded-md
  rounded-xl        →  rounded-md
  rounded-lg        →  rounded-md  (sprawdź każde: rounded-full OK dla okrągłych)

SHADOWS:
  shadow-2xl        →  shadow-[0_6.4px_14.4px_0_rgba(0,0,0,0.13),0_1.2px_3.6px_0_rgba(0,0,0,0.10)]
  shadow-xl         →  shadow-[0_6.4px_14.4px_0_rgba(0,0,0,0.13),0_1.2px_3.6px_0_rgba(0,0,0,0.10)]
  shadow-md         →  shadow-[0_3.2px_7.2px_0_rgba(0,0,0,0.13),0_0.6px_1.8px_0_rgba(0,0,0,0.11)]
  shadow-lg         →  shadow-[0_3.2px_7.2px_0_rgba(0,0,0,0.13),0_0.6px_1.8px_0_rgba(0,0,0,0.11)]
  "shadow-sm"       →  shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),0_0.3px_0.9px_0_rgba(0,0,0,0.11)]
  
  UWAGA: shadow-sm w Button.tsx to jest OK — nie touch!

FOCUS RINGS:
  focus:ring-blue-500    →  focus:ring-[#0078d4]
  focus:border-blue-500  →  focus:border-[#0078d4]
  ring-blue-500          →  ring-[#0078d4]

TEXT COLORS:
  text-blue-600    →  text-[#0078d4]
  text-blue-700    →  text-[#0078d4]
  text-emerald-600 →  text-[#107c10]
  text-emerald-700 →  text-[#107c10]
  text-indigo-600  →  text-[#0078d4]
  text-indigo-700  →  text-[#0078d4]
  text-slate-900   →  text-[#201f1e]   (sprawdź kontekst!)
  text-slate-600   →  text-[#605e5c]   (sprawdź kontekst!)
  text-slate-400   →  text-[#8a8886]   (sprawdź kontekst!)
  text-pink-600    →  (weryfikuj ręcznie — co to oznacza?)

BORDERS:
  border-slate-200          →  border-[#edebe9]
  border-slate-100          →  border-[#edebe9]
  border-blue-500/20        →  border-[#c7e0f4]
  border-emerald-500/20     →  border-[#edebe9]
  border-indigo-100         →  border-[#edebe9]
  border-amber-200          →  border-[#fde5c4]
  border-amber-100          →  border-[#fde5c4]
  border-red-300            →  border-[#a80000]

BACKGROUNDS:
  bg-blue-50     →  bg-[#eff6fc]  (jeśli info) lub bg-white (jeśli karta)
  bg-emerald-50  →  bg-[#dff6dd]  (jeśli sukces) lub bg-white
  bg-purple-50   →  bg-white
  bg-indigo-50   →  bg-white  lub  bg-[#eff6fc]
  bg-amber-50    →  bg-[#fff4ce]
  bg-slate-50    →  bg-[#f3f2f1]  lub  bg-white
  bg-[#f8fafc]   →  bg-[#f3f2f1]
  bg-[#fbfbfb]   →  bg-white

TYPOGRAPHY:
  font-extrabold  →  font-bold
  font-black      →  font-bold
  text-[9px]      →  text-[11px]  (OBOWIĄZKOWE — dostępność)
  text-4xl        →  text-3xl  (na nagłówkach, nie na liczbach...)
  text-5xl        →  text-3xl

GRADIENTS (usuń wszystkie w komponentach widoku):
  bg-gradient-to-*   →  flat background (patrz sekcja 4.2)
  blur-\[100px\]     →  usuń całkowicie
```

---

## 4.4 Metryki Sukcesu po Implementacji

Po wykonaniu wszystkich sprintów:

- [ ] `grep -r "rounded-xl\|rounded-2xl\|rounded-lg" features/steps/` → 0 wyników (poza Avatar/okrągłymi)
- [ ] `grep -r "shadow-xl\|shadow-2xl\|shadow-md\|shadow-lg" features/steps/` → 0 wyników
- [ ] `grep -r "bg-blue-50\|bg-emerald-50\|bg-purple-50\|bg-indigo-50" features/steps/` → 0 wyników
- [ ] `grep -r "bg-gradient-to" features/steps/` → 0 wyników  
- [ ] `grep -r "blur-\[100px\]" features/steps/` → 0 wyników
- [ ] `grep -r "text-\[9px\]" features/` → 0 wyników
- [ ] `grep -r "font-black\|font-extrabold" features/` → 0 wyników
- [ ] `grep -r "focus:ring-blue-500\|focus:border-blue-500" features/` → 0 wyników
- [ ] Build: `vite build` → 0 errors
- [ ] Visual: wszystkie ekrany wyglądają spójnie — flat, Fluent, sharp corners

---

## 4.5 Szacowany Nakład Pracy

| Sprint | Pliki | Czas | Ryzyko regresji |
|--------|-------|------|----------------|
| S1 — Shared components | Alert.tsx, SearchInput.tsx | 30 min | Niskie (szybkie) |
| S2 — StepPorownanie | 1 plik | 90 min | Średnie (dużo klas) |
| S3 — StepDashboard | 1 plik | 60 min | Niskie |
| S4 — StepPodsumowanie | 1 plik | 60 min | Niskie |
| S5 — StepWynikPodzial | 1 plik | 45 min | Niskie |
| S6 — StepPracownicy + StepAnaliza | 2 pliki | 60 min | Niskie |
| S7 — App.tsx nawigacja | 1 plik | 30 min | Niskie |
| **TOTAL** | **8 plików** | **~6.5h** | **Niskie** |

---

*Koniec raportu. Wersja: 1.0 | Ekrany: 9 | Pliki: 15 | Tokeny: 47*
