import { Firma } from '../../../entities/company/model';
import { generatePageHeaderV3, generateFooterV3 } from '../components';

export const generatePage04V3 = (firma: Firma, totals: any, date: string, sector: string) => `
<div class="page">

  ${generatePageHeaderV3('Czym Jest — i Czym Nie Jest — Eliton Prime™', '04. Czym jest i czym nie jest', 4, 11, date)}
<div class="page-body" style="padding-top:20px">

    <p class="lead">Transparentność jest fundamentem naszej pracy. Zanim podejmiesz decyzję, chcemy żebyś wiedział dokładnie: co ten model robi, czego nie robi, kiedy jest dla Ciebie idealny — i kiedy nie jest.</p>

    <!-- CZYM JEST / CZYM NIE JEST -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--border);margin-bottom:16px">

      <div style="background:#d1fae5;padding:12px 16px">
        <div style="font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--success);margin-bottom:8px;display:flex;align-items:center;gap:8px">
          <span style="font-size:16px">✓</span> Czym Eliton Prime™ JEST
        </div>
        <ul class="cl" style="margin:0">
          <li style="border-color:rgba(27,94,32,.15)"><strong>Legalnym wyłączeniem z podstawy ZUS</strong> — na podstawie §2 ust. 1 pkt 26 Rozp. MPiPS, obowiązującego od 1998 r.</li>
          <li style="border-color:rgba(27,94,32,.15)"><strong>Zmianą struktury wynagrodzenia</strong> — część wypłaty zastępowana jest imiennym świadczeniem rzeczowym o tej samej wartości nominalnej.</li>
          <li style="border-color:rgba(27,94,32,.15)"><strong>Narzędziem retencji pracowników</strong> — pracownik otrzymuje wyższe świadczenia rzeczowe (voucher EBS) i dostęp do benefitów niedostępnych w modelu standardowym. Wzrost wartości odczuwalny jak podwyżka, lecz realizowany przez świadczenie, nie gotówkę.</li>
          <li style="border-color:rgba(27,94,32,.15)"><strong>Rozwiązaniem transparentnym dla ZUS</strong> — wszystkie składki odprowadzane są terminowo, wyłączeniu podlega wyłącznie podstawa oskładkowania w zakresie świadczenia rzeczowego.</li>
          <li style="border-color:rgba(27,94,32,.15);border-bottom:none"><strong>Systemem w pełni dokumentowanym</strong> — uchwała Zarządu, imienne przypisanie świadczeń, logi EBS, raporty miesięczne dostępne na każde wezwanie organu.</li>
        </ul>
      </div>

      <div style="background:#fee2e2;padding:12px 16px">
        <div style="font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#DC2626;margin-bottom:8px;display:flex;align-items:center;gap:8px">
          <span style="font-size:16px">✗</span> Czym Eliton Prime™ NIE JEST
        </div>
        <ul class="cl" style="margin:0">
          <li style="border-color:rgba(155,28,28,.12)"><strong>Nie jest agresywną optymalizacją podatkową</strong> — nie tworzymy fikcyjnych spółek, nie zmieniamy formy zatrudnienia na B2B, nie wyprowadzamy majątku.</li>
          <li style="border-color:rgba(155,28,28,.12)"><strong>Nie jest działaniem na granicy prawa</strong> — przepis §2 ust. 1 pkt 26 ma 28-letnią historię stosowania i jest znany ZUS.</li>
          <li style="border-color:rgba(155,28,28,.12)"><strong>Nie jest bonem podarunkowym ani kartą pre-paid</strong> — voucher EBS nie jest środkiem płatniczym, nie można go wymienić na gotówkę u pracodawcy.</li>
          <li style="border-color:rgba(155,28,28,.12)"><strong>Nie jest obejściem prawa pracy</strong> — pracownik zachowuje pełną ochronę KP, wynagrodzenie zasadnicze nie spada poniżej ustawowego minimum.</li>
          <li style="border-color:rgba(155,28,28,.12);border-bottom:none"><strong>Nie jest rozwiązaniem dla każdej firmy</strong> — poniżej pokazujemy, kiedy model działa, a kiedy nie.</li>
        </ul>
      </div>

    </div>

    <!-- KIEDY DZIAŁA / KIEDY NIE DZIAŁA -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--border);margin-bottom:12px">

      <div style="background:var(--white);padding:12px 16px;border-top:3px solid var(--success)">
        <div style="font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--success);margin-bottom:8px">Kiedy model działa najlepiej</div>
        <div style="display:flex;flex-direction:column;gap:7px">
          <div style="display:flex;gap:8px;align-items:flex-start">
            <div style="width:16px;height:16px;background:var(--success);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px"><span style="font-size:9px;color:var(--white);font-weight:700">✓</span></div>
            <div><div style="font-size:11px;font-weight:600;color:var(--sp-navy)">Stałe zatrudnienie (UoP lub UZ)</div><div style="font-size:10.5px;color:var(--sp-text-muted)">Wynagrodzenie regularne, powtarzalne co miesiąc — model generuje stałe oszczędności.</div></div>
          </div>
          <div style="display:flex;gap:8px;align-items:flex-start">
            <div style="width:16px;height:16px;background:var(--success);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px"><span style="font-size:9px;color:var(--white);font-weight:700">✓</span></div>
            <div><div style="font-size:11px;font-weight:600;color:var(--sp-navy)">Wynagrodzenie ≥ 4 000 zł brutto</div><div style="font-size:10.5px;color:var(--sp-text-muted)">Przy wyższych wynagrodzeniach część objęta świadczeniem rzeczowym jest większa — oszczędności proporcjonalnie wyższe.</div></div>
          </div>
          <div style="display:flex;gap:8px;align-items:flex-start">
            <div style="width:16px;height:16px;background:var(--success);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px"><span style="font-size:9px;color:var(--white);font-weight:700">✓</span></div>
            <div><div style="font-size:11px;font-weight:600;color:var(--sp-navy)">Pracownicy gotowi korzystać z benefitów cyfrowych</div><div style="font-size:10.5px;color:var(--sp-text-muted)">Platforma EBS wymaga aktywności pracownika — modele zdalne, administracyjne i biurowe sprawdzają się najlepiej.</div></div>
          </div>
          <div style="display:flex;gap:8px;align-items:flex-start">
            <div style="width:16px;height:16px;background:var(--success);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px"><span style="font-size:9px;color:var(--white);font-weight:700">✓</span></div>
            <div><div style="font-size:11px;font-weight:600;color:var(--sp-navy)">Pracodawca chce wzmocnić retencję bez wzrostu kosztów</div><div style="font-size:10.5px;color:var(--sp-text-muted)">Model PLUS finansuje +4% wartości świadczeń rzeczowych dla pracownika ze środków Stratton Prime — realny benefit w postaci vouchera EBS, bez dodatkowego wydatku pracodawcy.</div></div>
          </div>
        </div>
      </div>

      <div style="background:var(--white);padding:12px 16px;border-top:3px solid #DC2626">
        <div style="font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#DC2626;margin-bottom:8px">Kiedy model może nie być optymalny</div>
        <div style="display:flex;flex-direction:column;gap:7px">
          <div style="display:flex;gap:8px;align-items:flex-start">
            <div style="width:16px;height:16px;background:#DC2626;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px"><span style="font-size:9px;color:var(--white);font-weight:700">—</span></div>
            <div><div style="font-size:11px;font-weight:600;color:var(--sp-navy)">Wynagrodzenie bliskie minimum ustawowego</div><div style="font-size:10.5px;color:var(--sp-text-muted)">Przy wynagrodzeniu ≤ minimalnego, wynagrodzenie zasadnicze nie może spaść — przestrzeń do wyłączenia jest ograniczona lub zerowa.</div></div>
          </div>
          <div style="display:flex;gap:8px;align-items:flex-start">
            <div style="width:16px;height:16px;background:#DC2626;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px"><span style="font-size:9px;color:var(--white);font-weight:700">—</span></div>
            <div><div style="font-size:11px;font-weight:600;color:var(--sp-navy)">Pracownicy w szczególnych grupach ZUS</div><div style="font-size:10.5px;color:var(--sp-text-muted)">Np. studenci do 26 r.ż. (zerowe składki) — model ZUS nie generuje oszczędności, bo podstawa i tak jest zerowa.</div></div>
          </div>
          <div style="display:flex;gap:8px;align-items:flex-start">
            <div style="width:16px;height:16px;background:#DC2626;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px"><span style="font-size:9px;color:var(--white);font-weight:700">—</span></div>
            <div><div style="font-size:11px;font-weight:600;color:var(--sp-navy)">Zatrudnienie nieregularne lub sezonowe</div><div style="font-size:10.5px;color:var(--sp-text-muted)">Model wymaga cykliczności — przy umowach krótkoterminowych lub zmiennych wymiarach etatu koszty wdrożenia mogą przewyższyć oszczędności.</div></div>
          </div>
          <div style="display:flex;gap:8px;align-items:flex-start">
            <div style="width:16px;height:16px;background:#DC2626;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px"><span style="font-size:9px;color:var(--white);font-weight:700">—</span></div>
            <div><div style="font-size:11px;font-weight:600;color:var(--sp-navy)">Brak zgody pracowników</div><div style="font-size:10.5px;color:var(--sp-text-muted)">Uczestnictwo jest dobrowolne. Jeśli pracownicy masowo odmówią, oszczędności będą proporcjonalnie niższe od kalkulacji.</div></div>
          </div>
        </div>
      </div>

    </div>

    <div class="box-gold">
      <div style="font-size:9.5px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--sp-gold);margin-bottom:8px">Wniosek z kalkulacji dla Twojej firmy</div>
      <p style="font-size:12px;color:var(--sp-text);line-height:1.65">Przeanalizowaliśmy Twoją listę płac pod kątem wszystkich powyższych czynników. <strong>Na podstawie przesłanej listy płac model jest dopasowany do Twojej struktury zatrudnienia.</strong> żadna ze znanych przesłanek wykluczających nie zachodzi &mdash; łączne wynagrodzenie brutto (${new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN'}).format(totals.sumaBrutto)}) daje przestrzeń do wdrożenia, a prognozowana oszczędność ${new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN'}).format(totals.savingsPlus)} miesięcznie jest kalkulowana konserwatywnie. Wyniki mogą się różnić w zależności od indywidualnych okoliczności.</p>
    </div>

  </div>
  

${generateFooterV3()}
</div>

<!-- ══════════════════ STR 5 (dawna 4) — TWARDE DANE FINANSOWE ══════════════════ -->
`;
