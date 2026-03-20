import { getOfferPdfV2Styles } from './styles';

export const generateHeadV2 = (title: string) => `
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        ${getOfferPdfV2Styles()}
      </style>
    </head>
`;

export const generatePageHeaderV2 = (title: string, subtitle: string, pageNumber: number, totalPages: number, date: string) => `
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

export const generateFooterV2 = () => `
    <div class="footer">
        <div class="footer-text">STRATTON PRIME SP. Z O.O.</div>
        <div class="footer-text">POUFNE &copy; ${new Date().getFullYear()}</div>
    </div>
`;
