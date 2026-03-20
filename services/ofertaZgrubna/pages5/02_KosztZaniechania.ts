import type { SimulationParams } from '../types';
import { fmtK2 } from '../shared';

export const generateKosztV5 = (p: SimulationParams, offerValidity: string, date: string): string => {
    const n = p.empCount;
    const { monthlySavings, yearlySavings, totalStd, totalNew, totalProv } = p.simulation;
    const kostBez   = totalNew - totalProv;
    const roi       = totalProv > 0 ? Math.round(monthlySavings / totalProv * 100) : 0;
    const voucherTot = Math.round(totalProv / 0.28);
    const q3savings = Math.round(monthlySavings * 3);
    // "co możesz zrobić z tymi pieniędzmi"
    const raisePerPerson = Math.round(monthlySavings / n);
    const newHires = +(monthlySavings / (totalStd / n)).toFixed(1);
    const bonusPool = Math.round(yearlySavings * 0.5);
    const pctNew = Math.round((totalNew / Math.max(1, totalStd)) * 100);
    const pctInvestment = Math.min(99, Math.round((totalProv / Math.max(1, monthlySavings)) * 100));
    const roiMultiple = +(monthlySavings / Math.max(1, totalProv)).toFixed(1);

    return `
<!-- ════ STR 3 — KOSZT ZANIECHANIA ════ -->
<div class="page">
  <div class="ph">
    <div class="ph-left">
      <div class="tag">02 · Analiza Kosztów Zatrudnienia</div>
      <div class="title">Ile Twoja firma przepłaca co miesiąc?</div>
    </div>
    <div class="ph-right">ANALIZA WSTĘPNA<br>${date}<br>STRONA 2/5</div>
  </div>
  <div class="pb" style="display:flex;flex-direction:column;gap:22px;padding-bottom:14px">
    <div class="inertia" style="margin-bottom:0">
      <div class="ig" style="padding:10px 16px">
        <div class="ig-val">${fmtK2(monthlySavings)} zł</div>
        <div class="ig-lbl">NADPŁATA / MIESIĄC</div>
        <div class="ig-note">Każdy miesiąc zwłoki to realna strata</div>
      </div>
      <div class="ig" style="padding:10px 16px">
        <div class="ig-val">${fmtK2(q3savings)} zł</div>
        <div class="ig-lbl">NADPŁATA / KWARTAŁ</div>
        <div class="ig-note">Koszt czekania przez 3 miesiące</div>
      </div>
      <div class="ig" style="padding:10px 16px">
        <div class="ig-val">${fmtK2(yearlySavings)} zł</div>
        <div class="ig-lbl">NADPŁATA / ROK</div>
        <div class="ig-note">Roczna utrata gotówki firmy</div>
      </div>
    </div>

    <!-- TABLE BLOCK — jeden wizualny kontener -->
    <div style="border:1px solid var(--border);overflow:hidden">
      <div style="padding:6px 16px 5px;background:#F7F6F4;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px">
        <span style="display:inline-block;width:4px;height:15px;background:var(--gold-dark);flex-shrink:0;border-radius:1px"></span>
        <span style="font-family:'Playfair Display',serif;font-size:13px;font-weight:700;color:var(--navy);letter-spacing:-.2px">Zestawienie kosztów miesięcznych</span>
      </div>
    <table class="ct" style="margin:0">
      <thead>
        <tr>
          <th>Składnik</th>
          <th>Model obecny</th>
          <th style="color:#C8973A">Model Eliton Prime™</th>
          <th>Różnica</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Ile płacisz za ZUS zamiast wynagrodzenia netto?<br/><span style="font-size:8px;opacity:.55;font-weight:400">Koszt brutto przed korektą struktury — suma dla całego zespołu</span></td>
          <td style="color:#C0392B;font-weight:700">${fmtK2(totalStd)} zł</td>
          <td>${fmtK2(kostBez)} zł</td>
          <td class="neg">&minus;${fmtK2(totalStd - kostBez)} zł <span style="font-size:8px;font-weight:400;opacity:.7">*</span></td>
        </tr>
        <tr>
          <td>Wynagrodzenie Stratton za wdrożenie i obsługę<br/><span style="font-size:8px;opacity:.65;font-weight:400"><strong style="font-size:9.5px;color:#C0392B;font-weight:700;opacity:1">28%</strong> wartości nominalnej voucherów — jedyny koszt po stronie firmy</span></td>
          <td class="muted">—</td>
          <td>${fmtK2(totalProv)} zł</td>
          <td class="muted" style="font-size:9px">koszt usługi</td>
        </tr>
        <tr>
          <td>Tyle będziesz płacić za ten sam zespół po wdrożeniu<br/><span style="font-size:8px;opacity:.55;font-weight:400">Nowy całkowity koszt zatrudnienia — brutto + obsługa Stratton</span></td>
          <td style="color:#C0392B;font-weight:700">${fmtK2(totalStd)} zł</td>
          <td>${fmtK2(totalNew)} zł</td>
          <td class="neg">&minus;${fmtK2(monthlySavings)} zł</td>
        </tr>
        <tr class="tot">
          <td>Gotówka wracająca do firmy każdego miesiąca</td>
          <td>—</td>
          <td>—</td>
          <td><strong>+ ${fmtK2(monthlySavings)} zł</strong></td>
        </tr>
      </tbody>
    </table>
    <div style="font-size:7.5px;color:var(--muted);padding:4px 16px 5px;line-height:1.4">
      * Oszczędność brutto wygenerowana przez optymalizację struktury zatrudnienia, przed potrąceniem opłaty serwisowej Eliton Prime™.
    </div>
    </div>

    <!-- BAR 1: KOSZT FIRMY — porównanie wizualne -->
    <div style="border:1px solid #DDD8CE;overflow:hidden">
      <div style="padding:8px 16px;background:#F7F6F4;border-bottom:1px solid #DDD8CE;display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:10.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#1A1F3C">Całkowity koszt zatrudnienia ${n} os. / miesiąc</div>
        <div style="font-size:9px;font-weight:600;color:#C0392B">różnica: −${fmtK2(monthlySavings)} zł / mc</div>
      </div>
      <div style="padding:7px 16px 5px;background:#FDF5F5;display:flex;align-items:center;gap:14px">
        <div style="width:120px;flex-shrink:0">
          <div style="font-size:7.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#C0392B;margin-bottom:3px">Model obecny</div>
          <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:#8B1A1A;line-height:1">${fmtK2(totalStd)} zł</div>
        </div>
        <div style="flex:1;height:22px;background:#FDEAEA;border-radius:2px;overflow:hidden">
          <div style="height:100%;width:100%;background:linear-gradient(90deg,#E87878,#C03030);border-radius:2px"></div>
        </div>
      </div>
      <div style="padding:5px 16px 7px;background:#F4FAF7;border-top:1px solid #E0EDE6;display:flex;align-items:center;gap:14px">
        <div style="width:120px;flex-shrink:0">
          <div style="font-size:7.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#2D6A4A;margin-bottom:3px">Eliton Prime™</div>
          <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:#1A4A30;line-height:1">${fmtK2(totalNew)} zł</div>
        </div>
        <div style="flex:1;height:22px;background:#DCF0E4;border-radius:2px;overflow:hidden">
          <div style="height:100%;width:${pctNew}%;background:linear-gradient(90deg,#52B87A,#2A7A48);border-radius:2px"></div>
        </div>
        <div style="font-size:13px;font-weight:800;color:#1E6B42;flex-shrink:0">−${fmtK2(monthlySavings)} zł</div>
      </div>
    </div>

    <!-- BAR 2: INWESTYCJA vs ZWROT -->
    <div style="border:1px solid #DDD8CE;overflow:hidden">
      <div style="padding:8px 16px;background:#F7F6F4;border-bottom:1px solid #DDD8CE;display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:10.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#1A1F3C">Twoja inwestycja vs miesięczny zwrot</div>
        <div style="font-size:9px;font-weight:600;color:#2D6A4A">ROI: ${roiMultiple}× — za każdą złotówkę płaconą Stratton odzyskujesz ${roiMultiple} zł</div>
      </div>
      <div style="padding:7px 16px 5px;background:#FFFCF4;display:flex;align-items:center;gap:14px">
        <div style="width:120px;flex-shrink:0">
          <div style="font-size:7.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#8B6010;margin-bottom:3px">Płacisz Stratton</div>
          <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:#6B4010;line-height:1">${fmtK2(totalProv)} zł</div>
        </div>
        <div style="flex:1;height:22px;background:#FFF0D0;border-radius:2px;overflow:hidden">
          <div style="height:100%;width:${pctInvestment}%;background:linear-gradient(90deg,#E8B84B,#B88020);border-radius:2px"></div>
        </div>
      </div>
      <div style="padding:5px 16px 7px;background:#F4FAF7;border-top:1px solid #E0EDE6;display:flex;align-items:center;gap:14px">
        <div style="width:120px;flex-shrink:0">
          <div style="font-size:7.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#2D6A4A;margin-bottom:3px">Odzyskujesz / mc</div>
          <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:#1A4A30;line-height:1">${fmtK2(monthlySavings)} zł</div>
        </div>
        <div style="flex:1;height:22px;background:#DCF0E4;border-radius:2px;overflow:hidden">
          <div style="height:100%;width:100%;background:linear-gradient(90deg,#52B87A,#2A7A48);border-radius:2px"></div>
        </div>
        <div style="font-size:11px;font-weight:700;color:#1E6B42;flex-shrink:0">${roiMultiple}× więcej niż płacisz</div>
      </div>
    </div>

    <!-- HOOK: CO MOŻESZ ZROBIĆ — dark navy section -->
    <div style="flex:1;display:flex;flex-direction:column;background:#0D1F3C;border:1.5px solid rgba(212,185,90,.35);overflow:hidden">

      <!-- hook header -->
      <div style="padding:14px 18px 16px;background:rgba(255,255,255,.035);border-bottom:1px solid rgba(212,185,90,.2);display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:3px;height:36px;background:linear-gradient(180deg,#D4B95A,#C6A15B);border-radius:2px;flex-shrink:0"></div>
          <div>
            <div style="font-size:8px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#D4B95A;margin-bottom:6px">Twój potencjał wzrostu</div>
            <div style="font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#FFFFFF;line-height:1.2">Co możesz zrobić z <span style="color:#D4B95A">${fmtK2(yearlySavings)} zł</span> odzyskanymi rocznie?</div>
          </div>
        </div>
        <div style="font-size:9px;font-style:italic;color:rgba(255,255,255,.68);max-width:200px;text-align:right;line-height:1.6">Każda złotówka przepłacona dziś<br>to wybór — który możesz zmienić już teraz.</div>
      </div>

      <!-- 4 panels, stretch to fill remaining height -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;margin-top:auto;margin-bottom:60px">

        <!-- CASH -->
        <div style="padding:14px 13px 14px;border-right:1px solid rgba(255,255,255,.07);border-top:3px solid #D4B95A;background:rgba(212,185,90,.06);display:flex;flex-direction:column">
          <div>
            <div style="font-size:7.5px;font-weight:700;letter-spacing:.17em;text-transform:uppercase;color:#D4B95A;margin-bottom:6px">Firma zyskuje cash</div>
            <div style="font-family:'Playfair Display',serif;font-size:28px;font-weight:700;color:#D4B95A;line-height:1">${fmtK2(bonusPool)}&thinsp;<span style="font-size:13px;font-weight:400">zł</span></div>
          </div>
          <div style="font-size:9.5px;color:rgba(255,255,255,.82);line-height:1.55;margin-top:13px">roczna nadwyżka gotówkowa — do podziału lub reinwestycji według decyzji zarządu</div>
        </div>

        <!-- ETAT -->
        <div style="padding:14px 13px 14px;border-right:1px solid rgba(255,255,255,.07);border-top:3px solid #38BDF8;background:rgba(56,189,248,.05);display:flex;flex-direction:column">
          <div>
            <div style="font-size:7.5px;font-weight:700;letter-spacing:.17em;text-transform:uppercase;color:#38BDF8;margin-bottom:6px">Firma rośnie</div>
            <div style="font-family:'Playfair Display',serif;font-size:28px;font-weight:700;color:#38BDF8;line-height:1">${newHires}&thinsp;<span style="font-size:13px;font-weight:400">etatu</span></div>
          </div>
          <div style="font-size:9.5px;color:rgba(255,255,255,.82);line-height:1.55;margin-top:13px">ekwiwalent nowych stanowisk — finansowanych wyłącznie z odzyskanych środków ZUS</div>
        </div>

        <!-- PROJEKTY -->
        <div style="padding:14px 13px 14px;border-right:1px solid rgba(255,255,255,.07);border-top:3px solid #FB923C;background:rgba(251,146,60,.05);display:flex;flex-direction:column">
          <div>
            <div style="font-size:7.5px;font-weight:700;letter-spacing:.17em;text-transform:uppercase;color:#FB923C;margin-bottom:6px">Projekty odblokowujesz</div>
            <div style="font-family:'Playfair Display',serif;font-size:28px;font-weight:700;color:#FB923C;line-height:1">teraz</div>
          </div>
          <div style="font-size:9.5px;color:rgba(255,255,255,.82);line-height:1.55;margin-top:13px">sprzęt, technologia, remont — inwestycje, które czekały na budżet, przestają czekać</div>
        </div>

        <!-- PRACOWNIK -->
        <div style="padding:14px 13px 14px;border-top:3px solid #34D399;background:rgba(52,211,153,.05);display:flex;flex-direction:column">
          <div>
            <div style="font-size:7.5px;font-weight:700;letter-spacing:.17em;text-transform:uppercase;color:#34D399;margin-bottom:6px">Pracownik odczuwa</div>
            <div style="font-family:'Playfair Display',serif;font-size:28px;font-weight:700;color:#34D399;line-height:1">do +10%</div>
          </div>
          <div style="font-size:9.5px;color:rgba(255,255,255,.82);line-height:1.55;margin-top:13px">wyższe wynagrodzenie netto — bez wzrostu kosztów płacowych pracodawcy</div>
        </div>

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
      <div class="footer-confidential">Dokument poufny &nbsp;·&nbsp; Strona 2 / 5</div>
    </div>
  </div>
</div>`;
};