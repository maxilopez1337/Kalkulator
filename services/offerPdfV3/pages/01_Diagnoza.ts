/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { Firma } from '../../../entities/company/model';
import { generatePageHeaderV3, generateFooterV3 } from '../components';

export const generatePage02V3 = (firma: Firma, totals: any, date: string, sector: string) => {
  const fmt = (v: number) =>
    new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      maximumFractionDigits: 0,
    }).format(v);
  const annualLoss = (totals.savingsPlus || 0) * 12;
  const loss3y = (totals.savingsPlus || 0) * 36;
  const sectorLabel = sector || 'Twojej branży';

  return `
<div class="page page-2">

  ${generatePageHeaderV3('Jak Zrozumieliśmy Twoją sytuację', '01. Diagnoza', 1, 11, date)}
<div class="page-body" style="display:flex;flex-direction:column;gap:0;padding-top:16px">

    <!-- ══ SEKCJA 1: PROBLEM ══ -->
    <div style="border-left:4px solid #DC2626;padding:20px 24px;background:var(--white);border-bottom:1px solid var(--border);flex:1">
      <div style="font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#DC2626;margin-bottom:12px">Twoja sytuacja dziś &mdash; wyniki analizy listy płac</div>

      <!-- Lead — problem w języku właściciela -->
      <p style="font-size:13.5px;color:var(--sp-navy);font-weight:600;line-height:1.6;margin-bottom:14px">Z analizy Twojej listy płac wynika, że <strong>${totals.count === 1 ? '1 pracownik kwalifikuje się' : `${totals.count} pracowników kwalifikuje się`} do restrukturyzacji kosztu pracy</strong>. Odprowadzasz co miesiąc <strong>${fmt(totals.sumaZusPracodawcy || 0)}</strong> składek ZUS — przy łącznym wynagrodzeniu brutto <strong>${fmt(totals.sumaBrutto || 0)}</strong>. Wdrożenie pozwoli Ci zaoszczędzić część tych środków w sposób transparentny i trwały.</p>

      <!-- KPI: 3 kafelki — ZUS / Brutto / Koszt zaniechania -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:var(--border)">
        <div style="background:var(--sp-gray);padding:14px 18px">
          <div style="font-size:8px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--sp-text-muted);margin-bottom:6px">ZUS pracodawcy / m-c</div>
          <div style="font-family:var(--font-serif);font-size:24px;color:#DC2626;line-height:1">${fmt(totals.sumaZusPracodawcy || 0)}</div>
          <div style="font-size:10px;color:var(--sp-text-muted);margin-top:4px">odprowadzane przy pełnym oskładkowaniu</div>
        </div>
        <div style="background:var(--sp-gray);padding:14px 18px">
          <div style="font-size:8px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--sp-text-muted);margin-bottom:6px">Wynagrodzenie brutto / m-c</div>
          <div style="font-family:var(--font-serif);font-size:24px;color:var(--sp-navy);line-height:1">${fmt(totals.sumaBrutto || 0)}</div>
          <div style="font-size:10px;color:var(--sp-text-muted);margin-top:4px">pełna przestrzeń optymalizacji dostępna</div>
        </div>
        <div style="background:#fff5f5;padding:14px 18px;border-left:2px solid #DC2626">
          <div style="font-size:8px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:#DC2626;margin-bottom:6px">Koszt zaniechania / rok</div>
          <div style="font-family:var(--font-serif);font-size:24px;color:#DC2626;line-height:1">${fmt(annualLoss)}</div>
          <div style="font-size:10px;color:var(--sp-text-muted);margin-top:4px">tyle tracisz rocznie przy braku działania</div>
        </div>
      </div>

      <!-- Implikacje — koszt bezczynności w czasie -->
      <div style="margin-top:10px;padding:10px 14px;background:#fff5f5;border-left:3px solid #DC2626;display:flex;align-items:flex-start;gap:12px">
        <div style="flex-shrink:0;font-size:16px;line-height:1.4;color:#DC2626">▲</div>
        <div>
          <span style="font-size:11px;font-weight:700;color:#a31515">Przy obecnej strukturze przekażesz do ZUS łącznie </span><span style="font-family:var(--font-serif);font-size:14px;font-weight:700;color:#DC2626">${fmt(loss3y)}</span><span style="font-size:11px;font-weight:700;color:#a31515"> przez najbliższe 3 lata.</span>
          <span style="font-size:10px;color:var(--sp-text-muted);display:block;margin-top:3px">To środki, które mogłyby sfinansować podwyżki, nowe etaty lub inwestycje — nie opuszczając budżetu pracy.</span>
        </div>
      </div>
    </div>

    <!-- ══ SEKCJA 2: ROZWIĄZANIE ══ -->
    <div style="border-left:4px solid var(--sp-gold);padding:20px 24px;background:var(--white);border-bottom:1px solid var(--border);flex:1">
      <div style="font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--sp-gold);margin-bottom:12px">Co zmienia restrukturyzacja kosztu pracy</div>
      <p style="font-size:13px;color:var(--sp-text-muted);line-height:1.7;margin-bottom:8px">Część wynagrodzenia zostaje zastąpiona wartościowym benefitem &mdash; <strong>Voucherem EBS</strong> &mdash; świadczeniem rzeczowym wyłączonym z podstawy ZUS na mocy przepisu obowiązującego od&nbsp;1998&nbsp;r. (§2&nbsp;ust.&nbsp;1&nbsp;pkt&nbsp;26 Rozp.&nbsp;MPiPS).</p>
      <p style="font-size:13px;color:var(--sp-text-muted);line-height:1.7;margin-bottom:8px">Po zmianie modelu wynagrodzenia, pracownik nadal otrzymuje to samo NETTO - w dwóch składowych <strong>${fmt(totals.sumaNettoZasadnicze || 0)} netto zasadnicze</strong> oraz <strong>${fmt(totals.totalBenefit || 0)} voucher EBS</strong>.</p>
      <p style="font-size:11px;color:var(--sp-text-muted);line-height:1.6;margin-top:0;margin-bottom:8px">W dalszej części oferty przedstawiamy <strong>Twój wariant wdrożenia</strong> &mdash; model skrojony pod Twoją strukturę zatrudnienia i Twoje preferencje.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--border)">
        <div style="background:var(--sp-gray);padding:14px 18px">
          <div style="font-size:8px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--sp-text-muted);margin-bottom:6px">ZUS pracodawcy po wdrożeniu</div>
          <div style="font-family:var(--font-serif);font-size:24px;color:var(--success);line-height:1">${fmt(totals.sumaZusPracodawcyEliton || 0)}</div>
          <div style="font-size:10px;color:var(--sp-text-muted);margin-top:4px">składki od niższej podstawy brutto</div>
        </div>
        <div style="background:var(--sp-navy);padding:14px 18px">
          <div style="font-size:8px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:rgba(212,175,90,.5);margin-bottom:6px">Oszczędność pracodawcy / m-c</div>
          <div style="font-family:var(--font-serif);font-size:24px;color:var(--success);line-height:1">+${fmt(totals.savingsPlus || 0)}</div>
          <div style="font-size:10px;color:rgba(255,255,255,.45);margin-top:4px">netto po odliczeniu opłaty EBS</div>
        </div>
      </div>
    </div>

    <!-- ══ SEKCJA 3: WNIOSEK ══ -->
    <div style="border-left:4px solid var(--success);padding:20px 24px;background:var(--white);flex:1;display:flex;flex-direction:column">
      <div style="font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--success);margin-bottom:14px">Wniosek &mdash; co Ty na tym zyskujesz</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:var(--border);flex:1">
        <div style="background:#f0faf4;padding:22px 18px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center">
          <div style="font-size:9.5px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--success);margin-bottom:10px">Oszczędność miesięczna</div>
          <div style="font-family:var(--font-serif);font-size:34px;color:var(--success);line-height:1">+${fmt(totals.savingsPlus || 0)}</div>
          <div style="font-size:11.5px;color:var(--sp-text-muted);margin-top:6px">zostaje w Twoim budżecie</div>
        </div>
        <div style="background:#f0faf4;padding:22px 18px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center">
          <div style="font-size:9.5px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--success);margin-bottom:10px">Oszczędność roczna</div>
          <div style="font-family:var(--font-serif);font-size:34px;color:var(--success);line-height:1">+${fmt((totals.savingsPlus || 0) * 12)}</div>
          <div style="font-size:11.5px;color:var(--sp-text-muted);margin-top:6px">przy stałych parametrach ZUS</div>
        </div>
        <div style="background:#f0faf4;padding:22px 18px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center">
          <div style="font-size:9.5px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--success);margin-bottom:10px">Oszczędność na pracownika / m-c</div>
          <div style="font-family:var(--font-serif);font-size:34px;color:var(--success);line-height:1">+${fmt((totals.savingsPlus || 0) / (totals.count || 1))}</div>
          <div style="font-size:11.5px;color:var(--sp-text-muted);margin-top:6px">średnio na 1 pracownika</div>
        </div>
      </div>
      <!-- CTA — forward-looking -->
      <div style="margin-top:14px;padding:14px 18px;background:var(--sp-navy);display:flex;align-items:center;justify-content:space-between;gap:16px">
        <div style="font-size:12px;color:rgba(255,255,255,.85);line-height:1.55;flex:1">
          Jak działa mechanizm i dlaczego jest zgodny z obowiązującymi regulacjami? <strong style="color:#fff"><br>Kolejne strony wyjaśniają to krok po kroku.</strong>
        </div>
        <div style="flex-shrink:0;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--sp-gold);white-space:nowrap">
          → Szczegóły
        </div>
      </div>
    </div>

  </div>
  
  ${generateFooterV3()}
</div>`;
};
