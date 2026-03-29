/**
 * Eliton Prime™ — Legalizacja Premii i Dopłat Pracowniczych
 *
 * Oferta 4-stronicowa przeznaczona dla firm, które chcą zastąpić
 * nieformalne wypłaty gotówkowe ("pod stołem") legalnym, optymalnym
 * podatkowo modelem dofinansowania przez voucher EBS.
 *
 * Główna narracja:
 *   Zamiast płacić premię przez podwyżkę brutto (drogo) lub gotówkę
 *   (nielegalnie), użyj voucherów EBS — zwolnionych z ZUS i PIT.
 *   Pracownik dostaje tyle samo (lub więcej), pracodawca płaci mniej.
 *   Dla pracowników w II progu (32% PIT) korzyść jest jeszcze większa.
 *
 * Strony:
 *   1. Okładka — kim jest oferta i dla kogo
 *   2. Trzy ścieżki — nielegalna gotówka / podwyżka / EBS
 *   3. Twarde dane finansowe — analiza per pracownik (dane firmy)
 *   4. Dlaczego to działa — podstawa prawna, korzyści i CTA
 */

import { ZapisanaKalkulacja } from '../../entities/history/model';
import { printHtmlAsPdf } from '../../shared/utils/printPdf';
import { getOfferPdfV3Styles } from '../offerPdfV3/styles';
import { generatePageHeaderV3, generateFooterV3 } from '../offerPdfV3/components';
import { LOGO_OFERTA_B64 } from '../offerPdfV3/pages/logoOfertaB64';
import { obliczWariantStandard, obliczWariantPodzial } from '../../features/tax-engine';

