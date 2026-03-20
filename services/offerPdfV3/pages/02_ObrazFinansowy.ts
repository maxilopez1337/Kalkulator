import { Firma } from '../../../entities/company/model';
import { generatePageHeaderV3, generateFooterV3 } from '../components';

export const generatePage06V3 = (firma: Firma, totals: any, date: string, sector: string): string => {
  const fmt = (v: number) => new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
  const fmtK = (v: number) => new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(Math.round(v));
  const nettoNewHeight = Math.min(95, Math.round(87 * (1 + totals.sumaRaise / totals.sumaNetto)));
  const yMax = totals.savingsPlus * 36;
  const y1 = totals.savingsPlus * 12;
  const y2 = totals.savingsPlus * 24;
  return `
<div class="page">

  ${generatePageHeaderV3('Obraz Finansowy — Porównanie i Prognoza', '02. Obraz finansowy', 2, 11, date)}
<div class="page-body" style="padding-top:16px;padding-bottom:40px;display:flex;flex-direction:column;gap:0">

    <!-- ══ SEKCJA A: Porównanie kosztów pracodawcy ══ -->
    <div style="margin-bottom:16px">
      <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border)">
        <span style="font-size:9px;font-weight:700;letter-spacing:.05em;color:var(--white);background:var(--sp-navy);padding:2px 7px;border-radius:2px">Wykres 1</span>
        <span style="font-size:8.5px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--sp-navy)">Całkowity koszt pracodawcy / miesiąc — przed i po wdrożeniu</span>
      </div>

        <!-- Słupki poziome — pełna szerokość -->
        <div>
          <!-- Model obecny -->
          <div style="margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px">
              <span style="font-size:10.5px;font-weight:600;color:var(--sp-text-muted)">Model obecny</span>
              <span style="font-size:14px;font-weight:700;color:var(--sp-text-muted)">${fmtK(totals.currentCost)} zł</span>
            </div>
            <div style="display:flex;height:40px;border-radius:2px;overflow:hidden;border:1px solid var(--border)">
              <div style="flex:${Math.round(totals.sumaBrutto / totals.currentCost * 100)};background:#8fa3b8;display:flex;align-items:center;padding-left:12px;min-width:0;overflow:hidden">
                <span style="font-size:9.5px;font-weight:600;color:#fff;white-space:nowrap">Brutto ${fmtK(totals.sumaBrutto)} zł</span>
              </div>
              <div style="flex:${Math.round(totals.sumaZusPracodawcy / totals.currentCost * 100)};background:#c0cdd8;display:flex;align-items:center;justify-content:center;min-width:0;overflow:hidden">
                <span style="font-size:9px;color:#fff;font-weight:600;white-space:nowrap">ZUS ${fmtK(totals.sumaZusPracodawcy)} zł</span>
              </div>
            </div>
          </div>

          <!-- Eliton PLUS -->
          <div style="margin-bottom:8px">
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px">
              <span style="font-size:10.5px;font-weight:700;color:var(--sp-navy)">Eliton Prime™ PLUS</span>
              <span style="font-size:14px;font-weight:700;color:var(--sp-navy)">${fmtK(totals.plusCost)} zł</span>
            </div>
            <!-- Info nad słupkiem: suma nowego brutto z umowy -->
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
              <span style="font-size:8px;color:var(--sp-text-muted)">Łączne nowe brutto z umowy:</span>
              <span style="font-size:8px;font-weight:700;color:var(--sp-navy)">${fmtK(totals.sumaZasadnicza)} zł zasadnicze brutto</span>
              <span style="font-size:8px;color:var(--sp-text-muted)">+</span>
              <span style="font-size:8px;font-weight:700;color:var(--sp-gold)">${fmtK(totals.sumaSwiadczenieBrutto)} zł świadczenie brutto</span>
              <span style="font-size:8px;color:var(--sp-text-muted)">=</span>
              <span style="font-size:8.5px;font-weight:700;color:var(--sp-navy);background:rgba(212,175,90,.12);padding:1px 5px;border-radius:2px">${fmtK(totals.sumaZasadnicza + totals.sumaSwiadczenieBrutto)} zł łącznie</span>
            </div>
            <div style="display:flex;height:40px;border-radius:2px;overflow:hidden;border:1px solid var(--border);width:100%">
              <div style="flex:${Math.round(totals.sumaZasadnicza / totals.currentCost * 100)};background:var(--sp-navy);display:flex;align-items:center;padding-left:10px;min-width:0;overflow:hidden">
                <span style="font-size:9.5px;font-weight:600;color:rgba(255,255,255,.9);white-space:nowrap">Zasadnicze br. ${fmtK(totals.sumaZasadnicza)} zł</span>
              </div>
              <div style="flex:${Math.round(totals.sumaSwiadczenieBrutto / totals.currentCost * 100)};background:var(--sp-gold);display:flex;align-items:center;justify-content:center;min-width:0;overflow:hidden">
                <span style="font-size:8px;color:#fff;font-weight:700;white-space:nowrap">Voucher br. ${fmtK(totals.sumaSwiadczenieBrutto)} zł</span>
              </div>
              <div style="flex:${Math.round(totals.sumaZusPracodawcyEliton / totals.currentCost * 100)};background:#3a6186;display:flex;align-items:center;justify-content:center;min-width:0;overflow:hidden">
                <span style="font-size:8.5px;color:#fff;font-weight:600;white-space:nowrap">ZUS ${fmtK(totals.sumaZusPracodawcyEliton)}</span>
              </div>
              <div style="flex:${Math.round((totals.commission - totals.sumaRaise - totals.sumaAdminBonus) / totals.currentCost * 100)};background:#c0a040;display:flex;align-items:center;justify-content:center;min-width:0;overflow:hidden">
                <span style="font-size:7px;color:#fff;font-weight:600">EBS</span>
              </div>
              <!-- Zielony segment oszczędności wypełnia resztę paska -->
              <div style="flex:${Math.round(totals.savingsPlus / totals.currentCost * 100)};background:var(--success);display:flex;align-items:center;justify-content:center;min-width:0;overflow:hidden">
                <span style="font-size:8px;color:#fff;font-weight:700;white-space:nowrap">+${fmt(totals.savingsPlus)} zł</span>
              </div>
            </div>
            <div style="font-size:8.5px;color:var(--sp-text-muted);margin-top:5px">w tym Opłata serwisowa EBS ${fmt(totals.commission - totals.sumaRaise - totals.sumaAdminBonus)} zł — oszczędność netto po jej odliczeniu</div>
          </div>

          <!-- Legenda -->
          <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:8px">
            <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;background:#8fa3b8;border-radius:1px"></div><span style="font-size:8.5px;color:var(--sp-text-muted)">Brutto (obecne)</span></div>
            <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;background:var(--sp-navy);border-radius:1px"></div><span style="font-size:8.5px;color:var(--sp-text-muted)">Brutto gotówkowe (nowe)</span></div>
            <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;background:var(--sp-gold);border-radius:1px"></div><span style="font-size:8.5px;color:var(--sp-text-muted)">Voucher EBS brutto (poza ZUS)</span></div>
            <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;background:#3a6186;border-radius:1px"></div><span style="font-size:8.5px;color:var(--sp-text-muted)">ZUS pracodawcy</span></div>
            <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;background:#c0a040;border-radius:1px"></div><span style="font-size:8.5px;color:var(--sp-text-muted)">Opłata serwisowa EBS</span></div>
            <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;background:var(--success);border-radius:1px"></div><span style="font-size:8.5px;color:var(--sp-text-muted)">Potencjalna oszczędność</span></div>
          </div>
        </div><!-- /słupki poziome -->
    </div><!-- /sekcja A -->

    <!-- ══ SEKCJA B: Oszczędności narastająco ══ -->
    <div style="border-top:2px solid var(--border);padding-top:14px;flex:1;display:flex;flex-direction:column">
      <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border)">
        <span style="font-size:9px;font-weight:700;letter-spacing:.05em;color:var(--white);background:var(--sp-navy);padding:2px 7px;border-radius:2px">Wykres 2</span>
        <span style="font-size:8.5px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--sp-navy)">Oszczędności narastająco — prognoza 36 miesięcy</span>
        <span style="font-size:8px;color:var(--sp-text-muted);font-weight:400">(${totals.count} pracowni${totals.count === 1 ? 'k' : (totals.count < 5 ? 'ków' : 'ków')} · wariant PLUS · wartości szacunkowe)</span>
      </div>

      <!-- Kontener wykresu — rozciąga się do wypełnienia strony -->
      <div style="display:flex;flex-direction:column;flex:1;gap:8px">

        <!-- Wykres z osią Y -->
        <div style="display:flex;gap:0;flex:1">

          <!-- Oś Y z jednostką zł -->
          <div style="width:60px;flex-shrink:0;position:relative;display:flex;flex-direction:column;justify-content:space-between;padding-bottom:2px">
            <div style="display:flex;align-items:center;justify-content:flex-end;gap:3px;padding-right:8px">
              <span style="font-size:7.5px;color:var(--sp-text-muted);white-space:nowrap">${fmtK(yMax)} zł</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:flex-end;gap:3px;padding-right:8px">
              <span style="font-size:7.5px;color:var(--sp-text-muted);white-space:nowrap">${fmtK(y2)} zł</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:flex-end;gap:3px;padding-right:8px">
              <span style="font-size:7.5px;color:var(--sp-text-muted);white-space:nowrap">${fmtK(y1)} zł</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:flex-end;gap:3px;padding-right:8px">
              <span style="font-size:7.5px;color:var(--sp-text-muted);white-space:nowrap">0 zł</span>
            </div>
          </div>

          <!-- Obszar wykresu -->
          <div style="flex:1;border-left:2px solid var(--sp-navy);border-bottom:2px solid var(--sp-navy);position:relative;padding:0 12px">

            <!-- Linie siatki -->
            <div style="position:absolute;left:0;right:0;bottom:33.3%;border-top:1px dashed rgba(0,0,0,.08)"></div>
            <div style="position:absolute;left:0;right:0;bottom:66.6%;border-top:1px dashed rgba(0,0,0,.08)"></div>

            <!-- Słupki — 12 kwartałów, każdy kwartał = para (kwartalna oszczędność złoty + narastająco granatowy) -->
            <div style="display:flex;align-items:flex-end;height:100%;gap:8px">
              ${Array.from({length: 12}, (_, i) => {
                const q = i + 1;
                const totalPct = (q / 12 * 100).toFixed(2);
                const isYearEnd = q === 4 || q === 8 || q === 12;
                const yearLabel = q === 4 ? 'Rok 1' : q === 8 ? 'Rok 2' : q === 12 ? 'Rok 3' : '';
                const goldColor = isYearEnd ? '#b8902a' : '#D4AF5A';
                const navyColor = q <= 4 ? '#52b788' : q <= 8 ? '#2a5a8c' : '#0D1F3C';
                return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;min-width:0;position:relative">
                  ${isYearEnd ? `<div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);font-size:7px;font-weight:700;color:var(--sp-navy);white-space:nowrap;background:#f8f7f4;padding:0 2px">${yearLabel}</div>` : ''}
                  <div style="width:60%;height:${totalPct}%;display:flex;flex-direction:column-reverse;border-radius:2px 2px 0 0;overflow:hidden;min-height:4px">
                    ${q > 1 ? `<div style="flex:${q - 1};background:${navyColor}"></div>` : ''}
                    <div style="flex:1;background:${goldColor}"></div>
                  </div>
                </div>`;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Etykiety osi X — Q1..Q12 -->
        <div style="display:flex;padding-left:62px;gap:3px">
          ${Array.from({length: 12}, (_, i) => {
            const q = i + 1;
            const isYearEnd = q === 4 || q === 8 || q === 12;
            const col = isYearEnd ? (q === 4 ? 'var(--success)' : 'var(--sp-navy)') : 'var(--sp-text-muted)';
            const fw = isYearEnd ? '700' : '400';
            return `<div style="flex:1;text-align:center;font-size:7px;color:${col};font-weight:${fw}">Q${q}</div>`;
          }).join('')}
        </div>

        <!-- Legenda kolorów -->
        <div style="display:flex;gap:18px;align-items:center;padding:3px 0 4px 62px">
          <div style="display:flex;align-items:center;gap:5px"><div style="width:8px;height:8px;background:#D4AF5A;border-radius:1px"></div><span style="font-size:8px;color:var(--sp-text-muted)">Oszczędność kwartalna</span></div>
          <div style="display:flex;align-items:center;gap:5px"><div style="width:8px;height:8px;background:#52b788;border-radius:1px"></div><span style="font-size:8px;color:var(--sp-text-muted)">Narastająco Rok 1</span></div>
          <div style="display:flex;align-items:center;gap:5px"><div style="width:8px;height:8px;background:#2a5a8c;border-radius:1px"></div><span style="font-size:8px;color:var(--sp-text-muted)">Narastająco Rok 2</span></div>
          <div style="display:flex;align-items:center;gap:5px"><div style="width:8px;height:8px;background:#0D1F3C;border-radius:1px"></div><span style="font-size:8px;color:var(--sp-text-muted)">Narastająco Rok 3</span></div>
        </div>
        <!-- Milestony -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border)">
          <div style="background:var(--sp-gray);padding:7px 12px;display:flex;align-items:center;gap:10px">
            <div style="width:24px;height:24px;background:#2d9a5f;border-radius:2px;flex-shrink:0;display:flex;align-items:center;justify-content:center">
              <span style="font-size:9px;color:#fff;font-weight:700">R1</span>
            </div>
            <div>
              <div style="font-size:8px;color:var(--sp-text-muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:2px">Rok 1 · M12</div>
              <div style="font-size:15px;font-weight:700;color:var(--sp-navy);line-height:1">${fmt(y1)} zł</div>
            </div>
          </div>
          <div style="background:var(--sp-gray);padding:7px 12px;display:flex;align-items:center;gap:10px">
            <div style="width:24px;height:24px;background:#1a3a5c;border-radius:2px;flex-shrink:0;display:flex;align-items:center;justify-content:center">
              <span style="font-size:9px;color:#fff;font-weight:700">R2</span>
            </div>
            <div>
              <div style="font-size:8px;color:var(--sp-text-muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:2px">Rok 2 · M24</div>
              <div style="font-size:15px;font-weight:700;color:var(--sp-navy);line-height:1">${fmt(y2)} zł</div>
            </div>
          </div>
          <div style="background:#0D1F3C;padding:7px 12px;display:flex;align-items:center;gap:10px">
            <div style="width:24px;height:24px;background:var(--sp-gold);border-radius:2px;flex-shrink:0;display:flex;align-items:center;justify-content:center">
              <span style="font-size:9px;color:#fff;font-weight:700">R3</span>
            </div>
            <div>
              <div style="font-size:8px;color:rgba(255,255,255,.45);text-transform:uppercase;letter-spacing:.1em;margin-bottom:2px">Rok 3 · M36</div>
              <div style="font-size:15px;font-weight:700;color:var(--sp-gold);line-height:1">${fmt(yMax)} zł</div>
            </div>
          </div>
        </div>

      </div><!-- /flex:1 -->

      <!-- ══ EFEKT DLA PRACOWNIKA — pod milestones ══ -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:var(--border);margin-top:14px">

        <!-- Słupki pionowe netto: Przed vs Po PLUS -->
        <div style="background:var(--sp-gray);padding:10px 16px;grid-column:1/3">
          <div style="font-size:8.5px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--sp-navy);margin-bottom:8px;text-align:center">Efekt dla pracownika — wynagrodzenie netto</div>
          <div style="display:flex;align-items:flex-end;justify-content:center;gap:20px;height:92px;padding-top:20px">
            <div style="width:80px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%">
              <div style="width:100%;background:#8fa3b8;height:87%;border-radius:2px 2px 0 0;display:flex;align-items:flex-start;justify-content:center;padding-top:6px">
                <span style="font-size:9px;color:#fff;font-weight:700">${fmtK(totals.sumaNetto)} zł</span>
              </div>
              <div style="font-size:8px;color:var(--sp-text-muted);padding-top:3px;border-top:2px solid var(--sp-navy);width:100%;text-align:center">Przed</div>
            </div>
            <div style="width:80px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;position:relative">
              <div style="position:absolute;top:-18px;left:50%;transform:translateX(-50%);font-size:8.5px;color:var(--success);font-weight:700;white-space:nowrap;background:var(--sp-gray);padding:1px 4px;border-radius:2px;border:1px solid var(--success)">+${fmt(totals.sumaRaise)} zł</div>
              <div style="width:100%;background:var(--sp-navy);height:${nettoNewHeight}%;border-radius:2px 2px 0 0;display:flex;align-items:flex-start;justify-content:center;padding-top:6px">
                <span style="font-size:9px;color:#fff;font-weight:700">${fmtK(totals.sumaNettoElitonPlus)} zł</span>
              </div>
              <div style="font-size:8px;color:var(--sp-navy);font-weight:600;padding-top:3px;border-top:2px solid var(--sp-navy);width:100%;text-align:center">Po PLUS</div>
            </div>
          </div>
        </div>

        <!-- Bonus kadr -->
        <div style="background:var(--sp-gray);padding:10px 16px;border-left:3px solid var(--sp-gold);display:flex;flex-direction:column;justify-content:center">
          <div style="font-size:8px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--sp-gold);margin-bottom:4px">Bonus kadr i księg.</div>
          <div style="font-size:22px;font-weight:700;color:var(--sp-navy);line-height:1">${fmt(totals.sumaAdminBonus)} zł<span style="font-size:10px;font-weight:400;color:var(--sp-text-muted)">/m-c</span></div>
          <div style="font-size:8.5px;color:var(--sp-text-muted);margin-top:4px">Finansuje Stratton Prime<br>Koszt pracodawcy: <strong>0 zł</strong></div>
        </div>

      </div>

    </div>

    <p class="disc" style="margin-top:4px;margin-bottom:0;font-size:7.5px;line-height:1.4">Dane mają charakter szacunkowy (${totals.count} pracowni${totals.count === 1 ? 'k' : 'ków'}, wariant PLUS, stałe parametry ZUS 2026). Wyniki mogą się różnić w zależności od struktury zatrudnienia i zmian legislacyjnych.</p>

  </div>
  

${generateFooterV3()}
</div>

<!-- ══════════════════ STR 7 — WARIANTY ══════════════════ -->
`;
};
