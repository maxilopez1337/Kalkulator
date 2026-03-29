/* eslint-disable no-useless-escape */
import type { SimulationParams } from '../types';
import { printHtmlAsPdf } from '../../../shared/utils/printPdf';
import { getV5Styles } from './css5';
import { generateCoverV5 } from './00_Cover';
import { generateMechanizmV5 } from './01_Mechanizm';
import { generateKosztV5 } from './02_KosztZaniechania';
import { generateWiarygodnoscV5 } from './03_Wiarygodnosc';
import { generateWariantyV5 } from './04_Warianty';
import { generateCTAV5 } from './05_KolejneKroki';

const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap';

export const ofertaV5Generator = {
  generate(p: SimulationParams): void {
    const now = new Date();
    const date = now.toLocaleDateString('pl-PL');
    const docNr = `SP/AW/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    const validity = (() => {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      return d.toLocaleDateString('pl-PL');
    })();

    const html = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Analiza Wstępna · Stratton Prime · ${p.firmaNazwa ?? 'Twoja Firma'} · ${docNr}</title>
  <link href="${FONTS_URL}" rel="stylesheet"/>
  <style>${getV5Styles()}</style>
</head>
<body>
${generateCoverV5(p, date, docNr)}
${generateMechanizmV5(p, date)}
${generateKosztV5(p, validity, date)}
${generateWiarygodnoscV5(p, date)}
${generateWariantyV5(p, date)}
${generateCTAV5(p, validity, date)}
<script>
  (function() {
    window.onload = function() { window.print(); };
  })();
<\/script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    printHtmlAsPdf(html, url);
  },
};