export const offerLegalizacjaPremiiGenerator = {

    generateOfferPDF: (item: ZapisanaKalkulacja) => {
        const tempPracownicy = item.dane.pracownicy;
        const tempFirma      = item.dane.firma;
        const tempConfig     = item.dane.config;
        const tempProwizja   = item.dane.prowizjaProc || 28;
        const date           = new Date().toLocaleDateString('pl-PL');

        const deadlineDate = new Date();
        deadlineDate.setDate(deadlineDate.getDate() + 14);
        const offerDeadline = deadlineDate.toLocaleDateString('pl-PL');
        const ref = `SP/${new Date().getFullYear()}/${String(new Date().getMonth()+1).padStart(2,'0')}/${(tempFirma?.nip||'').slice(-3)||'001'}`;

        const fmt  = (v: number) => new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
        const fmtK = (v: number) => new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(Math.round(v));

        const stawkaWypadkowa  = tempFirma.stawkaWypadkowa || 1.67;

        // ── Stawki ZUS z konfiguracji (zsynchronizowane z tax-engine) ────────
        const zusUop = tempConfig.zus.uop;
        // pracownik: emerytalna + rentowa + chorobowa (UoP — obowiązkowa)
        const ZUS_PRAC_RATE = (zusUop.pracownik.emerytalna + zusUop.pracownik.rentowa + zusUop.pracownik.chorobowa) / 100;
        // pracodawca: emerytalna + rentowa + FP + FGSP (bez wypadkowej — dodawana dynamicznie)
        const zusPracodawcaBase = (zusUop.pracodawca.emerytalna + zusUop.pracodawca.rentowa + zusUop.pracodawca.fp + zusUop.pracodawca.fgsp) / 100;
        const zusPracodawcaAdd  = zusPracodawcaBase + stawkaWypadkowa / 100;

        // ── Obliczenia per pracownik ──────────────────────────────────────────
        const activePracownicy = tempPracownicy.filter((p: any) => p.trybSkladek !== 'STUDENT_UZ');

        const workersData = activePracownicy.map((p: any) => {
            const currentModel   = obliczWariantStandard(p, tempFirma.stawkaWypadkowa, tempConfig);
            const nettoZasadnicza = p.nettoZasadnicza || (p.nettoDocelowe * 0.8);
            const elitonBase     = obliczWariantPodzial(p, tempFirma.stawkaWypadkowa, nettoZasadnicza, tempConfig);

            // premiaKwota = swiadczenie.netto = siła nabywcza pracownika z vouchera (netto po PIT)
            // voucherBrutto = swiadczenie.brutto = przychód art. 12 uPIT = netto + zaliczka PIT
            //   (tyle pracodawca faktycznie wydaje na świadczenie, cf. kosztPracodawcy w silniku)
            const premiaKwota   = elitonBase.swiadczenie.netto;
            const voucherBrutto = elitonBase.swiadczenie.brutto;

            // Próg PIT — używany do obliczenia bruttoRaise
            const rocznyBrutto  = currentModel.brutto * 12;
            const czyDrugaSkala = rocznyBrutto > 120_000;
            const pitRate       = czyDrugaSkala ? 0.32 : 0.12;

            // Koszt podwyżki, aby pracownik dostał premiaKwota NETTO w gotówce:
            //   brutto × (1 − ZUS_prac) × (1 − PIT) = premiaKwota
            //   → brutto = premiaKwota / ((1 − ZUS_prac) × (1 − PIT))  ← zależy od progu!
            const bruttoRaise = premiaKwota / ((1 - ZUS_PRAC_RATE) * (1 - pitRate));
            const kosztRaise  = bruttoRaise * (1 + zusPracodawcaAdd);

            // Koszt EBS: voucherBrutto (nominał + zaliczka PIT) + opłata serwisowa (prowizja% × nominał)
            // ZUS = 0 po obu stronach (Rozp. MPiPS § 2 ust. 1 pkt 26 z 18.12.1998)
            const kosztEBS = voucherBrutto + premiaKwota * (tempProwizja / 100);

            const oszczednosc    = kosztRaise - kosztEBS;
            const oszczednoscPct = kosztRaise > 0 ? Math.round(oszczednosc / kosztRaise * 100) : 0;

            return {
                imie: p.imie,
                nazwisko: p.nazwisko,
                premiaKwota,
                nettoZasadnicza,
                bruttoRaise,
                kosztRaise,
                kosztEBS,
                oszczednosc,
                oszczednoscPct,
                czyDrugaSkala,
                pitRate,
                bruttoCurrent: currentModel.brutto,
                voucherBrutto,
            };
        });

        const sumPremia      = workersData.reduce((a: number, w: any) => a + w.premiaKwota, 0);
        const sumKosztRaise  = workersData.reduce((a: number, w: any) => a + w.kosztRaise,  0);
        const sumKosztEBS    = workersData.reduce((a: number, w: any) => a + w.kosztEBS,    0);
        const sumOszczednosc = workersData.reduce((a: number, w: any) => a + w.oszczednosc, 0);
        const sumOszczRok    = sumOszczednosc * 12;
        const count2Bracket  = workersData.filter((w: any) => w.czyDrugaSkala).length;
        const avgOszczPct    = workersData.length > 0
            ? Math.round(workersData.reduce((a: number, w: any) => a + w.oszczednoscPct, 0) / workersData.length)
            : 0;

        // ── Na potrzeby strony 2: przykład — pracownik ma dostać 1000 zł NETTO ————————————————
        // Punkt wyjścia: premiaKwota = 1000 zł (siła nabywcza, co pracownik wyda)
        // EBS:   koszt = voucherBrutto + prowizja_netto (prowizja naliczana od nominału)
        // Podwyżka: brutto = 1000/((1−ZUS_prac)×(1−PIT)), koszt = brutto × (1+ZUS_pracodawcy)
        // Oszczędność % rośnie z progiem podatkowym — przy 12% ~19%, przy 32% ~22%.
        const ex = 1000;  // cel netto pracownika
        // I próg (12% PIT):
        const exVoucherBruttoI  = ex / (1 - 0.12);               // 1 136 zł (przychód deklarowany)
        const exKosztEBSI       = exVoucherBruttoI + ex * (tempProwizja / 100); // 1 136 + 150 = 1 286 zł przy 15%
        const exBruttoRaiseI    = ex / ((1 - ZUS_PRAC_RATE) * (1 - 0.12));     // 1 317 zł
        const exKosztRaiseI     = exBruttoRaiseI    * (1 + zusPracodawcaAdd);  // ~1 608 zł
        // II próg (32% PIT):
        const exVoucherBruttoII = ex / (1 - 0.32);               // 1 471 zł
        const exKosztEBSII      = exVoucherBruttoII + ex * (tempProwizja / 100); // 1 471 + 150 = 1 621 zł przy 15%
        const exBruttoRaiseII   = ex / ((1 - ZUS_PRAC_RATE) * (1 - 0.32));     // 1 704 zł
        const exKosztRaiseII    = exBruttoRaiseII   * (1 + zusPracodawcaAdd);  // ~2 081 zł
        // Oszczędność I próg (~19% przy 15% prowizji); rośnie z progiem PIT:
        const exOszczPct = Math.round((exKosztRaiseI - exKosztEBSI) / exKosztRaiseI * 100); // ~19%
        const exPITAmount     = Math.round(exVoucherBruttoI - ex);            // zaliczka PIT od vouchera
        const exProwizjaNetto = Math.round(ex * tempProwizja / 100);           // opłata serwisowa netto
        const exVATAmount     = Math.round(exProwizjaNetto * 0.23);            // VAT od prowizji

        // ── Pierwszy pracownik z listy — przykład podziału wynagrodzenia ─────────────────────
        const w0              = workersData[0] || null;
        const w0Name          = w0 ? `${w0.imie} ${w0.nazwisko}` : 'pracownik';
        const w0Zasadnicza    = w0 ? w0.nettoZasadnicza : 0;
        const w0Swiadczenie   = w0 ? w0.premiaKwota : 0;
        const w0Laczne        = w0Zasadnicza + w0Swiadczenie;
        const w0ZasadniczaPct = w0Laczne > 0 ? Math.round(w0Zasadnicza / w0Laczne * 100) : 0;
        const w0SwiadczeniePct = w0Laczne > 0 ? Math.round(w0Swiadczenie / w0Laczne * 100) : 0;
        const nPrac           = activePracownicy.length;
        const pracLabel       = nPrac === 1 ? '1 pracownika' : `${nPrac} pracowników`;

        // ── Kafelki strony 2: realne dane z pracownika #1 ─────────────────────────────────────
        const p1ex      = w0 ? Math.round(w0.premiaKwota) : Math.round(ex);
        const p1Brutto  = w0 ? Math.round(w0.voucherBrutto) : Math.round(exVoucherBruttoI);
        const p1PIT     = p1Brutto - p1ex;                              // zaliczka PIT (wychodzi z reguły 12%/32%)
        const p1Prowizja = Math.round(p1ex * tempProwizja / 100);       // prowizja netto
        const p1VAT     = Math.round(p1Prowizja * 0.23);                // VAT 23% od prowizji → odliczenie
        const p1Total   = p1Brutto + p1Prowizja;                        // łączny koszt pracodawcy
        const p1PitPct  = w0 ? Math.round(w0.pitRate * 100) : 12;       // 12 lub 32
        const p1Prog    = w0 ? (w0.czyDrugaSkala ? 'II próg' : 'I próg') : 'I próg';

        // ── II poziom: model fakturowania EBS ─────────────────────────────────────────────────
        // NOTA (bez VAT): za nominał voucherów = sumPremia (co pracownicy realnie wydają)
        // FV  (z VAT):    za obsługę = prowizja% × nominał + 23% VAT → VAT do odliczenia
        const notaMies     = sumPremia;                              // NOTA mies. (bez VAT, KUP)
        const fvNetMies    = notaMies * (tempProwizja / 100);        // FV netto obsługa
        const fvVATMies    = fvNetMies * 0.23;                       // VAT 23% → odliczenie
        const fvGrossMies  = fvNetMies + fvVATMies;                  // FV brutto
        const fvVATRok     = fvVATMies * 12;                         // VAT recovery / rok
        // CIT: zastąpienie gotówki voucherem obniża KUP (brak ZUS składek = mniejszy koszt podatkowy)
        // → firma traci tarczę CIT od zaoszczędzonych składek ZUS
        // Netto I poziom = ZUS savings × (1 − citRate); art. 15 ust. 1 uCIT
        const citRate       = 0.19;                                  // std. CIT sp. z o.o. (mały podatnik: 9%)
        const citKorektaRok = sumOszczRok * citRate;                 // utracona tarcza CIT na oszczędnościach ZUS
        const nettoOszczRok = sumOszczRok - citKorektaRok;           // I poziom po korekcie CIT
        const level2Rok     = nettoOszczRok + fvVATRok;             // łączna korzyść netto / rok

        // KUP łączny (nota + FV netto) — oba odpisywalne od podstawy podatku
        const kupMies = notaMies + fvNetMies;
        const kupRok  = kupMies * 12;

        // Tarcza podatkowa — warianty formy opodatkowania
        const tarczaData = [
            { label: 'JDG — skala I próg',     stawka: 12, star: false },
            { label: 'JDG — liniówka',         stawka: 19, star: true  },
            { label: 'JDG — skala II próg',    stawka: 32, star: false },
            { label: 'CIT 9% (mały podatnik)', stawka:  9, star: false },
            { label: 'CIT 19%',                stawka: 19, star: true  },
        ].map((v: { label: string; stawka: number; star: boolean }) => ({
            ...v,
            tarczaMies: Math.round(kupMies * v.stawka / 100),
            tarczaRok:  Math.round(kupRok  * v.stawka / 100),
            lacznie:    Math.round(kupRok  * v.stawka / 100 + fvVATRok),
        }));

        // ══════════════════════════════════════════════════════════════════════
        // STRONA 1 — OKŁADKA
        // ══════════════════════════════════════════════════════════════════════
        const page1 = `
<div class="page" style="background:#0A1128;display:flex;flex-direction:column;overflow:hidden">

  <!-- złoty pasek lewej krawędzi -->
  <div style="position:absolute;top:0;left:0;width:3px;height:100%;background:var(--sp-gold);opacity:.8;z-index:3"></div>

  <!-- tło — logo po prawej -->
  <img src="${LOGO_OFERTA_B64}" style="position:absolute;top:0;right:0;height:100%;width:auto;object-fit:contain;object-position:right center;z-index:1;opacity:.12;pointer-events:none;user-select:none" />

  <!-- TOP BAR -->
  <div style="padding:32px 52px 0 56px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;position:relative;z-index:2">
    <div style="display:flex;align-items:center;gap:9px">
      <div style="width:6px;height:6px;background:var(--sp-gold)"></div>
      <span style="font-size:8px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:rgba(255,255,255,.4)">STRATTON PRIME</span>
    </div>
    <span style="font-size:7px;letter-spacing:.22em;text-transform:uppercase;color:rgba(198,161,91,.5);font-weight:500">ANALIZA INDYWIDUALNA · POUFNE</span>
  </div>

  <!-- CENTRUM -->
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:0 52px 0 56px;position:relative;z-index:2">

    <div style="margin-bottom:52px">
      <div style="font-size:9px;font-weight:700;letter-spacing:.26em;text-transform:uppercase;color:rgba(198,161,91,.65);margin-bottom:20px;display:flex;align-items:center;gap:12px">
        <div style="width:28px;height:1px;background:var(--sp-gold);opacity:.8"></div>
        Eliton Prime™ · Legalizacja dopłat pracowniczych
      </div>
      <div style="font-family:var(--font-serif);font-size:40px;font-weight:400;color:#fff;line-height:1.18;letter-spacing:-.01em;max-width:500px">
        Daj pracownikom więcej.
      </div>
      <div style="font-family:var(--font-serif);font-size:40px;font-weight:400;font-style:italic;color:var(--sp-gold);line-height:1.18;letter-spacing:-.01em;margin-bottom:28px">
        Płać mniej.&nbsp;Legalnie.
      </div>
      <p style="font-size:12px;color:rgba(255,255,255,.45);line-height:1.8;max-width:440px;margin:0">
        Analiza pokazuje, ile Twoja firma może zaoszczędzić, zastępując kosztowne podwyżki brutto lub nieformalne premie gotówkowe — zwolnionym z ZUS voucherem EBS Eliton Prime™.
      </p>
    </div>

    <div style="height:1px;background:rgba(255,255,255,.08);max-width:440px;margin-bottom:32px"></div>

    <!-- Klient -->
    <div style="margin-bottom:36px">
      <div style="font-size:7.5px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:rgba(198,161,91,.55);margin-bottom:10px">Przygotowano dla</div>
      <div style="font-family:var(--font-serif);font-size:28px;font-weight:700;color:#fff;line-height:1.2;max-width:500px">${tempFirma?.nazwa || 'Nazwa Firmy'}</div>
      <div style="font-size:10.5px;color:rgba(255,255,255,.3);margin-top:6px;letter-spacing:.03em">NIP ${tempFirma?.nip || '---'}</div>
    </div>



  </div>

  <!-- DOLNA BELKA -->
  <div style="flex-shrink:0;position:relative;z-index:2;padding:16px 52px 24px 56px;border-top:1px solid rgba(255,255,255,.06)">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:7px;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.2);margin-bottom:3px">Data przygotowania</div>
        <div style="font-family:var(--font-mono);font-size:9px;color:rgba(255,255,255,.4)">${date}</div>
      </div>
      <div style="text-align:center">
        <div style="font-size:6px;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.15);margin-bottom:3px">Nr ref.</div>
        <div style="font-family:var(--font-mono);font-size:8px;color:rgba(255,255,255,.3)">${ref}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:7px;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.2);margin-bottom:3px">Ważne do</div>
        <div style="font-family:var(--font-mono);font-size:9px;color:rgba(198,161,91,.6)">${offerDeadline}</div>
      </div>
    </div>
  </div>


</div>`;

        // ══════════════════════════════════════════════════════════════════════
        // STRONA 2 — TRZY ŚCIEŻKI (porównanie scenariuszy)
        // ══════════════════════════════════════════════════════════════════════
        const colStyle = (accent: string, bg: string) =>
            `border:1px solid ${accent};border-top:4px solid ${accent};background:${bg};border-radius:2px;padding:16px;display:flex;flex-direction:column;gap:10px`;

        const badgeHtml = (text: string, color: string, bg: string) =>
            `<div style="display:inline-flex;align-items:center;gap:5px;padding:3px 8px;background:${bg};border:1px solid ${color};border-radius:2px;font-size:8px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${color}">${text}</div>`;

        const rowHtml = (label: string, value: string, muted = false) =>
            `<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid rgba(0,0,0,.05)">
               <span style="font-size:9.5px;color:${muted ? 'var(--sp-text-muted)' : 'var(--sp-text)'}">${label}</span>
               <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:${muted ? 'var(--sp-text-muted)' : 'var(--sp-navy)'}">${value}</span>
             </div>`;

        const page2 = `
<div class="page">
  ${generatePageHeaderV3('Struktura kosztów Programu Voucher EBS — indywidualna analiza', '02. Model rozliczeń', 2, 2, date)}

  <div class="page-body" style="padding-top:10px;padding-bottom:36px;display:flex;flex-direction:column;gap:6px">

    <!-- Przykład podziału wynagrodzenia — 1. pracownik z listy -->
    ${w0 ? `
    <div style="background:var(--sp-navy);border-radius:3px;padding:7px 14px;text-align:center">
      <div style="display:inline-flex;align-items:center;gap:6px;margin-bottom:6px;flex-wrap:wrap;justify-content:center">
        <span style="font-size:7.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(198,161,91,.7)">Rekomendowany model wynagradzania &mdash;</span>
        <span style="background:rgba(198,161,91,.2);border:1px solid rgba(198,161,91,.5);color:var(--sp-gold);font-size:6.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:2px 7px;border-radius:2px;white-space:nowrap">pracownik nr&nbsp;1 z listy</span>
        <span style="font-size:7.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(198,161,91,.7)">${w0Name}</span>
      </div>
      <div style="font-size:12px;font-weight:700;color:#fff;line-height:1.4">
        <span style="color:rgba(255,255,255,.75)">${fmtK(w0Zasadnicza)}&nbsp;zł netto zasadnicze</span>
        <span style="color:rgba(255,255,255,.4);margin:0 6px">+</span>
        <span style="color:var(--sp-gold)">${fmtK(w0Swiadczenie)}&nbsp;zł netto świadczenie rzeczowe <span style="font-size:9.5px;font-weight:400;color:rgba(198,161,91,.65)">(Voucher EBS)</span></span>
      </div>
      <div style="margin-top:6px;height:6px;border-radius:3px;overflow:hidden;background:rgba(255,255,255,.1);display:flex">
        <div style="width:${w0ZasadniczaPct}%;background:rgba(255,255,255,.35)"></div>
        <div style="width:${w0SwiadczeniePct}%;background:var(--sp-gold)"></div>
      </div>
      <div style="display:flex;justify-content:center;gap:24px;margin-top:3px">
        <span style="font-size:7.5px;color:rgba(255,255,255,.4)">Zasadnicze ${w0ZasadniczaPct}%</span>
        <span style="font-size:7.5px;color:rgba(198,161,91,.7)">Voucher EBS ${w0SwiadczeniePct}%</span>
      </div>
    </div>` : ''}

    <!-- ══ PODZIAŁ KOSZTU VOUCHERA + DOKUMENTY ══ -->
    <div style="border:1px solid rgba(198,161,91,.35);border-top:3px solid var(--sp-gold);padding:7px 12px;background:rgba(198,161,91,.03);flex:1;display:flex;flex-direction:column">
      <!-- nagłówek sekcji z etykietą "nr 1 z listy" -->
      <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:5px;flex-wrap:wrap">
        <div style="font-size:8.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--sp-navy)">Rentowno&#347;&#263; &#347;wiadczenia &mdash; struktura kosztu pracodawcy</div>
        <div style="background:var(--sp-navy);color:#fff;font-size:6.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:2px 6px;border-radius:2px;white-space:nowrap">&#x23;1 z listy pracownik&#xF3;w</div>
        <div style="font-size:7.5px;color:var(--sp-text-muted);margin-left:2px">${w0Name} &mdash; ${fmtK(p1ex)}&nbsp;z&#322; netto &#347;wiadczenia (${p1Prog}, prowizja ${tempProwizja}%)</div>
      </div>

      <!-- 4 kafelki: podział kosztu vouchera -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:5px">

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-top:2px solid #16a34a;padding:5px 6px;text-align:center">
          <div style="font-size:7px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#16a34a;margin-bottom:3px">&#346;wiadczenie rzeczowe</div>
          <div style="font-family:var(--font-mono);font-size:13px;font-weight:700;color:var(--sp-navy)">${fmtK(p1ex)}&nbsp;z&#322;</div>
        </div>

        <div style="background:#fffbeb;border:1px solid #fde68a;border-top:2px solid #d97706;padding:5px 6px;text-align:center">
          <div style="font-size:7px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#d97706;margin-bottom:3px">Zaliczka PIT (${p1PitPct}%)</div>
          <div style="font-family:var(--font-mono);font-size:13px;font-weight:700;color:var(--sp-navy)">${fmt(p1PIT)}&nbsp;z&#322;</div>
        </div>

        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-top:2px solid #2563EB;padding:5px 6px;text-align:center">
          <div style="font-size:7px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#2563EB;margin-bottom:3px">Prowizja Eliton (${tempProwizja}%)</div>
          <div style="font-family:var(--font-mono);font-size:13px;font-weight:700;color:var(--sp-navy)">${fmt(p1Prowizja)}&nbsp;z&#322;</div>
        </div>

        <div style="background:#f0f9ff;border:1px solid #bae6fd;border-top:2px solid #0284c7;padding:5px 6px;text-align:center">
          <div style="font-size:7px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#0284c7;margin-bottom:3px">VAT 23% od prowizji</div>
          <div style="font-family:var(--font-mono);font-size:13px;font-weight:700;color:var(--sp-navy)">${fmt(p1VAT)}&nbsp;z&#322;</div>
        </div>

      </div>
      <div style="background:#f8f5f0;border:1px solid rgba(198,161,91,.4);padding:3px 10px;display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:8px">
        <span style="color:var(--sp-text-muted)">${fmtK(p1ex)}&nbsp;+&nbsp;${fmt(p1PIT)}&nbsp;+&nbsp;${fmt(p1Prowizja)}&nbsp;=&nbsp;<strong style="color:var(--sp-navy)">${fmtK(p1Total)} z&#322; netto</strong> (&#322;&#261;czny koszt pracodawcy)</span>
        <span style="color:#0284c7">+${fmt(p1VAT)} z&#322; VAT &#x2192; odliczasz</span>
      </div>

      <!-- Nagłówek nad dokumentami -->
      <div style="font-size:9px;font-weight:700;color:var(--sp-navy);margin-bottom:4px;padding-bottom:3px;border-bottom:1px solid rgba(198,161,91,.25)">
        Przykładowe dokumenty księgowe — ${pracLabel}, ${tempFirma?.nazwa || 'Twoja firma'}
      </div>

      <!-- Dokumenty ksi&#x0119;gowe — wzory -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;flex:1;min-height:0">

        <!-- ══ NOTA KSIĘGOWA ══ -->
        <div style="background:#fff;border:1px solid #b8b8b8;border-top:3px solid #064e3b;display:flex;flex-direction:column;overflow:hidden">

          <!-- nagłówek dokumentu -->
          <div style="padding:6px 9px 5px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <div style="font-size:11.5px;font-weight:800;letter-spacing:.03em;color:#064e3b;line-height:1">NOTA KSI&#x0118;GOWA</div>
              <div style="font-size:7.5px;color:#374151;margin-top:2px;font-family:var(--font-mono)">Nr&nbsp;<strong>${ref}/N</strong></div>
            </div>
            <div style="text-align:right">
              <div style="font-size:6px;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em">Data wystawienia</div>
              <div style="font-size:8px;font-weight:700;color:#111827;margin-top:1px">${date}</div>
              <div style="background:#dcfce7;color:#059669;font-size:5.5px;font-weight:700;letter-spacing:.06em;padding:1px 5px;border-radius:2px;margin-top:3px;display:inline-block;text-transform:uppercase">Zwolniona z VAT</div>
            </div>
          </div>

          <!-- strony -->
          <div style="display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #e5e7eb">
            <div style="padding:4px 8px;border-right:1px solid #e5e7eb">
              <div style="font-size:6px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9ca3af;margin-bottom:2px">Wystawca</div>
              <div style="font-size:8.5px;font-weight:700;color:#111827;line-height:1.35">Stratton Prime sp. z o.o.</div>
              <div style="font-size:7px;color:#6b7280;margin-top:1px">ul. Junony 23/11, 80-299 Gda&#x0144;sk</div>
              <div style="font-size:7px;color:#6b7280">NIP: 5842867357</div>
            </div>
            <div style="padding:4px 8px">
              <div style="font-size:6px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9ca3af;margin-bottom:2px">Nabywca</div>
              <div style="font-size:8.5px;font-weight:700;color:#111827;line-height:1.35">${tempFirma?.nazwa || 'Twoja firma'}</div>
              <div style="font-size:7px;color:#6b7280;margin-top:1px">NIP: ${tempFirma?.nip || '&#8212;'}</div>
            </div>
          </div>

          <!-- tabela pozycji -->
          <table style="width:100%;border-collapse:collapse;flex:1">
            <thead>
              <tr style="background:#f0fdf4">
                <th style="padding:3px 5px;font-size:6px;font-weight:600;color:#374151;text-align:center;border-bottom:1px solid #d1fae5;border-right:1px solid #d1fae5;width:18px">Lp.</th>
                <th style="padding:3px 5px;font-size:6px;font-weight:600;color:#374151;text-align:left;border-bottom:1px solid #d1fae5;border-right:1px solid #d1fae5">Opis</th>
                <th style="padding:3px 5px;font-size:6px;font-weight:600;color:#374151;text-align:center;border-bottom:1px solid #d1fae5;border-right:1px solid #d1fae5;white-space:nowrap">Szt.</th>
                <th style="padding:3px 5px;font-size:6px;font-weight:600;color:#374151;text-align:right;border-bottom:1px solid #d1fae5;white-space:nowrap">Kwota</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:5px;text-align:center;border-right:1px solid #f3f4f6;border-bottom:1px solid #f3f4f6;font-size:7.5px;color:#9ca3af;vertical-align:top">1.</td>
                <td style="padding:5px;border-right:1px solid #f3f4f6;border-bottom:1px solid #f3f4f6">
                  <div style="font-size:8px;font-weight:700;color:#111827;line-height:1.3">Pakiet Voucher EBS</div>
                  <div style="font-size:6.5px;color:#6b7280;margin-top:1px">Bon R&oacute;&#x017C;nego Przeznaczenia (MPV)</div>
                  <div style="font-size:6px;color:#059669;margin-top:1px">art. 8b ust. 1 uVAT &middot; Rozp. MPiPS &sect;&nbsp;2 ust. 1 pkt 26 z 18.12.1998</div>
                </td>
                <td style="padding:5px;text-align:center;border-right:1px solid #f3f4f6;border-bottom:1px solid #f3f4f6;font-size:9px;font-weight:700;color:#111827;vertical-align:top">${nPrac}</td>
                <td style="padding:5px;text-align:right;border-bottom:1px solid #f3f4f6;vertical-align:top">
                  <div style="font-size:10px;font-weight:800;color:#111827;font-family:var(--font-mono)">${fmtK(notaMies)}&nbsp;z&#322;</div>
                  <div style="font-size:6px;color:#9ca3af;margin-top:1px">${fmtK(Math.round(notaMies / Math.max(nPrac, 1)))}&nbsp;z&#322;/os.</div>
                </td>
              </tr>
              <tr style="background:#fafafa">
                <td colspan="2" style="padding:3px 6px;font-size:7px;color:#6b7280;border-right:1px solid #f3f4f6;border-bottom:1px solid #f3f4f6">Termin p&#322;atno&#347;ci</td>
                <td colspan="2" style="padding:3px 6px;text-align:right;font-size:7.5px;font-weight:600;color:#374151;border-bottom:1px solid #f3f4f6">14&nbsp;dni od wystawienia</td>
              </tr>
              <tr>
                <td colspan="2" style="padding:3px 6px;font-size:7px;color:#6b7280;border-right:1px solid #f3f4f6;border-bottom:1px solid #f3f4f6">Forma p&#322;atno&#347;ci</td>
                <td colspan="2" style="padding:3px 6px;text-align:right;font-size:7.5px;font-weight:600;color:#374151;border-bottom:1px solid #f3f4f6">Przelew bankowy</td>
              </tr>
              <tr style="background:#f0fdf4">
                <td colspan="2" style="padding:3px 6px;font-size:6.5px;font-weight:700;color:#059669;border-right:1px solid #d1fae5">Zwolnienie z VAT &mdash; art. 8b ust. 1 uVAT</td>
                <td colspan="2" style="padding:3px 6px;text-align:right;font-size:6.5px;font-weight:700;color:#059669">Stawka: ZW &#x2713;</td>
              </tr>
            </tbody>
          </table>

          <!-- stopka -->
          <div style="background:#064e3b;padding:5px 10px;display:flex;justify-content:space-between;align-items:center">
            <div style="font-size:6px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.07em">Do zap&#322;aty</div>
            <div style="font-size:13px;font-weight:800;color:#fff;font-family:var(--font-mono)">${fmtK(notaMies)}&nbsp;z&#322;</div>
          </div>

        </div>

        <!-- ══ FAKTURA VAT ══ -->
        <div style="background:#fff;border:1px solid #b8b8b8;border-top:3px solid #1e3a8a;display:flex;flex-direction:column;overflow:hidden">

          <!-- nagłówek dokumentu -->
          <div style="padding:6px 9px 5px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <div style="font-size:11.5px;font-weight:800;letter-spacing:.03em;color:#1e3a8a;line-height:1">FAKTURA VAT</div>
              <div style="font-size:7.5px;color:#374151;margin-top:2px;font-family:var(--font-mono)">Nr&nbsp;<strong>${ref}/F</strong></div>
            </div>
            <div style="text-align:right">
              <div style="display:flex;gap:10px;align-items:flex-start">
                <div>
                  <div style="font-size:6px;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em">Data wystawienia</div>
                  <div style="font-size:8px;font-weight:700;color:#111827;margin-top:1px">${date}</div>
                </div>
                <div>
                  <div style="font-size:6px;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em">Data sprzeda&#x017C;y</div>
                  <div style="font-size:8px;font-weight:700;color:#111827;margin-top:1px">${date}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- strony -->
          <div style="display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #e5e7eb">
            <div style="padding:4px 8px;border-right:1px solid #e5e7eb">
              <div style="font-size:6px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9ca3af;margin-bottom:2px">Sprzedawca</div>
              <div style="font-size:8.5px;font-weight:700;color:#111827;line-height:1.35">Stratton Prime sp. z o.o.</div>
              <div style="font-size:7px;color:#6b7280;margin-top:1px">ul. Junony 23/11, 80-299 Gda&#x0144;sk</div>
              <div style="font-size:7px;color:#6b7280">NIP: 5842867357</div>
            </div>
            <div style="padding:4px 8px">
              <div style="font-size:6px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9ca3af;margin-bottom:2px">Nabywca</div>
              <div style="font-size:8.5px;font-weight:700;color:#111827;line-height:1.35">${tempFirma?.nazwa || 'Twoja firma'}</div>
              <div style="font-size:7px;color:#6b7280;margin-top:1px">NIP: ${tempFirma?.nip || '&#8212;'}</div>
            </div>
          </div>

          <!-- tabela pozycji FV -->
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="background:#eff6ff">
                <th style="padding:3px 4px;font-size:6px;font-weight:600;color:#374151;text-align:center;border-bottom:1px solid #dbeafe;border-right:1px solid #dbeafe;width:16px">Lp.</th>
                <th style="padding:3px 4px;font-size:6px;font-weight:600;color:#374151;text-align:left;border-bottom:1px solid #dbeafe;border-right:1px solid #dbeafe">Nazwa us&#322;ugi</th>
                <th style="padding:3px 4px;font-size:6px;font-weight:600;color:#374151;text-align:center;border-bottom:1px solid #dbeafe;border-right:1px solid #dbeafe;white-space:nowrap">Szt.</th>
                <th style="padding:3px 4px;font-size:6px;font-weight:600;color:#374151;text-align:center;border-bottom:1px solid #dbeafe;border-right:1px solid #dbeafe;white-space:nowrap">J.m.</th>
                <th style="padding:3px 4px;font-size:6px;font-weight:600;color:#374151;text-align:right;border-bottom:1px solid #dbeafe;border-right:1px solid #dbeafe;white-space:nowrap">Netto</th>
                <th style="padding:3px 4px;font-size:6px;font-weight:600;color:#374151;text-align:center;border-bottom:1px solid #dbeafe;border-right:1px solid #dbeafe;white-space:nowrap">VAT%</th>
                <th style="padding:3px 4px;font-size:6px;font-weight:600;color:#374151;text-align:right;border-bottom:1px solid #dbeafe;border-right:1px solid #dbeafe;white-space:nowrap">VAT&nbsp;z&#322;</th>
                <th style="padding:3px 4px;font-size:6px;font-weight:600;color:#374151;text-align:right;border-bottom:1px solid #dbeafe;white-space:nowrap">Brutto</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:4px 5px;text-align:center;border-right:1px solid #f3f4f6;border-bottom:1px solid #f3f4f6;font-size:7.5px;color:#9ca3af;vertical-align:top">1.</td>
                <td style="padding:4px 5px;border-right:1px solid #f3f4f6;border-bottom:1px solid #f3f4f6">
                  <div style="font-size:7.5px;font-weight:700;color:#111827;line-height:1.3">Op&#322;ata serwisowa EBS</div>
                  <div style="font-size:6.5px;color:#6b7280;margin-top:1px">${tempProwizja}% warto&#347;ci nom. &#347;wiadcze&#324;</div>
                </td>
                <td style="padding:4px 5px;text-align:center;border-right:1px solid #f3f4f6;border-bottom:1px solid #f3f4f6;font-size:8px;font-weight:700;color:#111827;vertical-align:top">1</td>
                <td style="padding:4px 5px;text-align:center;border-right:1px solid #f3f4f6;border-bottom:1px solid #f3f4f6;font-size:7px;color:#6b7280;vertical-align:top">us&#322;.</td>
                <td style="padding:4px 5px;text-align:right;border-right:1px solid #f3f4f6;border-bottom:1px solid #f3f4f6;font-size:8px;font-weight:600;color:#111827;font-family:var(--font-mono);vertical-align:top">${fmtK(fvNetMies)}&nbsp;z&#322;</td>
                <td style="padding:4px 5px;text-align:center;border-right:1px solid #f3f4f6;border-bottom:1px solid #f3f4f6;font-size:7.5px;font-weight:700;color:#1e3a8a;vertical-align:top">23%</td>
                <td style="padding:4px 5px;text-align:right;border-right:1px solid #f3f4f6;border-bottom:1px solid #f3f4f6;font-size:8px;font-weight:600;color:#1e3a8a;font-family:var(--font-mono);vertical-align:top">${fmtK(fvVATMies)}&nbsp;z&#322;</td>
                <td style="padding:4px 5px;text-align:right;border-bottom:1px solid #f3f4f6;font-size:8px;font-weight:700;color:#111827;font-family:var(--font-mono);vertical-align:top">${fmtK(fvGrossMies)}&nbsp;z&#322;</td>
              </tr>
            </tbody>
          </table>

          <!-- zestawienie VAT + płatność -->
          <div style="display:flex;border-top:1px solid #e5e7eb;flex:1">

            <!-- tabela zestawienia VAT -->
            <div style="flex:1;border-right:1px solid #e5e7eb;display:flex;flex-direction:column">
              <table style="width:100%;border-collapse:collapse">
                <thead>
                  <tr style="background:#eff6ff">
                    <th style="padding:2px 4px;font-size:6px;font-weight:600;color:#374151;text-align:center;border-bottom:1px solid #dbeafe;border-right:1px solid #dbeafe">Stawka</th>
                    <th style="padding:2px 4px;font-size:6px;font-weight:600;color:#374151;text-align:right;border-bottom:1px solid #dbeafe;border-right:1px solid #dbeafe">Wart. netto</th>
                    <th style="padding:2px 4px;font-size:6px;font-weight:600;color:#374151;text-align:right;border-bottom:1px solid #dbeafe;border-right:1px solid #dbeafe">Kwota VAT</th>
                    <th style="padding:2px 4px;font-size:6px;font-weight:600;color:#374151;text-align:right;border-bottom:1px solid #dbeafe">Wart. brutto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding:2px 4px;text-align:center;border-right:1px solid #f3f4f6;border-bottom:1px solid #f3f4f6;font-size:7px;font-weight:700;color:#1e3a8a">23%</td>
                    <td style="padding:2px 4px;text-align:right;border-right:1px solid #f3f4f6;border-bottom:1px solid #f3f4f6;font-size:7px;color:#374151;font-family:var(--font-mono)">${fmtK(fvNetMies)}</td>
                    <td style="padding:2px 4px;text-align:right;border-right:1px solid #f3f4f6;border-bottom:1px solid #f3f4f6;font-size:7px;color:#1e3a8a;font-family:var(--font-mono)">${fmtK(fvVATMies)}</td>
                    <td style="padding:2px 4px;text-align:right;border-bottom:1px solid #f3f4f6;font-size:7px;font-weight:600;color:#111827;font-family:var(--font-mono)">${fmtK(fvGrossMies)}</td>
                  </tr>
                  <tr style="background:#f0f9ff">
                    <td style="padding:2px 4px;text-align:center;border-right:1px solid #dbeafe;font-size:6.5px;font-weight:800;color:#374151">RAZEM</td>
                    <td style="padding:2px 4px;text-align:right;border-right:1px solid #dbeafe;font-size:7px;font-weight:700;color:#374151;font-family:var(--font-mono)">${fmtK(fvNetMies)}</td>
                    <td style="padding:2px 4px;text-align:right;border-right:1px solid #dbeafe;font-size:7px;font-weight:700;color:#1e3a8a;font-family:var(--font-mono)">${fmtK(fvVATMies)}</td>
                    <td style="padding:2px 4px;text-align:right;font-size:7px;font-weight:800;color:#111827;font-family:var(--font-mono)">${fmtK(fvGrossMies)}</td>
                  </tr>
                </tbody>
              </table>
              <div style="padding:3px 5px;display:flex;gap:10px;border-top:1px solid #f3f4f6;margin-top:auto">
                <div><span style="font-size:6px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em">Termin&ensp;</span><span style="font-size:7px;font-weight:700;color:#374151">14 dni od wystawienia</span></div>
                <div><span style="font-size:6px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em">Forma&ensp;</span><span style="font-size:7px;font-weight:700;color:#374151">Przelew</span></div>
              </div>
            </div>

            <!-- do zapłaty -->
            <div style="background:#1e3a8a;padding:6px 10px;display:flex;flex-direction:column;justify-content:center;align-items:flex-end;min-width:80px">
              <div style="font-size:6px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.07em;margin-bottom:2px">Do zap&#322;aty</div>
              <div style="font-size:13px;font-weight:800;color:#fff;font-family:var(--font-mono)">${fmtK(fvGrossMies)}&nbsp;z&#322;</div>
            </div>

          </div>

        </div>

      </div>

    </div>

    <!-- ══ INTRO TEXT — kontekst etapu ══ -->
      <div style="border-left:5px solid var(--sp-gold);background:rgba(198,161,91,.07);border-radius:0 4px 4px 0;padding:9px 14px">
      <div style="font-size:10px;color:rgba(10,17,40,.55);line-height:1.75;margin-bottom:4px">Prezentowana analiza stanowi indywidualn&#x0105; wycen&#x0119; potencja&#322;u optymalizacji koszt&#xF3;w zatrudnienia w Pa&#x0144;stwa organizacji &mdash; obliczon&#x0105; na podstawie rzeczywistej listy p&#322;ac.</div>
      <div style="font-size:11px;color:var(--sp-navy);line-height:1.7;font-weight:400"><strong style="font-weight:800">Etapy 1 i 2 zosta&#322;y zrealizowane.</strong> Jeste&#x15B; na etapie Decyzji &mdash; to jedyny krok wymagaj&#x0105;cy Twojego potwierdzenia. Implementacj&#x0105; zajmujemy si&#x0119; w ca&#322;o&#x15B;ci my.</div>
    </div>

    <!-- ══ ETAPY WDROŻENIA — Metodologia Szymona Negacza ══ -->
    <div style="background:#f8f7f4;border:1px solid rgba(198,161,91,.4);border-top:3px solid var(--sp-gold);padding:8px 12px">

      <!-- Nagłówek + dot-indicator -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:7.5px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--sp-navy);opacity:.55">Harmonogram wdro&#x017C;enia programu</div>
        <div style="display:flex;align-items:center;gap:5px">
          <div style="display:flex;gap:3px;align-items:center">
            <div style="width:8px;height:8px;border-radius:50%;background:#22c55e"></div>
            <div style="width:8px;height:8px;border-radius:50%;background:#22c55e"></div>
            <div style="width:10px;height:10px;border-radius:50%;background:var(--sp-gold);border:1.5px solid #fff;box-shadow:0 0 0 1.5px var(--sp-gold)"></div>
            <div style="width:8px;height:8px;border-radius:50%;background:rgba(10,17,40,.15)"></div>
            <div style="width:8px;height:8px;border-radius:50%;background:rgba(10,17,40,.15)"></div>
            <div style="width:8px;height:8px;border-radius:50%;background:rgba(10,17,40,.15)"></div>
            <div style="width:8px;height:8px;border-radius:50%;background:rgba(34,197,94,.25);border:1px solid #22c55e"></div>
          </div>
          <span style="font-size:6.5px;font-weight:600;color:var(--sp-navy);opacity:.5;margin-left:4px">krok&nbsp;3&nbsp;z&nbsp;7</span>
        </div>
      </div>

      <!-- Timeline stepper -->
      <div style="position:relative">
        <!-- Linia bazowa -->
        <div style="position:absolute;top:11px;left:3.5%;right:3.5%;height:2px;background:rgba(10,17,40,.1)"></div>
        <!-- Linia ukończona (kroki 1–2, ~2/7 szerokości) -->
        <div style="position:absolute;top:11px;left:3.5%;width:26%;height:2px;background:#22c55e"></div>
        <!-- Linia bieżąca (krok 2→3, złota) -->
        <div style="position:absolute;top:11px;left:29.5%;width:14%;height:2px;background:var(--sp-gold)"></div>

        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:0;padding-top:2px">

          <!-- KROK 1 — Analiza potrzeb [DONE] -->
          <div style="display:flex;flex-direction:column;align-items:center;gap:3px">
            <div style="width:22px;height:22px;border-radius:50%;background:#22c55e;border:2px solid #fff;display:flex;align-items:center;justify-content:center;z-index:1;flex-shrink:0">
              <span style="color:#fff;font-size:10px;font-weight:700">&#x2713;</span>
            </div>
            <div style="font-size:7.5px;font-weight:700;color:var(--sp-navy);text-align:center;line-height:1.35">Audyt<br>potrzeb</div>
            <div style="font-size:7px;color:#6b7280;text-align:center;line-height:1.4">Analiza<br>potencja&#322;u</div>
          </div>

          <!-- KROK 2 — Kalkulacja indywidualna [DONE] -->
          <div style="display:flex;flex-direction:column;align-items:center;gap:3px">
            <div style="width:22px;height:22px;border-radius:50%;background:#22c55e;border:2px solid #fff;display:flex;align-items:center;justify-content:center;z-index:1;flex-shrink:0">
              <span style="color:#fff;font-size:10px;font-weight:700">&#x2713;</span>
            </div>
            <div style="font-size:7.5px;font-weight:700;color:var(--sp-navy);text-align:center;line-height:1.35">Kalkulacja<br>indywidualna</div>
            <div style="font-size:7px;color:#6b7280;text-align:center;line-height:1.4">Wycena<br>na Twojej li&#347;cie</div>
          </div>

          <!-- KROK 3 — Decyzja [JESTEŚ TUTAJ] -->
          <div style="display:flex;flex-direction:column;align-items:center;gap:3px;position:relative">
            <div style="position:absolute;top:-13px;background:var(--sp-gold);padding:2px 6px;border-radius:2px;font-size:6.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--sp-navy);white-space:nowrap">Jeste&#x15B; tutaj</div>
            <div style="width:26px;height:26px;border-radius:50%;background:var(--sp-gold);border:2.5px solid #fff;box-shadow:0 0 0 2px var(--sp-gold);display:flex;align-items:center;justify-content:center;z-index:1;flex-shrink:0;margin-top:-2px">
              <span style="color:var(--sp-navy);font-size:11px;font-weight:700">&#x2192;</span>
            </div>
            <div style="font-size:8px;font-weight:700;color:var(--sp-navy);text-align:center;line-height:1.35">Decyzja</div>
            <div style="font-size:7px;color:var(--sp-gold);text-align:center;line-height:1.4;font-weight:600">Wa&#x17C;na do<br>${offerDeadline}</div>
          </div>

          <!-- KROK 4 — Podpisanie umowy [PRZYSZŁOŚĆ] -->
          <div style="display:flex;flex-direction:column;align-items:center;gap:3px">
            <div style="width:22px;height:22px;border-radius:50%;background:#f8f7f4;border:1.5px solid rgba(10,17,40,.2);display:flex;align-items:center;justify-content:center;position:relative;z-index:2;flex-shrink:0">
              <span style="font-size:8px;font-weight:700;color:rgba(10,17,40,.3)">4</span>
            </div>
            <div style="font-size:7.5px;font-weight:700;color:rgba(10,17,40,.38);text-align:center;line-height:1.35">Podpisanie<br>umowy</div>
            <div style="font-size:7px;color:#9ca3af;text-align:center;line-height:1.4">Kwalifikowany<br>e-podpis</div>
          </div>

          <!-- KROK 5 — Wdrożenie dokumentacji [PRZYSZŁOŚĆ] -->
          <div style="display:flex;flex-direction:column;align-items:center;gap:3px">
            <div style="width:22px;height:22px;border-radius:50%;background:#f8f7f4;border:1.5px solid rgba(10,17,40,.2);display:flex;align-items:center;justify-content:center;position:relative;z-index:2;flex-shrink:0">
              <span style="font-size:8px;font-weight:700;color:rgba(10,17,40,.3)">5</span>
            </div>
            <div style="font-size:7.5px;font-weight:700;color:rgba(10,17,40,.38);text-align:center;line-height:1.35">Wdro&#x17C;enie<br>dokumentacji</div>
            <div style="font-size:7px;color:#9ca3af;text-align:center;line-height:1.4">Uchwa&#322;a,<br>aneksy</div>
          </div>

          <!-- KROK 6 — Start EBS [PRZYSZŁOŚĆ] -->
          <div style="display:flex;flex-direction:column;align-items:center;gap:3px">
            <div style="width:22px;height:22px;border-radius:50%;background:#f8f7f4;border:1.5px solid rgba(10,17,40,.2);display:flex;align-items:center;justify-content:center;position:relative;z-index:2;flex-shrink:0">
              <span style="font-size:8px;font-weight:700;color:rgba(10,17,40,.3)">6</span>
            </div>
            <div style="font-size:7.5px;font-weight:700;color:rgba(10,17,40,.38);text-align:center;line-height:1.35">Start<br>EBS</div>
            <div style="font-size:7px;color:#9ca3af;text-align:center;line-height:1.4">Aktywacja<br>platformy</div>
          </div>

          <!-- KROK 7 — Pierwsze oszczędności [WYNIK] -->
          <div style="display:flex;flex-direction:column;align-items:center;gap:3px">
            <div style="width:22px;height:22px;border-radius:50%;background:#f0fdf4;border:2px solid #22c55e;display:flex;align-items:center;justify-content:center;position:relative;z-index:2;flex-shrink:0">
              <span style="font-size:7px;font-weight:800;color:#22c55e">z&#322;</span>
            </div>
            <div style="font-size:7.5px;font-weight:700;color:rgba(10,17,40,.38);text-align:center;line-height:1.35">Pierwsze<br>oszcz&#x0119;dno&#x15B;ci</div>

          </div>

        </div>
      </div>

      <!-- Dolny pasek informacyjny -->
      <div style="background:var(--sp-navy);border-radius:3px;padding:6px 10px;display:flex;align-items:center;gap:10px;margin-top:6px">
        <div style="width:20px;height:20px;border-radius:50%;background:#22c55e;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <span style="color:#fff;font-size:10px;font-weight:700">&#x2713;</span>
        </div>
        <div>
          <div style="font-size:7px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:2px">Fazy 1&ndash;2 z 7 zrealizowane</div>
          <div style="font-size:8px;color:rgba(255,255,255,.85);line-height:1.55">Audyt potrzeb i indywidualna wycena zosta&#322;y przeprowadzone. Kolejna faza &mdash; formalne potwierdzenie wsp&#xF3;&#322;pracy &mdash; realizujemy w ci&#x0105;gu 48 godzin od Twojej decyzji.</div>
        </div>
      </div>

    </div>

    <!-- ══ KONTAKT DO OPIEKUNA ══ -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;border:1px solid rgba(198,161,91,.2);overflow:hidden">

      <!-- Wystawca / dane firmy -->
      <div style="background:#162040;padding:10px 14px;border-right:1px solid rgba(255,255,255,.08)">
        <div style="font-size:7px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:5px">Wystawca dokument&#xF3;w</div>
        <div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:5px">Stratton Prime sp. z o.o.</div>
        <div style="font-size:8.5px;color:rgba(255,255,255,.5);line-height:1.7">ul. Junony 23/11, 80-299 Gda&#x0144;sk<br>NIP: 5842867357<br>Nr ref.: ${ref}</div>
      </div>

      <!-- CTA -->
      <div style="background:var(--sp-gold);padding:10px 14px;border-right:1px solid rgba(198,161,91,.3);display:flex;flex-direction:column;justify-content:center">
        <div style="font-size:7.5px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(10,17,40,.5);margin-bottom:5px">Gotowi na wsp&#xF3;&#322;prac&#x0119;?</div>
        <div style="font-size:13px;font-weight:700;color:var(--sp-navy);margin-bottom:4px;line-height:1.2">&#x27A4; Um&#xF3;w konsultacj&#x0119; strategiczn&#x0105;</div>
        <div style="font-size:8px;color:rgba(10,17,40,.65);line-height:1.45">W ci&#x0105;gu 5 dni roboczych od podpisania umowy uruchamiamy program &mdash; kompletna dokumentacja po naszej stronie.</div>
        <div style="margin-top:5px;font-size:7.5px;color:rgba(10,17,40,.45)">Oferta wa&#x017C;na do: <strong style="color:rgba(10,17,40,.7)">${offerDeadline}</strong></div>
      </div>

      <!-- Opiekun dane -->
      <div style="background:#1e3a8a;padding:10px 14px">
        <div style="font-size:7px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:5px">Tw&#xF3;j opiekun</div>
        <div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:5px;line-height:1.2">${tempFirma?.opiekunNazwa || 'Stratton Prime'}</div>
        ${tempFirma?.opiekunTelefon ? `<div style="font-size:9px;color:rgba(255,255,255,.65);margin-bottom:4px;display:flex;align-items:center;gap:6px"><span style="color:rgba(255,255,255,.25)">&#x260E;</span>${tempFirma.opiekunTelefon}</div>` : ''}
        <div style="font-size:9px;color:rgba(255,255,255,.65);display:flex;align-items:center;gap:6px"><span style="color:rgba(255,255,255,.25)">&#x2709;</span>${tempFirma?.opiekunEmail || 'kontakt@strattonprime.pl'}</div>
      </div>

    </div>

  </div>
  ${generateFooterV3()}
</div>`;

        // ══════════════════════════════════════════════════════════════════════
        // STRONA 3 — TWARDE DANE: analiza per pracownik
        // ══════════════════════════════════════════════════════════════════════
        const tableRows = workersData.map((w: any) => `
          <tr>
            <td>${w.imie} ${w.nazwisko}${w.czyDrugaSkala ? '<span class="sub" style="color:#7c3aed;font-weight:700">II próg</span>' : ''}</td>
            <td class="r">${fmt(w.premiaKwota)} zł</td>
            <td style="text-align:right;color:#DC2626">${fmt(w.kosztRaise)} zł</td>
            <td class="r gold">${fmt(w.kosztEBS)} zł</td>
            <td class="r" style="color:var(--success);font-weight:700">${fmt(w.oszczednosc)} zł</td>
            <td class="r" style="color:var(--success)">${w.oszczednoscPct}%</td>
          </tr>`).join('');

        const page3 = `
<div class="page">
  ${generatePageHeaderV3('Analiza finansowa — Twoja firma', '03. Twarde dane', 3, 4, date)}

  <div class="page-body" style="padding-top:8px">

    <!-- CEO Bar: 3 liczby -->
    <div style="background:var(--sp-navy);border-radius:4px;padding:8px 16px;margin-bottom:10px;display:grid;grid-template-columns:1fr 1px 1fr 1px 1fr;gap:0;align-items:center">
      <div style="text-align:center;padding:0 10px">
        <div style="font-size:7.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.9);margin-bottom:2px">Wart. premii/m-c ogółem</div>
        <div style="font-family:var(--font-serif);font-size:20px;color:rgba(255,255,255,.8)">${fmtK(sumPremia)}&nbsp;<span style="font-size:10px">zł</span></div>
      </div>
      <div style="width:1px;height:28px;background:rgba(255,255,255,.1)"></div>
      <div style="text-align:center;padding:0 10px">
        <div style="font-size:7.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.9);margin-bottom:2px">Koszt przez podwyżki</div>
        <div style="font-family:var(--font-serif);font-size:20px;color:#f87171">${fmtK(sumKosztRaise)}&nbsp;<span style="font-size:10px">zł</span></div>
      </div>
      <div style="width:1px;height:28px;background:rgba(255,255,255,.1)"></div>
      <div style="text-align:center;padding:0 10px">
        <div style="font-size:7.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.9);margin-bottom:2px">Koszt przez EBS — oszczędn.</div>
        <div style="font-family:var(--font-serif);font-size:20px;color:var(--sp-gold)">${fmtK(sumKosztEBS)}&nbsp;<span style="font-size:10px">zł</span>&nbsp;<span style="font-size:12px;color:var(--success)">−${fmtK(sumOszczednosc)}</span></div>
      </div>
    </div>

    <table class="dt" style="font-size:9.5px;margin-bottom:10px">
      <thead>
        <tr>
          <th>Pracownik</th>
          <th class="r">Premia<span class="sub">„do ręki" / m-c</span></th>
          <th class="r" style="color:#DC2626">Gdyby podwyżka<span class="sub">Koszt pracodawcy</span></th>
          <th class="r gold">★ Z voucherem EBS<span class="sub">Koszt pracodawcy</span></th>
          <th class="r">Oszczędzasz / m-c</th>
          <th class="r">%</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
        <tr class="tr-total">
          <td><strong>ŁĄCZNIE (${activePracownicy.length} os.)</strong></td>
          <td class="r"><strong>${fmt(sumPremia)} zł</strong></td>
          <td style="text-align:right;color:#DC2626"><strong>${fmt(sumKosztRaise)} zł</strong></td>
          <td class="r gold"><strong>${fmt(sumKosztEBS)} zł</strong></td>
          <td class="r" style="color:var(--success)"><strong>${fmt(sumOszczednosc)} zł</strong></td>
          <td class="r" style="color:var(--success)"><strong>~${avgOszczPct}%</strong></td>
        </tr>
      </tbody>
    </table>

    <!-- Roczna oszczędność -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
      <div style="background:rgba(16,185,129,.06);border:1px solid rgba(16,185,129,.25);border-left:3px solid var(--success);padding:10px 14px">
        <div style="font-size:8px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--success);margin-bottom:4px">Roczna oszczędność (EBS vs podwyżki)</div>
        <div style="font-family:var(--font-serif);font-size:26px;font-weight:700;color:var(--sp-navy)">${fmt(sumOszczRok)} zł<span style="font-size:11px;font-weight:400;color:var(--sp-text-muted)"> / rok</span></div>
        <div style="font-size:8.5px;color:var(--sp-text-muted);margin-top:4px">Przy tych samych kwotach netto dla pracowników</div>
      </div>
      ${count2Bracket > 0 ? `
      <div style="background:rgba(124,58,237,.05);border:1px solid rgba(124,58,237,.2);border-left:3px solid #7c3aed;padding:10px 14px">
        <div style="font-size:8px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:#7c3aed;margin-bottom:4px">Bonus — II próg podatkowy (32%)</div>
        <div style="font-size:10.5px;color:var(--sp-navy);line-height:1.5">${count2Bracket} z ${activePracownicy.length} pracowni${activePracownicy.length < 5 ? 'ków' : 'ków'} przekracza próg 120&nbsp;000&nbsp;zł/rok. Dla nich podwyżka kosztuje więcej (wyższa PIT w mianowniku brutto). Koszt EBS również rośnie, ale <strong style="color:#7c3aed">oszczędność % (~${exOszczPct}%) pozostaje stała</strong> — a absolutna kwota oszczędności jest wyższa.</div>
      </div>` : `
      <div style="background:var(--sp-gray);border:1px solid var(--border);padding:10px 14px">
        <div style="font-size:8px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--sp-gold);margin-bottom:4px">Podstawa prawna</div>
        <div style="font-size:9.5px;color:var(--sp-text-muted);line-height:1.5">Vouchery EBS to przychód pracownika wg art. 12 uPIT — objęty PIT wg skali. Są jednak <strong>wyłączone z podstawy wymiaru składek ZUS</strong> (Rozp. MPiPS § 2 ust. 1 pkt 26 z 18.12.1998). To jedyne, lecz realne źródło oszczędności pracodawcy.</div>
      </div>`}
    </div>

    <!-- Roczna wizualizacja — miesięczne słupki porównawcze -->
    <div style="background:var(--sp-gray);border:1px solid var(--border);padding:8px 14px">
      <div style="font-size:7.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--sp-navy);margin-bottom:6px">Porównanie miesięcznego kosztu pracodawcy (cała firma)</div>
      <div style="display:flex;gap:8px;align-items:flex-end;height:50px">
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%">
          <div style="font-size:7px;color:#DC2626;font-weight:600;margin-bottom:3px">${fmtK(sumKosztRaise)} zł</div>
          <div style="width:100%;background:#ef4444;height:100%;border-radius:2px 2px 0 0"></div>
          <div style="font-size:7px;color:var(--sp-text-muted);margin-top:3px">Przez podwyżkę</div>
        </div>
        <div style="flex:${Math.round(sumKosztEBS/sumKosztRaise*100)/100};display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%">
          <div style="font-size:7px;color:var(--sp-gold);font-weight:700;margin-bottom:3px">${fmtK(sumKosztEBS)} zł</div>
          <div style="width:100%;background:var(--sp-gold);height:${Math.round(sumKosztEBS/sumKosztRaise*100)}%;border-radius:2px 2px 0 0"></div>
          <div style="font-size:7px;color:var(--sp-text-muted);margin-top:3px">★ Przez EBS</div>
        </div>
      </div>
    </div>

    <p class="disc" style="margin-top:6px">Dane dla Twojej firmy (${activePracownicy.length} pracowni${activePracownicy.length < 5 ? 'ków' : 'ków'}). Kolumna „do ręki" = kwota netto, którą pracownik faktycznie otrzymuje. „Oszczędzasz" = różnica między kosztem podwyżki a kosztem vouchera EBS. Prowizja EBS ${tempProwizja}%, ZUS pracodawcy ${Math.round(zusPracodawcaAdd*100)}%.</p>
  </div>
  ${generateFooterV3()}
</div>`;

        // ══════════════════════════════════════════════════════════════════════
        // STRONA 4 — DLACZEGO TO DZIAŁA + CTA
        // ══════════════════════════════════════════════════════════════════════
        const page4 = `
<div class="page">
  ${generatePageHeaderV3('Dlaczego to działa i co dalej', '04. Podsumowanie', 4, 4, date)}

  <div class="page-body" style="padding-top:12px">

    <!-- Wielka liczba — oszczędność roczna -->
    <div style="background:var(--sp-navy);border-radius:4px;padding:14px 24px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between">
      <div>
        <div style="font-size:8px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:4px">Łączna roczna oszczędność</div>
        <div style="font-family:var(--font-serif);font-size:34px;font-weight:700;color:var(--sp-gold);line-height:1">${fmtK(sumOszczRok)} zł</div>
        <div style="font-size:10px;color:rgba(255,255,255,.4);margin-top:4px">vs. realizacja tych samych premii przez podwyżki brutto</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:8px;color:rgba(255,255,255,.3);margin-bottom:2px">Miesięcznie</div>
        <div style="font-family:var(--font-mono);font-size:18px;color:rgba(255,255,255,.7);font-weight:700">${fmtK(sumOszczednosc)} zł</div>
        <div style="font-size:8px;color:rgba(255,255,255,.3);margin-top:6px">Śr. oszczędność na pracowniku</div>
        <div style="font-family:var(--font-mono);font-size:14px;color:var(--sp-gold)">${workersData.length > 0 ? fmtK(sumOszczednosc/workersData.length) : 0} zł/m-c</div>
      </div>
    </div>

    <!-- 4 filary — mechanics -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--border);margin-bottom:14px">

      <div style="background:var(--sp-gray);padding:12px 16px">
        <div style="font-size:8px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--sp-gold);margin-bottom:6px">✓ Czy to jest legalne?</div>
        <p style="font-size:9.5px;color:var(--sp-text-muted);line-height:1.5;margin:0">Tak — i to od 27 lat. Vouchery towarowe są wyłączone ze składek ZUS na mocy rozporządzenia Ministra Pracy z 1998 r. Pracownik płaci od nich podatek dochodowy — tak samo jak od zwykłej premii. To nie jest „optymalizacja na granicy prawa" — to standardowe, powszechnie stosowane narzędzie kadrowe.</p>
      </div>

      <div style="background:var(--sp-gray);padding:12px 16px">
        <div style="font-size:8px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--success);margin-bottom:6px">💰 Skąd pochodzi oszczędność?</div>
        <p style="font-size:9.5px;color:var(--sp-text-muted);line-height:1.5;margin:0">Z braku ZUS. Przy podwyżce płacisz ~${Math.round(zusPracodawcaAdd*100)}% ZUS pracodawcy na górze, a pracownik traci 13,71% ZUS z dołu. Przy voucherze — ani jedno, ani drugie. Podatek dochodowy płacony jest tak samo jak przy podwyżce.</p>
      </div>

      <div style="background:var(--sp-gray);padding:12px 16px">
        <div style="font-size:8px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#0284c7;margin-bottom:6px">📊 Jak dużo oszczędzasz?</div>
        <p style="font-size:9.5px;color:var(--sp-text-muted);line-height:1.5;margin:0">Około <strong>${avgOszczPct > 0 ? avgOszczPct : 8}% taniej</strong> niż przez podwyżkę — przy identycznym netto dla pracownika. Dla Twojej firmy to konkretnie <strong>${fmtK(sumOszczednosc)} zł miesięcznie</strong> i <strong>${fmtK(sumOszczRok)} zł rocznie</strong>, które zostają w kasie firmy. Im więcej pracowników i wyższe premie — tym większa kwota.</p>
      </div>

      <div style="background:var(--sp-gray);padding:12px 16px">
        <div style="font-size:8px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--sp-navy);margin-bottom:6px">🤝 Co Stratton robi za Ciebie?</div>
        <p style="font-size:9.5px;color:var(--sp-text-muted);line-height:1.5;margin:0">Przygotowujemy całą dokumentację: regulamin, wzory ewidencji, integrację z listą płac. Nie musisz zmieniać umów o pracę — wystarczy aktualizacja regulaminu wynagradzania. Zazwyczaj pierwsze vouchery trafiają do pracowników już w następnym miesiącu po podpisaniu umowy.</p>
      </div>
    </div>

    <!-- Zestawienie porównawcze — szybkie podsumowanie -->
    <div style="border:1px solid var(--border);border-top:3px solid var(--sp-gold);padding:10px 16px;margin-bottom:14px">
      <div style="font-size:8px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--sp-navy);margin-bottom:8px">Podsumowanie finansowe</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;text-align:center">
        <div>
          <div style="font-size:7.5px;color:var(--sp-text-muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">Premie/m-c (netto)</div>
          <div style="font-family:var(--font-mono);font-size:16px;font-weight:700;color:var(--sp-navy)">${fmtK(sumPremia)} zł</div>
        </div>
        <div>
          <div style="font-size:7.5px;color:#DC2626;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">Koszt — podwyżki</div>
          <div style="font-family:var(--font-mono);font-size:16px;font-weight:700;color:#DC2626">${fmtK(sumKosztRaise)} zł</div>
        </div>
        <div>
          <div style="font-size:7.5px;color:var(--sp-gold);text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">★ Koszt — EBS</div>
          <div style="font-family:var(--font-mono);font-size:16px;font-weight:700;color:var(--sp-gold)">${fmtK(sumKosztEBS)} zł</div>
        </div>
        <div>
          <div style="font-size:7.5px;color:var(--success);text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">Oszcz. roczna</div>
          <div style="font-family:var(--font-mono);font-size:16px;font-weight:700;color:var(--success)">${fmtK(sumOszczRok)} zł</div>
        </div>
      </div>
    </div>

    <!-- CTA -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div style="background:var(--sp-navy);padding:14px 18px;display:flex;flex-direction:column;justify-content:space-between">
        <div>
          <div style="font-size:8px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--sp-gold-light);margin-bottom:6px">Następne kroki</div>
          <ol style="margin:0;padding:0 0 0 14px;list-style:decimal;color:rgba(255,255,255,.65);font-size:9.5px;line-height:1.8">
            <li>Weryfikacja danych pracowniczych (1 dzień rob.)</li>
            <li>Podpisanie umowy serwisowej Stratton Prime</li>
            <li>Aktualizacja regulaminu wynagradzania</li>
            <li>Synchronizacja z systemem kadrowym</li>
            <li>Pierwsze vouchery — już w następnym miesiącu</li>
          </ol>
        </div>
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.08)">
          <div style="font-size:7.5px;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:.1em">Oferta ważna do</div>
          <div style="font-family:var(--font-mono);font-size:13px;color:var(--sp-gold);margin-top:2px">${offerDeadline}</div>
        </div>
      </div>

      <div style="background:rgba(198,161,91,.05);border:2px solid var(--sp-gold);padding:14px 18px">
        <div style="font-size:8px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--sp-gold);margin-bottom:10px">Kontakt w sprawie oferty</div>
        ${tempFirma?.opiekunNazwa ? `
        <div style="margin-bottom:8px">
          <div style="font-size:12px;font-weight:700;color:var(--sp-navy)">${tempFirma.opiekunNazwa}</div>
          <div style="font-size:9px;color:var(--sp-text-muted)">Opiekun Handlowy</div>
        </div>
        ${tempFirma?.opiekunEmail ? `<div style="font-size:9.5px;color:var(--sp-navy);margin-bottom:3px">✉ ${tempFirma.opiekunEmail}</div>` : ''}
        ${tempFirma?.opiekunTelefon ? `<div style="font-size:9.5px;color:var(--sp-navy)">☎ ${tempFirma.opiekunTelefon}</div>` : ''}
        ` : `
        <div style="font-size:9.5px;color:var(--sp-text-muted);line-height:1.6">
          Stratton Prime Sp. z o.o.<br>
          ul. Nowy Świat 42/44, 80-299 Gdańsk<br>
          NIP: 5842867357
        </div>`}
        <div style="margin-top:12px;padding-top:10px;border-top:1px solid rgba(198,161,91,.2);font-size:8.5px;color:var(--sp-text-muted)">
          Przygotowany na podstawie przekazanych danych.<br>
          Wyniki szacunkowe — ostateczne wartości po weryfikacji.
        </div>
      </div>
    </div>

  </div>
  ${generateFooterV3()}
