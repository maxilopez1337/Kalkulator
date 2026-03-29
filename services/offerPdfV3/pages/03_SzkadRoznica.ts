/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { Firma } from '../../../entities/company/model';
import { generatePageHeaderV3, generateFooterV3 } from '../components';

export const generateJakjestpodzielonawygenerowanawartoV3 = (
  firma: Firma,
  totals: any,
  date: string,
  sector: string
) => `
<div class="page">

  ${generatePageHeaderV3('Skąd Różnica? Pełny Rozkład Wartości', '03. Skąd różnica', 3, 11, date)}
<div class="page-body" style="padding:6px 40px 58px;display:flex;flex-direction:column">

    <p class="lead">Każda złotówka wygenerowanej oszczędności ma konkretny adres. Z <strong>${new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totals.efektStruktury + totals.zusSaved)} zł</strong> łącznej wartości oszczędności — pracodawca zachowuje więcej niż połowę, reszta trafia do pracowników i kadr. Poniżej pełny rozkład tych wartości.</p>

    <!-- WATERFALL DIAGRAM — wizualny rozkład -->
    <div style="margin-bottom:8px">

      <!-- Wiersz nagłówkowy -->
      <div style="display:grid;grid-template-columns:200px 1fr 100px;gap:0;border-bottom:2px solid var(--sp-navy);padding-bottom:5px;margin-bottom:0">
        <div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--sp-text-muted)">Element</div>
        <div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--sp-text-muted)">Co to oznacza</div>
        <div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--sp-text-muted);text-align:right">Kwota / m-c</div>
      </div>

      <!-- Wiersz 1 — efekt strukturalny -->
      <div style="display:grid;grid-template-columns:200px 1fr 100px;gap:0;border-bottom:1px solid var(--border);padding:7px 0;align-items:start">
        <div>
          <div style="font-size:11px;font-weight:700;color:var(--sp-navy)">Efekt strukturalny</div>
          <div style="font-size:10px;color:var(--sp-text-muted)">Zamiana części brutto na Voucher EBS</div>
        </div>
        <div style="font-size:11px;color:var(--sp-text-muted);padding-right:12px;line-height:1.5">Nowe wynagrodzenie brutto (zasadnicza + świadczenie rzeczowe brutto) wynosi <strong>${new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totals.sumaZasadnicza + totals.sumaSwiadczenieBrutto)} zł</strong> zamiast ${new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totals.sumaBrutto)} zł. Zysk strukturalny ${new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totals.efektStruktury)} zł wynika z tego, że świadczenie rzeczowe kosztuje pracodawcę mniej niż równoważntę pensję brutto &mdash; pracownik otrzymuje pełną wartość vouchera EBS.</div>
        <div style="text-align:right;background:#d1fae5;padding:6px 10px;border-top:2px solid var(--success)">
          <span style="font-family:var(--font-serif);font-size:20px;color:var(--success);font-weight:700">${new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totals.efektStruktury)} zł</span>
          <div style="font-size:9px;color:var(--success);font-weight:600">efekt zamiany</div>
        </div>
      </div>

      <!-- Wiersz 1b — ZUS pracodawcy -->
      <div style="display:grid;grid-template-columns:200px 1fr 100px;gap:0;border-bottom:1px solid var(--border);padding:7px 0;align-items:start">
        <div>
          <div style="font-size:11px;font-weight:700;color:var(--sp-navy)">ZUS pracodawcy</div>
          <div style="font-size:10px;color:var(--sp-text-muted)">§2 ust. 1 pkt 26 — niższa podstawa</div>
        </div>
        <div style="font-size:11px;color:var(--sp-text-muted);padding-right:12px;line-height:1.5">Składki ZUS pracodawcy (emerytalna, rentowa, wypadkowa) liczone od niższego brutto ${new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totals.sumaZasadnicza)} zł zamiast ${new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totals.sumaBrutto)} zł. Voucher EBS jest z tych składek wyłączony z mocy prawa.</div>
        <div style="text-align:right;background:#d1fae5;padding:6px 10px;border-top:2px solid var(--success)">
          <span style="font-family:var(--font-serif);font-size:20px;color:var(--success);font-weight:700">${new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totals.zusSaved)} zł</span>
          <div style="font-size:9px;color:var(--success);font-weight:600">ZUS pracodawcy</div>
        </div>
      </div>

      <!-- Wiersz 2 — podwyżka netto pracownika -->
      <div style="display:grid;grid-template-columns:200px 1fr 100px;gap:0;border-bottom:1px solid var(--border);padding:7px 0;background:rgba(212,175,90,.04);align-items:start">
        <div style="padding-left:14px;border-left:3px solid var(--sp-gold)">
          <div style="font-size:11px;font-weight:700;color:var(--sp-navy)">Podwyżka świadczeń rzeczowych pracownika</div>
          <div style="font-size:10px;color:var(--sp-text-muted)">+4% w formie vouchera EBS · finansowane przez SP</div>
        </div>
        <div style="font-size:11px;color:var(--sp-text-muted);padding-right:12px;line-height:1.5">Pracownik dostaje o ${new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totals.sumaRaise)} zł więcej w formie świadczenia rzeczowego (voucher EBS) każdego miesiąca — nie jako gotówkę na konto. Finansowane przez Stratton Prime w ramach modelu PLUS — nie obciąża budżetu pracodawcy.</div>
        <div style="text-align:right">
          <span style="font-family:var(--font-serif);font-size:20px;color:var(--sp-gold);font-weight:700">${new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totals.sumaRaise)} zł</span>
          <div style="font-size:9px;color:var(--sp-text-muted)">do pracownika</div>
        </div>
      </div>

      <!-- Wiersz 3 — bonus administracyjny -->
      <div style="display:grid;grid-template-columns:200px 1fr 100px;gap:0;border-bottom:1px solid var(--border);padding:7px 0;align-items:start">
        <div style="padding-left:14px;border-left:3px solid var(--sp-gold)">
          <div style="font-size:11px;font-weight:700;color:var(--sp-navy)">Bonus dla działu kadr/księgowości</div>
          <div style="font-size:10px;color:var(--sp-text-muted)">2% wartości świadczeń · finansowany przez SP</div>
        </div>
        <div style="font-size:11px;color:var(--sp-text-muted);padding-right:12px;line-height:1.5">Pracownicy kadr i księgowości obsługujący wdrożenie EBS otrzymują miesięczne wynagrodzenie za prowadzenie dokumentacji i rozliczeń. Wynosi 2% wartości świadczeń (${new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totals.sumaAdminBonus)} zł) i jest w całości finansowany przez Stratton Prime — nie przez pracodawcę.</div>
        <div style="text-align:right">
          <span style="font-family:var(--font-serif);font-size:20px;color:var(--sp-gold);font-weight:700">${new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totals.sumaAdminBonus)} zł</span>
          <div style="font-size:9px;color:var(--sp-text-muted)">do kadr i księg.</div>
        </div>
      </div>

      <!-- Wiersz 4 — opłata EBS -->
      <div style="display:grid;grid-template-columns:200px 1fr 100px;gap:0;border-bottom:1px solid var(--border);padding:7px 0;align-items:start">
        <div style="padding-left:14px;border-left:3px solid var(--sp-navy)">
          <div style="font-size:11px;font-weight:700;color:var(--sp-navy)">Opłata serwisowa EBS</div>
          <div style="font-size:10px;color:var(--sp-text-muted)">${totals.prowizjaProc}% wartości nominalnej świadczeń</div>
        </div>
        <div style="font-size:11px;color:var(--sp-text-muted);padding-right:12px;line-height:1.5">Wynagrodzenie Stratton Prime za technologię, obsługę prawną, wdrożenie, dokumentację i bieżące utrzymanie platformy EBS. Płatna przez pracodawcę. Jedyna pozycja kosztowa po stronie klienta. (Podwyżka pracownika i bonus kadr są finansowane przez Stratton w ramach pełnej opłaty za obsługę ${new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totals.commission)} zł.)</div>
        <div style="text-align:right">
          <span style="font-family:var(--font-serif);font-size:20px;color:var(--sp-navy);font-weight:700">${new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totals.commission - totals.sumaRaise - totals.sumaAdminBonus)} zł</span>
          <div style="font-size:9px;color:var(--sp-text-muted)">opłata za usługę</div>
        </div>
      </div>

      <!-- Wiersz SUMA -->
      <div style="display:grid;grid-template-columns:200px 1fr 100px;gap:0;background:var(--sp-navy);padding:11px 14px;margin-top:1px">
        <div>
          <div style="font-size:14px;font-weight:700;color:var(--sp-gold-light)">Potencjalna oszczędność pracodawcy (po odliczeniu wszystkich kosztów)</div>
          <div style="font-size:11px;color:rgba(255,255,255,.35)">Szacunkowy zysk netto w budżecie firmy</div>
        </div>
        <div style="font-size:11px;color:rgba(255,255,255,.55);padding-right:12px;line-height:1.5">Pięć strumieni wartości zsumowanych: dwa oszczędnościowe (${new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totals.efektStruktury)} i ${new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totals.zusSaved)} zł) minus trzy wypływy do pracownika, kadr i Stratton Prime. Pracodawca zatrzymuje ponad połowę wygenerowanej wartości.</div>
        <div style="text-align:right">
          <span style="font-family:var(--font-serif);font-size:26px;color:var(--sp-gold-light);font-weight:700">+${new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totals.savingsPlus)} zł</span>
          <div style="font-size:10px;color:rgba(255,255,255,.35)">miesięcznie</div>
        </div>
      </div>

    </div>

    <!-- PODZIAŁ GRAFICZNY -->
    <h3 class="sh">Jak jest podzielona wygenerowana wartość?</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:1px;background:var(--border);margin-bottom:10px">
      <div style="background:#d1fae5;padding:11px 10px;text-align:center;border-top:3px solid var(--success)">
        <div style="font-size:9.5px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--success);margin-bottom:8px">Pracodawca</div>
        <div style="font-family:var(--font-serif);font-size:24px;color:var(--success);line-height:1;margin-bottom:6px">+${new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totals.savingsPlus)} zł</div>
        <div style="font-size:12px;color:var(--sp-text-muted)">Oszczędność netto po wszystkich kosztach</div>
        <div style="margin-top:8px;font-size:11px;font-weight:600;color:var(--success)">oszczędność netto</div>
      </div>
      <div style="background:var(--sp-gray);padding:11px 10px;text-align:center;border-top:3px solid var(--sp-gold)">
        <div style="font-size:9.5px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--sp-gold);margin-bottom:6px">Pracownik</div>
        <div style="font-family:var(--font-serif);font-size:24px;color:var(--sp-gold);line-height:1;margin-bottom:6px">${new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totals.sumaRaise)} zł</div>
        <div style="font-size:12px;color:var(--sp-text-muted)">Wzrost wartości świadczeń rzeczowych co miesiąc</div>
        <div style="margin-top:8px;font-size:11px;font-weight:600;color:var(--sp-gold)">wzrost netto / m-c</div>
      </div>
      <div style="background:var(--sp-gray);padding:11px 10px;text-align:center;border-top:3px solid var(--sp-gold)">
        <div style="font-size:9.5px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--sp-gold);margin-bottom:6px">Kadry / Księgowość</div>
        <div style="font-family:var(--font-serif);font-size:24px;color:var(--sp-gold);line-height:1;margin-bottom:6px">${new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totals.sumaAdminBonus)} zł</div>
        <div style="font-size:12px;color:var(--sp-text-muted)">Bonus administracyjny za obsługę EBS</div>
        <div style="font-size:9px;color:var(--sp-text-muted);margin-top:4px">finansowane przez SP</div>
        <div style="margin-top:6px;font-size:11px;font-weight:600;color:var(--sp-gold)">bonus miesięczny</div>
      </div>
      <div style="background:var(--sp-navy);padding:11px 10px;text-align:center;border-top:3px solid rgba(255,255,255,.2)">
        <div style="font-size:9.5px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:rgba(212,175,90,.6);margin-bottom:8px">Stratton Prime (opłata)</div>
        <div style="font-family:var(--font-serif);font-size:24px;color:var(--sp-gold-light);line-height:1;margin-bottom:6px">${new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totals.commission - totals.sumaRaise - totals.sumaAdminBonus)} zł</div>
        <div style="font-size:12px;color:rgba(255,255,255,.4)">Technologia, prawo, wdrożenie, utrzymanie</div>
        <div style="margin-top:8px;font-size:11px;font-weight:600;color:var(--sp-gold-light)">opłata za usługę</div>
      </div>
    </div>

    <div class="box-gold" style="flex:1">
      <div style="font-size:9.5px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--sp-gold);margin-bottom:10px">Wniosek: model jest zaprojektowany tak, żeby wygrały trzy strony</div>
      <p style="font-size:12.5px;color:var(--sp-text-muted);line-height:1.7">Pracodawca zatrzymuje ponad połowę wygenerowanej wartości jako oszczędność netto. Pracownik dostaje realnie wyższe świadczenia rzeczowe (voucher EBS) każdego miesiąca — bez obciążenia budżetu firmy. Kadry otrzymują bonus za dodatkową pracę administracyjną. Wszystkie trzy strony zyskują realnie — z jednej puli ZUS, która wcześniej trafiała wyłącznie do systemu ubezpieczeń.</p>
    </div>

    <p style="font-size:8.5px;color:var(--sp-text-muted);line-height:1.5;margin-top:6px">Rozkład wartości obliczony dla ${totals.count} pracownik${totals.count === 1 ? 'a' : 'ów'} przy łącznym wynagrodzeniu brutto ${new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(totals.sumaBrutto)}. Wariant PLUS. Podwyżka i bonus dla kadr finansowane ze środków Stratton Prime — nie stanowią kosztu pracodawcy. Pełna kalkulacja dostępna na życzenie.</p>

  </div>
  ${generateFooterV3()}
</div>
`;
