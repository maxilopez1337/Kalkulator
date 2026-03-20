export const fmt2 = (v: number) =>
    new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

export const fmtK2 = (v: number) =>
    new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(Math.round(v));

export const PF = () => `
  <div class="footer">
    <div class="footer-rule"></div>
    <div class="footer-inner">
      <div class="footer-text">Stratton Prime Sp. z o.o. &middot; Gdańsk &middot; NIP: 5842867357</div>
      <div class="footer-brand">
        <div class="footer-brand-mark">
          <div class="footer-brand-line"></div>
          <div class="footer-brand-dot"></div>
          <div class="footer-brand-line"></div>
        </div>
        <div class="footer-brand-name">Stratton Prime</div>
      </div>
      <div class="footer-confidential">&#9632; POUFNE</div>
    </div>
  </div>`;

export const PH = (secNum: string, title: string, date: string, pageStr: string) => `
  <div class="header">
    <div class="header-left">
      <div class="header-subtitle">${secNum}</div>
      <div class="header-title">${title}</div>
    </div>
    <div class="header-meta">
      <div>DATA: ${date}</div>
      <div>STRONA ${pageStr}</div>
    </div>
  </div>`;
