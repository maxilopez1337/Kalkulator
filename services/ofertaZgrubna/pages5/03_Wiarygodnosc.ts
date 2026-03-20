import type { SimulationParams } from '../types';
import { radoslawZukPhotoB64 } from '../../offerPdfV3/pages/radoslawZukPhotoB64';
import {
  allianz_logo_B64, ergo_hestia_B64, generali_logo_big_B64, ladenhall_B64,
  Laven_logo_dark_B64, lloyds_logo_sized_nav__1__B64, logo_warta_B64, luxmed_B64,
  orange_B64, pzu_B64, signal_iduna_polska_logo_B64, TU_ZDROWIE_B64,
  uniqa_logo_B64, unum_B64, vienna_life_logo_B64
} from '../../offerPdfV3/pages/partners/partnersB64';

const NR_DP = '12602';

export const generateWiarygodnoscV5 = (_p: SimulationParams, date: string): string => `
<!-- ════ STR 3 — WIARYGODNOSC ════ -->
<div class="page">
  <div class="ph">
    <div class="ph-left">
      <div class="tag">03 · Dlaczego Stratton Prime</div>
      <div class="title">Wiarygodność i Bezpieczeństwo</div>
    </div>
    <div class="ph-right">ANALIZA WSTĘPNA<br>${date}<br>STRONA 3/5</div>
  </div>
  <div style="padding:20px 48px 70px;flex:1;display:flex;flex-direction:column;overflow:hidden">

    <!-- Radosław Żuk: photo left, data right -->
    <div style="display:grid;grid-template-columns:150px 1fr;border:1px solid #DDD8CE;flex-shrink:0;margin-bottom:15px">
      <div style="overflow:hidden;min-height:150px;border-right:1px solid #DDD8CE">
        <img src="${radoslawZukPhotoB64}" style="width:150px;height:100%;object-fit:cover;object-position:center top;display:block">
      </div>
      <div style="padding:16px 22px;display:flex;flex-direction:column;justify-content:center">
        <div style="font-size:7.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#B09020;margin-bottom:5px">◈ Za bezpieczeństwo prawne oferty odpowiada</div>
        <div style="font-family:'Playfair Display',serif;font-size:19px;color:#0D1F3C;margin-bottom:1px">Radosław Żuk</div>
        <div style="font-size:8px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#B09020;margin-bottom:7px">Doradca Podatkowy</div>
        <p style="font-size:10.5px;color:#8896A8;line-height:1.6;margin-bottom:7px;max-width:520px">Specjalista w zakresie prawa ubezpieczeń społecznych i prawa podatkowego. Wieloletnie doświadczenie w obsłudze kontroli ZUS i postępowań podatkowych dla klientów MŚP i korporacji. Autor niezależnej analizy prawno-podatkowej modelu Eliton Prime™ (luty 2026).</p>
        <div style="display:flex;gap:18px">
          <span style="font-size:8.5px;color:#8896A8">Nr wpisu: <strong style="color:#0D1F3C">${NR_DP}</strong></span>
          <span style="font-size:8.5px;color:#8896A8">Kancelaria Żuk Pośpiech Sp. k. · kzp.law</span>
        </div>
      </div>
    </div>

    <!-- Cytat z analizy -->
    <div style="padding:14px 20px;border-left:4px solid #B09020;background:#F8F7F4;flex-shrink:0;margin-bottom:15px">
      <div style="font-size:7.5px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#B09020;margin-bottom:7px">Niezależna analiza prawno-podatkowa · luty 2026</div>
      <p style="font-family:'Playfair Display',serif;font-size:12.5px;color:#0D1F3C;line-height:1.75;font-style:italic;margin:0 0 5px">&bdquo;Przy spełnieniu warunków formalnych wdrożenia nie zachodzą podstawy do kwestionowania modelu Eliton Prime™ przez organy ZUS ani podatkowe.&rdquo;</p>
      <div style="font-size:8.5px;color:#8896A8">Analiza dostępna do wglądu na etapie due diligence</div>
    </div>

    <!-- Dlaczego Stratton Prime — navy 3 kolumny -->
    <div style="background:#0D1F3C;padding:18px 20px;flex-shrink:0;margin-bottom:15px">
      <div style="font-size:7.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#F2E8C8;margin-bottom:11px">Dlaczego Stratton Prime?</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px">
        <div style="display:flex;align-items:flex-start;gap:9px">
          <div style="width:22px;height:22px;background:#B09020;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0"><span style="font-size:10px;font-weight:700;color:#fff">1</span></div>
          <div><div style="font-size:19px;font-weight:700;color:#D4AF5A;line-height:1;margin-bottom:2px">28 lat</div><div style="font-size:10.5px;font-weight:600;color:#fff;margin-bottom:2px">podstawy prawnej modelu</div><div style="font-size:9.5px;color:rgba(255,255,255,.5);line-height:1.55">Rozporządzenie składkowe z 1998 r. — nasz zespół specjalizuje się w tych przepisach od lat i zna je od podszewki.</div></div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:9px">
          <div style="width:22px;height:22px;background:#B09020;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0"><span style="font-size:10px;font-weight:700;color:#fff">2</span></div>
          <div><div style="font-size:19px;font-weight:700;color:#D4AF5A;line-height:1;margin-bottom:2px">~28%</div><div style="font-size:10.5px;font-weight:600;color:#fff;margin-bottom:2px">niższe koszty pracy</div><div style="font-size:9.5px;color:rgba(255,255,255,.5);line-height:1.55">Średnio raportowany wynik po pierwszych 3 miesiącach współpracy — niezależnie od branży i wielkości firmy.</div></div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:9px">
          <div style="width:22px;height:22px;background:#B09020;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0"><span style="font-size:10px;font-weight:700;color:#fff">3</span></div>
          <div><div style="font-size:19px;font-weight:700;color:#D4AF5A;line-height:1;margin-bottom:2px">0</div><div style="font-size:10.5px;font-weight:600;color:#fff;margin-bottom:2px">skutecznych kwestionowań ZUS</div><div style="font-size:9.5px;color:rgba(255,255,255,.5);line-height:1.55">Żaden model Stratton Prime nie został cofnięty w toku kontroli ZUS ani US.</div></div>
        </div>
      </div>
      <div style="margin-top:10px;padding-top:9px;border-top:1px solid rgba(255,255,255,.1);display:grid;grid-template-columns:1fr 1fr;gap:9px">
        <div style="font-size:9px;color:rgba(255,255,255,.65);line-height:1.5"><span style="color:#D4AF5A;font-weight:600">Branża usługowa · 175 prac.</span><br/>→ <strong style="color:rgba(255,255,255,.9)">~1 763 597 zł / rok</strong> oszczędności dla pracodawcy</div>
        <div style="font-size:9px;color:rgba(255,255,255,.65);line-height:1.5"><span style="color:#D4AF5A;font-weight:600">Obiekt hotelarski, woj. pomorskie · 30 prac.</span><br/>→ <strong style="color:rgba(255,255,255,.9)">~302 340 zł / rok</strong> szacunek z analizy wstępnej</div>
      </div>
    </div>

    <!-- Zakres wsparcia prawnego: 3 kafle -->
    <div style="background:#F8F7F4;padding:13px 20px;flex-shrink:0;margin-bottom:15px">
      <div style="font-size:7.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#0D1F3C;margin-bottom:7px">Zakres wsparcia prawnego dla klientów Stratton Prime</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#DDD8CE">
        <div style="background:#fff;padding:14px 16px;border-top:3px solid #B09020">
          <div style="font-size:18px;color:#B09020;margin-bottom:5px;line-height:1">§</div>
          <div style="font-size:10px;font-weight:600;color:#0D1F3C;margin-bottom:4px">Obsługa kontroli</div>
          <div style="font-size:9px;color:#8896A8;line-height:1.5">ZUS, PIP i KAS — po udzieleniu pełnomocnictwa, pełna reprezentacja. (BEZPŁATNIE)</div>
        </div>
        <div style="background:#fff;padding:14px 16px;border-top:3px solid #B09020">
          <div style="font-size:13px;font-weight:700;color:#B09020;margin-bottom:5px;line-height:1">D&amp;O</div>
          <div style="font-size:10px;font-weight:600;color:#0D1F3C;margin-bottom:4px">Polisa D&amp;O</div>
          <div style="font-size:9px;color:#8896A8;line-height:1.5">Leadenhall — do 30 mln zł. Ochrona Zarządu i wdrożonego rozwiązania.</div>
        </div>
        <div style="background:#fff;padding:14px 16px;border-top:3px solid #B09020">
          <div style="font-size:18px;color:#B09020;margin-bottom:5px;line-height:1">↻</div>
          <div style="font-size:10px;font-weight:600;color:#0D1F3C;margin-bottom:4px">Monitoring zmian</div>
          <div style="font-size:9px;color:#8896A8;line-height:1.5">Bieżący nadzór legislacyjny — klient informowany przy każdej zmianie przepisów.</div>
        </div>
      </div>
    </div>

    <!-- Nasi Partnerzy -->
    <div style="flex:1;background:#fff;padding:10px 20px;display:flex;flex-direction:column">
      <div style="font-size:9.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#8896A8;margin-bottom:4px">Nasi Partnerzy</div>
      <div style="font-size:10.5px;color:#0D1F3C;font-weight:500;margin-bottom:9px">Współpracujemy wyłącznie z instytucjami o ugruntowanej pozycji rynkowej, gwarantującymi pełne bezpieczeństwo wdrażanych rozwiązań.</div>
      <div style="flex:1;display:grid;grid-template-columns:repeat(8,1fr);grid-template-rows:1fr 1fr;gap:8px 16px;align-items:center">
        <img src="${allianz_logo_B64}" style="max-height:30px;width:100%;height:100%;object-fit:contain;object-position:center" />
        <img src="${ergo_hestia_B64}" style="max-height:30px;width:100%;height:100%;object-fit:contain;object-position:center" />
        <img src="${generali_logo_big_B64}" style="max-height:30px;width:100%;height:100%;object-fit:contain;object-position:center" />
        <img src="${ladenhall_B64}" style="max-height:30px;width:100%;height:100%;object-fit:contain;object-position:center" />
        <img src="${Laven_logo_dark_B64}" style="max-height:30px;width:100%;height:100%;object-fit:contain;object-position:center" />
        <img src="${lloyds_logo_sized_nav__1__B64}" style="max-height:30px;width:100%;height:100%;object-fit:contain;object-position:center" />
        <img src="${logo_warta_B64}" style="max-height:30px;width:100%;height:100%;object-fit:contain;object-position:center" />
        <img src="${luxmed_B64}" style="max-height:30px;width:100%;height:100%;object-fit:contain;object-position:center" />
        <img src="${orange_B64}" style="max-height:30px;width:100%;height:100%;object-fit:contain;object-position:center" />
        <img src="${pzu_B64}" style="max-height:30px;width:100%;height:100%;object-fit:contain;object-position:center" />
        <img src="${signal_iduna_polska_logo_B64}" style="max-height:30px;width:100%;height:100%;object-fit:contain;object-position:center" />
        <img src="${TU_ZDROWIE_B64}" style="max-height:30px;width:100%;height:100%;object-fit:contain;object-position:center" />
        <img src="${uniqa_logo_B64}" style="max-height:30px;width:100%;height:100%;object-fit:contain;object-position:center" />
        <img src="${unum_B64}" style="max-height:30px;width:100%;height:100%;object-fit:contain;object-position:center" />
        <img src="${vienna_life_logo_B64}" style="max-height:30px;width:100%;height:100%;object-fit:contain;object-position:center" />
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
      <div class="footer-confidential">Dokument poufny &nbsp;·&nbsp; Strona 3 / 5</div>
    </div>
  </div>
</div>`;