</div>`;

        // ── HTML doc ──────────────────────────────────────────────────────────
        const html = `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${tempFirma?.nazwa || 'Oferta'} — Legalizacja Premii Eliton Prime™</title>
    <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet">
    <style>${getOfferPdfV3Styles()}</style>
    <style>
      .dt { width:100%;border-collapse:collapse }
      .dt th { background:var(--sp-navy);color:#fff;font-size:8.5px;font-weight:600;letter-spacing:.03em;text-transform:uppercase;padding:6px 8px;text-align:left }
      .dt th.r { text-align:right }
      .dt th.gold { color:var(--sp-gold) }
      .dt td { padding:5px 8px;border-bottom:1px solid var(--border);font-size:9.5px;color:var(--sp-text) }
      .dt td.r { text-align:right }
      .dt td.gold { text-align:right;color:var(--sp-gold);font-weight:600 }
      .dt tr.tr-total td { background:var(--sp-gray);font-weight:700;border-top:2px solid var(--sp-navy) }
      .sub { display:block;font-size:7.5px;color:var(--sp-text-muted);font-weight:400;margin-top:1px }
      .lead { font-size:11px;color:var(--sp-text-muted);line-height:1.65 }
      .disc { font-size:8px;color:var(--sp-text-muted);line-height:1.4;margin-top:6px }

      /* ── Formatowanie wydruku z oznaczeniami drukarskimi ── */
      @media print {
        @page {
          size: A4 portrait;
          margin: 0;
          /* Spad 3 mm — treść wychodzi poza linię cięcia, zabezpiecza przed białym marginesem */
          bleed: 3mm;
          /* Znaczniki cięcia i krzyże rejestracyjne */
          marks: crop cross;
        }

        /* Strefa bezpieczna 8 mm — padding gwarantuje, że nic ważnego nie znajdzie się
           bliżej niż 8 mm od każdej krawędzi (powyżej linii cięcia) */
        .page-body {
          padding-left: 8mm !important;
          padding-right: 8mm !important;
        }

        /* Upewnij się, że tła i kolory są drukowane */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    </style>
</head>
<body style="margin:0;padding:0;background:#CCC8C2;display:flex;flex-direction:column;align-items:center">
    ${[page1, page2, page3, page4].join('\n')}
    <script>window.onload=()=>window.print();</script>
</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html' });
        const url  = URL.createObjectURL(blob);
        const safeNazwa = (tempFirma?.nazwa || 'Eliton-Prime')
            .replace(/[^a-z0-9\-_ ]/gi, '_')
            .trim();
        printHtmlAsPdf(html, url, `Oferta-LegalizacjaPremii-${safeNazwa}.pdf`);
    },
};
