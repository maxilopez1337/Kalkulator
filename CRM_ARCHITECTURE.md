# Stratton Prime CRM — Architektura Systemu
### Dokument dla zespołu deweloperów · v1.0 · Marzec 2026

---

## FAZA 1 — Analiza Istniejącego Kalkulatora

### 1.1 Ogólna charakterystyka systemu

**Stratton Prime** to zaawansowana aplikacja SPA (Single Page Application) służąca do kalkulacji kosztów zatrudnienia w modelu optymalizacji wynagrodzenia opartym na podziale świadczeń (podstawa + benefit pracowniczy). Produkt jest narzędziem sprzedażowym — handlowiec przeprowadza klienta (firmę) przez 7-krokowy wizard i generuje ofertę PDF/Excel pokazującą oszczędności.

### 1.2 Stos technologiczny (stan obecny)

| Warstwa | Technologia |
|---|---|
| Renderer | React 19 + TypeScript 5.8 |
| Build | Vite 6 |
| Styling | Tailwind CSS (custom D365 tokens) |
| Testy | Vitest |
| PDF | @react-pdf/renderer, jsPDF, pdf-lib, Puppeteer |
| Excel | ExcelJS (CDN) |
| Backend (min.) | Express.js (Node) — tylko generacja PDF przez Puppeteer |
| Baza danych | LocalStorage (historia kalkulacji JSON) |
| State | React Context (5 niezależnych providerów) |

### 1.3 Główne moduły

#### Encje domenowe

```
Pracownik {
  dane osobowe: imię, nazwisko, dataurodzenia, płeć
  parametry umowy: typUmowy (UOP/UZ), trybSkladek
  netto: nettoDocelowe, nettoZasadnicza
  podatki: pit2, ulgaMlodych, kupTyp, pitMode
  ZUS: skladkaFP, skladkaFGSP, choroboweAktywne
}

Firma {
  identyfikator: nip, nazwa
  adres: adres, kodPocztowy, miasto
  kontakt: email, telefon, osobaKontaktowa
  handlowiec: opiekunNazwa, opiekunEmail, opiekunTelefon
  parametry: okres (YYYY-MM), stawkaWypadkowa (%)
}

Config (globalne stawki ZUS/PIT — konfigurowalny):
  ZUS UoP/UZ: emerytalna, rentowa, chorobowa, wypadkowa, FP, FGŚP
  PIT: progi, KUP standard/podwyższone, ulga dla młodych, itp.
  Świadczenie: stawkaPIT, odpłatność
  Prowizja: standard (28%), plus (26%)

ZapisanaKalkulacja (historia):
  id, dataUtworzenia, nazwaFirmy
  liczbaPracownikow, oszczednoscRoczna
  dane: { firma, pracownicy, config, prowizjaProc }
```

#### Silnik podatkowy (`features/tax-engine/`)

- `obliczWariantStandard(pracownik, stawkaWypadkowa, config)` → pełny koszt pracodawcy według standardowego modelu
- `obliczWariantPodzial(pracownik, stawkaWypadkowa, nettoZasadnicza, config)` → model z podziałem na zasadniczą + świadczenie pozapłacowe  
- `znajdzBruttoDlaNetto(netto, params, config)` → iteracyjny gross-up (odwrócone obliczenie brutto z netto)
- `obliczPit(brutto, params, config)` → zaliczka PIT z pełną obsługą ulg i progów
- `obliczZusPracodawca(brutto, typUmowy, ..., config)` → składki po stronie pracodawcy

**Kluczowa wartość biznesowa:** silnik liczy oszczędność = kosztStandard − kosztPodział − prowizja. To jest rdzeń produktu Stratton.

#### Przepływ kroku w wizerze

```
krok 0: StepFirma         → dane organizacji (NIP/GUS, kontakt, parametry ZUS)
krok 1: StepPracownicy    → ewidencja osobowa (lista + D365 master-detail)
krok 2: StepWynikStandard → analiza kosztów w modelu standardowym
krok 3: StepWynikPodzial  → model docelowy (podział zasadnicza+świadczenie)
krok 4: StepPorownanie    → business case (porównanie wariantów)
krok 5: StepPodsumowanie  → podsumowanie + PDF + Excel
krok 6: StepAnalizaPracownika → symulacja dla jednotnego pracownika
```

#### Usługi wyjściowe

- `offerPdfV3Generator` — oferta PDF wielostronicowa (Puppeteer → HTML→PDF)
- `offerLegalizacjaPremiiGenerator` — dedykowany wariant oferty dla sektora
- `excelGenerator` — eksport szczegółów do xlsx (ExcelJS)
- `generateFullHistoryExcel` — eksport całej historii kalkulacji

#### State management (Context API)

```
AppProvider
├── ConfirmProvider      (dialogi potwierdzające)
├── NotificationProvider (toast'y sukces/error/info)
├── CompanyProvider      (firma + config)
├── EmployeeProvider     (pracownicy[])
├── HistoryProvider      (historia: ZapisanaKalkulacja[])
└── CalculationProvider  (wyniki kalkulacji, prowizjaProc)
```

