import { Firma } from '../../../entities/company/model';
import { generatePageHeaderV3, generateFooterV3 } from '../components';

export const generateIlekosztujeCikadymiesiczwokiV3 = (firma: Firma, totals: any, date: string, sector: string) => `
<div class="page">

  ${generatePageHeaderV3('Twoja Droga do Pierwszych Oszczędności', '10. Twoja droga', 10, 11, date)}
<div class="page-body" style="padding-top:20px">

    <p class="lead" style="border-left:3px solid var(--sp-gold);padding-left:14px;color:var(--sp-navy);margin-bottom:16px">Poniżej widać pełny proces od pierwszego kontaktu do wygenerowania pierwszych oszczędności.<br><strong>Jesteś teraz na etapie Decyzji</strong> — wszystkie poprzednie kroki zostały wykonane. Dalsze działanie zależy wyłącznie od Ciebie.</p>

    <!-- PROCESS AXIS -->
    <div style="margin-bottom:14px;overflow:hidden;border:1px solid rgba(0,0,0,.09)">
      <div style="background:var(--sp-navy);padding:10px 18px;display:flex;align-items:center;justify-content:space-between">
        <div style="font-size:8px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--sp-gold)">Etapy wdrożenia</div>
        <div style="display:flex;align-items:center;gap:5px">
          <span style="width:9px;height:9px;border-radius:50%;background:var(--success);display:inline-block"></span>
          <span style="width:9px;height:9px;border-radius:50%;background:var(--success);display:inline-block"></span>
          <span style="width:10px;height:10px;border-radius:50%;background:var(--sp-gold);display:inline-block;box-shadow:0 0 0 3px rgba(198,161,91,.3)"></span>
          <span style="width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.18);display:inline-block"></span>
          <span style="width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.18);display:inline-block"></span>
          <span style="width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.18);display:inline-block"></span>
          <span style="width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.18);display:inline-block"></span>
          <span style="font-size:8px;color:rgba(255,255,255,.45);margin-left:6px">krok 3 z 7</span>
        </div>
      </div>
      <div style="background:var(--sp-gray);padding:0 16px 14px">
      <div style="padding-top:38px">
        <div class="proc-axis">

        <div class="proc-step">
          <div class="proc-circle done">✓</div>
          <div class="proc-label done">Analiza<br>potrzeb</div>
          <div class="proc-sub">Zidentyfikowaliśmy<br>potencjał</div>
        </div>

        <div class="proc-step">
          <div class="proc-circle done">✓</div>
          <div class="proc-label done">Kalkulacja<br>indywidualna</div>
          <div class="proc-sub">Na podstawie<br>Twojej listy płac</div>
        </div>

        <div class="proc-step" style="position:relative">
          <div class="proc-badge-now">Jesteś tutaj</div>
          <div class="proc-circle active">→</div>
          <div class="proc-label active">Decyzja</div>
          <div class="proc-sub" style="color:var(--sp-gold);font-weight:600">Ważna do<br>${totals.offerDeadline}</div>
        </div>

        <div class="proc-step">
          <div class="proc-circle future" style="background:var(--sp-gray)">4</div>
          <div class="proc-label future">Podpisanie<br>umowy</div>
          <div class="proc-sub">Autenti<br>e-podpis</div>
        </div>

        <div class="proc-step">
          <div class="proc-circle future" style="background:var(--sp-gray)">5</div>
          <div class="proc-label future">Wdrożenie<br>dokumentacji</div>
          <div class="proc-sub">Uchwała,<br>aneksy</div>
        </div>

        <div class="proc-step">
          <div class="proc-circle future" style="background:var(--sp-gray)">6</div>
          <div class="proc-label future">Start<br>EBS</div>
          <div class="proc-sub">Pierwsze<br>Vouchery EBS</div>
        </div>

        <div class="proc-step">
          <div class="proc-circle future" style="border-color:var(--success);color:var(--success);background:var(--sp-gray)">zł</div>
          <div class="proc-label future" style="color:var(--success)">Pierwsze<br>oszczędności</div>
          <div class="proc-sub" style="color:var(--success)">${new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN'}).format(totals.savingsPlus)}<br>miesięcznie</div>
        </div>

        </div>
      </div>
      </div>
    </div>

    <div style="background:var(--sp-navy);border-left:4px solid var(--success);padding:12px 20px;margin-bottom:16px;display:flex;align-items:center;gap:16px">
      <div style="background:var(--success);border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <span style="font-size:15px;color:var(--white);font-weight:700">✓</span>
      </div>
      <div>
        <div style="font-size:8.5px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--success);margin-bottom:3px">Kroki 1–2 z 7 zakończone</div>
        <div style="font-size:11.5px;color:rgba(255,255,255,.78);line-height:1.5">Analiza potrzeb i kalkulacja indywidualna są gotowe. Następny krok to Twoja decyzja — potem wszystko realizujemy my.</div>
      </div>
    </div>

    <h3 class="sh">Ile kosztuje Cię każdy miesiąc zwłoki?</h3>
    <p style="font-size:13px;color:var(--sp-text-muted);margin-bottom:16px">Każdy miesiąc bez wdrożenia to potencjalna oszczędność, która pozostaje niezrealizowana — środki trafiają do systemu danin publicznych w wyższej niż możliwa wysokości.</p>

    <div class="cod">
      <div class="cod-cell" style="border-top:3px solid rgba(220,38,38,.35)">
        <div class="cod-period">1 miesiąc zwłoki</div>
        <div class="cod-amount">−${new Intl.NumberFormat('pl-PL',{minimumFractionDigits:2,maximumFractionDigits:2}).format(totals.savingsPlus)} zł</div>
        <div class="cod-label">strata netto</div>
      </div>
      <div class="cod-cell" style="border-top:3px solid rgba(220,38,38,.55)">
        <div class="cod-period">3 miesiące zwłoki</div>
        <div class="cod-amount">−${new Intl.NumberFormat('pl-PL',{minimumFractionDigits:2,maximumFractionDigits:2}).format(totals.savingsPlus * 3)} zł</div>
        <div class="cod-label">strata netto</div>
      </div>
      <div class="cod-cell" style="border-top:3px solid rgba(220,38,38,.75)">
        <div class="cod-period">6 miesięcy zwłoki</div>
        <div class="cod-amount">−${new Intl.NumberFormat('pl-PL',{minimumFractionDigits:2,maximumFractionDigits:2}).format(totals.savingsPlus * 6)} zł</div>
        <div class="cod-label">strata netto</div>
      </div>
      <div class="cod-cell" style="border-top:3px solid #DC2626">
        <div class="cod-period">12 miesięcy zwłoki</div>
        <div class="cod-amount" style="font-size:26px">−${new Intl.NumberFormat('pl-PL',{minimumFractionDigits:2,maximumFractionDigits:2}).format(totals.savingsPlus * 12)} zł</div>
        <div class="cod-label" style="color:#f87171;font-weight:600">maksymalna strata</div>
      </div>
    </div>

    <div style="border:1px solid #DC2626;display:grid;grid-template-columns:auto 1fr;overflow:hidden;margin-bottom:10px">
      <div style="background:#DC2626;padding:14px 18px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-width:80px;text-align:center">
        <div style="font-size:8px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.75)">Ważność</div>
        <div style="font-size:16px;font-weight:700;color:var(--white);line-height:1.2;white-space:nowrap">${totals.offerDeadline}</div>
      </div>
      <div style="padding:12px 16px;background:#fff0f0">
        <div style="font-size:9.5px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#DC2626;margin-bottom:5px">Ważne — termin oferty Wariantu PLUS</div>
        <p style="font-size:12px;color:var(--sp-text);line-height:1.6;margin:0">Wariant <strong>PLUS</strong> (niższy koszt obsługi, D&amp;O Leadenhall w pakiecie, wdrożenie w 14 dni) jest dostępny przez <strong>14 dni od daty tej kalkulacji</strong>. Po tym terminie obowiązuje wyłącznie wariant STANDARD.</p>
      </div>
    </div>


  </div>
  

${generateFooterV3()}
</div>

<!-- ══════════════════ STR 10 — SKĄD RÓŻNICA: ROZKŁAD OSZCZĘDNOŚCI ══════════════════ -->
`;
