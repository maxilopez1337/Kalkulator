import type { SimulationParams } from '../types';
import { fmtK2 } from '../shared';

export const generateMechanizmV5 = (p: SimulationParams, date: string): string => {
    const n = p.empCount;
    const avgNet = p.salaryMode === 'NETTO' ? p.avgSalary : Math.round(p.avgSalary * 0.715);
    const { totalProv } = p.simulation;
    const bruttOld = Math.round(p.simulation.avgBruttoStd);
    const zusOld   = Math.round(p.simulation.avgZusStd);
    const bruttNew = Math.round(p.simulation.avgBruttoNowy);
    const zusNew   = Math.round(p.simulation.avgZusNowy);
    const voucher  = Math.round(p.simulation.avgEbs);
    const perProv  = totalProv / n;
    const totalStdPP     = bruttOld + zusOld;
    const totalEPwithFee = bruttNew + zusNew + perProv;
    const savings        = totalStdPP - totalEPwithFee;
    const savingsPct     = Math.round((savings / Math.max(1, totalStdPP)) * 100);

    return `
<!-- ════ STR 2 — MECHANIZM ════ -->
<div class="page">
  <div class="ph">
    <div class="ph-left">
      <div class="tag">01 · Mechanizm i Bezpieczeństwo</div>
      <div class="title">Jak pracuje model w Twojej firmie.</div>
    </div>
    <div class="ph-right">ANALIZA WSTĘPNA<br>${date}<br>STRONA 1/5</div>
  </div>
  <div class="pb">
    <p class="lead" style="margin-bottom:14px">Twoja firma każdego miesiąca przepłaca na ZUS — dlaczego? Ponieważ nie korzystasz z prawa, które działa od 1998 r. Przepisy pozwalają część wynagrodzenia wypłacać jako świadczenie rzeczowe zwolnione ze składek.<br><strong>Eliton Prime™</strong> koryguje tę strukturę. Twój pracownik dostaje tyle samo lub więcej. Ty płacisz tyle, ile powinieneś.</p>

    <h3 class="sh" style="padding:4px 0;margin:0 0 10px">Przed wdrożeniem modelu i po — 1 pracownik / miesięcznie</h3>

    <!-- VISUAL BEFORE/AFTER COMPARISON -->
    <div style="margin-bottom:14px;border:1px solid #DDD8CE;overflow:hidden">
      <!-- column headers -->
      <div style="display:grid;grid-template-columns:1fr 52px 1fr">
        <div style="background:#2B2B3A;padding:10px 20px;text-align:center">
          <div style="font-size:8px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.75)">MODEL OBECNY</div>
          <div style="font-size:9px;color:rgba(255,255,255,.5);margin-top:3px">przed wdrożeniem modelu</div>
        </div>
        <div style="background:#1A1F3C;display:flex;align-items:center;justify-content:center">
          <div style="font-size:14px;color:rgba(255,255,255,.25)">→</div>
        </div>
        <div style="background:#0D3322;padding:10px 20px;text-align:center">
          <div style="font-size:8px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#A8E6C3">ELITON PRIME™</div>
          <div style="font-size:9px;color:rgba(168,230,195,.65);margin-top:3px">po wdrożeniu modelu</div>
        </div>
      </div>

      <!-- row 1: pracownik dostaje -->
      <div style="display:grid;grid-template-columns:1fr 52px 1fr;border-top:1px solid #E0DDD8">
        <div style="background:#FAFAF8;padding:14px 20px">
          <div style="font-size:8px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#9A9390;margin-bottom:6px">Pracownik dostaje</div>
          <div style="font-size:22px;font-family:'Playfair Display',serif;font-weight:700;color:#3A3A4A;line-height:1">${fmtK2(avgNet)} zł</div>
          <div style="font-size:9px;color:#9A9390;margin-top:4px">wynagrodzenie netto</div>
        </div>
        <div style="background:#F2F2F2;border-left:1px solid #E0DDD8;border-right:1px solid #E0DDD8;display:flex;align-items:center;justify-content:center">
          <div style="font-size:7.5px;color:#9A9390;font-weight:700;letter-spacing:.06em;text-transform:uppercase;text-align:center;line-height:1.4">BEZ<br>ZMIAN</div>
        </div>
        <div style="background:#F4FAF7;padding:14px 20px">
          <div style="font-size:8px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#2D6A4A;margin-bottom:6px">Pracownik dostaje</div>
          <div style="font-size:22px;font-family:'Playfair Display',serif;font-weight:700;color:#2D6A4A;line-height:1">${fmtK2(avgNet)} zł</div>
          <div style="font-size:9px;color:#2D6A4A;margin-top:4px">netto z <strong>voucher ${fmtK2(voucher)} zł</strong></div>
        </div>
      </div>

      <!-- row 2: koszt pracodawcy -->
      <div style="display:grid;grid-template-columns:1fr 52px 1fr;border-top:1px solid #E0DDD8">
        <div style="background:#FDF5F5;padding:14px 20px">
          <div style="font-size:8px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#C0392B;margin-bottom:6px">Koszt pracodawcy</div>
          <div style="font-size:22px;font-family:'Playfair Display',serif;font-weight:700;color:#C0392B;line-height:1">${fmtK2(totalStdPP)} zł</div>
          <div style="font-size:9px;color:#C0392B;margin-top:4px;opacity:.7">brutto ${fmtK2(bruttOld)} + ZUS ${fmtK2(zusOld)}</div>
        </div>
        <div style="background:#F2F2F2;border-left:1px solid #E0DDD8;border-right:1px solid #E0DDD8;display:flex;align-items:center;justify-content:center">
          <div style="font-size:7.5px;color:#9A9390;font-weight:700;letter-spacing:.06em;text-transform:uppercase;text-align:center;line-height:1.4">ZA<br>MNIEJ</div>
        </div>
        <div style="background:#F4FAF7;padding:14px 20px">
          <div style="font-size:8px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#2D6A4A;margin-bottom:6px">Koszt pracodawcy</div>
          <div style="font-size:22px;font-family:'Playfair Display',serif;font-weight:700;color:#2D6A4A;line-height:1">${fmtK2(totalEPwithFee)} zł</div>
          <div style="font-size:9px;color:#2D6A4A;margin-top:4px;opacity:.7">brutto ${fmtK2(bruttNew)} + ZUS ${fmtK2(zusNew)} + obsługa</div>
        </div>
      </div>

      <!-- row 3: savings callout -->
      <div style="background:#0D1F3C;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;border-top:2px solid #C6A15B">
        <div style="font-size:9.5px;font-weight:600;color:rgba(255,255,255,.65);letter-spacing:.04em">Miesięczna oszczędność na 1 pracowniku:</div>
        <div style="display:flex;align-items:baseline;gap:8px">
          <span style="font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:#D4AA5A;line-height:1">−${fmtK2(savings)} zł</span>
          <span style="font-size:11px;color:rgba(212,170,90,.65);font-weight:600">/ mc (−${savingsPct}%)</span>
        </div>
      </div>
    </div>

    <!-- W skali zespołu -->
    <div style="margin-bottom:14px;background:#F7F6F4;border:1px solid #DDD8CE;padding:11px 18px;display:flex;align-items:center;gap:0">
      <div style="font-size:8.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#6A6A7A;flex-shrink:0;margin-right:20px">W skali ${n} os.</div>
      <div style="flex:1;display:grid;grid-template-columns:1fr 1px 1fr 1px 1fr;gap:0">
        <div style="text-align:center;padding:0 12px">
          <div style="font-size:8px;color:#9A9390;margin-bottom:3px;text-transform:uppercase;letter-spacing:.1em">Obecny koszt/mc</div>
          <div style="font-size:15px;font-weight:700;color:#C0392B;font-family:'Playfair Display',serif">${fmtK2(totalStdPP * n)} zł</div>
        </div>
        <div style="background:#DDD8CE"></div>
        <div style="text-align:center;padding:0 12px">
          <div style="font-size:8px;color:#9A9390;margin-bottom:3px;text-transform:uppercase;letter-spacing:.1em">Koszt po wdrożeniu</div>
          <div style="font-size:15px;font-weight:700;color:#2D6A4A;font-family:'Playfair Display',serif">${fmtK2(totalEPwithFee * n)} zł</div>
        </div>
        <div style="background:#DDD8CE"></div>
        <div style="text-align:center;padding:0 12px">
          <div style="font-size:8px;color:#9A9390;margin-bottom:3px;text-transform:uppercase;letter-spacing:.1em">Oszczędność/mc</div>
          <div style="font-size:15px;font-weight:700;color:#C6A15B;font-family:'Playfair Display',serif">+${fmtK2(savings * n)} zł</div>
        </div>
      </div>
    </div>

    <!-- CYTAT ŻUKA -->
    <div style="display:grid;grid-template-columns:3px 1fr;gap:14px;background:#F8F7F4;border:1px solid #E0DDD8;padding:12px 16px 12px 0;margin-bottom:12px">
      <div style="background:#B09020;flex-shrink:0"></div>
      <div>
        <div style="font-size:7.5px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#B09020;margin-bottom:7px">Niezależna analiza prawno-podatkowa · Radosław Żuk, Doradca Podatkowy (nr wpisu 12602)</div>
        <p style="font-family:'Playfair Display',serif;font-size:12px;color:#0D1F3C;line-height:1.75;font-style:italic;margin:0 0 6px">&bdquo;Przy spełnieniu warunków formalnych wdrożenia nie zachodzą podstawy do kwestionowania modelu Eliton Prime™ przez organy ZUS ani podatkowe. Mechanizm oparty na §2 ust. 1 pkt 26 Rozporządzenia MPiPS funkcjonuje w obrocie prawnym od 1998 r. i jest znany organom kontrolnym.&rdquo;</p>
        <div style="font-size:8px;color:#8896A8">Kancelaria Żuk Pośpiech Sp. k. · kzp.law · Analiza dostępna do wglądu na etapie due diligence</div>
      </div>
    </div>

    <h3 class="sh" style="padding:4px 0;margin:0 0 8px">Transparentność — czym jest, a czym nie jest Eliton Prime™</h3>
    <div class="yn" style="margin-bottom:0">
      <div class="yn-col" style="padding:12px 18px">
        <div class="yn-head yes">✓ &nbsp;Czym Eliton Prime™ JEST</div>
        <div class="yn-item"><span class="yn-ico y">✓</span><span>Legalnym wyłączeniem z podstawy ZUS na mocy §2 ust. 1 pkt 26 Rozp. MPiPS — obowiązującego od 1998 r. i stosowanego przez tysiące firm.</span></div>
        <div class="yn-item"><span class="yn-ico y">✓</span><span>Zmianą struktury wynagrodzenia — część wypłaty zastępowana imiennym świadczeniem rzeczowym o tej samej wartości dla pracownika.</span></div>
        <div class="yn-item"><span class="yn-ico y">✓</span><span>Systemem w pełni dokumentowanym — uchwała Zarządu, imienne przypisanie voucherów, logi EBS i raporty miesięczne.</span></div>
      </div>
      <div class="yn-col" style="padding:12px 18px">
        <div class="yn-head no">✗ &nbsp;Czym Eliton Prime™ NIE JEST</div>
        <div class="yn-item"><span class="yn-ico n">✗</span><span>Nie jest agresywną optymalizacją podatkową — brak fikcyjnych spółek, zmian na B2B ani wyprowadzania majątku.</span></div>
        <div class="yn-item"><span class="yn-ico n">✗</span><span>Nie jest działaniem na granicy prawa — §2 pkt 26 ma 28-letnią historię stosowania i jest znany ZUS.</span></div>
        <div class="yn-item"><span class="yn-ico n">✗</span><span>Nie jest bonem podarunkowym — voucher EBS nie jest środkiem płatniczym ani nie podlega wymianie na gotówkę u pracodawcy.</span></div>
      </div>
    </div>
  </div>
  <div class="footer">
    <div class="footer-rule"></div>
    <div class="footer-inner">
      <div class="footer-text">Stratton Prime Sp. z o.o.&nbsp;·&nbsp;ul. Nowy Świat 42/44, 80-299 Gdańsk&nbsp;·&nbsp;NIP: 5842867357</div>
      <div class="footer-brand">
        <div class="footer-brand-mark"><div class="footer-brand-line"></div><div class="footer-brand-dot"></div><div class="footer-brand-line"></div></div>
        <div class="footer-brand-name">STRATTON PRIME</div>
      </div>
      <div class="footer-confidential">Dokument poufny &nbsp;·&nbsp; Strona 1 / 5</div>
    </div>
  </div>
</div>`;
};