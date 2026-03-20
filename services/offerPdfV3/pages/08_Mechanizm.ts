import { Firma } from '../../../entities/company/model';
import { generatePageHeaderV3, generateFooterV3 } from '../components';
import { tarczaOchronnaB64 } from './tarczaB64';

export const generate4przesankiwyczeniaZUS2ust1pkt26RozpMPiPSV3 = (firma: Firma, date: string, sector: string) => `
<div class="page">

  ${generatePageHeaderV3('Mechanizm i Bezpieczeństwo', '08. Mechanizm i bezpieczeństwo', 8, 11, date)}
<div class="page-body">
    <!-- baner załącznik -->
    <div style="background:var(--sp-gray);border:1px solid var(--border);border-left:4px solid var(--sp-gold);padding:7px 16px;margin-bottom:16px;display:flex;align-items:center;gap:12px">
      <span style="font-size:9px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--sp-gold);white-space:nowrap">ZAŁĄCZNIK TECHNICZNY</span>
      <span style="width:1px;height:16px;background:var(--border);flex-shrink:0"></span>
      <span style="font-size:10.5px;color:var(--sp-text-muted)">Ten rozdział zawiera szczegółową podstawę prawną i metodologię modelu. Składowany tutaj jako materiał referencyjny — działamy na jego podstawie od dnia 1. wdrożenia.</span>
    </div>

    <!-- 3 kroki -->
    <div class="g3" style="margin-bottom:18px">
      <div class="gc">
        <div class="gc-lbl">Krok 1</div>
        <div style="font-size:14px;font-weight:600;color:var(--sp-navy);margin-bottom:4px">Zmiana struktury wynagrodzenia</div>
        <p style="font-size:11.5px;color:var(--sp-text-muted);line-height:1.6">Część wynagrodzenia przyznawana jest w formie imiennego świadczenia rzeczowego — Vouchera EBS. Podstawa: <strong>§2 ust. 1 pkt 26 Rozp. MPiPS z 18.12.1998 r.</strong> (Dz.U. 1998 nr 161 poz. 1106).</p>
      </div>
      <div class="gc">
        <div class="gc-lbl">Krok 2</div>
        <div style="font-size:14px;font-weight:600;color:var(--sp-navy);margin-bottom:4px">Zamknięty katalog usług EBS</div>
        <p style="font-size:11.5px;color:var(--sp-text-muted);line-height:1.6">Pracownik korzysta z usług: pakiety medyczne, VPN, narzędzia AI, wellbeing, ubezpieczenia, telekomunikacja. Voucher nie jest środkiem pieniężnym — nie podlega wymianie na gotówkę.</p>
      </div>
      <div class="gc">
        <div class="gc-lbl">Krok 3</div>
        <div style="font-size:14px;font-weight:600;color:var(--sp-navy);margin-bottom:4px">Wyłączenie z podstawy ZUS</div>
        <p style="font-size:11.5px;color:var(--sp-text-muted);line-height:1.6">Świadczenie rzeczowe spełniające 4 przesłanki ustawowe nie wchodzi do podstawy wymiaru składek ZUS — ani pracowniczych, ani pracodawcy.</p>
      </div>
    </div>

    <!-- 4 przesłanki -->
    <div style="position:relative">
      <img src="data:image/png;base64,${tarczaOchronnaB64}" style="position:absolute;right:-27px;bottom:47px;height:1000px;width:auto;z-index:10;pointer-events:none" />
    <h3 class="sh">4 przesłanki wyłączenia ZUS — §2 ust. 1 pkt 26 Rozp. MPiPS</h3>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--border);margin-bottom:16px">

      <div style="background:var(--white);padding:14px 18px;border-left:3px solid var(--sp-gold)">
        <div style="font-size:8.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--sp-gold);margin-bottom:4px">Przesłanka 1 · Rzeczowość świadczenia</div>
        <div style="font-size:12.5px;font-weight:600;color:var(--sp-navy);margin-bottom:4px">Zamknięty katalog — nie środek pieniężny</div>
        <p style="font-size:11px;color:var(--sp-text-muted);line-height:1.55;margin-bottom:6px">Voucher EBS uprawnia wyłącznie do usług z predefiniowanego katalogu. Nie jest instrumentem płatniczym ani nie podlega wypłacie w gotówce — wyklucza kwalifikację jako „korzyść pieniężna".</p>
        <div style="font-size:10px;color:var(--sp-gold);font-weight:600">→ Pełna analiza: Przewodnik Prawny, str. 3–4</div>
      </div>

      <div style="background:var(--white);padding:14px 18px;border-left:3px solid var(--sp-gold)">
        <div style="font-size:8.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--sp-gold);margin-bottom:4px">Przesłanka 2 · Częściowa odpłatność pracownika</div>
        <div style="font-size:12.5px;font-weight:600;color:var(--sp-navy);margin-bottom:4px">Ceny w EBS niższe niż detaliczne</div>
        <p style="font-size:11px;color:var(--sp-text-muted);line-height:1.55;margin-bottom:6px">Pracownik korzysta z usług po cenach preferencyjnych (5–20% poniżej cen detalicznych). Platforma EBS dokumentuje porównanie cen przy każdej transakcji — dowód gotowy dla ZUS.</p>
        <div style="font-size:10px;color:var(--sp-gold);font-weight:600">→ Pełna analiza: Przewodnik Prawny, str. 4–5</div>
      </div>

      <div style="background:var(--white);padding:14px 18px;border-left:3px solid var(--sp-gold)">
        <div style="font-size:8.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--sp-gold);margin-bottom:4px">Przesłanka 3 · Ujęcie w przepisach o wynagradzaniu</div>
        <div style="font-size:12.5px;font-weight:600;color:var(--sp-navy);margin-bottom:4px">Uchwała Zarządu (art. 77² KP) · Instrukcja (art. 353¹ KC)</div>
        <p style="font-size:11px;color:var(--sp-text-muted);line-height:1.55;margin-bottom:3px"><strong>UoP:</strong> Regulamin Wynagradzania (art. 77² KP) lub Uchwała Zarządu — wyrok SN <strong>II UK 337/09</strong>.</p>
        <p style="font-size:11px;color:var(--sp-text-muted);line-height:1.55;margin-bottom:6px"><strong>UZ:</strong> Instrukcja przyznawania świadczeń (art. 353¹ KC) — interpretacja ZUS <strong>DI/100000/43/620/2023</strong>.</p>
        <div style="font-size:10px;color:var(--sp-gold);font-weight:600">→ Wzory dokumentów: Przewodnik Prawny, str. 6–8</div>
      </div>

      <div style="background:var(--white);padding:14px 18px;border-left:3px solid var(--sp-gold)">
        <div style="font-size:8.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--sp-gold);margin-bottom:4px">Przesłanka 4 · Pieniężne określenie wartości</div>
        <div style="font-size:12.5px;font-weight:600;color:var(--sp-navy);margin-bottom:4px">Nominalna wartość Vouchera EBS w PLN</div>
        <p style="font-size:11px;color:var(--sp-text-muted);line-height:1.55;margin-bottom:6px">Wartość świadczenia wyrażona kwotowo w PLN, imiennie przypisana pracownikowi. Raport miesięczny EBS gotowy do przedłożenia ZUS. Skutki PIT: przychód z <strong>art. 12 ust. 1 uPIT</strong> (UoP) lub <strong>art. 13 pkt 8 uPIT</strong> (UZ).</p>
        <div style="font-size:10px;color:var(--sp-gold);font-weight:600">→ Rozliczenie PIT i KUP CIT: Przewodnik Prawny, str. 9–11</div>
      </div>

    </div>

    <!-- Tarcza Ochronna -->
    <div class="shield">
      <div class="shield-title">Tarcza Ochronna™ Stratton Prime</div>
      <p class="shield-sub" style="color:#fff">Reprezentacja i dokumentacja w ramach umowy — na każdym etapie wdrożenia i ewentualnych postępowań kontrolnych. <span style="color:rgba(255,255,255,.7);font-size:11px">→ Pełny zakres: Przewodnik Prawny, str. 12–13</span></p>
      <div class="shield-cols">
        <div><div class="sh-ct">Opinia Prawna Kancelarii Żuk Pośpiech <span style="font-size:8px;background:rgba(212,175,90,.2);color:var(--sp-gold-light);padding:1px 5px;border-radius:2px;vertical-align:middle">odpłatne</span></div><p class="sh-cx" style="color:#fff;font-size:9.5px">Certyfikowana analiza prawno-podatkowa wdrożenia EBS dla Twojej Spółki — zgodność prawna, CIT/PIT/ZUS i rekomendacje wdrożeniowe. <span style="white-space:nowrap">Zamówienia: biuro@stratton-prime.pl · kzp.law</span></p></div>
        <div><div class="sh-ct">Polisa D&O Leadenhall<br><span style="font-size:9px;font-weight:400;color:rgba(255,255,255,.55)">— do 30 mln zł</span></div><p class="sh-cx" style="color:#fff;font-size:9.5px">Ubezpieczenie D&O LW020/D&O/01 — ochrona Zarządu i wdrożonego rozwiązania (wariant PLUS).</p></div>
        <div><div class="sh-ct">Reprezentacja prawna<br><span style="font-size:8px;background:rgba(212,175,90,.2);color:var(--sp-gold-light);padding:1px 5px;border-radius:2px">PLUS — bez dopłat</span></div><p class="sh-cx" style="color:#fff;font-size:9.5px">Obsługa kontroli ZUS, PIP i KAS przez radców prawnych Kancelarii Żuk Pośpiech — w wariancie PLUS realizowana w ramach obowiązującej umowy, bez dodatkowych kosztów.</p></div>
      </div>
    </div>
    </div>
  </div>
  

${generateFooterV3()}
</div>

<!-- ══════════════════ STR 3.5 — CZYM JEST / CZYM NIE JEST ══════════════════ -->
`;
