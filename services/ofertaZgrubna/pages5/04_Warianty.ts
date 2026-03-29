import type { SimulationParams } from '../types';
import { fmtK2 } from '../shared';
import { generateFooterWithPage } from '../../offerPdfV3/components';

export const generateWariantyV5 = (p: SimulationParams, date: string): string => {
  const { monthlySavings } = p.simulation;

  return `
<!-- ════ STR 4 — WARIANTY WDROŻENIA ════ -->
<div class="page">
  <div class="ph">
    <div class="ph-left">
      <div class="tag">04 · Warianty Wdrożenia</div>
      <div class="title">Wybierz wariant odpowiedni dla Twojej firmy</div>
    </div>
    <div class="ph-right">ANALIZA WSTĘPNA<br>${date}<br>STRONA 4/5</div>
  </div>
  <div class="pb">

    <p style="margin-bottom:14px;font-size:11px;color:#2A2F55;line-height:1.65">
      Każdy wariant daje Państwu <strong>tę samą kalkulację i pełną obsługę prawną</strong>.
      Wariant <strong>Eliton Prime™ PLUS</strong> przyspiesza wdrożenie z 4–6 tygodni do <strong style="color:#8B3A1A">14 dni</strong>,
      obniża prowizję EBS do <strong style="color:#8B3A1A">26%</strong>,
      chroni Zarząd polisą D&amp;O <strong style="color:#8B3A1A">do 30 mln zł</strong>
      i zapewnia dedykowanego opiekuna przez cały czas wdrożenia.
      Jeśli Państwa firma szuka maksymalnego tempa i pełnej ochrony prawnej — Eliton Prime™ PLUS jest
      wariantem, który jest rekomendowany. Zestawienie szczegółowe poniżej.
    </p>

    <!-- VARIANT COMPARISON — jasne tło -->
    <div style="border:1px solid #D4B95A;background:#fff;overflow:hidden">

      <!-- nagłówek tabeli -->
      <div style="display:grid;grid-template-columns:1fr 80px 80px 190px;background:#0D1F3C;align-items:stretch">
        <div style="padding:10px 16px;font-size:8.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.72)">Co dostajesz w ramach wdrożenia</div>
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border-left:1px solid rgba(255,255,255,.08);padding:8px 4px;text-align:center">
          <span style="font-size:8.5px;font-weight:700;letter-spacing:.04em;color:rgba(255,255,255,.9)">Eliton Prime™</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border-left:1px solid rgba(212,175,90,.25);background:rgba(212,175,90,.07);padding:8px 4px;text-align:center">
          <span style="font-size:8.5px;font-weight:700;letter-spacing:.04em;color:#D4AA5A">✦ Eliton Prime™</span>
          <span style="font-size:8.5px;font-weight:700;letter-spacing:.04em;color:#D4AA5A">PLUS</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border-left:1px solid rgba(212,175,90,.25);background:rgba(212,175,90,.07);padding:8px 16px;text-align:center">
          <span style="font-size:8px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#D4AA5A">REKOMENDUJEMY</span>
          <span style="font-size:8px;font-weight:700;letter-spacing:.06em;color:#D4AA5A">Eliton Prime™ PLUS</span>
        </div>
      </div>

      <!-- wiersze cech -->
      <div style="display:grid;grid-template-columns:1fr 80px 80px 190px;border-bottom:1px solid #EDE8DE;background:#FAFAF7">
        <div style="padding:9px 16px">
          <div style="font-size:10.5px;font-weight:600;color:#1A1F3C">Kalkulacja i pełna dokumentacja prawna</div>
          <div style="font-size:9px;color:#6B6B8A;margin-top:2px">indywidualna analiza + komplet dokumentów wdrożeniowych</div>
        </div>
        <div style="display:flex;align-items:center;justify-content:center;border-left:1px solid #EDE8DE"><span style="font-size:16px;color:#2E7D52;font-weight:700;line-height:1">✓</span></div>
        <div style="display:flex;align-items:center;justify-content:center;border-left:1px solid rgba(212,175,90,.3);background:rgba(212,175,90,.04)"><span style="font-size:16px;color:#C6A15B;font-weight:700;line-height:1">✓</span></div>
        <div style="padding:9px 16px;border-left:1px solid rgba(212,175,90,.3);background:rgba(212,175,90,.04);display:flex;align-items:center">
          <div style="font-size:8.5px;color:#8B6010;line-height:1.5;font-style:italic">Identyczne w obu wariantach — punkt startowy każdego wdrożenia</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 80px 80px 190px;border-bottom:1px solid #EDE8DE;background:#fff">
        <div style="padding:9px 16px">
          <div style="font-size:10.5px;font-weight:600;color:#1A1F3C">Szkolenie kadry + obsługa kontroli ZUS/PIP</div>
          <div style="font-size:9px;color:#6B6B8A;margin-top:2px">przygotowanie HR i obsługa ewentualnych inspekcji</div>
        </div>
        <div style="display:flex;align-items:center;justify-content:center;border-left:1px solid #EDE8DE"><span style="font-size:16px;color:#2E7D52;font-weight:700;line-height:1">✓</span></div>
        <div style="display:flex;align-items:center;justify-content:center;border-left:1px solid rgba(212,175,90,.3);background:rgba(212,175,90,.04)"><span style="font-size:16px;color:#C6A15B;font-weight:700;line-height:1">✓</span></div>
        <div style="padding:9px 16px;border-left:1px solid rgba(212,175,90,.3);background:rgba(212,175,90,.04);display:flex;align-items:center">
          <div style="font-size:8.5px;color:#8B6010;line-height:1.5;font-style:italic">Identyczne w obu wariantach — Twój zespół jest gotowy</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 80px 80px 190px;border-bottom:1px solid #EDE8DE;background:#FAFAF7">
        <div style="padding:9px 16px">
          <div style="font-size:10.5px;font-weight:600;color:#1A1F3C">Niższa prowizja EBS — <span style="color:#C6A15B">26%</span> zamiast 28–31%</div>
          <div style="font-size:9px;color:#6B6B8A;margin-top:2px">realnie niższy koszt obsługi każdego etatu</div>
        </div>
        <div style="display:flex;align-items:center;justify-content:center;border-left:1px solid #EDE8DE"><span style="font-size:14px;color:#CCC;line-height:1">—</span></div>
        <div style="display:flex;align-items:center;justify-content:center;border-left:1px solid rgba(212,175,90,.3);background:rgba(212,175,90,.04)"><span style="font-size:16px;color:#C6A15B;font-weight:700;line-height:1">✓</span></div>
        <div style="padding:9px 16px;border-left:1px solid rgba(212,175,90,.3);background:rgba(212,175,90,.04);display:flex;align-items:center">
          <div style="font-size:8.5px;color:#8B3A1A;font-weight:600;line-height:1.5">→ każdy etat kosztuje mniej od pierwszej wypłaty</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 80px 80px 190px;border-bottom:1px solid #EDE8DE;background:#fff">
        <div style="padding:9px 16px">
          <div style="font-size:10.5px;font-weight:600;color:#1A1F3C">Wdrożenie priorytetowe — <span style="color:#C6A15B">14 dni</span></div>
          <div style="font-size:9px;color:#6B6B8A;margin-top:2px">zamiast standardowych 4–6 tygodni</div>
        </div>
        <div style="display:flex;align-items:center;justify-content:center;border-left:1px solid #EDE8DE"><span style="font-size:14px;color:#CCC;line-height:1">—</span></div>
        <div style="display:flex;align-items:center;justify-content:center;border-left:1px solid rgba(212,175,90,.3);background:rgba(212,175,90,.04)"><span style="font-size:16px;color:#C6A15B;font-weight:700;line-height:1">✓</span></div>
        <div style="padding:9px 16px;border-left:1px solid rgba(212,175,90,.3);background:rgba(212,175,90,.04);display:flex;align-items:center">
          <div style="font-size:8.5px;color:#8B3A1A;font-weight:600;line-height:1.5">→ oszczędności zaczynają wpływać o 4 tyg. wcześniej</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 80px 80px 190px;border-bottom:1px solid #EDE8DE;background:#FAFAF7">
        <div style="padding:9px 16px">
          <div style="font-size:10.5px;font-weight:600;color:#1A1F3C">Dodatkowe <span style="color:#C6A15B">+4%</span> świadczeń dla pracowników</div>
          <div style="font-size:9px;color:#6B6B8A;margin-top:2px">wyższe benefity bez wzrostu kosztów pracodawcy</div>
        </div>
        <div style="display:flex;align-items:center;justify-content:center;border-left:1px solid #EDE8DE"><span style="font-size:14px;color:#CCC;line-height:1">—</span></div>
        <div style="display:flex;align-items:center;justify-content:center;border-left:1px solid rgba(212,175,90,.3);background:rgba(212,175,90,.04)"><span style="font-size:16px;color:#C6A15B;font-weight:700;line-height:1">✓</span></div>
        <div style="padding:9px 16px;border-left:1px solid rgba(212,175,90,.3);background:rgba(212,175,90,.04);display:flex;align-items:center">
          <div style="font-size:8.5px;color:#8B3A1A;font-weight:600;line-height:1.5">→ pracownik odczuwa podwyżkę — firma nie płaci więcej</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 80px 80px 190px;border-bottom:1px solid #EDE8DE;background:#fff">
        <div style="padding:9px 16px">
          <div style="font-size:10.5px;font-weight:600;color:#1A1F3C">Polisa D&amp;O Leadenhall — do <span style="color:#C6A15B">30 mln zł</span></div>
          <div style="font-size:9px;color:#6B6B8A;margin-top:2px">ochrona Zarządu na wypadek kwestionowania przez ZUS</div>
        </div>
        <div style="display:flex;align-items:center;justify-content:center;border-left:1px solid #EDE8DE"><span style="font-size:14px;color:#CCC;line-height:1">—</span></div>
        <div style="display:flex;align-items:center;justify-content:center;border-left:1px solid rgba(212,175,90,.3);background:rgba(212,175,90,.04)"><span style="font-size:16px;color:#C6A15B;font-weight:700;line-height:1">✓</span></div>
        <div style="padding:9px 16px;border-left:1px solid rgba(212,175,90,.3);background:rgba(212,175,90,.04);display:flex;align-items:center">
          <div style="font-size:8.5px;color:#8B3A1A;font-weight:600;line-height:1.5">→ Zarząd otrzymuje w cenie polisę OC, która zabezpiecza majątek członków zarządu i osób decyzyjnych</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 80px 80px 190px;border-bottom:1px solid #EDE8DE;background:#FAFAF7">
        <div style="padding:9px 16px">
          <div style="font-size:10.5px;font-weight:600;color:#1A1F3C">Dedykowany opiekun wdrożenia</div>
          <div style="font-size:9px;color:#6B6B8A;margin-top:2px">jedna osoba odpowiedzialna za całość procesu</div>
        </div>
        <div style="display:flex;align-items:center;justify-content:center;border-left:1px solid #EDE8DE"><span style="font-size:14px;color:#CCC;line-height:1">—</span></div>
        <div style="display:flex;align-items:center;justify-content:center;border-left:1px solid rgba(212,175,90,.3);background:rgba(212,175,90,.04)"><span style="font-size:16px;color:#C6A15B;font-weight:700;line-height:1">✓</span></div>
        <div style="padding:9px 16px;border-left:1px solid rgba(212,175,90,.3);background:rgba(212,175,90,.04);display:flex;align-items:center">
          <div style="font-size:8.5px;color:#8B3A1A;font-weight:600;line-height:1.5">→ zero przekazywania między działami</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 80px 80px 190px;background:#fff">
        <div style="padding:9px 16px">
          <div style="font-size:10.5px;font-weight:600;color:#1A1F3C">+2% wynagrodzenie za obsługę dla HR / Księgowość</div>
          <div style="font-size:9px;color:#6B6B8A;margin-top:2px">motywacja wewnętrzna do sprawnego wdrożenia</div>
        </div>
        <div style="display:flex;align-items:center;justify-content:center;border-left:1px solid #EDE8DE"><span style="font-size:14px;color:#CCC;line-height:1">—</span></div>
        <div style="display:flex;align-items:center;justify-content:center;border-left:1px solid rgba(212,175,90,.3);background:rgba(212,175,90,.04)"><span style="font-size:16px;color:#C6A15B;font-weight:700;line-height:1">✓</span></div>
        <div style="padding:9px 16px;border-left:1px solid rgba(212,175,90,.3);background:rgba(212,175,90,.04);display:flex;align-items:center">
          <div style="font-size:8.5px;color:#8B3A1A;font-weight:600;line-height:1.5">→ Księgowość/kadry otrzymują wynagrodzenie za prowadzenie programu EBS w firmie</div>
        </div>
      </div>

      <!-- stopka tabeli z CTA -->
      <div style="display:grid;grid-template-columns:1fr 80px 80px 190px;background:#0D1F3C;border-top:2px solid #D4AA5A">
        <div style="padding:12px 16px;display:flex;flex-direction:column;justify-content:center;gap:4px">
          <div style="font-family:'Playfair Display',serif;font-size:13px;font-weight:400;font-style:italic;color:#FFFFFF;line-height:1.3">Masz pytania o warianty?</div>
          <div style="font-size:9px;color:rgba(255,255,255,.65);line-height:1.5">Twój doradca omówi różnice i pomoże wybrać wariant dopasowany do Twojej firmy.</div>
        </div>
        <div style="border-left:1px solid rgba(255,255,255,.08)"></div>
        <div style="border-left:1px solid rgba(212,175,90,.25);background:rgba(212,175,90,.07)"></div>
        <div style="padding:10px 16px;border-left:1px solid rgba(212,175,90,.25);background:rgba(212,175,90,.1);display:flex;flex-direction:column;justify-content:center;gap:3px">
          <div style="font-size:9.5px;color:#D4AA5A;font-weight:700">Omów Eliton Prime™ PLUS z Doradcą</div>
          ${p.advisorName ? `<div style="font-size:9px;font-weight:600;color:#FFFFFF;line-height:1.4">${p.advisorName}</div>` : ''}
          ${p.advisorPhone ? `<div style="font-size:10.5px;font-weight:700;color:#D4AA5A;letter-spacing:.04em;margin-top:3px">${p.advisorPhone}</div>` : ''}
        </div>
      </div>
    </div>

    <div style="margin-top:12px;padding:10px 16px;background:#FFF9F0;border:1px solid #E8C97A;border-left:4px solid #C6A15B">
      <div style="font-size:10px;color:#6B4A10;line-height:1.6">Każdy miesiąc bez wdrożenia to <strong style="color:#8B3A1A">${fmtK2(monthlySavings)} zł</strong>, które Twoja firma wpłaca do ZUS zamiast do własnej kieszeni — i których nie odzyska.</div>
    </div>

    <!-- TIMELINE — wypełnia pozostałą przestrzeń strony -->
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;background:#0D1F3C;border:1.5px solid rgba(212,185,90,.28);padding:18px 24px">
      <div style="font-size:7.5px;letter-spacing:.15em;text-transform:uppercase;color:#D4AA5A;margin-bottom:12px">Po wyborze wariantu — co się dzieje dalej</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr">
        <div style="padding-right:18px">
          <div style="font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:#D4AA5A;line-height:1">01</div>
          <div style="font-size:9.5px;font-weight:700;color:#FFFFFF;margin:7px 0 5px;line-height:1.3">Podpisanie umowy</div>
          <div style="font-size:8.5px;color:rgba(255,255,255,.78);line-height:1.6">Wybierasz wariant i podpisujesz dokumenty — zdalnie lub stacjonarnie. Twój doradca prowadzi Cię przez cały proces.</div>
        </div>
        <div style="padding:0 18px;border-left:1px solid rgba(212,185,90,.2)">
          <div style="font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:#D4AA5A;line-height:1">02</div>
          <div style="font-size:9.5px;font-weight:700;color:#FFFFFF;margin:7px 0 5px;line-height:1.3">Dokumentacja</div>
          <div style="font-size:8.5px;color:rgba(255,255,255,.78);line-height:1.6">Kompletujemy regulamin i indywidualne aneksy dla każdego pracownika. Wszystko zgodne z aktualnymi przepisami.</div>
        </div>
        <div style="padding:0 18px;border-left:1px solid rgba(212,185,90,.2)">
          <div style="font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:#D4AA5A;line-height:1">03</div>
          <div style="font-size:9.5px;font-weight:700;color:#FFFFFF;margin:7px 0 5px;line-height:1.3">Szkolenie HR i kadry</div>
          <div style="font-size:8.5px;color:rgba(255,255,255,.78);line-height:1.6">Szkolimy Twój zespół i przygotowujemy go na ewentualne pytania kontroli ZUS lub PIP.</div>
        </div>
        <div style="padding-left:18px;border-left:1px solid rgba(212,185,90,.2)">
          <div style="font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:#D4AA5A;line-height:1">04</div>
          <div style="font-size:9.5px;font-weight:700;color:#FFFFFF;margin:7px 0 5px;line-height:1.3">Pierwsze oszczędności</div>
          <div style="font-size:8.5px;color:rgba(255,255,255,.78);line-height:1.6">Od pierwszej listy płac nowy system działa. Oszczędności wpływają — Państwo widzą efekty od razu.</div>
        </div>
      </div>
    </div>

    <div style="padding:12px 16px;background:#F8F6F2;border-top:1px solid #DDD8CE">
      <p style="font-size:8.5px;color:#5A5A7A;line-height:1.65;margin:0">
        Wynagrodzenie za obsługę EBS jest naliczane od wartości nominalnej świadczeń rzeczowych przypisanych pracownikom w danym miesiącu rozliczeniowym — nie od wartości oskładkowanych składek ZUS.
        Wariant Eliton Prime™ PLUS dostępny przy podjęciu decyzji w ciągu <strong>14 dni</strong> od przedstawienia kalkulacji.
        Dla firm z większymi wolumenami oferta jest przygotowywana indywidualnie.
      </p>
    </div>

  </div>
  ${generateFooterWithPage(4, 5)}
</div>`;
};
