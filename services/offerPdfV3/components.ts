import { getOfferPdfV3Styles } from './styles';
import { LOGO_OFERTA_B64 } from './pages/logoOfertaB64';

export const generateHeadV3 = (title: string) => `
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        ${getOfferPdfV3Styles()}
      </style>
    </head>
`;

export const generatePageHeaderV3 = (title: string, subtitle: string, pageNumber: number, totalPages: number, date: string) => `
    <div class="header">
        <div class="header-left">
            <div class="header-subtitle">${subtitle}</div>
            <div class="header-title">${title}</div>
        </div>
        <div class="header-meta">
            <div>DATA: ${date}</div>
            <div style="margin-top: 4px;">STRONA ${pageNumber}/${totalPages}</div>
        </div>
    </div>
`;

export const generateFooterV3 = () => `
    <div class="footer">
        <div class="footer-rule"></div>
        <div class="footer-inner">
            <div class="footer-text">Stratton Prime Sp. z o.o.<span style="margin:0 6px;opacity:.25">·</span>ul. Nowy Świat 42/44, 80-299 Gdańsk<span style="margin:0 6px;opacity:.25">·</span>NIP: 5842867357</div>
            <div class="footer-brand">
                <div class="footer-brand-mark">
                    <div class="footer-brand-line"></div>
                    <div class="footer-brand-dot"></div>
                    <div class="footer-brand-line"></div>
                </div>
                <div class="footer-brand-name">STRATTON PRIME</div>
            </div>
            <div class="footer-confidential"><svg width="8" height="10" viewBox="0 0 9 11" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x=".5" y="4.5" width="8" height="6" rx="1" stroke="var(--sp-navy)" stroke-opacity=".5"/><path d="M2 4.5V3a2.5 2.5 0 0 1 5 0v1.5" stroke="var(--sp-navy)" stroke-opacity=".5" stroke-linecap="round"/><circle cx="4.5" cy="7.5" r=".75" fill="var(--sp-navy)" fill-opacity=".5"/></svg>Dokument poufny</div>
        </div>
    </div>
`;

/**
 * Stopka z numerem strony — używana przez strony wewnętrzne (np. Analiza Wstępna).
 * Jedna zmiana tutaj = aktualizacja we wszystkich generatorach.
 */
export const generateFooterWithPage = (pageNum: number, totalPages: number) => `
    <div class="footer">
        <div class="footer-rule"></div>
        <div class="footer-inner">
            <div class="footer-text">Stratton Prime Sp. z o.o.&nbsp;·&nbsp;ul. Nowy Świat 42/44, 80-299 Gdańsk&nbsp;·&nbsp;NIP: 5842867357</div>
            <div class="footer-brand">
                <div class="footer-brand-mark">
                    <div class="footer-brand-line"></div>
                    <div class="footer-brand-dot"></div>
                    <div class="footer-brand-line"></div>
                </div>
                <div class="footer-brand-name">STRATTON PRIME</div>
            </div>
            <div class="footer-confidential">Dokument poufny &nbsp;·&nbsp; Strona ${pageNum} / ${totalPages}</div>
        </div>
    </div>
`;

export interface CoverShellParams {
    /** Kolor tła strony, np. '#F8F7F4' (jasny) lub '#0A1128' (granatowy) */
    background: string;
    /** Krycie logo po prawej stronie (0–1). Granatowe tło → 0.12, jasne → 0.8 */
    logoOpacity?: number;
    /** Etykieta dokumentu w prawym górnym rogu, np. 'OFERTA INDYWIDUALNA' */
    subtitle: string;
    /** Kolor etykiety subtitle (domyślnie złoty) */
    subtitleColor?: string;
    /** HTML treści środkowej sekcji — specyficzny dla każdej oferty */
    centerContent: string;
    /** Data dokumentu */
    date: string;
    /** Numer referencyjny dokumentu */
    ref: string;
    /** Imię i nazwisko autora dokumentu */
    advisorName: string;
    /** E-mail autora (opcjonalny) */
    advisorEmail?: string;
}

/**
 * Wspólna powłoka okładki (cover page) dla wszystkich ofert.
 * Definiuje stały layout: złoty pasek, logo, top bar, dolna belka.
 * Treść środkowa jest wstrzykiwana jako parametr centerContent.
 *
 * Zmień raz tutaj → zmiana widoczna we wszystkich ofertach.
 */
export const generateCoverShell = (p: CoverShellParams): string => {
    const logoOpacity = p.logoOpacity ?? 0.8;
    const subtitleColor = p.subtitleColor ?? 'rgba(212,175,90,.92)';
    return `<div class="page" style="display:flex;flex-direction:column;overflow:hidden;background:${p.background}">

  <!-- złoty pasek lewej krawędzi -->
  <div style="position:absolute;top:0;left:0;width:3px;height:100%;background:#C6A15B;opacity:.85;z-index:3"></div>

  <!-- logo — prawa połowa, pełna wysokość -->
  <img src="${LOGO_OFERTA_B64}" style="position:absolute;top:0;right:0;height:100%;width:auto;object-fit:contain;object-position:right center;z-index:1;pointer-events:none;user-select:none;opacity:${logoOpacity}" />

  <!-- TOP BAR -->
  <div style="padding:32px 52px 0 56px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;position:relative;z-index:2">
    <div style="display:flex;align-items:center;gap:9px">
      <div style="width:6px;height:6px;background:#C6A15B"></div>
      <span style="font-size:8px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:rgba(13,31,60,.65)">STRATTON PRIME</span>
    </div>
    <span style="font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:${subtitleColor};font-weight:700">${p.subtitle}</span>
  </div>

  <!-- TREŚĆ ŚRODKOWA -->
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:0 52px 0 56px;position:relative;z-index:2">
    ${p.centerContent}
  </div>

  <!-- DOLNA BELKA -->
  <div style="flex-shrink:0;position:relative;z-index:2">
    <div style="height:1px;margin:0 52px 0 56px;background:linear-gradient(90deg,#C6A15B 0%,rgba(198,161,91,.2) 40%,transparent 100%)"></div>
    <div style="padding:16px 52px 24px 56px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:6.5px;text-transform:uppercase;letter-spacing:.2em;color:rgba(176,144,32,.6);margin-bottom:5px">Data dokumentu</div>
        <div style="font-size:13px;font-weight:300;color:rgba(13,31,60,.7);letter-spacing:.04em">${p.date}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:5px">
        <div style="display:flex;align-items:center;gap:7px">
          <div style="width:18px;height:1px;background:rgba(176,144,32,.35)"></div>
          <div style="width:5px;height:5px;background:#C6A15B;opacity:.7"></div>
          <div style="width:18px;height:1px;background:rgba(176,144,32,.35)"></div>
        </div>
        <div style="font-size:7px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:rgba(13,31,60,.4)">STRATTON PRIME</div>
        <div style="font-size:7px;letter-spacing:.14em;color:rgba(176,144,32,.45)">${p.ref}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:6.5px;text-transform:uppercase;letter-spacing:.2em;color:rgba(176,144,32,.6);margin-bottom:5px">Dokument przygotowała</div>
        <div style="font-size:13px;font-weight:300;color:rgba(13,31,60,.7);letter-spacing:.02em">${p.advisorName}</div>
        ${p.advisorEmail ? `<div style="font-size:8px;color:rgba(13,31,60,.35);margin-top:3px;letter-spacing:.06em">${p.advisorEmail}</div>` : ''}
      </div>
    </div>
  </div>

</div>`;
};
