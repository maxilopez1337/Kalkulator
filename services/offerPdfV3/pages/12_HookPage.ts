/* eslint-disable @typescript-eslint/no-explicit-any */
import { Firma } from '../../../entities/company/model';

export const generateHookPageV3 = (_firma: Firma, totals: any, _date: string, _sector: string) => {
  const fmtK = (v: number) =>
    new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(Math.round(v));
  const annualSavings = totals.savingsPlus * 12;
  const extraNetto = totals.sumaNettoElitonPlus - totals.sumaNetto;

  const opiekunNazwa = _firma.opiekunNazwa || 'Michał Zawadzki';
  const opiekunEmail = _firma.opiekunEmail || 'm.zawadzki@stratton-prime.pl';
  const opiekunTelefon = _firma.opiekunTelefon || '+48 730 268 668';

  return `
<div class="page hook-page" style="background:#f8f7f4">
  <div class="hook-body">

    <!-- HEADLINE -->
    <div style="padding-bottom:28px;border-bottom:1px solid rgba(13,31,60,.1)">
      <div class="hook-tag" style="color:rgba(176,144,32,.75)">Stratton Prime · Eliton Prime™</div>
      <h2 class="hook-headline" style="font-size:52px;margin-bottom:12px;color:#0D1F3C">
        Jak będzie wyglądać<br>Twoja firma za <em>rok</em>?
      </h2>
      <p style="font-size:13px;color:rgba(13,31,60,.45);max-width:560px;line-height:1.75;margin:0">
        Przy tej samej liście płac. Tych samych ${totals.count} pracownikach. Bez żadnych zmian w zatrudnieniu.
      </p>
    </div>

    <!-- VISION PILLARS — FINANSE / LUDZIE / BEZPIECZEŃSTWO -->
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:32px 0">

      <div style="font-size:8px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:rgba(176,144,32,.75);margin-bottom:22px">
        Co zmienia się od pierwszego miesiąca wdrożenia
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:rgba(13,31,60,.08)">

        <!-- FINANSE -->
        <div style="background:#fff;padding:32px 28px 28px">
          <div style="font-size:8px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--sp-gold);margin-bottom:16px">FINANSE</div>
          <div style="display:flex;align-items:baseline;gap:5px;margin-bottom:8px">
            <span style="font-family:var(--font-serif);font-size:46px;font-weight:700;color:#0D1F3C;line-height:.9;letter-spacing:-.015em">${fmtK(annualSavings)}</span>
            <span style="font-size:18px;font-weight:500;color:rgba(13,31,60,.38);line-height:1">zł</span>
          </div>
          <div style="font-size:9.5px;color:rgba(13,31,60,.35);letter-spacing:.04em;margin-bottom:18px;text-transform:uppercase">rocznie / budżet pracowniczy</div>
          <div style="width:28px;height:2px;background:var(--sp-gold);opacity:.7;margin-bottom:16px"></div>
          <p style="font-size:11.5px;color:rgba(13,31,60,.58);line-height:1.65;margin:0">Środki pozostają w firmie — reinwestujesz je w rozwój, sprzęt lub dodatkowe benefity.</p>
        </div>

        <!-- LUDZIE -->
        <div style="background:#fffdf7;padding:32px 28px 28px;border-left:2px solid var(--sp-gold);border-right:2px solid var(--sp-gold)">
          <div style="font-size:8px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--sp-gold);margin-bottom:16px">LUDZIE</div>
          <div style="display:flex;align-items:baseline;gap:5px;margin-bottom:8px">
            <span style="font-family:var(--font-serif);font-size:46px;font-weight:700;color:#0D1F3C;line-height:.9;letter-spacing:-.015em">+${fmtK(extraNetto)}</span>
            <span style="font-size:18px;font-weight:500;color:rgba(13,31,60,.38);line-height:1">zł</span>
          </div>
          <div style="font-size:9.5px;color:rgba(13,31,60,.35);letter-spacing:.04em;margin-bottom:18px;text-transform:uppercase">wartości świadczeń / miesiąc · cały zespół</div>
          <div style="width:28px;height:2px;background:var(--sp-gold);opacity:.7;margin-bottom:16px"></div>
          <p style="font-size:11.5px;color:rgba(13,31,60,.58);line-height:1.65;margin:0">Każdy z ${totals.count} pracowników otrzymuje świadczenia rzeczowe o wyższej wartości — bez wzrostu Twoich kosztów brutto.</p>
        </div>

        <!-- BEZPIECZEŃSTWO -->
        <div style="background:#fff;padding:32px 28px 28px">
          <div style="font-size:8px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--sp-gold);margin-bottom:16px">BEZPIECZEŃSTWO</div>
          <div style="display:flex;align-items:baseline;gap:5px;margin-bottom:8px">
            <span style="font-family:var(--font-serif);font-size:46px;font-weight:700;color:#0D1F3C;line-height:.9">0</span>
          </div>
          <div style="font-size:9.5px;color:rgba(13,31,60,.35);letter-spacing:.04em;margin-bottom:18px;text-transform:uppercase">kwestionowań ZUS / Stratton Prime</div>
          <div style="width:28px;height:2px;background:var(--sp-gold);opacity:.7;margin-bottom:16px"></div>
          <p style="font-size:11.5px;color:rgba(13,31,60,.58);line-height:1.65;margin:0">Dokumentacja prawna, polisa D&amp;O Leadenhall, pełne wsparcie przy kontroli — wbudowane w cenę.</p>
        </div>

      </div>
    </div>

    <!-- CTA BLOCK -->
    <div class="hook-cta-block" style="border-top:1px solid rgba(13,31,60,.1)">
      <div class="hook-cta-left">
        <div class="hook-cta-eyebrow">Trzy kroki do pierwszych oszczędności</div>
        <div class="hook-cta-title" style="color:#0D1F3C">Podejmij decyzję już dziś.<br><span style="font-weight:400;font-size:0.85em;color:rgba(13,31,60,.45)">Wdrożenie realizujemy w 14 dni.</span></div>
        <div style="margin-top:16px;display:flex;flex-direction:column;gap:10px">
          <div class="hook-cta-step" style="color:rgba(13,31,60,.6)"><span class="n" style="background:#0D1F3C;color:#fff">1</span>Email z potwierdzeniem</div>
          <div class="hook-cta-step" style="color:rgba(13,31,60,.6)"><span class="n" style="background:#0D1F3C;color:#fff">2</span>Podpis elektroniczny (Autenti)</div>
          <div class="hook-cta-step" style="color:rgba(13,31,60,.6)"><span class="n" style="background:#0D1F3C;color:#fff">3</span>Wdrożenie — start oszczędności</div>
        </div>
      </div>
      <div class="hook-cta-right">
        <div class="hook-deadline" style="border-color:rgba(176,144,32,.4)">
          <div class="hook-deadline-label">Oferta PLUS ważna do</div>
          <div class="hook-deadline-date" style="color:var(--sp-gold)">${totals.offerDeadline}</div>
          <div class="hook-deadline-sub" style="color:rgba(13,31,60,.4)">14 dni od daty kalkulacji</div>
        </div>
        <div class="hook-contact" style="margin-top:12px;color:rgba(13,31,60,.55)">
          <strong style="color:#0D1F3C">${opiekunNazwa}</strong><br>
          ${opiekunEmail}<br>
          ${opiekunTelefon}
        </div>
      </div>
    </div>

  </div>

  <!-- BOTTOM BAR -->
  <div class="hook-pf" style="background:#0D1F3C;border-top:none;color:rgba(255,255,255,.38)">
    <span>STRATTON PRIME SP. Z O.O. · NIP: 5842867357 · KRS: 0001169520 · REGON: 541537557 · ul. Nowy Świat 42/44, 80-299 Gdańsk · biuro@stratton-prime.pl · +48 730 268 668</span>
    <span>POUFNE © 2026</span>
  </div>

  <!-- DISCLAIMER + RODO -->
  <div style="background:#ece9e3;border-top:3px solid #0D1F3C;padding:16px 72px 18px;position:relative;z-index:1">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px">
      <div>
        <div style="font-size:8px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#0D1F3C;margin-bottom:5px">Nota prawna</div>
        <p style="font-size:8.5px;color:#555;line-height:1.7;margin:0">Niniejszy dokument ma charakter informacyjny i marketingowy. Kalkulacje sporządzono na podstawie danych przekazanych przez Klienta — wyniki mają charakter szacunkowy i mogą się różnić od rzeczywistych. Dokument nie stanowi porady prawnej ani podatkowej (ustawa z dnia 5 lipca 1996 r., t.j. Dz.U. 2021 poz. 2117). Stratton Prime Sp. z o.o. rekomenduje uzyskanie indywidualnej opinii przed podjęciem decyzji.</p>
      </div>
      <div>
        <div style="font-size:8px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#0D1F3C;margin-bottom:5px">Ochrona danych (RODO)</div>
        <p style="font-size:8.5px;color:#555;line-height:1.7;margin:0">Administrator: Stratton Prime Sp. z o.o., NIP 5842867357, KRS 0001169520. Dane przetwarzane na podstawie art. 6 ust. 1 lit. b i f RODO w celu przygotowania oferty. Prawo dostępu, sprostowania, usunięcia — kontakt: biuro@stratton-prime.pl. Szczegóły: <strong>stratton-prime.pl/rodo</strong></p>
      </div>
    </div>
  </div>

</div>
`;
};