Historia jest persystowana w `localStorage`. Brak backendu dla danych użytkownika — to punkt krytyczny do zmiany w CRM.

### 1.4 Punkty integracji i API (obecne)

| Punkt | Typ | Opis |
|---|---|---|
| `POST /generate-pdf` | HTTP REST | Express → Puppeteer → zwraca PDF buffer |
| GUS BIR API | HTTP GET (przez proxy lub bezpośrednio) | Pobieranie danych firmy po NIP |
| LocalStorage | Browser API | Trwałość historii kalkulacji |
| ExcelJS CDN | Script load | Generacja xlsx po stronie klienta |

### 1.5 Przypadki użycia w CRM

1. **Lead → Kalkulacja** — handlowiec klika firmę w CRM, otwiera kalkulator z prefill danymi, uruchamia sesję
2. **Oferta → PDF** — wynik kalkulacji staje się dokumentem oferty przypiętym do deala w pipeline
3. **Raportowanie** — oszczędności z kalkulacji → KPI dashboardu (suma oszczędności portfela, średni ROI klienta)
4. **Follow-up** — historia zmian kalkulacji dla klienta (track record negocjacji)
5. **Onboarding** — po podpisaniu umowy: pracownicy → import do modułu kadrowego/podziale świadczeń

---

## FAZA 2 — Architektura CRM

### 2.1 Wizja systemu

