export const getV5Styles = (): string => `
  :root {
    --navy: #0D1F3C;
    --gold: #D4AF5A; --gold-dark: #B09020; --gold-light: #C6A15B;
    --green: #2D7A4F; --green-dark: #1B5E20;
    --red: #9B1C1C;
    --white: #FFFFFF; --off: #F8F7F4; --bg: #CCC8C2;
    --text: #1C1C1C; --slate: #4A5467; --muted: #8896A8;
    --border: #DDD8CE;
    --font-sans: 'Inter', sans-serif;
    --font-serif: 'Playfair Display', serif;
    --font-mono: 'JetBrains Mono', monospace;
  }
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
  html{background:var(--bg)}
  body{font-family:var(--font-sans);color:var(--text);font-size:13px;line-height:1.65;background:var(--bg)}
  .page{width:210mm;height:297mm;background:var(--white);position:relative;overflow:hidden;margin:20px auto;display:flex;flex-direction:column;box-shadow:0 25px 50px -12px rgba(0,0,0,.25);page-break-after:always}
  @media print{
    @page{size:A4;margin:0}
    html,body{background:transparent;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .page{margin:0;box-shadow:none;height:297mm;width:210mm}
  }
  /* HEADER */
  .ph{display:flex;justify-content:space-between;align-items:flex-end;padding:14px 48px 10px;border-bottom:2px solid var(--gold-dark);flex-shrink:0}
  .ph-left .tag{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--gold-dark);margin-bottom:4px}
  .ph-left .title{font-family:var(--font-serif);font-size:28px;font-weight:700;color:var(--navy);line-height:1;letter-spacing:-0.5px}
  .ph-right{font-family:var(--font-mono);font-size:10px;color:var(--muted);text-align:right;line-height:1.4}
  /* BODY */
  .pb{padding:14px 48px 62px;flex:1}
  /* FOOTER — V3 style */
  .footer{position:absolute;bottom:0;left:0;right:0;background:var(--white)}
  .footer-rule{height:1px;margin:0 50px;background:linear-gradient(90deg,var(--gold-dark) 0%,rgba(198,161,91,.15) 35%,transparent 100%)}
  .footer-inner{display:flex;justify-content:space-between;align-items:center;padding:7px 50px 8px}
  .footer-text{font-size:8px;color:var(--muted);font-family:var(--font-mono);letter-spacing:.6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
  .footer-brand{display:flex;flex-direction:column;align-items:center;gap:3px;flex-shrink:0}
  .footer-brand-mark{display:flex;align-items:center;gap:6px}
  .footer-brand-line{width:14px;height:1px;background:rgba(176,144,32,.35)}
  .footer-brand-dot{width:4px;height:4px;background:var(--gold-dark);opacity:.6;border-radius:50%}
  .footer-brand-name{font-size:6.5px;font-weight:700;letter-spacing:.26em;text-transform:uppercase;color:rgba(13,31,60,.4)}
  .footer-confidential{font-size:7.5px;font-family:var(--font-mono);letter-spacing:.12em;color:rgba(13,31,60,.5);font-weight:700;white-space:nowrap;flex-shrink:0;text-transform:uppercase}
  /* HEADINGS */
  h3.sh{font-family:var(--font-serif);font-size:14px;font-weight:700;color:var(--navy);display:flex;align-items:center;gap:12px;margin:0 0 7px;letter-spacing:-0.2px;padding:4px 0 5px}
  h3.sh::before{content:'';display:inline-block;width:4px;height:18px;background:var(--gold-dark);flex-shrink:0}
  p.lead{font-size:11.5px;color:var(--slate);line-height:1.55;margin-bottom:18px;max-width:680px}
  /* MODEL COMPARE */
  .mc{display:grid;grid-template-columns:1fr 44px 1fr;gap:1px;background:var(--border);margin-bottom:22px}
  .mc-col{background:var(--white);padding:18px 22px}.mc-col.after{background:#E8F5E9}
  .mc-title{font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-bottom:12px}
  .mc-col.after .mc-title{color:var(--green-dark)}
  .mc-row{display:flex;justify-content:space-between;align-items:baseline;padding:5px 0;border-bottom:1px solid rgba(0,0,0,.06)}
  .mc-row:last-child{border:none}
  .mc-lbl{font-size:11.5px;color:var(--slate)}
  .mc-val{font-size:12.5px;font-weight:600;color:var(--navy);white-space:nowrap}
  .mc-val.green{color:var(--green-dark)}.mc-val.gold{color:var(--gold-dark)}.mc-val.red{color:var(--red)}
  .mc-arrow{background:var(--navy);color:var(--gold);display:flex;align-items:center;justify-content:center;font-size:20px}
  /* YES/NO */
  .yn{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--border);margin-bottom:22px}
  .yn-col{background:var(--white);padding:20px 24px}
  .yn-head{font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;padding:8px 12px;margin-bottom:10px}
  .yn-head.yes{background:#E8F5E9;color:var(--green-dark)}.yn-head.no{background:#FFF0F0;color:var(--red)}
  .yn-item{display:flex;gap:10px;align-items:flex-start;padding:7px 0;border-bottom:1px solid var(--border);font-size:12px;color:var(--slate);line-height:1.55}
  .yn-item:last-child{border:none}
  .yn-ico{flex-shrink:0;margin-top:1px;font-size:13px}
  .yn-ico.y{color:var(--green-dark)}.yn-ico.n{color:var(--red)}
  /* INERTIA */
  .inertia{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:var(--border);margin-bottom:10px}
  .ig{background:var(--navy);padding:14px 18px;text-align:center}.ig.main{background:#1a0a0a}
  .ig-val{font-family:var(--font-serif);font-size:28px;color:#f87171;line-height:1;margin-bottom:4px}
  .ig.main .ig-val{font-size:38px;color:#fca5a5}
  .ig-lbl{font-size:10px;color:rgba(255,255,255,.78);line-height:1.4}
  .ig-note{font-size:9px;color:rgba(255,255,255,.55);margin-top:3px}
  /* COST TABLE */
  .ct{width:100%;border-collapse:collapse;margin-bottom:10px;font-size:11.5px}
  .ct thead th{background:var(--navy);color:var(--white);padding:7px 11px;text-align:left;font-size:8.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase}
  .ct thead th:not(:first-child){text-align:right}
  .ct tbody tr{border-bottom:1px solid var(--border)}.ct tbody tr:nth-child(odd){background:var(--off)}.ct tbody tr.tot{background:var(--navy)}
  .ct td{padding:7px 11px;color:var(--navy)}.ct td:not(:first-child){text-align:right;font-weight:600}
  .ct .neg{color:var(--green-dark)}.ct .pos{color:var(--red)}
  .ct .muted{color:var(--muted)!important;font-weight:400!important}
  .ct .tot td{color:var(--gold);font-weight:700}
  /* ROI STRIP */
  .roi{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);margin-bottom:22px}
  .roi-c{background:var(--white);padding:18px 16px;text-align:center}
  .roi-c.accent{background:#F2E8C8;border-top:3px solid var(--gold-dark)}
  .roi-val{font-family:var(--font-serif);font-size:30px;color:var(--navy);line-height:1;margin-bottom:4px}
  .roi-c.accent .roi-val{color:var(--gold-dark)}.roi-lbl{font-size:10px;color:var(--muted);letter-spacing:.08em;line-height:1.4}
  /* PLUS SECTION — HOOK */
  .plus{background:linear-gradient(140deg,#0a1628 0%,var(--navy) 50%,#111d38 100%);padding:14px 22px;position:relative;overflow:hidden;border-top:3px solid var(--gold);margin-bottom:0}
  .plus::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(ellipse 80% 130% at 105% 40%,rgba(212,175,90,.11),transparent);pointer-events:none}
  .plus::after{content:'';position:absolute;top:0;right:0;width:48%;height:100%;background:repeating-linear-gradient(-45deg,transparent,transparent 10px,rgba(212,175,90,.025) 10px,rgba(212,175,90,.025) 11px);pointer-events:none}
  .plus-header{margin-bottom:9px;position:relative;z-index:1}
  .plus-badge{display:inline-block;background:var(--gold-dark);color:var(--navy);font-size:7.5px;font-weight:700;letter-spacing:.15em;padding:3px 10px;margin-bottom:7px;text-transform:uppercase}
  .plus-title{font-family:var(--font-serif);font-size:15px;color:var(--white);margin-bottom:5px;line-height:1.2}
  .plus-title em{font-style:italic;color:var(--gold)}
  .plus-sub{font-size:9.5px;color:rgba(255,255,255,.72);line-height:1.45;max-width:620px}
  .plus-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border:1px solid rgba(212,175,90,.18);overflow:hidden;margin-bottom:9px;position:relative;z-index:1}
  .plus-cell{padding:10px 12px;text-align:center;border-right:1px solid rgba(212,175,90,.12);position:relative}
  .plus-cell:last-child{border-right:none}
  .plus-cell::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold-dark),var(--gold))}
  .plus-val{font-family:var(--font-serif);font-size:22px;color:var(--gold);line-height:1;margin-bottom:4px}
  .plus-lbl{font-size:8.5px;color:rgba(255,255,255,.72);line-height:1.35}
  .plus-hook{background:rgba(212,175,90,.06);border:1px solid rgba(212,175,90,.16);padding:9px 14px;display:flex;align-items:center;justify-content:space-between;gap:18px;position:relative;z-index:1}
  .plus-hook-txt{font-size:9.5px;color:rgba(255,255,255,.78);line-height:1.45;flex:1}
  .plus-hook-txt strong{color:var(--gold)}
  .plus-hook-cta{font-size:10px;font-weight:700;color:var(--gold);letter-spacing:.05em;white-space:nowrap;flex-shrink:0}
  /* CREDIBILITY */
  .zuk{background:var(--navy);padding:24px 28px;display:flex;gap:20px;align-items:flex-start;margin-bottom:18px}
  .zuk-av{width:56px;height:56px;background:rgba(255,255,255,.08);border:1.5px solid var(--gold-dark);border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--font-serif);font-size:16px;color:var(--gold);flex-shrink:0}
  .zuk-name{font-size:14px;font-weight:600;color:var(--white);margin-bottom:1px}
  .zuk-role{font-size:9.5px;color:rgba(255,255,255,.65);margin-bottom:10px;letter-spacing:.03em}
  .zuk-q{font-family:var(--font-serif);font-size:12.5px;font-style:italic;color:rgba(255,255,255,.92);line-height:1.65;border-left:2px solid var(--gold-dark);padding-left:12px}
  .zuk-meta{font-size:9.5px;color:var(--muted);margin-top:8px}
  /* PILLARS */
  .pillars{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:var(--border);margin-bottom:18px}
  .pil{background:var(--off);padding:22px 18px;text-align:center;border-top:3px solid var(--gold-dark)}
  .pil-val{font-family:var(--font-serif);font-size:36px;color:var(--navy);line-height:1;margin-bottom:5px}
  .pil-lbl{font-size:10.5px;font-weight:600;color:var(--navy);margin-bottom:3px;letter-spacing:.03em}
  .pil-sub{font-size:10.5px;color:var(--muted);line-height:1.5}
  /* SUPPORT GRID */
  .sg{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:var(--border);margin-bottom:18px}
  .sg-it{background:var(--white);padding:9px 11px;display:flex;gap:8px;align-items:flex-start}
  .sg-ico{font-size:14px;color:var(--gold-dark);flex-shrink:0;margin-top:1px}
  .sg-title{font-size:10.5px;font-weight:600;color:var(--navy);margin-bottom:2px}
  .sg-desc{font-size:9.5px;color:var(--muted);line-height:1.4}
  /* CTA BLOCK */
  .cta-block{background:var(--navy);padding:20px 48px;text-align:center;position:relative;overflow:hidden}
  .cta-block::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(ellipse 70% 80% at 50% 50%,rgba(176,144,32,.08),transparent);pointer-events:none}
  .cta-eyebrow{font-size:8.5px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:10px}
  .cta-eyebrow::before,.cta-eyebrow::after{content:'';width:24px;height:1px;background:var(--gold)}
  .cta-h{font-family:var(--font-serif);font-size:26px;color:var(--white);line-height:1.2;margin-bottom:6px}
  .cta-h em{font-style:italic;color:var(--gold)}
  .cta-sub{font-size:11px;color:rgba(255,255,255,.72);margin-bottom:14px;line-height:1.6;max-width:540px;margin-left:auto;margin-right:auto}
  .cta-btn{background:var(--gold-dark);color:var(--navy);padding:10px 0;font-size:12px;font-weight:700;letter-spacing:.06em;margin-bottom:12px}
  .cta-btn span{display:block;font-size:10px;font-weight:400;color:rgba(0,25,55,.6);margin-top:3px}
  .cta-contacts{display:flex;justify-content:center;gap:20px;margin-bottom:12px}
  .cc-item{display:flex;flex-direction:column;align-items:center;gap:2px;min-width:0}
  .cc-lbl{font-size:7.5px;color:rgba(255,255,255,.58);letter-spacing:.12em;text-transform:uppercase;white-space:nowrap}
  .cc-val{font-size:11px;font-weight:600;color:var(--white);white-space:nowrap}
  .cta-guar{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(255,255,255,.08);margin-top:10px}
  .cg{background:rgba(255,255,255,.04);padding:9px 12px;text-align:center;font-size:10px;color:rgba(255,255,255,.65);line-height:1.4}
  .cg strong{display:block;color:rgba(255,255,255,.9);font-size:10.5px;margin-bottom:1px}
  /* TIMELINE */
  .tl-row{display:grid;grid-template-columns:repeat(6,1fr);gap:1px;background:var(--border);margin-bottom:24px}
  .tl-cell{background:var(--white);padding:18px 14px;text-align:center}
  .tl-cell.active{background:var(--navy)}.tl-cell.cta{background:var(--gold-dark)}
  .tl-time{font-size:8px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--gold-dark);margin-bottom:6px}
  .tl-cell.active .tl-time{color:var(--gold)}.tl-cell.cta .tl-time{color:var(--white)}
  .tl-num{font-family:var(--font-serif);font-size:22px;color:var(--navy);margin-bottom:5px}
  .tl-cell.active .tl-num{color:var(--white)}.tl-cell.cta .tl-num{color:var(--white)}
  .tl-label{font-size:10.5px;font-weight:600;color:var(--navy);margin-bottom:3px}
  .tl-cell.active .tl-label{color:var(--white)}.tl-cell.cta .tl-label{color:var(--white)}
  .tl-desc{font-size:10px;color:var(--muted);line-height:1.5}
  .tl-cell.active .tl-desc{color:rgba(255,255,255,.8)}.tl-cell.cta .tl-desc{color:rgba(255,255,255,.9)}
  /* UTIL */
  .disc{font-size:10.5px;color:var(--muted);line-height:1.6;border-top:1px solid var(--border);padding-top:10px;margin-top:14px}
`;
