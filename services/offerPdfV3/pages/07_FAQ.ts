import { Firma } from '../../../entities/company/model';
import { generatePageHeaderV3, generateFooterV3 } from '../components';

export const generatePage10V3 = (firma: Firma, date: string, sector: string) => `
<div class="page">

  ${generatePageHeaderV3('Pytania i Odpowiedzi', '07. Pytania i odpowiedzi', 7, 11, date)}
<div class="page-body" style="padding-top:8px">

    <!-- górna część — 6 pytań pełną szerokością -->
    <div class="faq-item" style="padding:5px 0 4px">
      <div class="faq-tag faq-tag-law">Prawo</div>
      <div class="faq-q" style="line-height:1.3;margin-bottom:2px">Na jakiej podstawie prawnej działa model i jak jest potwierdzona jego legalność?</div>
      <p class="faq-a" style="line-height:1.45;margin:0 0 2px">§2 ust. 1 pkt 26 Rozp. MPiPS — przepis nieprzerwanie obowiązujący od 28 lat. Legalność potwierdzają: interpretacja ZUS DI/100000/43/620/2023, wyrok SN II UK 337/09 oraz niezależna analiza Kancelarii Żuk Pośpiech (luty 2026).</p>
      <div class="faq-ref">→ Pełna analiza: Przewodnik Prawny Eliton Prime™, str. 3–6</div>
    </div>
    <div class="faq-item" style="padding:5px 0 4px">
      <div class="faq-tag faq-tag-fin">Finanse</div>
      <div class="faq-q" style="line-height:1.3;margin-bottom:2px">Czy oszczędności pozwalają sfinansować podwyżki?</div>
      <p class="faq-a" style="line-height:1.45;margin:0 0 2px">Tak. W wariancie PLUS Stratton Prime dofinansowuje +4% wartości świadczeń rzeczowych dla pracownika z własnych środków — koszt pracodawcy mimo to spada. Wygenerowaną pulę oszczędności rekomendujemy rozdzielić strategicznie: część przeznaczyć na podwyżkę wynagrodzenia netto pracowników — bezpośrednio wzmacniając retencję zespołu bez wzrostu obciążeń ZUS — a pozostałą część zatrzymać jako zysk operacyjny firmy.</p>
      <div class="faq-ref">→ Szczegóły: Przewodnik Prawny, str. 3</div>
    </div>
    <div class="faq-item" style="padding:5px 0 4px">
      <div class="faq-tag faq-tag-risk">Ryzyko</div>
      <div class="faq-q" style="line-height:1.3;margin-bottom:2px">Co w sytuacji kontroli ZUS, PIP lub KAS?</div>
      <p class="faq-a" style="line-height:1.45;margin:0 0 2px"><strong>Tarcza Ochronna™.</strong> Doradcy Podatkowi Kancelarii Żuk Pośpiech obsługują postępowania kontrolne w ramach umowy. Kompletna ścieżka audytowa: uchwała Zarządu, zindywidualizowane przypisanie świadczeń i logi EBS.</p>
      <div class="faq-ref">→ Szczegóły ryzyk: Przewodnik Prawny, str. 12–13</div>
    </div>
    <div class="faq-item" style="padding:5px 0 4px">
      <div class="faq-tag faq-tag-fin">Finanse</div>
      <div class="faq-q" style="line-height:1.3;margin-bottom:2px">Czy wartość vouchera EBS jest przychodem pracownika? Jak to wpływa na PIT?</div>
      <p class="faq-a" style="line-height:1.45;margin:0 0 2px">Tak — voucher jest przychodem ze stosunku pracy (art. 12 uPIT) opodatkowanym na zasadach ogólnych. Model obniża podstawę ZUS, nie zwalnia z PIT. Pracodawca wykazuje wartość vouchera w PIT-11.</p>
      <div class="faq-ref">→ Szczegóły: Przewodnik Prawny, str. 9–10</div>
    </div>
    <div class="faq-item" style="padding:5px 0 4px">
      <div class="faq-tag faq-tag-risk">Ryzyko</div>
      <div class="faq-q" style="line-height:1.3;margin-bottom:2px">Co się stanie, jeśli przepisy się zmienią?</div>
      <p class="faq-a" style="line-height:1.45;margin:0 0 2px">Dział Prawny monitoruje zmiany legislacyjne na bieżąco. W razie istotnej zmiany informujemy i dostosowujemy model — lub umożliwiamy rozwiązanie umowy z 1-miesięcznym wypowiedzeniem, bez kar.</p>
      <div class="faq-ref">→ Szczegóły: Przewodnik Prawny, str. 13</div>
    </div>
    <div class="faq-item" style="padding:5px 0 4px">
      <div class="faq-tag faq-tag-fin">Emerytura</div>
      <div class="faq-q" style="line-height:1.3;margin-bottom:2px">Czy niższe składki ZUS nie obniżą przyszłej emerytury pracownika?</div>
      <p class="faq-a" style="line-height:1.45;margin:0 0 2px">Tak — niższa podstawa ZUS przekłada się na niższe świadczenie z I filaru. Oficjalna prognoza ZUS (FUS 2024) wskazuje jednak, że stopa zastąpienia dla osób wchodzących dziś na rynek pracy spadnie poniżej 30%, a Instytut Emerytalny szacuje ją na 23–26%. System repartycyjny nie zapewni godnej emerytury niezależnie od wysokości składek. Wygenerowane oszczędności rekomendujemy przeznaczyć na podwyżkę netto lub dofinansowanie III filaru (PPK, IKZE, IKE) — Stratton Prime oferuje wsparcie wdrożeniowe w tym zakresie.</p>
      <div class="faq-ref">→ ZUS: Prognoza FUS 2024 · Instytut Emerytalny: <em>Emerytalna Pułapka</em> (marzec 2025) &nbsp;<a href="https://www.instytutemerytalny.pl/wp-content/uploads/2025/03/Raport-Emerytalna-Pulapka-19032025.pdf" style="color:var(--sp-navy);background:var(--sp-gold);padding:1px 6px;border-radius:2px;font-weight:700;font-size:8.5px;letter-spacing:.04em;text-decoration:none;vertical-align:middle">↓ RAPORT PDF</a></div>
    </div>

    <!-- dolna część — 4 pytania w 2 kolumnach -->
    <div class="faq-cols" style="margin-top:2px">
      <div>
        <div class="faq-item" style="padding:5px 0 4px">
          <div class="faq-tag faq-tag-law">Prawo</div>
          <div class="faq-q" style="line-height:1.3;margin-bottom:2px">Czy model obejmuje umowy zlecenie?</div>
          <p class="faq-a" style="line-height:1.45;margin:0 0 2px">Tak — §5 ust. 2 pkt 2 Rozp. MPiPS wprost rozszerza zwolnienie ZUS na zleceniobiorców. Wystarczy Instrukcja przyznawania świadczeń (art. 353¹ KC).</p>
          <div class="faq-ref">→ Przewodnik Prawny, str. 5–6</div>
        </div>
        <div class="faq-item" style="border-bottom:none;padding:5px 0 4px">
          <div class="faq-tag faq-tag-proc">Proces</div>
          <div class="faq-q" style="line-height:1.3;margin-bottom:2px">Jak wygląda proces uzyskania zgody pracownika?</div>
          <p class="faq-a" style="line-height:1.45;margin:0 0 2px">Zmiana wymaga aneksu podpisanego przez pracownika — uczestnictwo dobrowolne. Pracownik, który odmówi, pozostaje na dotychczasowych warunkach (min. 4 806 zł brutto w 2026).</p>
          <div class="faq-ref">→ Przewodnik Prawny, str. 8</div>
        </div>
      </div>
      <div>
        <div class="faq-item" style="padding:5px 0 4px">
          <div class="faq-tag faq-tag-proc">Proces</div>
          <div class="faq-q" style="line-height:1.3;margin-bottom:2px">Jak model wpływa na pracę księgowości?</div>
          <p class="faq-a" style="line-height:1.45;margin:0 0 2px">Minimalnie — jedna nota księgowa miesięcznie (nie faktura VAT; voucher jest bonem MPV, art. 8b ustawy o VAT). Platforma EBS eksportuje raporty CSV i PDF gotowe do PIT-11.</p>
          <div class="faq-ref">→ Przewodnik Prawny, str. 10–11</div>
        </div>
        <div class="faq-item" style="border-bottom:none;padding:5px 0 4px">
          <div class="faq-tag faq-tag-proc">Proces</div>
          <div class="faq-q" style="line-height:1.3;margin-bottom:2px">Jakie są warunki wypowiedzenia umowy?</div>
          <p class="faq-a" style="line-height:1.45;margin:0 0 2px">Umowa na czas nieokreślony z 1-miesięcznym wypowiedzeniem. Brak kar umownych i dodatkowych opłat poza wynagrodzeniem za obsługę EBS.</p>
          <div class="faq-ref">→ Wzór umowy dostępny przed podpisaniem — zapytaj opiekuna</div>
        </div>
      </div>
    </div>
  </div>


${generateFooterV3()}
</div>

<!-- ══════════════════ STR 11 — OŚ PROCESU + KOSZT ZWŁOKI ══════════════════ -->
`;
