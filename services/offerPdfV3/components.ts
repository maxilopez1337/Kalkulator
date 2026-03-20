import { getOfferPdfV3Styles } from './styles';

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
