import type { SimulationParams } from '../types';
import { fmtK2 } from '../shared';
import { LOGO_OFERTA_B64 } from '../../offerPdfV3/pages/logoOfertaB64';

export const generateCoverV5 = (p: SimulationParams, date: string, docNr: string): string => {
    const firm  = p.firmaNazwa || 'Twoja firma';
    const n     = p.empCount;
    const prac  = n === 1 ? 'pracownik' : n < 5 ? 'pracownicy' : 'pracowników';
    const contractLabel = p.contractType === 'UOP' ? 'Umowy o pracę (UoP)' : p.contractType === 'UZ' ? 'Umowy zlecenia (UZ)' : 'Mix UoP/UZ';
    const { monthlySavings, yearlySavings, totalStd, totalNew, totalProv } = p.simulation;
    const advisorName  = p.advisorName  || 'Twój Doradca';
    const advisorEmail = p.advisorEmail || '';
    const avgNet = p.salaryMode === 'NETTO' ? p.avgSalary : Math.round(p.avgSalary * 0.715);
    const savingsPct = Math.round((monthlySavings / Math.max(1, totalStd)) * 100);

    // Hook kwalifikacyjny — "dlaczego akurat ta firma"
    const contractReason =
        p.contractType === 'UOP'   ? `Twoja firma ma pełną elastyczność struktury wynagrodzenia — przepisy od 1998 r. pozwalają część wynagrodzenia wypłacać jako <strong style="color:rgba(13,31,60,.8)">świadczenie rzeczowe wolne od składek ZUS</strong>, co bezpośrednio obniża koszty pracy.` :
        p.contractType === 'UZ'    ? `Umowy zlecenia w Twojej firmie to gotowy punkt wejścia dla korekty strukturalnej — przepisy od 1998 r. dają tu <strong style="color:rgba(13,31,60,.8)">realną możliwość obniżenia składek ZUS bez zmiany wynagrodzenia netto</strong>.` :
        /* MIXED */                  `Mieszana struktura zatrudnienia (UoP/UZ) to dwa niezależne punkty korekty — <strong style="color:rgba(13,31,60,.8)">każdy typ umowy otwiera własną ścieżkę do oszczędności</strong>.`;
    const scaleReason = n >= 20
        ? `Przy ${n} pracownikach efekt skali działa na Twoją korzyść — <strong style="color:rgba(13,31,60,.8)">każdy miesiąc wdrożenia przynosi oszczędność pomnożoną ${n}-krotnie.</strong>`
        : `Nawet przy ${n} pracownikach miesięczna oszczędność przekracza równowartość <strong style="color:rgba(13,31,60,.8)">pełnego wynagrodzenia jednej osoby w Twoim zespole.</strong>`;
    const ref = `SP/AW/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    return `<div class="page" style="display:flex;flex-direction:column;overflow:hidden;background:#F8F7F4">

  <!-- złoty pasek lewej krawędzi -->
  <div style="position:absolute;top:0;left:0;width:3px;height:100%;background:#C6A15B;opacity:.85;z-index:3"></div>

  <!-- logo-oferta — prawa połowa, pełna wysokość -->
  <img src="${LOGO_OFERTA_B64}" style="position:absolute;top:0;right:0;height:100%;width:auto;object-fit:contain;object-position:right center;z-index:1;pointer-events:none;user-select:none" />

  <!-- TOP BAR -->
  <div style="padding:32px 52px 0 56px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;position:relative;z-index:2">
    <div style="display:flex;align-items:center;gap:9px">
      <div style="width:6px;height:6px;background:#C6A15B"></div>
      <span style="font-size:8px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:rgba(13,31,60,.65)">STRATTON PRIME</span>
    </div>
    <span style="font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:rgba(212,175,90,.92);font-weight:700">ANALIZA WSTĘPNA</span>
  </div>

  <!-- CENTRUM — główna treść -->
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:0 52px 0 56px;position:relative;z-index:2">

    <!-- subtagline produktu -->
    <div style="margin-bottom:44px">
      <div style="font-size:9px;font-weight:700;letter-spacing:.26em;text-transform:uppercase;color:rgba(176,144,32,.75);margin-bottom:20px;display:flex;align-items:center;gap:12px">
        <div style="width:28px;height:1px;background:#C6A15B;opacity:.8"></div>
        ELITON Prime™ · Diagnoza kosztów pracy
      </div>

      <!-- Nagłówek hero -->
      <div style="font-family:'Playfair Display',serif;font-size:42px;font-weight:400;color:#0D1F3C;line-height:1.18;letter-spacing:-.01em;max-width:480px">
        Znaleźliśmy,<br>ile przepłacasz.
      </div>
      <div style="font-family:'Playfair Display',serif;font-size:42px;font-weight:400;font-style:italic;color:#C6A15B;line-height:1.18;letter-spacing:-.01em;margin-bottom:16px">
        Co miesiąc.
      </div>

      <div style="font-size:11px;color:rgba(176,144,32,.95);letter-spacing:.04em;margin-bottom:18px;font-weight:600">• szacunek na podstawie średnich parametrów — dokładna kwota po analizie listy płac</div>

      <!-- HOOK KWALIFIKACYJNY — dlaczego akurat ta firma -->
      <div style="margin-top:14px;padding:10px 14px;background:rgba(198,161,91,.07);border-left:3px solid rgba(198,161,91,.6);max-width:420px">
        <div style="font-size:9.5px;color:rgba(13,31,60,.6);line-height:1.7">${contractReason}</div>
        <div style="font-size:9.5px;color:rgba(13,31,60,.6);line-height:1.7;margin-top:4px">${scaleReason}</div>
      </div>
    </div>

    <!-- separator -->
    <div style="height:1px;background:rgba(13,31,60,.1);max-width:480px;margin-bottom:28px"></div>

    <!-- Przygotowano dla -->
    <div style="margin-bottom:28px">
      <div style="font-size:7.5px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:rgba(176,144,32,.65);margin-bottom:10px">Przygotowano dla</div>
      <div style="font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:#0D1F3C;line-height:1.2;max-width:500px">${firm}</div>
      <div style="font-size:10px;color:rgba(13,31,60,.4);margin-top:5px;letter-spacing:.04em">${n} ${prac} · ${contractLabel}</div>
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
            <div style="font-family:'Playfair Display',serif;font-size:52px;font-weight:700;color:#D4AF5A;line-height:1;letter-spacing:-.02em">${fmtK2(monthlySavings)}</div>
            <div style="font-size:18px;font-weight:300;color:rgba(212,175,90,.88);padding-bottom:6px">zł / mies.</div>
          </div>
          <div style="font-size:10px;color:rgba(255,255,255,.62);margin-top:5px;letter-spacing:.03em">szacunek wstępny · dokładna kwota po audycie listy płac</div>
        </div>

        <!-- before → after -->
        <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0;border-left:1px solid rgba(212,175,90,.15);padding-left:20px;justify-content:center;align-items:center">
          <div style="text-align:center">
            <div style="font-size:8px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.62);margin-bottom:2px">Koszt teraz</div>
            <div style="font-size:16px;font-weight:600;color:rgba(255,255,255,.82)">${fmtK2(totalStd)} zł</div>
          </div>
          <div style="text-align:center;color:rgba(212,175,90,.5);font-size:14px;line-height:1">↓</div>
          <div style="text-align:center">
            <div style="font-size:8px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(45,122,79,.7);margin-bottom:2px">Po wdrożeniu modelu</div>
            <div style="font-size:16px;font-weight:700;color:#5DBF8A">${fmtK2(totalNew)} zł</div>
          </div>
        </div>
      </div>



    </div>

  </div>

  <!-- DOLNA BELKA -->
  <div style="flex-shrink:0;position:relative;z-index:2">
    <div style="height:1px;margin:0 52px 0 56px;background:linear-gradient(90deg,#C6A15B 0%,rgba(198,161,91,.2) 40%,transparent 100%)"></div>
    <div style="padding:16px 52px 24px 56px;display:flex;justify-content:space-between;align-items:center">

      <div>
        <div style="font-size:6.5px;text-transform:uppercase;letter-spacing:.2em;color:rgba(176,144,32,.6);margin-bottom:5px">Data dokumentu</div>
        <div style="font-size:13px;font-weight:300;color:rgba(13,31,60,.7);letter-spacing:.04em">${date}</div>
      </div>

      <div style="display:flex;flex-direction:column;align-items:center;gap:5px">
        <div style="display:flex;align-items:center;gap:7px">
          <div style="width:18px;height:1px;background:rgba(176,144,32,.35)"></div>
          <div style="width:5px;height:5px;background:#C6A15B;opacity:.7"></div>
          <div style="width:18px;height:1px;background:rgba(176,144,32,.35)"></div>
        </div>
        <div style="font-size:7px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:rgba(13,31,60,.4)">STRATTON PRIME</div>
        <div style="font-size:7px;letter-spacing:.14em;color:rgba(176,144,32,.45)">${ref}</div>
      </div>

      <div style="text-align:right">
        <div style="font-size:6.5px;text-transform:uppercase;letter-spacing:.2em;color:rgba(176,144,32,.6);margin-bottom:5px">Dokument przygotowała</div>
        <div style="font-size:13px;font-weight:300;color:rgba(13,31,60,.7);letter-spacing:.02em">${advisorName}</div>
        <div style="font-size:8px;color:rgba(13,31,60,.35);margin-top:3px;letter-spacing:.06em">${advisorEmail}</div>
      </div>

    </div>
  </div>

</div>`;
};
