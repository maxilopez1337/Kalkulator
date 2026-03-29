/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { Firma } from '../../../entities/company/model';
import { generatePageHeaderV3, generateFooterV3 } from '../components';

export const generatePage05V3 = (
  firma: Firma,
  totals: any,
  date: string,
  sector: string
): string => {
  const fmt = (v: number) =>
    new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
      v
    );
  const fmtK = (v: number) =>
    new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(Math.round(v));
  const bruttoNew = totals.sumaZasadnicza + totals.totalBenefit;
  const zusPracDelta = totals.sumaZusPracownika - totals.sumaZusPracownikaEliton;
  const nettoPercent =
    totals.sumaNetto > 0 ? Math.round((totals.sumaRaise / totals.sumaNetto) * 100) : 0;
  const roiMult = fmt((totals.savingsPlus + totals.commission) / totals.commission);
  const roiPct = Math.round((totals.savingsPlus / totals.commission) * 100);
  return `
<div class="page">

  ${generatePageHeaderV3('Twarde Dane Finansowe', '06. Twarde dane finansowe', 6, 11, date)}
<div class="page-body" style="padding-top:6px;padding-bottom:62px;overflow:hidden;display:flex;flex-direction:column">
    <!-- CEO summary — trzy liczby ponad tabelą -->
    <div style="background:var(--sp-navy);border-radius:4px;padding:10px 16px;margin-bottom:9px;display:grid;grid-template-columns:1fr 1px 1fr 1px 1fr;gap:0;align-items:center">
      <div style="text-align:center;padding:0 10px">
        <div style="font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.9);margin-bottom:3px">Twoja firma płaci teraz</div>
        <div style="font-family:var(--font-serif);font-size:25px;color:rgba(255,255,255,.85)">${fmtK(totals.currentCost)}&nbsp;<span style="font-size:11px">zł/m-c</span></div>
      </div>
      <div style="width:1px;height:32px;background:rgba(255,255,255,.1)"></div>
      <div style="text-align:center;padding:0 10px">
        <div style="font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.9);margin-bottom:3px">Po wdrożeniu PLUS</div>
        <div style="font-family:var(--font-serif);font-size:25px;color:var(--sp-gold)">${fmtK(totals.plusCost)}&nbsp;<span style="font-size:11px">zł/m-c</span></div>
      </div>
      <div style="width:1px;height:32px;background:rgba(255,255,255,.1)"></div>
      <div style="text-align:center;padding:0 10px">
        <div style="font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.9);margin-bottom:3px">Oszczędność rocznie</div>
        <div style="font-family:var(--font-serif);font-size:27px;font-weight:700;color:var(--success)">${fmtK(totals.savingsPlus * 12)}&nbsp;<span style="font-size:11px">zł/rok</span></div>
      </div>
    </div>

    <table class="dt" style="font-size:12px">
      <thead>
        <tr>
          <th>Kategoria kosztowa</th>
          <th class="r">Aktualny Koszt Zatrudnienia</th>
          <th class="r gold">☆ Eliton Prime™ PLUS</th>
          <th class="r gold">Zmiana</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Wynagrodzenie brutto z umowy<span class="sub">Gotówka + świadczenie rzeczowe (łącznie)</span></td>
          <td class="old">${fmt(totals.sumaBrutto)} zł</td>
          <td class="new">${fmt(totals.sumaZasadnicza + totals.sumaSwiadczenieBrutto)} zł</td>
          <td class="delta save">−${fmt(Math.abs(totals.sumaBrutto - (totals.sumaZasadnicza + totals.sumaSwiadczenieBrutto)))} zł</td>
        </tr>
        <tr>
          <td>ZUS Pracodawcy<span class="sub">Emerytalna, rentowa, wypadkowa</span></td>
          <td class="old">${fmt(totals.sumaZusPracodawcy)} zł</td>
          <td class="new">${fmt(totals.sumaZusPracodawcyEliton)} zł</td>
          <td class="delta save">−${fmt(totals.zusSaved)} zł</td>
        </tr>
        <tr>
          <td>Wynagrodzenie netto (do wypłaty)<span class="sub">Kwota na konto + wartość vouchera EBS</span></td>
          <td style="text-align:right;color:var(--sp-text-muted)">${fmt(totals.sumaNetto)} zł</td>
          <td class="new">${fmt(totals.sumaNettoElitonPlus)} zł</td>
          <td class="delta" style="color:var(--sp-text-muted)">${totals.sumaNettoElitonPlus >= totals.sumaNetto ? '+' : '−'}${fmt(Math.abs(totals.sumaNettoElitonPlus - totals.sumaNetto))} zł</td>
        </tr>
        <tr>
          <td>Opłata serwisowa EBS<span class="sub">${totals.prowizjaProc}% wartości nominalnej świadczeń</span></td>
          <td style="text-align:right;color:var(--sp-text-muted)">—</td>
          <td class="new">${fmt(totals.commission - totals.sumaRaise - totals.sumaAdminBonus)} zł</td>
          <td class="delta" style="color:var(--sp-navy)">${fmt(totals.commission - totals.sumaRaise - totals.sumaAdminBonus)} zł</td>
        </tr>
        <tr>
          <td>Bonus administracyjny dla kadr i księg.<span class="sub">2% wartości świadczeń — finansowany przez Stratton Prime</span></td>
          <td style="text-align:right;color:var(--sp-text-muted)">0,00 zł</td>
          <td class="new" style="color:var(--success)">${fmt(totals.sumaAdminBonus)} zł</td>
          <td class="delta save">+${fmt(totals.sumaAdminBonus)} zł</td>
        </tr>
        <tr>
          <td>Dodatkowa podwyżka wynagrodzenia dla pracowników, wyliczana od świadczenia netto<span class="sub">+4% świadczeń rzeczowych EBS finansowane przez Stratton Prime</span></td>
          <td style="text-align:right;color:var(--sp-text-muted)">0,00 zł</td>
          <td class="new" style="color:var(--success)">${fmt(totals.sumaRaise)} zł</td>
          <td class="delta save">+${fmt(totals.sumaRaise)} zł</td>
        </tr>
        <tr class="tr-total">
          <td><strong>Całkowity koszt pracodawcy / miesiąc</strong><span class="sub">Oszczędność netto po odliczeniu opłaty EBS</span></td>
          <td style="text-align:right"><span class="sub">Standard</span>${fmt(totals.currentCost)} zł</td>
          <td class="new"><span class="sub">Nowy Model</span>${fmt(totals.plusCost)} zł</td>
          <td class="delta save"><span class="sub">Oszczędność</span>+${fmt(totals.savingsPlus)} zł</td>
        </tr>

      </tbody>
    </table>

    <!-- BOX: Bonus administracyjny — wyjaśnienie -->
    <div style="background:var(--sp-gray);border:1px solid var(--border);border-left:3px solid var(--sp-gold);padding:10px 14px;margin-bottom:9px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;align-items:start">
      <div>
        <div style="font-size:8.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--sp-gold);margin-bottom:4px">Bonus administracyjny — co to jest?</div>
        <p style="font-size:11px;color:var(--sp-text-muted);line-height:1.5;margin:0">Miesięczny dodatek dla kadr i księgowości obsługujących EBS. Wynosi <strong>2%</strong> wartości świadczeń — przy świadczeniu ${fmt(totals.totalBenefit)} zł daje to <strong>${fmt(totals.sumaAdminBonus)} zł/m-c</strong>.</p>
      </div>
      <div>
        <div style="font-size:8.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--sp-gold);margin-bottom:4px">Kto otrzymuje i skąd środki?</div>
        <p style="font-size:11px;color:var(--sp-text-muted);line-height:1.5;margin:0">Bonus dla wskazanych pracowników kadr/księgowości. <strong>Finansowany w całości przez Stratton Prime</strong> — zerowy koszt pracodawcy.</p>
      </div>
      <div>
        <div style="font-size:8.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--sp-gold);margin-bottom:4px">Skutki podatkowe i ewidencja</div>
        <p style="font-size:11px;color:var(--sp-text-muted);line-height:1.5;margin:0">Przychód z art. 12 ust. 1 uPIT — pracodawca odprowadza zaliczkę PIT. Stratton Prime dostarcza gotowy schemat ewidencji i wzór listy wypłat.</p>
      </div>
    </div>

    <div class="two" style="flex:1">
      <div class="box-navy" style="margin-bottom:0;padding:16px 20px;display:flex;flex-direction:column">
        <div style="font-size:9.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--sp-gold-light);margin-bottom:10px">Rekomendacja alokacji oszczędności<br>Eliton Prime™ PLUS</div>
        <p style="font-size:13px;color:#fff;line-height:1.7;margin:0;flex:1">Wygenerowaną pulę <strong style="color:var(--sp-gold-light)">${fmt(totals.savingsPlus)} zł/m-c</strong> rekomendujemy rozdzielić strategicznie: część przeznaczyć na podwyżkę wynagrodzenia netto pracowników — realizowaną poprzez zwiększenie wartości świadczeń rzeczowych EBS, bez wzrostu brutto z umowy ani nowych narzutów ZUS — bezpośrednio wzmacniając retencję zespołu, a pozostałą część zatrzymać jako zysk operacyjny firmy.</p>
      </div>
      <div class="box-gold" style="margin-bottom:0;padding:16px 20px;display:flex;flex-direction:column">
        <div style="font-size:9.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--sp-gold);margin-bottom:10px">Wniosek analityczny: koszt zaniechania</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <span style="font-size:13px;color:var(--sp-text-muted)">Strata miesięczna</span>
          <span style="font-family:var(--font-serif);font-size:24px;color:#DC2626">−${fmt(totals.savingsPlus)} zł</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <span style="font-size:13px;color:var(--sp-text-muted)">Strata roczna</span>
          <span style="font-family:var(--font-serif);font-size:28px;font-weight:700;color:#DC2626">−${fmt(totals.savingsPlus * 12)} zł</span>
        </div>
        <p style="font-size:12.5px;color:var(--sp-text-muted);line-height:1.6;margin:0;flex:1">Każdy miesiąc bez wdrożenia to potencjalna oszczędność, która nie zostaje zrealizowana.</p>
      </div>
    </div>
    <p class="disc">Kalkulacja indywidualna na podstawie przesłanej listy płac. Wyniki mogą się różnić w zależności od zmian struktury zatrudnienia, formy umów i stawek ZUS. Dane mają charakter szacunkowy i mogą się różnić od wyników faktycznie osiągniętych. · Szczegółowy rozkład tego, jak liczona jest oszczędność.</p>
  </div>
  

${generateFooterV3()}
</div>

<!-- ══════════════════ STR 6 — WYKRESY ══════════════════ -->
`;
};