```
┌─────────────────────────────────────────────────────────────────────┐
│                        STRATTON PRIME CRM                           │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │   CONTACTS   │  │   PIPELINE   │  │   KALKULATOR (obecny)    │  │
│  │  & ACCOUNTS  │  │   SPRZEDAŻY  │  │   jako mikroserwis       │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────────┘  │
│         │                 │                      │                  │
│  ┌──────▼─────────────────▼──────────────────────▼───────────────┐ │
│  │                   SHARED DATA LAYER                           │ │
│  │   PostgreSQL + Redis (cache) + S3 (dokumenty)                 │ │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  REPORTING   │  │   PROJECTS   │  │   INTEGRATIONS           │  │
│  │  & ANALYTICS │  │   / ORDERS   │  │   (GUS, ZUS, Email)      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Schemat architektury technicznej

```
┌─────────────────────────────────────────────────────────────────────┐
│  KLIENT (przeglądarka)                                              │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │   Next.js 15 App (React 19 + TypeScript)                    │   │
│  │                                                             │   │
│  │   /dashboard      (KPI, aktywności)                        │   │
│  │   /contacts       (firmy, kontakty)                        │   │
│  │   /pipeline       (Kanban deale)                           │   │
│  │   /calculator/*   → embedowany StepWizard (obecny kod)    │   │
│  │   /projects       (zlecenia, wdrożenia)                   │   │
│  │   /reports        (analityka, eksporty)                   │   │
│  │   /settings       (config ZUS/PIT, użytkownicy, role)     │   │
│  └─────────────────────┬───────────────────────────────────────┘   │
└────────────────────────┼────────────────────────────────────────────┘
                         │ HTTPS / WebSocket
┌────────────────────────▼────────────────────────────────────────────┐
│  LOAD BALANCER (nginx / Cloudflare)                                 │
└────────────────────────┬────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────────┐
│  BACKEND (Node.js / Fastify lub NestJS)                             │
│                                                                     │
│  Moduły:                                                            │
│  ├── AuthModule        (JWT + refresh, RBAC)                       │
│  ├── ContactsModule    (firmy, osoby kontaktowe)                   │
│  ├── PipelineModule    (deale, etapy, aktywności)                  │
│  ├── CalculatorModule  (sesje, wyniki, historia)  ← KLUCZOWY       │
│  ├── DocumentsModule   (oferty PDF, excel, S3)                     │
│  ├── ProjectsModule    (wdrożenia, milestone'y)                    │
│  ├── ReportsModule     (agregaty, export)                          │
│  ├── IntegrationsModule(GUS, emailer, webhook'i)                   │
│  └── ConfigModule      (ZUS/PIT rates, prowizje)                   │
│                                                                     │
│  Tax Engine (wydzielony pakiet npm: @stratton/tax-engine)          │
│  → Dokładnie ten sam kod co obecnie w features/tax-engine/          │
└────────┬───────────────────────┬────────────────────────────────────┘
         │                       │
┌────────▼──────────┐   ┌────────▼──────────────────────────────────┐
│  PostgreSQL 16    │   │  Redis 7 (cache sesji, task queue)        │
│  (primary data)   │   └────────────────────────────────────────────┘
└────────┬──────────┘
         │
┌────────▼──────────────────────────────────────────────────────────┐
│  S3-compatible storage (docs, PDF, excel archiwum)                │
└───────────────────────────────────────────────────────────────────┘
```

### 2.3 Stos technologiczny (docelowy)

| Warstwa | Technologia | Uzasadnienie |
|---|---|---|
| **Frontend** | Next.js 15 (App Router) | SSR dla SEO, server components dla dashboardu, routing grupowy |
| **UI** | React 19 + Tailwind CSS | Kontynuacja obecnego stosu — zero przepisywania komponentów |
| **Design System** | Obecne tokeny D365 + shadcn/ui | Gotowe komponenty Table, Dialog, Combobox |
| **State (CRM)** | Zustand + React Query (TanStack) | CRM wymaga cache serwera, optimistic updates |
| **Backend** | NestJS 11 (Node + TypeScript) | Dekoratory modułowe, silna typizacja, DI container |
| **ORM** | Prisma 6 | Type-safe queries, migracje, obsługa PostgreSQL |
| **Baza** | PostgreSQL 16 | JSONB dla elastycznych danych kalkulacji, pełny ACID |
| **Cache/Queue** | Redis 7 + BullMQ | Kolejkowanie generacji PDF (Puppeteer), cache sesji |
| **Auth** | NextAuth.js v5 + JWT + RBAC | OAuth (Google/Microsoft) + email/password |
| **PDF** | Puppeteer na workerze BullMQ | Obecny kod bez zmian, izolowany worker |
| **Excel** | ExcelJS na backendzie | Przeniesione z CDN na node_modules |
| **Storage** | MinIO (self-hosted) lub AWS S3 | Dokumenty ofert |
| **Email** | Resend + React Email | Powiadomienia, wysyłka ofert |
| **Testy** | Vitest + Playwright | Obecne testy silnika + E2E |
| **Deploy** | Docker Compose (dev) / K8s (prod) | — |
| **CI/CD** | GitHub Actions | — |

### 2.4 Schemat bazy danych

```sql
-- UŻYTKOWNICY I ROLE
users (
  id UUID PK,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR,
  avatar_url VARCHAR,
  role ENUM('admin','manager','sales','viewer'),
  created_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ
)

-- ORGANIZACJE (klienci)
accounts (
  id UUID PK,
  nip VARCHAR(10) UNIQUE,
  name VARCHAR NOT NULL,
  address VARCHAR,
  postal_code VARCHAR(6),
  city VARCHAR,
  email VARCHAR,
  phone VARCHAR,
  website VARCHAR,
  wypadkowa_rate DECIMAL(5,2) DEFAULT 1.67,
  segment ENUM('SME','MED','ENT') DEFAULT 'SME',
  status ENUM('lead','prospect','active','churned') DEFAULT 'lead',
  owner_id UUID FK→users,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- OSOBY KONTAKTOWE
contacts (
  id UUID PK,
  account_id UUID FK→accounts,
  first_name VARCHAR,
  last_name VARCHAR,
  email VARCHAR,
  phone VARCHAR,
  role VARCHAR,           -- "HR Manager", "CFO" itp.
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ
)

-- DEALE / PIPELINE
deals (
  id UUID PK,
  account_id UUID FK→accounts,
  contact_id UUID FK→contacts,
  owner_id UUID FK→users,
  title VARCHAR NOT NULL,
  stage ENUM('new','qualified','proposal','negotiation','won','lost'),
  expected_value DECIMAL(15,2),  -- szacunkowa prowizja roczna
  expected_savings DECIMAL(15,2),-- szacunkowa oszczędność klienta
  close_date DATE,
  probability INT DEFAULT 20,    -- %
  lost_reason VARCHAR,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- SESJE KALKULATORA
calculation_sessions (
  id UUID PK,
  deal_id UUID FK→deals NULLABLE,   -- może być standalone
  account_id UUID FK→accounts NULLABLE,
  created_by UUID FK→users,
  name VARCHAR,                      -- "Kalkulacja Q1 2026 - wariant A"
  status ENUM('draft','complete','archived'),
  period VARCHAR(7),                 -- "2026-03"
  commission_pct DECIMAL(5,2),
  config JSONB,                      -- snapshot Config (stawki ZUS/PIT)
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- PRACOWNICY W SESJI
session_employees (
  id UUID PK,
  session_id UUID FK→calculation_sessions,
  first_name VARCHAR,
  last_name VARCHAR,
  birth_date DATE,
  gender CHAR(1),
  contract_type VARCHAR(10),
  zus_mode VARCHAR(30),
  pit2 DECIMAL(7,2),
  ulga_mlodych BOOLEAN DEFAULT false,
  kup_type VARCHAR(20),
  netto_target DECIMAL(10,2),
  netto_zasadnicza DECIMAL(10,2),
  pit_mode VARCHAR(15) DEFAULT 'AUTO',
  skladka_fp BOOLEAN DEFAULT true,
  skladka_fgsp BOOLEAN DEFAULT true,
  position INTEGER            -- kolejność
)

-- WYNIKI KALKULACJI (snapshot po obliczeniu)
calculation_results (
  id UUID PK,
  session_id UUID FK→calculation_sessions UNIQUE,
  calculated_at TIMESTAMPTZ,
  summary JSONB,              -- PodsumowanieWynikow
  details JSONB               -- WynikPracownika[] (pełne dane)
)

-- DOKUMENTY (oferty PDF, excel)
documents (
  id UUID PK,
  session_id UUID FK→calculation_sessions,
  deal_id UUID FK→deals NULLABLE,
  type ENUM('offer_pdf','excel_report','offer_legalizacja'),
  file_name VARCHAR,
  storage_key VARCHAR,        -- S3 path
  file_size_kb INT,
  generated_by UUID FK→users,
  generated_at TIMESTAMPTZ
)

-- AKTYWNOŚCI (log CRM)
activities (
  id UUID PK,
  account_id UUID FK→accounts NULLABLE,
  deal_id UUID FK→deals NULLABLE,
  user_id UUID FK→users,
  type ENUM('note','call','email','meeting','calculation','document','stage_change'),
  title VARCHAR,
  body TEXT,
  occurred_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)

-- PROJEKTY / ZLECENIA (po wygraniu deala)
projects (
  id UUID PK,
  deal_id UUID FK→deals,
  account_id UUID FK→accounts,
  owner_id UUID FK→users,
  name VARCHAR,
  status ENUM('onboarding','active','suspended','completed'),
  start_date DATE,
  monthly_value DECIMAL(10,2),
  employee_count INT,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- KONFIGURACJA STAWEK (wersjonowana)
tax_configs (
  id UUID PK,
  name VARCHAR,               -- "Stawki 2026"
  valid_from DATE,
  config JSONB,               -- Config object
  is_default BOOLEAN DEFAULT false,
  created_by UUID FK→users,
  created_at TIMESTAMPTZ
)

-- INDEKSY
CREATE INDEX idx_deals_account ON deals(account_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_sessions_deal ON calculation_sessions(deal_id);
CREATE INDEX idx_activities_account ON activities(account_id);
CREATE INDEX idx_activities_deal ON activities(deal_id);
CREATE INDEX idx_employees_session ON session_employees(session_id);
```

### 2.5 Interfejs komunikacji: Pulpit ↔ Kalkulator

```typescript
// Kontrakt danych przesyłanych z CRM do kalkulatora
interface CalculatorSessionInit {
  // Skąd przyszliśmy (do powrotu)
  dealId?: string;
  accountId?: string;
  
  // Prefill z CRM (opcjonalny)
  prefillFirma?: Partial<Firma>;
  prefillEmployees?: Pracownik[];
  
  // Kontekst trybu
  mode: 'new' | 'edit' | 'view';
  sessionId?: string;  // dla mode='edit'|'view'
}

// Co kalkulator zwraca do CRM po zakończeniu
interface CalculatorSessionResult {
  sessionId: string;
  status: 'saved' | 'discarded';
  summary?: {
    employeeCount: number;
    annualSavings: number;
    monthlyCommission: number;
  };
}

// Routing (Next.js)
// /calculator/new?dealId=xxx&accountId=yyy
// /calculator/[sessionId]/edit
// /calculator/[sessionId]/view
```

---

## FAZA 3 — Plan Implementacji

### 3.1 Kolejność faz

```
FAZA A (Tygodnie 1–3): Infrastruktura i fundament
FAZA B (Tygodnie 4–6): Migracja kalkulatora na backend
FAZA C (Tygodnie 7–10): Core CRM — kontakty, pipeline
FAZA D (Tygodnie 11–13): Integracja CRM ↔ Kalkulator
FAZA E (Tygodnie 14–16): Raportowanie, projekty, e-mail
FAZA F (Tygodnie 17–18): Testy, optymalizacja, UAT, deploy
```

---

### FAZA A — Infrastruktura (T1–T3)

#### A1. Wydzielenie silnika podatkowego jako pakietu

```bash
packages/
  tax-engine/
    src/
      logic/    ← kopia features/tax-engine/logic/
      index.ts
      constants.ts
    package.json  # name: "@stratton/tax-engine"
    tsconfig.json
```

Silnik musi być **identyczny** z obecnym — żadna logika się nie zmienia, tylko zmienia się miejsce zamieszkania. To gwarantuje że obliczenia w CRM = obliczenia w starej aplikacji.

```bash
# weryfikacja ciągłości
cd packages/tax-engine
npm test  # testy z features/tax-engine/tests przeniesione tu
```

#### A2. Inicjalizacja monorepo

```bash
stratton-crm/
  apps/
    web/          ← Next.js 15 (migracja obecnej aplikacji)
    api/          ← NestJS
  packages/
    tax-engine/   ← wydzielony (A1)
    ui/           ← obecne shared/ui/* i common/Icons.tsx
    types/        ← obecne entities/* (Pracownik, Firma, Config, itp.)
  docker-compose.yml
  turbo.json      ← Turborepo do budowania
```

```bash
pnpm dlx create-turbo@latest stratton-crm
# lub ręcznie z pnpm workspaces
```

#### A3. Baza danych i migracje

```bash
cd apps/api
pnpm add prisma @prisma/client
npx prisma init

# Zdefiniuj schema.prisma według schematu z sekcji 2.4
npx prisma migrate dev --name init
npx prisma generate
```

#### A4. Docker Compose (dev)

```yaml
# docker-compose.yml
version: '3.9'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: stratton_crm
      POSTGRES_USER: stratton
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports: ["5433:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]
  
  redis:
    image: redis:7-alpine
    ports: ["6380:6379"]
  
  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD}
    ports: ["9000:9000", "9001:9001"]
    volumes: ["miniodata:/data"]

volumes:
  pgdata:
  miniodata:
```

#### A5. Autentykacja (NestJS)

```typescript
// apps/api/src/auth/auth.module.ts
// JWT access token (15min) + refresh token (7 dni, HttpOnly cookie)
// Role: ADMIN | MANAGER | SALES | VIEWER
// Guards: @Roles('ADMIN') nad kontrolerami

@Module({
  imports: [
    JwtModule.registerAsync({ useFactory: (cfg) => ({
      secret: cfg.get('JWT_SECRET'),
      signOptions: { expiresIn: '15m' }
    }), inject: [ConfigService] }),
  ],
})
export class AuthModule {}
```

---

### FAZA B — Migracja kalkulatora (T4–T6)

#### B1. Backend — CalculatorModule

```typescript
// Endpointy REST
POST   /api/sessions                    → utwórz sesję
GET    /api/sessions/:id                → pobierz sesję
PUT    /api/sessions/:id                → aktualizuj (firma, config)
PATCH  /api/sessions/:id/employees      → zapisz listę pracowników
POST   /api/sessions/:id/calculate      → uruchom silnik, zapisz wyniki
GET    /api/sessions/:id/results        → pobierz wyniki
POST   /api/sessions/:id/documents      → zlecenie PDF/Excel (BullMQ)
GET    /api/sessions/:id/documents      → lista dokumentów dla sesji

// Logika
class CalculationService {
  async calculate(sessionId: string): Promise<CalculationResult> {
    const session = await this.prisma.calculationSession.findUniqueOrThrow({...});
    const employees = await this.prisma.sessionEmployee.findMany({...});
    
    // Deserializuj Config z JSONB
    const config: Config = session.config as Config;
    
    // Uruchom @stratton/tax-engine (ten sam kod!)
    const details = employees.map(emp => ({
      pracownik: mapEmployeeToModel(emp),
      standard: obliczWariantStandard(emp, session.account.wypadkowa_rate, config),
      podzial: obliczWariantPodzial(emp, ...),
      oszczednosc: ...
    }));
    
    const summary = aggregateSummary(details, session.commission_pct);
    
    // Zapisz snapshot
    await this.prisma.calculationResult.upsert({ where: { sessionId }, data: { summary, details } });
    
    return { summary, details };
  }
}
```

#### B2. PDF Worker (BullMQ)

```typescript
// Przeniesiony Puppeteer do BullMQ workera
@Processor('pdf-generation')
class PdfWorker {
  @Process()
  async generatePdf(job: Job<{ sessionId: string; type: string }>) {
    const session = await this.calculationService.getFullSession(job.data.sessionId);
    const html = offerPdfV3Generator.generateOfferHTML(session); // bez zmian!
    const pdf = await this.puppeteerService.renderPdf(html);
    const key = await this.storageService.upload(pdf, `offers/${job.data.sessionId}.pdf`);
    await this.prisma.document.create({ data: { sessionId: ..., storageKey: key, ... } });
    return { key };
  }
}
```

#### B3. Frontend — migracja komponentów React

```
Obecny kod w apps/web/features/steps/* → przeniesiony 1:1
Obecne komponenty shared/ui/* → do packages/ui

Zmiany minimalne:
1. Usunąć LocalStorage z HistoryContext → zastąpić react-query + API calls
2. Context CompanyProvider/EmployeeProvider → stan lokalny sesji (zachowany)
3. Dodać URL params: /calculator/new?dealId=xxx
4. Dodać "Powrót do deala" button w StepPodsumowanie
```

Komponenty kroku NIE wymagają przepisania. To jest kluczowa zasada migracji.

---

### FAZA C — Core CRM (T7–T10)

#### C1. Moduł Kontaktów i Firm

```typescript
// accounts.controller.ts
GET    /api/accounts              → lista z paginacją + filtry
POST   /api/accounts              → utwórz (NIP lookup GUS auto)
GET    /api/accounts/:id          → szczegóły
PUT    /api/accounts/:id          → edytuj
GET    /api/accounts/:id/contacts → lista kontaktów firmy
GET    /api/accounts/:id/deals    → lista dealów
GET    /api/accounts/:id/sessions → historia kalkulacji
GET    /api/accounts/:id/timeline → aktywności chronologicznie
```

**GUS Integration Service:**
```typescript
// gus.service.ts - wrapper obecnego fetch'a GUS w StepFirma
class GusService {
  async lookupByNip(nip: string): Promise<Partial<Firma>> {
    // Przeniesiona logika z StepFirma.tsx (fetch do GUS BIR API)
    // Teraz przez backend (unika CORS, ukryty klucz API)
  }
}
```

#### C2. Pipeline Sprzedażowy (Kanban)

```
Etapy (konfigurowalne):
  new → qualified → proposal → negotiation → won → lost

Deal Entity:
  - Powiązany z Account + Contact
  - Kalkulacja (calculation_session) jako załącznik
  - Expected savings (z wyników kalkulatora!)
  - Automatyczna aktualizacja stage po wygenerowaniu oferty PDF
```

Widok frontendowy: **Kanban board** z drag-and-drop (biblioteka `@dnd-kit/core`).

#### C3. Dashboard KPI

```typescript
// reports.service.ts — zapytania agregujące PostgreSQL
interface DashboardMetrics {
  pipeline: {
    totalDeals: number;
    totalValue: number;          // suma expected_savings
    byStage: Record<Stage, number>;
  };
  savings: {
    totalAnnualSavings: number;  // z wygranych dealów w bieżącym roku
    avgSavingsPerClient: number;
    topClientsThisMonth: TopClient[];
  };
  activity: {
    calculationsToday: number;
    documentsGeneratedThisWeek: number;
    newAccountsThisMonth: number;
  };
  conversion: {
    leadToProposal: number;      // %
    proposalToWon: number;       // %
  };
}

// SQL przykład (Prisma raw)
SELECT 
  stage,
  COUNT(*) as count,
  SUM(expected_savings) as total_savings
FROM deals
WHERE owner_id = ? AND created_at > NOW() - INTERVAL '90 days'
GROUP BY stage
```

---

### FAZA D — Integracja CRM ↔ Kalkulator (T11–T13)

#### D1. Widok firmy z zakładką Kalkulacje

```
AccountDetailPage
├── Tab: Informacje       (dane firmy, kontakty)
├── Tab: Pipeline         (deale dla tej firmy)
├── Tab: Kalkulacje       (lista sesji kalkulatora z wynikami)
│    ├── [Nowa kalkulacja] → /calculator/new?accountId=xxx
│    ├── [Edytuj] → /calculator/[sessionId]/edit
│    └── [Pobierz PDF] → /api/sessions/:id/documents/:docId/download
└── Tab: Historia         (timeline aktywności)
```

#### D2. Prefill danych przy starcie kalkulatora

```typescript
// apps/web/app/calculator/new/page.tsx
export default async function NewCalculatorPage({
  searchParams
}: { searchParams: { accountId?: string; dealId?: string } }) {
  
  // Server-side prefetch (Next.js server component)
  let prefillData = null;
  if (searchParams.accountId) {
    prefillData = await api.accounts.getById(searchParams.accountId);
  }
  
  return (
    <CalculatorApp
      initialFirma={prefillData ? mapAccountToFirma(prefillData) : undefined}
      dealId={searchParams.dealId}
      onComplete={(result) => {
        // Po zapisaniu → wróć do deala i zaktualizuj expected_savings
        router.push(`/pipeline/deals/${result.dealId}`);
      }}
    />
  );
}
```

#### D3. Automatyczna aktualizacja deala po kalkulacji

```typescript
// Po POST /api/sessions/:id/calculate
// Jeśli sesja ma deal_id → aktualizuj deal.expected_savings
async function updateDealAfterCalculation(dealId: string, summary: PodsumowanieWynikow) {
  await prisma.deal.update({
    where: { id: dealId },
    data: {
      expectedSavings: summary.oszczednoscRoczna,
      expectedValue: summary.prowizja * 12,
    }
  });
  
  // Utwórz aktywność w timeline
  await prisma.activity.create({
    data: {
      dealId,
      type: 'calculation',
      title: `Kalkulacja zaktualizowana — oszczędność ${formatPLN(summary.oszczednoscRoczna)}/rok`,
      occurredAt: new Date(),
    }
  });
}
```

---

### FAZA E — Raportowanie i Projekty (T14–T16)

#### E1. Moduł Raportowania

```
Raporty dostępne:
│
├── Pipeline Report
│    ├── Funnel konwersji (SVG chart — Recharts)
│    ├── Prognoza przychodów (weighted pipeline × probability)
│    └── Ranking handlowców (deals won + savings)
│
├── Savings Report
│    ├── Łączne oszczędności portfela klientów
│    ├── Trend miesięczny (line chart)
│    └── Top 10 klientów wg oszczędności
│
├── Activity Report
│    ├── Aktywności per handlowiec
│    └── Lead time (lead→won dni)
│
└── Export do Excel (istniejący useExcelExport hook)
```

#### E2. Moduł Projektów / Wdrożeń

```
Po wygraniu deala (stage = 'won'):
  → Automatyczne utworzenie projektu z danymi z deala
  
Projekt zawiera:
  - Harmonogram wdrożenia (milestone'y z datami)
  - Miesięczna wartość kontraktu
  - Status: onboarding → active → suspended → completed
  - Powiązane kalkulacje (archiwum)
  - Dokumenty (aktywna umowa)
```

#### E3. Email Notifications (Resend)

```typescript
// Wyzwalacze:
// 1. Deal przeszedł do 'proposal' → email do managera
// 2. Dokument PDF gotowy → email do handlowca + opcja "Wyślij do klienta"
// 3. Deal stuck >14 dni w jednym etapie → reminder email
// 4. Nowy lead przypisany → email do handlowca

// Template (React Email):
const OfferReadyEmail = ({ clientName, downloadUrl, savings }) => (
  <Html>
    <Text>Oferta dla {clientName} jest gotowa.</Text>
    <Text>Szacunkowa oszczędność: {savings} zł/rok</Text>
    <Button href={downloadUrl}>Pobierz PDF</Button>
  </Html>
);
```

---

### FAZA F — Testy i Wdrożenie (T17–T18)

#### F1. Strategia testowania

```
UNIT TESTS (Vitest):
  packages/tax-engine/**   → 100% pokrycia (krytyczna logika)
  api/src/calculation/**   → testy jednostkowe CalculationService

INTEGRATION TESTS (Vitest + testcontainers):
  Prawdziwa baza PostgreSQL w Docker
  Pełny flow: createSession → addEmployees → calculate → getResults

E2E TESTS (Playwright):
  Scenariusze:
    1. Logowanie → nowa kalkulacja → generacja PDF → pobranie
    2. Lead → pipeline → kalkulacja → won
    3. Import Excel → kalkulacja → eksport Excel

PERFORMANCE:
  Obliczenia 500 pracowników: target < 200ms (synchro, in-memory)
  Generacja PDF: target < 8s (Puppeteer async worker)
  Dashboard cold load: target < 1s (Next.js ISR)
```

#### F2. Wymagania wydajnościowe

| Metryka | Target | Uwagi |
|---|---|---|
| Kalkulacja (100 pracowników) | < 50ms | CPU bound, synchronicznie |
| Kalkulacja (500 pracowników) | < 200ms | Ewentualnie worker thread |
| Generacja PDF | < 8s | BullMQ async, user dostaje status |
| API P95 latency | < 100ms | Typowe CRUD |
| Dashboard load | < 1s | ISR Next.js + Redis cache |
| Concurrent users | 50 | Jednofirmowy deployment |
| DB connections | Pool 20 max | Prisma connection pooling |

#### F3. Wymagania bezpieczeństwa (OWASP Top 10)

| Zagrożenie | Mitygacja |
|---|---|
| Broken Access Control | RBAC na każdym endpoincie, row-level security (accountId check) |
| Cryptographic Failures | HTTPS wszędzie, bcrypt dla haseł, JWT z krótkim TTL |
| Injection | Prisma ORM (parameterized queries), Zod validation na wejściu |
| Insecure Design | Separation of concerns, CalculationSession izolowane per user |
| Security Misconfiguration | Helmet.js, strict CSP, no default credentials |
| Vulnerable Components | Dependabot, `npm audit` w CI |
| Auth Failures | Rate limiting (Fastify throttle), account lockout po 5 próbach |
| Software Integrity | Package lock, SBOM, podpisywane commity |
| Logging Failures | Structured logging (Pino), audit log dla operacji finansowych |
| SSRF | Whitelist na GUS Integration (tylko gov.pl domeny) |

#### F4. Środowisko produkcyjne

```yaml
# Kubernetes (opcja prod — lub Docker Compose na VPS)

Namespace: stratton-crm
│
├── Deployment: web (Next.js)     replicas: 2, 512MB RAM
├── Deployment: api (NestJS)      replicas: 2, 512MB RAM  
├── Deployment: pdf-worker        replicas: 1, 1GB RAM (Puppeteer!)
│
├── StatefulSet: postgres         1 replica, 10GB PVC
├── StatefulSet: redis             1 replica, 2GB PVC
├── StatefulSet: minio             1 replica, 50GB PVC
│
├── Ingress: nginx                 TLS termination, Let's Encrypt
└── HPA: api, web                  auto-scale CPU > 70%
```

---

## Wireframe — Główne widoki

### Dashboard

```
┌─ STRATTON PRIME CRM ──────────────────────────────────────────────┐
│ [≡] Stratton Prime              [🔔] [CEM ▾]                      │
├────────┬──────────────────────────────────────────────────────────┤
│        │  Dzień dobry, CEM                     Q1 2026            │
│  Pulpit│                                                           │
│  ──────│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │
│  Firmy │  │  12 Dealów   │ │ 2.4M zł/rok  │ │  8 Kalkulacji    │ │
│  Deale │  │  w pipeline  │ │  oszczędności│ │  w tym tygodniu  │ │
│  Kalk. │  │  aktywnych   │ │  portfela    │ │                  │ │
│  Raporty  └──────────────┘ └──────────────┘ └──────────────────┘ │
│  Projekt  ┌─────────────────────────────┐ ┌──────────────────────┐│
│  Ustawien.│  PIPELINE                   │ │ OSTATNIE AKTYWNOŚCI  ││
│        │  │  New(3) Qual(4) Prop(3)...  │ │ ● ABC Sp.z o.o.      ││
│        │  │  [miniaturka Kanban]        │ │   Kalkulacja — 2h    ││
│        │  │  > Szczegóły               │ │ ● XYZ SA             ││
│        │  └─────────────────────────────┘ │   PDF wygenerowany   ││
│        │  ┌─────────────────────────────┐ └──────────────────────┘│
│        │  │  TOP KLIENCI (oszczędności) │                         │
│        │  │  1. ABC Sp.z o.o.  128k/rok │                         │
│        │  │  2. XYZ SA          96k/rok │                         │
│        │  └─────────────────────────────┘                         │
└────────┴──────────────────────────────────────────────────────────┘
```

### Widok Firmy z Kalkulacjami

```
┌─ ABC Sp. z o.o. ──────────────────────────────────────────────────┐
│  [←] Firmy  /  ABC Sp. z o.o.                  [Nowa kalkulacja +] │
├───────────────────────────────────────────────────────────────────┤
│  [Informacje] [Pipeline(3)] [Kalkulacje(5)] [Historia]            │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Sesja kalkulatora             Status    Oszczędność   Data       │
│  ─────────────────────────────────────────────────────────────    │
│  Kalkulacja Q1 2026 - 45 os.  ● Gotowa  128,400 zł/r  03.2026   │
│  [Podgląd] [Edytuj] [PDF ↓] [Excel ↓]                            │
│                                                                   │
│  Kalkulacja Q4 2025 - 40 os.  ● Gotowa   98,200 zł/r  11.2025   │
│  [Podgląd] [Edytuj] [PDF ↓] [Excel ↓]                            │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Kalkulator (osadzony w CRM)

```
┌─ ABC Sp. z o.o. → Nowa Kalkulacja ────────────────────────────────┐
│  [←] Wróć do firmy                                                │
│                                                                   │
│  [1. Organizacja] [2. Pracownicy] [3. Analiza] ... [6. Podsumow.] │
│  ─────────────────────────────────────────────────────────────── │
│                                                                   │
│  (obecny StepFirma / StepPracownicy / ... bez zmian)              │
│                                                                   │
│  [Anuluj i wróć]                        [Zapisz i wróć do deala] │
└───────────────────────────────────────────────────────────────────┘
```

---

## Harmonogram wdrożenia

| Tydzień | Faza | Deliverables |
|---|---|---|
| T1 | A | Monorepo, Docker Compose, PostgreSQL schema |
| T2 | A | NestJS skeleton, Auth (JWT + RBAC), Prisma setup |
| T3 | A | @stratton/tax-engine jako pakiet, testy przeniesione |
| T4 | B | CalculatorModule (CRUD sesji + pracowników) |
| T5 | B | CalculationService (tax-engine na backendzie) |
| T6 | B | PDF Worker (BullMQ + Puppeteer), S3 storage |
| T7 | C | AccountsModule + ContactsModule API |
| T8 | C | Widoki React: lista firm, szczegóły firmy |
| T9 | C | PipelineModule API + Kanban frontend |
| T10| C | Dashboard API + widgety KPI |
| T11| D | Integracja Account ↔ Calculator (prefill, linki) |
| T12| D | Auto-update deal po kalkulacji, aktywności timeline |
| T13| D | GUS Service przez backend, konfiguracja stawek |
| T14| E | ReportsModule (pipeline, savings, activity) |
| T15| E | ProjectsModule (po won) |
| T16| E | Email notifications (Resend) |
| T17| F | Testy integracyjne, E2E (Playwright) |
| T18| F | UAT, performance tuning, deploy na prod |

**Łącznie: 18 tygodni** ≈ 4,5 miesiąca dla 2-osobowego zespołu.

---

## Plan skalowania

### Faza 1 (do 50 użytkowników, 1 firma)
→ Docker Compose na VPS (8 vCPU, 16GB RAM) — proste Operations

### Faza 2 (do 500 użytkowników, multitenant)
```sql
-- Dodaj tenant_id do każdej tabeli
ALTER TABLE accounts ADD COLUMN tenant_id UUID NOT NULL;
ALTER TABLE users ADD COLUMN tenant_id UUID NOT NULL;
-- Row-level security w PostgreSQL
CREATE POLICY tenant_isolation ON accounts USING (tenant_id = current_setting('app.tenant_id')::uuid);
```
→ Migracja na Kubernetes, connection pooling (PgBouncer)

### Faza 3 (> 1000 użytkowników)
- Read replicas PostgreSQL
- Redis Cluster
- CDN dla statycznych assetów
- Oddzielne klastry PDF workers (resource intensive)

---

## Podsumowanie dla zespołu

**Co NIE ulega zmianie:**
- Cała logika silnika podatkowego (`features/tax-engine/*`) — przeniesiona 1:1
- Wszystkie komponenty React kroków wizerdu — przeniesione 1:1  
- Generatory PDF/Excel — przeniesione na worker backend

**Co jest nowe:**
- PostgreSQL zamiast LocalStorage
- REST API (NestJS) jako warstwa danych
- Moduły CRM: Firmy, Kontakty, Pipeline, Projekty, Raporty
- Autentykacja i RBAC
- Async PDF generation (BullMQ)
- Email notifications

**Kluczowa zasada migracji:** Kalkulator to mikro-aplikacja osadzona w CRM. Jego kod nie jest przepisywany — tylko opakowany w nowe routy i podłączony do backendu zamiast LocalStorage. Dzięki temu ryzyko regresji w logice obliczeń jest zerowe.
