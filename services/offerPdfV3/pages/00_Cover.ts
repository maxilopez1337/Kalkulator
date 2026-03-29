/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { Firma } from '../../../entities/company/model';
import { LOGO_OFERTA_B64 } from './logoOfertaB64';

const fmt = (v: number) =>
  new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(Math.round(v));

export const generatePage01V3 = (firma: Firma, totals: any, date: string, sector: string) => {
  const savings12 = (totals?.savingsPlus || 0) * 12;
  const n = totals?.count || 0;
  const prac = n === 1 ? 'pracownik' : n < 5 ? 'pracownicy' : 'pracowników';
  const kwalif = n > 1 && n < 5 ? 'kwalifikują się' : 'kwalifikuje się';
  const ref = `SP/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${(firma?.nip || '').slice(-3) || '001'}`;

  return `
<div class="page" style="display:flex;flex-direction:column;overflow:hidden;background:#f8f7f4">

  <!-- złoty pasek lewej krawędzi — cała strona -->
  <div style="position:absolute;top:0;left:0;width:3px;height:100%;background:var(--sp-gold);opacity:.8;z-index:3"></div>

  <!-- logo-oferta — prawa połowa, pełna wysokość strony -->
  <img src="${LOGO_OFERTA_B64}" style="position:absolute;top:0;right:0;height:100%;width:auto;object-fit:contain;object-position:right center;z-index:1;pointer-events:none;user-select:none" />

  <!-- ── TOP BAR ── -->
  <div style="padding:32px 52px 0 56px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;position:relative;z-index:2">
    <div style="display:flex;align-items:center;gap:9px">
      <div style="width:6px;height:6px;background:var(--sp-gold)"></div>
      <span style="font-size:8px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:rgba(13,31,60,.65)">STRATTON PRIME</span>
    </div>
    <span style="font-size:7px;letter-spacing:.22em;text-transform:uppercase;color:rgba(176,144,32,.6);font-weight:500">OFERTA INDYWIDUALNA</span>
  </div>

  <!-- ── CENTRUM — główna treść ── -->
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:0 52px 0 56px;position:relative;z-index:2">

    <!-- tagline / headline produktu -->
    <div style="margin-bottom:52px">
      <div style="font-size:9px;font-weight:700;letter-spacing:.26em;text-transform:uppercase;color:rgba(176,144,32,.75);margin-bottom:20px;display:flex;align-items:center;gap:12px">
        <div style="width:28px;height:1px;background:var(--sp-gold);opacity:.8"></div>
        ELITON Prime™ · Indywidualny model wynagradzania
      </div>
      <div style="font-family:var(--font-serif);font-size:42px;font-weight:400;color:#0D1F3C;line-height:1.18;letter-spacing:-.01em;max-width:480px">
        Transformacja<br>kosztów pracy.
      </div>
      <div style="font-family:var(--font-serif);font-size:42px;font-weight:400;font-style:italic;color:var(--sp-gold);line-height:1.18;letter-spacing:-.01em;margin-bottom:28px">
        Twój wariant.
      </div>
      <p style="font-size:12px;color:rgba(13,31,60,.5);line-height:1.8;max-width:420px;margin:0">
        Na podstawie Twojej listy płac zidentyfikowaliśmy część budżetu pracowniczego, który dziś przepływa do ZUS ponad optymalny poziom — bez faktycznej korzyści dla Ciebie ani Twoich pracowników.<br>
        <strong style="font-size:13.5px;color:rgba(13,31,60,.78);font-weight:700">Możemy to zmienić.</strong>
      </p>
    </div>

    <!-- separator -->
    <div style="height:1px;background:rgba(13,31,60,.1);max-width:420px;margin-bottom:32px"></div>

    <!-- klient -->
    <div style="margin-bottom:28px">
      <div style="font-size:7.5px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:rgba(176,144,32,.65);margin-bottom:12px">Przygotowano dla</div>
      <div style="font-family:var(--font-serif);font-size:28px;font-weight:700;color:#0D1F3C;line-height:1.2;max-width:500px">${firma?.nazwa || 'Nazwa Firmy'}</div>
      <div style="font-size:10.5px;color:rgba(13,31,60,.4);margin-top:6px;letter-spacing:.03em">NIP ${firma?.nip || '---'}</div>
    </div>

    <!-- HOOK — savings block -->
    <div style="max-width:520px;background:#0D1F3C;border-top:3px solid #D4AF5A;position:relative;overflow:hidden">

      <!-- decorative radial glow -->
      <div style="position:absolute;top:0;right:0;width:240px;height:100%;background:radial-gradient(ellipse 80% 120% at 110% 50%,rgba(212,175,90,.12),transparent);pointer-events:none"></div>

      <!-- main number row -->
      <div style="padding:22px 28px 18px;display:flex;align-items:flex-end;gap:20px;position:relative;z-index:1">
        <div style="flex:1">
          <div style="font-size:8px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:rgba(212,175,90,.92);margin-bottom:8px">Oszczędność na składkach ZUS</div>
          <div style="display:flex;align-items:baseline;gap:8px">
            <div style="font-family:var(--font-serif);font-size:52px;font-weight:700;color:#D4AF5A;line-height:1;letter-spacing:-.02em">${fmt(totals?.savingsPlus || 0)}</div>
            <div style="font-size:18px;font-weight:300;color:rgba(212,175,90,.88);padding-bottom:6px">zł / mies.</div>
          </div>
          <div style="font-size:10px;color:rgba(255,255,255,.62);margin-top:5px;letter-spacing:.03em">wyliczone na podstawie Twojej listy płac &middot; kwota gotowa do wdrożenia</div>
        </div>

        <!-- before → after -->
        <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0;border-left:1px solid rgba(212,175,90,.15);padding-left:20px;justify-content:center;align-items:center">
          <div style="text-align:center">
            <div style="font-size:8px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.62);margin-bottom:2px">Koszt teraz</div>
            <div style="font-size:16px;font-weight:600;color:rgba(255,255,255,.82)">${fmt(totals?.currentCost || 0)} zł</div>
          </div>
          <div style="text-align:center;color:rgba(212,175,90,.5);font-size:14px;line-height:1">↓</div>
          <div style="text-align:center">
            <div style="font-size:8px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(45,122,79,.7);margin-bottom:2px">Po wdrożeniu modelu</div>
            <div style="font-size:16px;font-weight:700;color:#5DBF8A">${fmt(totals?.elitonPlusCost || 0)} zł</div>
          </div>
        </div>
      </div>

    </div>

  </div>

  <!-- ── DOLNA BELKA ── -->
  <div style="flex-shrink:0;position:relative;z-index:2">
    <!-- złota linia dekoracyjna nad stopką -->
    <div style="height:1px;margin:0 52px 0 56px;background:linear-gradient(90deg,var(--sp-gold) 0%,rgba(198,161,91,.2) 40%,transparent 100%)"></div>
    <div style="padding:16px 52px 24px 56px;display:flex;justify-content:space-between;align-items:center">

      <!-- lewa: data -->
      <div>
        <div style="font-size:6.5px;text-transform:uppercase;letter-spacing:.2em;color:rgba(176,144,32,.6);margin-bottom:5px">Data dokumentu</div>
        <div style="font-size:12px;font-weight:300;color:rgba(13,31,60,.7);letter-spacing:.04em">${date}</div>
      </div>

      <!-- środek: logo/branding -->
      <div style="display:flex;flex-direction:column;align-items:center;gap:5px">
        <div style="display:flex;align-items:center;gap:7px">
          <div style="width:18px;height:1px;background:rgba(176,144,32,.35)"></div>
          <div style="width:5px;height:5px;background:var(--sp-gold);opacity:.7"></div>
          <div style="width:18px;height:1px;background:rgba(176,144,32,.35)"></div>
        </div>
        <div style="font-size:7px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:rgba(13,31,60,.4)">STRATTON PRIME</div>
        <div style="font-size:6.5px;letter-spacing:.14em;color:rgba(176,144,32,.45);font-family:var(--font-mono)">${ref}</div>
      </div>

      <!-- prawa: autor -->
      <div style="text-align:right">
        <div style="font-size:6.5px;text-transform:uppercase;letter-spacing:.2em;color:rgba(176,144,32,.6);margin-bottom:5px">Dokument przygotował</div>
        <div style="font-size:12px;font-weight:300;color:rgba(13,31,60,.7);letter-spacing:.02em">${firma?.opiekunNazwa || 'Dział Analiz Finansowych'}</div>
        <div style="font-size:8px;color:rgba(13,31,60,.35);margin-top:3px;letter-spacing:.06em">stratton-prime.pl</div>
      </div>

    </div>
  </div>

</div>`;
};
