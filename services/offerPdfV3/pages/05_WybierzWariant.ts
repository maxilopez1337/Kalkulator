import { Firma } from '../../../entities/company/model';
import { generatePageHeaderV3, generateFooterV3 } from '../components';

export const generatePage07V3 = (firma: Firma, totals: any, date: string, sector: string) => `
<div class="page">

  ${generatePageHeaderV3('Wybierz Wariant dla Swojej Firmy', '05. Wybierz wariant', 5, 11, date)}
<div class="page-body" style="padding-top:18px;padding-bottom:40px">
    <p class="lead" style="margin-bottom:8px">Dwa warianty — jeden cel: <strong>maksymalne oszczędności przy zerowym ryzyku prawnym</strong>. Rekomendujemy <strong>Eliton Prime™ PLUS</strong> — oto konkretne rezultaty, które osiągasz.</p>

    <table class="vt">
      <thead>
        <tr>
          <th></th>
          <th>Eliton Prime™ PLUS<br><span style="font-size:8.5px;font-weight:400;opacity:.85;letter-spacing:.03em">★ Rekomendowany</span></th>
          <th>Eliton Prime™</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Opłata serwisowa EBS</td><td class="hl"><strong>${totals.prowizjaProc}%*</strong> wartości świadczeń</td><td>28–31%* wartości świadczeń</td></tr>
        <tr><td>Pierwsze oszczędności<span class="sub">Kiedy firma zaczyna realnie zarabiać na modelu</span></td><td class="hl"><strong>już od 1. miesiąca</strong> (wdrożenie priorytetowe, do 14 dni)</td><td>po 4–6 tygodniach</td></tr>
        <tr><td>Oferta ważna od daty kalkulacji</td><td class="hl"><strong style="color:#DC2626">14 dni</strong></td><td>bezterminowo</td></tr>
        <tr><td>Pewność liczb przed decyzją<span class="sub">Indywidualna kalkulacja z Twojej listy płac — przed podpisaniem</span></td><td class="hl yes">✓ przed podpisaniem</td><td class="yes">✓ przed podpisaniem</td></tr>
        <tr><td>Dokumenty gotowe na audyt ZUS od dnia 1<span class="sub">Uchwała Zarządu + pełna teczka kontrolna</span></td><td class="hl yes">✓ w pakiecie</td><td class="yes">✓ w pakiecie</td></tr>
        <tr><td>Dział kadr operacyjnie gotowy w 1 dzień<span class="sub">Szkolenie kadr i księgowości — zero przestojów wdrożeniowych</span></td><td class="hl yes">✓ wliczone</td><td class="yes">✓ wliczone</td></tr>
        <tr><td>Kontrola ZUS bez angażowania Zarządu<span class="sub">Pełna reprezentacja przez Stratton Prime przy ZUS, PIP i KAS</span></td><td class="hl yes">✓ pełna ochrona</td><td class="yes">✓ pełna ochrona</td></tr>
        <tr><td>Wynagrodzenie za prowadzenie programu EBS<span class="sub">Bonus 2% dla kadr/księg. motywujący do obsługi EBS — płaci SP</span></td><td class="hl yes">✓ finansowany przez SP</td><td class="no">—</td></tr>
        <tr><td>Pracownicy dostają podwyżkę — 0 zł kosztu firmy<span class="sub">+4% świadczeń rzeczowych EBS finansowane przez Stratton Prime</span></td><td class="hl yes">✓ do +4% gratis</td><td class="no">—</td></tr>
        <tr><td>Zarząd chroniony do 30 mln zł<span class="sub">Polisa D&amp;O Leadenhall — odpowiedzialność os. członków zarządu</span></td><td class="hl yes">✓ do 30 mln zł</td><td class="no">—</td></tr>
      </tbody>
    </table>

    <div class="box-navy" style="padding:8px 14px;margin-bottom:5px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div>
          <div style="font-size:8.5px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:var(--sp-gold-light);margin-bottom:5px">W wariancie PLUS — Polisa D&amp;O Leadenhall LW020/D&amp;O/01</div>
          <p style="font-size:11px;color:rgba(255,255,255,.62);line-height:1.5;margin-bottom:6px">Chroni: członków zarządu, rady nadzorczej, prokurentów, głównych księgowych oraz ich małżonków i spadkobierców. Klauzule A+B obligatoryjne (A = odpowiedzialność osobista Zarządu, B = refundacja przez spółkę).</p>
          <p style="font-size:10px;color:rgba(255,255,255,.42)">Ochrona retroaktywna · Trigger claims made<br>3 lata (obecni D&amp;O) / 10 lat (byli D&amp;O)</p>
        </div>
        <div style="border-left:1px solid rgba(255,255,255,.07);padding-left:18px">
          <div style="font-size:8.5px;color:rgba(255,255,255,.3);margin-bottom:5px">Suma gwarancyjna</div>
          <div style="font-family:var(--font-serif);font-size:21px;color:var(--sp-gold-light);line-height:1;margin-bottom:3px">500 tys.–30 mln zł</div>
          <div style="font-size:10px;color:rgba(255,255,255,.35)">W pakiecie · bez dopłat<br>Dopasowywana do skali ryzyka</div>
        </div>
      </div>
    </div>

    <div class="box-gold" style="padding:6px 12px;margin-bottom:5px">
      <div style="font-size:8.5px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:var(--sp-gold);margin-bottom:4px">Odpłatnie — Indywidualna Opinia Prawna Kancelarii Żuk Pośpiech</div>
      <p style="font-size:11px;color:var(--sp-text-muted);line-height:1.5">Klienci Eliton Prime™ mogą nabyć certyfikowaną opinię Kancelarii Radców Prawnych i Doradców Podatkowych <strong>Żuk Pośpiech Sp. k.</strong> (Katowice) — obejmującą pełną analizę skutków wdrożenia dla Twojej Spółki: ZUS (§2 ust. 1 pkt 26), PIT, KUP CIT (art. 15 ust. 1 uCIT). <span style="font-size:10px;color:var(--sp-text-muted)">Zamówienia: biuro@stratton-prime.pl</span></p>
    </div>
    <p class="disc">* Opłata serwisowa EBS naliczana od wartości nominalnej świadczeń — nie od wartości składek ZUS. Wariant PLUS dostępny przy podjęciu decyzji w ciągu 14 dni od daty kalkulacji (do ${totals.offerDeadline}).</p>
  </div>
  

${generateFooterV3()}
</div>

<!-- ══════════════════ STR 6 — HARMONOGRAM ══════════════════ -->
`;
