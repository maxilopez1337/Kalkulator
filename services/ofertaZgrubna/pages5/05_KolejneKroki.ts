import type { SimulationParams } from '../types';
import { fmtK2 } from '../shared';
import { generateFooterWithPage } from '../../offerPdfV3/components';

export const generateCTAV5 = (p: SimulationParams, offerValidity: string, date: string): string => {
    const { monthlySavings } = p.simulation;
    const advisorName  = p.advisorName  || 'Twój Doradca';
    const advisorPhone = p.advisorPhone || '';
    const advisorEmail = p.advisorEmail || '';

    return `
<!-- ════ STR 5 — CTA ════ -->
<div class="page">
  <div class="ph">
    <div class="ph-left">
      <div class="tag">05 · Kolejne Kroki</div>
      <div class="title">Twoja Droga do Oszczędności</div>
    </div>
    <div class="ph-right">ANALIZA WSTĘPNA<br>${date}<br>STRONA 5/5</div>
  </div>
  <div class="pb" style="display:flex;flex-direction:column;justify-content:space-between;padding-bottom:70px">

    <p class="lead" style="margin-bottom:0">Diagnoza jest gotowa. Potrzebujemy jednej rzeczy: <strong>Państwa listy płac — w 48h przygotowujemy dokładną kalkulację nadpłaty i kompletną propozycję korekty.</strong> Dalszą obsługę przejmuje nasz zespół. Kalkulacja bezpłatna, bez zobowiązań.</p>

    <!-- TIMELINE (graficzny) -->
    <div style="background:#F8F7F4;border:1px solid #DDD8CE;padding:7px 10px">

      <!-- Rząd 1: etykiety czasu / odznaki -->
      <div style="display:grid;grid-template-columns:repeat(6,1fr);text-align:center;margin-bottom:4px">
        <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
          <span style="display:inline-block;background:#2D7A4F;color:#fff;font-size:6.5px;font-weight:700;letter-spacing:.1em;padding:2px 8px;text-transform:uppercase">TERAZ</span>
          <span style="font-size:6.5px;font-weight:700;color:#2D7A4F;letter-spacing:.06em">JESTEŚ TUTAJ</span>
        </div>
        <div style="display:flex;align-items:flex-end;justify-content:center;padding-bottom:2px">
          <span style="font-size:8px;font-weight:700;color:#8896A8;letter-spacing:.12em">48H</span>
        </div>
        <div style="display:flex;align-items:flex-end;justify-content:center;padding-bottom:2px">
          <span style="font-size:8px;font-weight:600;color:#8896A8;letter-spacing:.1em">TYDZIEŃ 1</span>
        </div>
        <div style="display:flex;align-items:flex-end;justify-content:center;padding-bottom:2px">
          <span style="font-size:8px;font-weight:600;color:#8896A8;letter-spacing:.1em">TYDZIEŃ 2</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
          <span style="display:inline-block;background:rgba(45,122,79,.12);color:#2D7A4F;font-size:7px;font-weight:700;letter-spacing:.08em;padding:2px 8px;text-transform:uppercase">TYG. 3–4</span>
        </div>
        <div style="display:flex;align-items:flex-end;justify-content:center;padding-bottom:2px">
          <span style="font-size:8px;font-weight:600;color:#8896A8;letter-spacing:.1em">MIESIĄC 2+</span>
        </div>
      </div>

      <!-- Rząd 2: okręgi z linią łączącą -->
      <div style="position:relative;margin-bottom:4px">
        <!-- linia bazowa (szara) -->
        <div style="position:absolute;top:15px;left:8.33%;right:8.33%;height:2px;background:#DDD8CE;z-index:0"></div>
        <!-- linia aktywna (zielona → złota, kroki 1→2) -->
        <div style="position:absolute;top:15px;left:8.33%;width:16.67%;height:2px;background:linear-gradient(90deg,#2D7A4F,#D4AF5A);z-index:0"></div>
        <div style="display:grid;grid-template-columns:repeat(6,1fr);text-align:center;position:relative;z-index:1">
          <!-- 1: zielony wypełniony ✓ -->
          <div style="display:flex;justify-content:center">
            <div style="width:30px;height:30px;background:#2D7A4F;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:12px;color:#fff;box-shadow:0 0 0 4px rgba(45,122,79,.15)">✓</div>
          </div>
          <!-- 2: złoty wypełniony 2 -->
          <div style="display:flex;justify-content:center">
            <div style="width:30px;height:30px;background:#D4AF5A;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:14px;line-height:1;color:#fff;font-weight:700;box-shadow:0 0 0 4px rgba(212,175,90,.15)">2</div>
          </div>
          <!-- 3: kontur szary 3 -->
          <div style="display:flex;justify-content:center">
            <div style="width:30px;height:30px;background:#fff;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:14px;line-height:1;color:#0D1F3C;border:2px solid #C8C2BA">3</div>
          </div>
          <!-- 4: kontur szary 4 -->
          <div style="display:flex;justify-content:center">
            <div style="width:30px;height:30px;background:#fff;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:14px;line-height:1;color:#0D1F3C;border:2px solid #C8C2BA">4</div>
          </div>
          <!-- 5: kontur zielony 5 -->
          <div style="display:flex;justify-content:center">
            <div style="width:30px;height:30px;background:#fff;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:14px;line-height:1;color:#2D7A4F;border:2px solid #2D7A4F">5</div>
          </div>
          <!-- 6: granatowy wypełniony zł -->
          <div style="display:flex;justify-content:center">
            <div style="width:30px;height:30px;background:#0D1F3C;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:10px;line-height:1;font-weight:700;color:#D4AF5A">zł</div>
          </div>
        </div>
      </div>

      <!-- Rząd 3: etykiety i opisy -->
      <div style="display:grid;grid-template-columns:repeat(6,1fr);text-align:center">
        <div style="padding:0 4px">
          <div style="font-size:8.5px;font-weight:700;color:#2D7A4F;margin-bottom:2px">Analiza wstępna</div>
          <div style="font-size:7.5px;color:#8896A8;line-height:1.35">Ten dokument · szacunek na śr. parametrach</div>
        </div>
        <div style="padding:0 4px">
          <div style="font-size:8.5px;font-weight:700;color:#B09020;margin-bottom:2px">Kalkulacja indywidualna</div>
          <div style="font-size:7.5px;color:#8896A8;line-height:1.35">Lista płac → precyzyjna kalkulacja + oferta Plus<br><strong style="color:#B09020">BEZPŁATNIE</strong></div>
        </div>
        <div style="padding:0 4px">
          <div style="font-size:8.5px;font-weight:600;color:#0D1F3C;margin-bottom:2px">Decyzja</div>
          <div style="font-size:7.5px;color:#8896A8;line-height:1.35">Przeglądasz wyniki i decydujesz. Oferta Plus ważna 14 dni.</div>
        </div>
        <div style="padding:0 4px">
          <div style="font-size:8.5px;font-weight:600;color:#0D1F3C;margin-bottom:2px">Dokumentacja</div>
          <div style="font-size:7.5px;color:#8896A8;line-height:1.35">Uchwała, aneksy — przygotowuje SP</div>
        </div>
        <div style="padding:0 4px">
          <div style="font-size:8.5px;font-weight:700;color:#2D7A4F;margin-bottom:2px">Start EBS</div>
          <div style="font-size:7.5px;color:#8896A8;line-height:1.35">Pierwsze vouchery<br><strong style="color:#2D7A4F">DO 14 DNI</strong></div>
        </div>
        <div style="padding:0 4px">
          <div style="font-size:8.5px;font-weight:700;color:#0D1F3C;margin-bottom:2px">Oszczędności</div>
          <div style="font-size:7.5px;color:#8896A8;line-height:1.35"><strong style="font-size:11px;color:#0D1F3C">~${fmtK2(monthlySavings)} zł</strong><br>co miesiąc</div>
        </div>
      </div>

    </div>

    <!-- Co zawiera wdrożenie -->
    <h3 class="sh">Standard — co zawiera wdrożenie Eliton Prime™</h3>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#DDD8CE">
      <div class="sg-it"><div class="sg-ico">✓</div><div><div class="sg-title">Kalkulacja indywidualna</div><div class="sg-desc">Na podstawie Twojej listy płac — przed podpisaniem umowy. Bezpłatnie.</div></div></div>
      <div class="sg-it"><div class="sg-ico">§</div><div><div class="sg-title">Uchwała Zarządu</div><div class="sg-desc">Gotowy wzór dokumentu — na audyt ZUS od dnia 1.</div></div></div>
      <div class="sg-it"><div class="sg-ico">✎</div><div><div class="sg-title">Aneksy dla pracowników</div><div class="sg-desc">Kompletna dokumentacja dla każdego pracownika.</div></div></div>
      <div class="sg-it"><div class="sg-ico">▶</div><div><div class="sg-title">Szkolenie kadr i księg.</div><div class="sg-desc">Operacyjne wdrożenie działu kadr w 1 dzień roboczy.</div></div></div>
      <div class="sg-it"><div class="sg-ico"><svg width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.5 0.5L1 2.5V7C1 10.3 3.4 13.4 6.5 14.5C9.6 13.4 12 10.3 12 7V2.5L6.5 0.5Z" fill="#C6A15B"/><path d="M5 7.5L6.2 8.7L8.5 6" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div><div class="sg-title">Ochrona przy kontroli ZUS</div><div class="sg-desc">Pełna reprezentacja Stratton Prime przy ZUS, PIP i KAS.</div></div></div>
      <div class="sg-it" style="border:1.5px solid rgba(212,175,90,.35);background:rgba(212,175,90,.04)"><div class="sg-ico" style="color:#D4AF5A">+</div><div><div class="sg-title" style="display:flex;align-items:center;gap:6px">Bonus administracyjny<span style="font-size:6.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;background:#D4AF5A;color:#0D1F3C;padding:1.5px 5px;border-radius:3px;line-height:1.4">tylko PLUS</span></div><div class="sg-desc">2% dla kadr/księg. — finansowany przez Stratton Prime.</div></div></div>
    </div>

    <!-- PLUS hook -->
    <div style="background:linear-gradient(135deg,#0a1628 0%,#0D1F3C 60%,#112240 100%);border-top:3px solid #D4AF5A;position:relative;overflow:hidden">
      <div style="position:absolute;top:0;right:0;width:40%;height:100%;background:repeating-linear-gradient(-45deg,transparent,transparent 8px,rgba(212,175,90,.03) 8px,rgba(212,175,90,.03) 9px);pointer-events:none"></div>
      <div style="display:flex;align-items:stretch;position:relative;z-index:1">

        <!-- Lewa: badge PLUS -->
        <div style="background:rgba(212,175,90,.08);border-right:1px solid rgba(212,175,90,.2);padding:14px 24px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;flex-shrink:0">
          <div style="font-size:7px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:rgba(212,175,90,.6)">ELITON PRIME™</div>
          <div style="font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:#D4AF5A;line-height:1">PLUS</div>
        </div>

        <!-- Środek: 3 benefity -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);flex:1">
          <div style="padding:14px 20px;border-right:1px solid rgba(212,175,90,.12)">
            <div style="font-family:'Playfair Display',serif;font-size:26px;color:#D4AF5A;font-weight:700;line-height:1;margin-bottom:5px">${p.prowizjaPlus ?? 26}%</div>
            <div style="font-size:9.5px;font-weight:600;color:rgba(255,255,255,.9);margin-bottom:3px">Niższa prowizja</div>
            <div style="font-size:8px;color:rgba(255,255,255,.5);line-height:1.4">vs ${p.prowizjaStandard ?? 28}% w Standard — ${(p.prowizjaStandard ?? 28) - (p.prowizjaPlus ?? 26)}% więcej zostaje w firmie co miesiąc</div>
          </div>
          <div style="padding:14px 20px;border-right:1px solid rgba(212,175,90,.12)">
            <div style="font-family:'Playfair Display',serif;font-size:26px;color:#D4AF5A;font-weight:700;line-height:1;margin-bottom:5px">+4%</div>
            <div style="font-size:9.5px;font-weight:600;color:rgba(255,255,255,.9);margin-bottom:3px">Więcej świadczeń</div>
            <div style="font-size:8px;color:rgba(255,255,255,.5);line-height:1.4">wyższe benefity EBS dla pracowników bez dodatkowego kosztu</div>
          </div>
          <div style="padding:14px 20px">
            <div style="font-family:'Playfair Display',serif;font-size:16px;color:#D4AF5A;font-weight:700;line-height:1.1;margin-bottom:5px">~30 mln zł</div>
            <div style="font-size:9.5px;font-weight:600;color:rgba(255,255,255,.9);margin-bottom:3px">Polisa D&amp;O</div>
            <div style="font-size:8px;color:rgba(255,255,255,.5);line-height:1.4">Leadenhall — pełna ochrona zarządu przy kontroli ZUS</div>
          </div>
        </div>

      </div>
    </div>

    <!-- Navy CTA block -->
    <div class="cta-block">
      <div class="cta-eyebrow">Jeden krok dzieli Cię od dokładnych liczb</div>
      <div class="cta-h">Wyślij listę płac.<br><em>W 48h otrzymasz gotową ilustrację oszczędności.</em></div>
      <div class="cta-sub">Przesyłasz plik — my analizujemy. Kalkulacja obejmuje każdy etat, rodzaj umowy i strukturę premii. Dokładna kwota nadpłaty ZUS — nie szacunek, nie procent. Dane anonimizujemy niezwłocznie po przetworzeniu.</div>
      <div class="cta-contacts" style="justify-content:center;text-align:center">
        <div class="cc-item"><div class="cc-lbl">Doradca</div><div class="cc-val">${advisorName}</div></div>
        <div class="cc-item"><div class="cc-lbl">Telefon</div><div class="cc-val">${advisorPhone}</div></div>
        <div class="cc-item"><div class="cc-lbl">E-mail</div><div class="cc-val">${advisorEmail}</div></div>
      </div>
      <div class="cta-guar">
        <div class="cg"><strong>Bezpłatnie</strong>Kalkulacja indywidualna przed podpisaniem umowy</div>
        <div class="cg"><strong>Bez umowy wstępnej</strong>Zobowiązanie dopiero po Twojej decyzji</div>
        <div class="cg"><strong>Wyniki w liczbach</strong>Dokładna kwota — nie orientacyjny procent</div>
      </div>
    </div>

    <div class="disc">Stratton Prime Sp. z o.o. · NIP: 5842867357 · ul. Nowy Świat 42/44, 80-299 Gdańsk · stratton-prime.pl · Niniejszy dokument nie stanowi oferty w rozumieniu Kodeksu Cywilnego. Ostateczne warunki określa umowa po indywidualnej kalkulacji. Mechanizm oparty na §2 ust. 1 pkt 26 Rozporządzenia MPiPS z 18.12.1998 r. Kalkulacje mają charakter szacunkowy — rzeczywiste wyniki zależą od indywidualnej struktury zatrudnienia. · <a href="https://stratton-prime.pl/rodo" style="color:inherit;text-decoration:underline">RODO: stratton-prime.pl/rodo</a></div>

  </div>
  ${generateFooterWithPage(5, 5)}
</div>`;
};
