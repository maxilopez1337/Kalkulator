export const getOfferPdfV3Styles = () => `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap');

    :root {
        /* Stratton Prime Brand Colors */
        --sp-navy: #0A1128;      /* Primary Navy */
        --sp-gold: #C6A15B;      /* Primary Gold */
        --sp-gold-light: #E5C585; /* Light Gold */
        --sp-gray: #F3F4F6;      /* Light Gray Background */
        --sp-text: #1F2937;      /* Main Text */
        --sp-text-muted: #6B7280; /* Muted Text */
        
        /* Functional Colors */
        --white: #ffffff;
        --success: #10B981;
        --border: #E5E7EB;
        
        --font-sans: 'Inter', sans-serif;
        --font-serif: 'Playfair Display', serif;
        --font-mono: 'JetBrains Mono', monospace;
    }

    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: var(--font-sans); color: var(--sp-text); background: #cbd5e1; -webkit-font-smoothing: antialiased; }

    .page {
        width: 210mm;
        height: 297mm;
        background: var(--white);
        margin: 20px auto;
        position: relative;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        display: flex;
        flex-direction: column;
        page-break-after: always;
    }

    /* Header & Footer - Stratton Prime Style */
    .header { 
        padding: 40px 50px 20px; 
        display: flex; 
        justify-content: space-between; 
        align-items: flex-end; 
        border-bottom: 2px solid var(--sp-gold); 
    }
    .header-left { display: flex; flex-direction: column; gap: 6px; }
    .header-subtitle { 
        font-family: var(--font-sans);
        font-size: 10px; 
        color: var(--sp-gold); 
        font-weight: 700; 
        text-transform: uppercase; 
        letter-spacing: 2px; 
    }
    .header-title { 
        font-family: var(--font-serif);
        font-size: 26px; 
        font-weight: 700; 
        color: var(--sp-navy); 
        letter-spacing: -0.5px; 
        line-height: 1;
    }
    .header-meta { 
        font-family: var(--font-mono); 
        font-size: 9px; 
        color: var(--sp-text-muted); 
        text-align: right; 
        line-height: 1.4;
    }

    .footer { 
        position: absolute; 
        bottom: 0; 
        left: 0; 
        right: 0; 
        padding: 0;
        display: flex;
        flex-direction: column;
        background: var(--white); 
    }
    .footer-rule { height: 1px; margin: 0 50px; background: linear-gradient(90deg, var(--sp-gold) 0%, rgba(198,161,91,.15) 35%, transparent 100%); }
    .footer-inner { display: flex; justify-content: space-between; align-items: center; padding: 6px 50px 7px; }
    .footer-text { font-size: 8px; color: var(--sp-text-muted); font-family: var(--font-mono); letter-spacing: 0.6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
    .footer-brand { display: flex; flex-direction: column; align-items: center; gap: 3px; flex-shrink: 0; }
    .footer-brand-mark { display: flex; align-items: center; gap: 6px; }
    .footer-brand-line { width: 14px; height: 1px; background: rgba(198,161,91,.35); }
    .footer-brand-dot { width: 4px; height: 4px; background: var(--sp-gold); opacity: .6; }
    .footer-brand-name { font-size: 6.5px; font-weight: 700; letter-spacing: .26em; text-transform: uppercase; color: var(--sp-text-muted); }
    .footer-confidential { font-size: 7.5px; font-family: var(--font-mono); letter-spacing: .12em; color: var(--sp-navy); opacity: .5; font-weight: 700; white-space: nowrap; flex-shrink: 0; display: flex; align-items: center; gap: 5px; text-transform: uppercase; }

    .page-body { flex: 1; padding: 40px 50px 62px; overflow: hidden; }

    /* Typography */
    h1, h2, h3, h4 { margin: 0; color: var(--sp-navy); }
    h3 { font-family: var(--font-serif); letter-spacing: 0; }
    
    .text-muted { color: var(--sp-text-muted); }
    .mono { font-family: var(--font-mono); }
    
    /* Bento Grid - Stratton Prime Style */
    .bento-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 30px; }
    .bento-card { 
        background: var(--white); 
        border: 1px solid var(--border); 
        border-radius: 2px; /* Minimalist corners */
        padding: 24px; 
        display: flex; 
        flex-direction: column; 
        position: relative;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
    }
    .bento-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: var(--sp-gold); /* Gold accent line */
        opacity: 0.3;
    }
    .bento-card.full-width { grid-column: 1 / -1; }
    
    /* Highlight Card (Navy) */
    .bento-card.highlight { 
        background: var(--sp-navy); 
        color: var(--white); 
        border: none; 
    }
    .bento-card.highlight::before { background: var(--sp-gold); opacity: 1; }
    .bento-card.highlight .text-muted { color: #9CA3AF; }
    .bento-card.highlight .bento-label { color: var(--sp-gold); }
    .bento-card.highlight .bento-value { color: var(--white); }
    
    /* Success Card (Light Gold) */
    .bento-card.success { 
        background: #FFFBEB; 
        border: 1px solid var(--sp-gold-light); 
    }
    .bento-card.success::before { background: var(--sp-gold); opacity: 1; }
    .bento-card.success .bento-label { color: #92400E; }
    .bento-card.success .bento-value { color: var(--sp-navy); }
    
    .bento-label { 
        font-family: var(--font-sans);
        font-size: 11px; 
        font-weight: 700; 
        color: var(--sp-text-muted); 
        text-transform: uppercase; 
        letter-spacing: 1px; 
        margin-bottom: 12px; 
    }
    
    .bento-value { 
        font-family: var(--font-mono); 
        font-size: 28px; 
        font-weight: 700; 
        letter-spacing: -1px; 
        margin-bottom: 6px; 
        color: var(--sp-navy);
    }
    
    .bento-desc { font-size: 11px; color: var(--sp-text-muted); line-height: 1.5; }

    /* Tables - Financial Statement Style */
    .data-table { 
        width: 100%; 
        border-collapse: collapse; 
        font-size: 11px; 
        margin-top: 20px; 
        border-top: 2px solid var(--sp-navy);
        border-bottom: 2px solid var(--sp-navy);
    }
    .data-table th { 
        text-align: left; 
        padding: 12px 16px; 
        background: var(--sp-gray); 
        color: var(--sp-navy); 
        font-weight: 700; 
        text-transform: uppercase; 
        letter-spacing: 0.5px; 
        border-bottom: 1px solid var(--border); 
    }
    .data-table td { 
        padding: 12px 16px; 
        border-bottom: 1px solid var(--border); 
        color: var(--sp-text); 
        font-family: var(--font-mono); 
    }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table .col-highlight { 
        background: #FFFBEB; 
        font-weight: 700; 
        color: var(--sp-navy); 
    }
    .data-table .row-total td { 
        background: var(--sp-navy); 
        color: var(--white); 
        font-weight: 700; 
        border-top: 2px solid var(--sp-navy); 
    }
    .data-table .row-total .col-highlight { 
        background: #1e293b; 
        color: var(--sp-gold); 
    }

    /* Badges */
    .badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 2px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .badge-blue { background: var(--sp-navy); color: var(--white); }
    .badge-emerald { background: #ECFDF5; color: #059669; }
    .badge-slate { background: var(--sp-gray); color: var(--sp-text-muted); }

    /* Cover Page Specific */
    .cover-wrapper { display: flex; flex-direction: column; height: 100%; padding: 60px; position: relative; }
    .cover-bg-pattern { 
        position: absolute; 
        top: 0; right: 0; bottom: 0; width: 35%; 
        background-color: var(--sp-navy);
        z-index: 0; 
    }
    .cover-content { position: relative; z-index: 1; display: flex; flex-direction: column; height: 100%; }
    .cover-logo { 
        font-family: var(--font-sans);
        font-size: 20px; 
        font-weight: 800; 
        letter-spacing: 2px; 
        color: var(--sp-navy); 
        margin-bottom: auto; 
        text-transform: uppercase;
    }
    .cover-title { 
        font-family: var(--font-serif);
        font-size: 64px; 
        font-weight: 700; 
        letter-spacing: -2px; 
        line-height: 1; 
        color: var(--sp-navy); 
        margin-bottom: 24px; 
        max-width: 60%; 
    }
    .cover-subtitle { 
        font-family: var(--font-sans);
        font-size: 18px; 
        color: var(--sp-text-muted); 
        font-weight: 400; 
        line-height: 1.6; 
        max-width: 60%; 
        margin-bottom: 60px; 
        border-left: 4px solid var(--sp-gold);
        padding-left: 20px;
    }
    .cover-meta-grid { 
        display: grid; 
        grid-template-columns: 1fr 1fr; 
        gap: 40px; 
        margin-top: auto; 
        padding-top: 40px; 
        border-top: 2px solid var(--sp-navy); 
    }
    .meta-item { display: flex; flex-direction: column; gap: 8px; }
    .meta-label { font-size: 10px; font-weight: 700; color: var(--sp-gold); text-transform: uppercase; letter-spacing: 1px; }
    .meta-value { font-size: 14px; font-weight: 600; color: var(--sp-navy); }
    .meta-value.mono { font-family: var(--font-mono); font-size: 13px; }

    .preview-body {
        background: #e2e8f0;
        margin: 0;
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
    }

    @media print {
        @page { size: A4 portrait; margin: 0; }
        body, .preview-body { 
            background: white !important; 
            margin: 0 !important; 
            padding: 0 !important; 
            display: block !important; 
            gap: 0 !important;
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
        }
        .no-print { display: none !important; }
        .page { 
            margin: 0; 
            box-shadow: none; 
            page-break-after: always; 
            break-after: page;
            width: 210mm; 
            height: 297mm; 
            overflow: hidden; 
            border-radius: 0; 
        }
    }

    /* --- Page 8: Advisory Roadmap & Contact --- */
    .roadmap-container {
        display: grid;
        grid-template-columns: 1.2fr 0.8fr;
        gap: 60px;
    }

    .roadmap-step {
        display: flex;
        gap: 20px;
        position: relative;
        padding-bottom: 30px;
    }
    
    .roadmap-step:last-child {
        padding-bottom: 0;
    }

    .roadmap-line {
        position: absolute;
        top: 35px;
        left: 16px;
        bottom: -5px;
        width: 2px;
        background: #E2E8F0;
        z-index: 0;
    }
    
    .roadmap-step:last-child .roadmap-line {
        display: none;
    }

    .roadmap-marker {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: white;
        border: 2px solid var(--sp-navy);
        color: var(--sp-navy);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 14px;
        position: relative;
        z-index: 1;
        flex-shrink: 0;
    }

    .roadmap-marker.active {
        background: var(--sp-navy);
        color: white;
        border-color: var(--sp-navy);
        box-shadow: 0 0 0 4px #E0E7FF;
    }
    
    .roadmap-marker.final {
        background: var(--sp-gold);
        border-color: var(--sp-gold);
        color: white;
        box-shadow: 0 0 0 4px #FEF3C7;
    }

    .roadmap-content {
        padding-top: 4px;
    }

    .roadmap-title {
        font-size: 14px;
        font-weight: 700;
        color: var(--sp-navy);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 6px;
    }

    .roadmap-desc {
        font-size: 12px;
        color: var(--sp-text-muted);
        line-height: 1.5;
    }

    .business-card {
        background: white;
        border: 1px solid var(--border);
        padding: 30px;
        position: relative;
        box-shadow: 0 10px 30px -10px rgba(0,0,0,0.08);
        overflow: hidden;
    }

    .business-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: var(--sp-gold);
    }

    .bc-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        color: var(--sp-text-muted);
        margin-bottom: 8px;
        font-weight: 600;
    }

    .bc-name {
        font-family: var(--font-serif);
        font-size: 24px;
        font-weight: 700;
        color: var(--sp-navy);
        margin-bottom: 4px;
    }

    .bc-role {
        font-size: 12px;
        color: var(--sp-gold);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 24px;
    }

    .bc-contact-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
        font-size: 13px;
        color: var(--sp-text-muted);
    }

    .bc-icon {
        width: 24px;
        height: 24px;
        background: var(--sp-gray);
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--sp-navy);
    }

    /* --- Page 1: Refined Classic Cover --- */
    .cover-v3-container {
        height: 100%;
        display: flex;
        position: relative;
        background: white;
    }

    .cover-v3-content {
        flex: 1;
        padding: 60px;
        display: flex;
        flex-direction: column;
        z-index: 2;
    }

    .cover-v3-sidebar {
        width: 28%;
        background: var(--sp-navy);
        position: relative;
        overflow: hidden;
    }
    
    .cover-v3-sidebar::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: repeating-linear-gradient(
            45deg,
            rgba(255,255,255,0.03),
            rgba(255,255,255,0.03) 1px,
            transparent 1px,
            transparent 10px
        );
    }

    .cover-v3-logo {
        font-size: 16px;
        font-weight: 800;
        letter-spacing: 3px;
        color: var(--sp-navy);
        text-transform: uppercase;
        margin-bottom: 100px;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .cover-v3-logo::before {
        content: '';
        display: block;
        width: 24px;
        height: 24px;
        background: var(--sp-gold);
    }

    .cover-v3-badge {
        display: inline-block;
        padding: 6px 12px;
        background: #F1F5F9;
        color: var(--sp-navy);
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 30px;
        border-left: 3px solid var(--sp-gold);
    }

    .cover-v3-title {
        font-family: var(--font-serif);
        font-size: 68px;
        line-height: 0.95;
        color: var(--sp-navy);
        margin-bottom: 24px;
        letter-spacing: -2px;
    }
    
    .cover-v3-title span {
        color: var(--sp-gold);
        font-style: italic;
    }

    .cover-v3-subtitle {
        font-family: var(--font-sans);
        font-size: 18px;
        line-height: 1.5;
        color: var(--sp-text-muted);
        max-width: 80%;
        margin-bottom: 80px;
    }

    .cover-v3-meta {
        margin-top: auto;
        border-top: 1px solid var(--border);
        padding-top: 30px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
    }

    .cv3-label {
        font-size: 10px;
        text-transform: uppercase;
        color: var(--sp-text-muted);
        letter-spacing: 1px;
        margin-bottom: 6px;
    }
    
    .cv3-value {
        font-size: 14px;
        font-weight: 600;
        color: var(--sp-navy);
    }

    /* ═══════════════════════════════════════════════════════
       COMPONENT CLASSES — used across all 12 pages
    ═══════════════════════════════════════════════════════ */

    /* Lead paragraph */
    p.lead { font-size:12px; color:var(--sp-text-muted); line-height:1.65; margin-bottom:12px; max-width:680px; }

    /* Section headings */
    h3.sh { font-size:9.5px; font-weight:700; letter-spacing:.18em; text-transform:uppercase; color:var(--sp-navy); display:flex; align-items:center; gap:10px; margin:14px 0 8px; }
    h3.sh::before { content:''; display:inline-block; width:3px; height:14px; background:var(--sp-gold); flex-shrink:0; }

    /* Boxes */
    .box { border:1px solid var(--border); padding:22px 26px; background:var(--sp-gray); margin-bottom:14px; }
    .box-navy { background:var(--sp-navy); color:var(--white); padding:16px 20px; margin-bottom:10px; position:relative; overflow:hidden; }
    .box-gold { border:1px solid var(--sp-gold); border-left:4px solid var(--sp-gold); background:#fdf3d0; padding:12px 16px; margin-bottom:10px; }
    .box-red  { border:1px solid #DC2626; border-left:4px solid #DC2626; background:#fff0f0; padding:12px 16px; margin-bottom:10px; }

    /* Grid cards */
    .g2 { display:grid; grid-template-columns:1fr 1fr; gap:1px; background:var(--border); margin-bottom:16px; }
    .g3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:1px; background:var(--border); margin-bottom:16px; }
    .gc { background:var(--white); padding:20px 18px; }
    .gc.navy { background:var(--sp-navy); }
    .gc-lbl { font-size:9px; font-weight:600; letter-spacing:.15em; text-transform:uppercase; color:var(--sp-gold); margin-bottom:5px; }
    .gc.navy .gc-lbl { color:var(--sp-gold-light); }
    .gc-val { font-family:var(--font-serif); font-size:26px; color:var(--sp-navy); line-height:1.1; }
    .gc.navy .gc-val { color:var(--white); }
    .gc-val.big { font-size:38px; }
    .gc-val.strike { color:#DC2626; font-size:28px; }
    .gc-val.green { color:var(--success); }
    .gc-val.gold { color:var(--sp-gold-light); }
    .gc-note { font-size:11.5px; color:var(--sp-text-muted); margin-top:5px; line-height:1.5; }
    .gc.navy .gc-note { color:rgba(255,255,255,.5); }

    /* Data table */
    .dt { width:100%; border-collapse:collapse; font-size:12.5px; margin-bottom:14px; }
    .dt thead th { background:var(--sp-navy); color:var(--white); padding:8px 12px; text-align:left; font-size:9.5px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; }
    .dt thead th.gold { color:var(--sp-gold-light); }
    .dt thead th.r { text-align:right; }
    .dt tbody tr { border-bottom:1px solid var(--border); }
    .dt tbody tr.tr-total { background:var(--sp-navy); }
    .dt tbody tr.tr-save { background:#fdf3d0; }
    .dt td { padding:8px 12px; color:var(--sp-text-muted); vertical-align:top; }
    .dt td .sub { display:block; font-size:10px; color:var(--sp-text-muted); margin-top:2px; }
    .dt .old { color:#DC2626; text-align:right; }
    .dt .new { font-weight:600; color:var(--sp-navy); text-align:right; }
    .dt .delta { text-align:right; font-weight:600; }
    .dt .save { color:var(--success); }
    .dt .cost { color:#DC2626; }
    .dt .neutral { color:var(--sp-text-muted); }
    .dt .tr-total td { color:var(--white); font-weight:600; }
    .dt .tr-total .new { color:var(--sp-gold-light); }
    .dt .tr-total .delta { color:#81C784; }
    .dt .tr-save td { font-weight:600; color:var(--sp-navy); }
    .dt .tr-save .new { color:var(--success); text-align:right; }

    /* Variant table */
    .vt { width:100%; border-collapse:collapse; font-size:11.5px; margin-bottom:8px; }
    .vt thead th { padding:7px 10px; text-align:center; font-size:9px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; }
    .vt thead th:first-child { text-align:left; color:var(--sp-text-muted); background:transparent; border-bottom:1px solid var(--border); }
    .vt thead th:nth-child(2) { background:var(--sp-gold); color:var(--white); }
    .vt thead th:last-child { background:var(--sp-navy); color:rgba(255,255,255,.7); }
    .vt tbody tr { border-bottom:1px solid var(--border); }
    .vt tbody tr:hover { background:var(--sp-gray); }
    .vt td { padding:5px 10px; color:var(--sp-text-muted); }
    .vt td:first-child { color:var(--sp-navy); font-weight:500; }
    .vt td .sub { display:block; font-size:9px; font-weight:400; color:var(--sp-text-muted); margin-top:1px; line-height:1.35; }
    .vt td:nth-child(2), .vt td:last-child { text-align:center; }
    .vt .hl { background:rgba(198,161,91,.08); }
    .yes { color:var(--success); font-weight:700; font-size:14px; }
    .no  { color:var(--sp-text-muted); font-size:14px; }

    /* Two-column layouts */
    .two   { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .two-w { display:grid; grid-template-columns:3fr 2fr; gap:26px; }

    /* Checklist */
    ul.cl { list-style:none; margin:6px 0 14px; padding:0; }
    ul.cl li { font-size:11px; color:var(--sp-text-muted); padding:4px 0 4px 20px; position:relative; border-bottom:1px solid var(--border); line-height:1.5; }
    ul.cl li:last-child { border-bottom:none; }
    ul.cl li::before { content:'—'; position:absolute; left:0; color:var(--sp-gold); font-weight:700; }
    ul.cl li strong { color:var(--sp-navy); }

    /* Disclaimer */
    .disc { font-size:10px; color:var(--sp-text-muted); line-height:1.65; border-top:1px solid var(--border); padding-top:8px; margin-top:8px; }

    /* Timeline */
    .tl { margin-bottom:20px; }
    .tl-item { display:grid; grid-template-columns:48px 1fr; gap:0; }
    .tl-left { display:flex; flex-direction:column; align-items:center; }
    .tl-dot { width:34px; height:34px; border:2px solid var(--sp-gold); border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:var(--font-serif); font-size:15px; color:var(--sp-gold); background:var(--white); flex-shrink:0; z-index:1; }
    .tl-dot.fill { background:var(--sp-gold); color:var(--white); border-color:var(--sp-gold); }
    .tl-dot.green-fill { background:var(--success); border-color:var(--success); color:var(--white); }
    .tl-line { width:1px; flex:1; min-height:18px; background:rgba(198,161,91,.3); }
    .tl-item:last-child .tl-line { display:none; }
    .tl-body { padding:5px 0 22px 14px; }
    .tl-tag { font-size:8.5px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; color:var(--sp-gold); margin-bottom:2px; }
    .tl-title { font-size:13px; font-weight:600; color:var(--sp-navy); margin-bottom:4px; }
    .tl-text { font-size:12px; color:var(--sp-text-muted); line-height:1.65; }
    .tl-badge { display:inline-block; font-size:9px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; background:var(--sp-navy); color:var(--white); padding:3px 10px; margin-top:7px; }

    /* Shield block */
    .shield { background:var(--sp-navy); padding:26px 28px; color:var(--white); position:relative; overflow:hidden; margin-bottom:16px; }
    .shield::after { content:'⬡'; position:absolute; right:18px; top:50%; transform:translateY(-50%); font-size:100px; color:rgba(198,161,91,.06); line-height:1; pointer-events:none; }
    .shield-title { font-family:var(--font-serif); font-size:19px; color:var(--sp-gold-light); margin-bottom:7px; }
    .shield-sub { font-size:12px; color:rgba(255,255,255,.6); margin-bottom:18px; max-width:500px; line-height:1.7; }
    .shield-cols { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
    .sh-ct { font-size:11px; font-weight:600; color:var(--sp-gold-light); margin-bottom:3px; }
    .sh-cx { font-size:11px; color:rgba(255,255,255,.48); line-height:1.55; }

    /* FAQ */
    .faq-item { border-bottom:1px solid var(--border); padding:6px 0; }
    .faq-item:last-child { border-bottom:none; }
    .faq-q { font-size:11px; font-weight:600; color:var(--sp-navy); margin-bottom:2px; display:flex; gap:9px; align-items:flex-start; }
    .faq-q::before { content:'Q'; font-size:9px; font-weight:700; background:var(--sp-navy); color:var(--sp-gold-light); width:17px; height:17px; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; }
    .faq-a { font-size:10.5px; color:var(--sp-text-muted); line-height:1.5; padding-left:26px; }
    .faq-tag { display:inline-block; font-size:7px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; padding:2px 6px; border-radius:2px; margin-bottom:4px; }
    .faq-tag-law   { background:rgba(10,17,40,.08);  color:var(--sp-navy); }
    .faq-tag-fin   { background:rgba(198,161,91,.12); color:#8a6e2e; }
    .faq-tag-proc  { background:rgba(16,185,129,.1);  color:#065f46; }
    .faq-tag-risk  { background:rgba(220,38,38,.08);  color:#991b1b; }
    .faq-cols { display:grid; grid-template-columns:1fr 1fr; gap:0 20px; }
    .faq-ref { font-size:9.5px; color:var(--sp-gold); font-weight:600; padding-left:26px; margin-top:2px; }

    /* Contact card */
    .cc { border:1px solid var(--border); padding:24px; background:var(--sp-gray); }
    .cc-name { font-family:var(--font-serif); font-size:22px; color:var(--sp-navy); margin-bottom:3px; }
    .cc-role { font-size:10px; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:var(--sp-gold); margin-bottom:12px; }
    .cc-bio { font-size:12px; color:var(--sp-text-muted); font-style:italic; line-height:1.65; margin-bottom:14px; }
    .cc-row { display:flex; align-items:center; gap:9px; font-size:12.5px; color:var(--sp-text-muted); margin-bottom:5px; }
    .cc-ico { width:16px; color:var(--sp-gold); font-size:12px; flex-shrink:0; }

    /* Process axis */
    .proc-axis { display:flex; align-items:flex-start; gap:0; margin:16px 0 20px; position:relative; }
    .proc-axis::before { content:''; position:absolute; top:22px; left:22px; right:22px; height:3px; background:linear-gradient(90deg,var(--success) 0%,var(--success) 45%,rgba(0,0,0,.1) 45%,rgba(0,0,0,.1) 100%); z-index:0; border-radius:2px; }
    .proc-step { flex:1; display:flex; flex-direction:column; align-items:center; position:relative; z-index:1; padding:0 5px; }
    .proc-circle { width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:16px; margin-bottom:8px; border:2px solid var(--border); background:var(--white); flex-shrink:0; }
    .proc-circle.done { background:var(--success); border-color:var(--success); color:var(--white); font-size:14px; }
    .proc-circle.active { width:48px; height:48px; background:var(--sp-gold); border-color:var(--sp-gold); color:var(--white); box-shadow:0 0 0 6px rgba(198,161,91,.25); font-size:18px; }
    .proc-circle.future { background:rgba(0,0,0,.04); border-color:rgba(0,0,0,.12); color:var(--sp-text-muted); }
    .proc-label { font-size:9.5px; font-weight:600; text-align:center; line-height:1.35; color:var(--sp-text-muted); }
    .proc-label.done { color:var(--success); }
    .proc-label.active { color:var(--sp-navy); font-weight:700; font-size:10px; }
    .proc-label.future { color:var(--sp-text-muted); }
    .proc-sub { font-size:9px; text-align:center; color:var(--sp-text-muted); margin-top:4px; line-height:1.4; }

    /* Case studies */
    .case { border-left:3px solid var(--sp-gold); padding:12px 16px; margin-bottom:12px; background:var(--sp-gray); }
    .case-hd { display:flex; justify-content:space-between; margin-bottom:5px; }
    .case-name { font-size:13px; font-weight:600; color:var(--sp-navy); }
    .case-size { font-size:9.5px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:var(--sp-text-muted); }
    .case-txt { font-size:12px; color:var(--sp-text-muted); line-height:1.6; margin-bottom:4px; }
    .case-res { font-size:13px; font-weight:600; color:var(--success); }

    /* Pills */
    .pill-g { display:inline-block; padding:2px 9px; font-size:9px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; background:var(--sp-gold); color:var(--white); }
    .pill-n { display:inline-block; padding:2px 9px; font-size:9px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; background:var(--sp-navy); color:var(--sp-gold-light); }

    /* Process badge */
    .proc-badge-now { position:absolute; top:-22px; left:50%; transform:translateX(-50%); background:var(--sp-gold); color:var(--white); font-size:8px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; padding:3px 8px; white-space:nowrap; }
    .proc-badge-now::after { content:''; position:absolute; bottom:-4px; left:50%; transform:translateX(-50%); width:0; height:0; border-left:4px solid transparent; border-right:4px solid transparent; border-top:4px solid var(--sp-gold); }

    /* Cost of delay */
    .cod { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:var(--border); margin-bottom:16px; }
    .cod-cell { background:var(--sp-navy); padding:16px 12px; text-align:center; overflow:hidden; }
    .cod-period { font-size:8.5px; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:rgba(255,255,255,.7); margin-bottom:10px; }
    .cod-amount { font-family:var(--font-serif); font-size:22px; color:#DC2626; line-height:1; margin-bottom:8px; white-space:nowrap; }
    .cod-label { font-size:11px; color:rgba(255,255,255,.7); font-weight:500; }

    /* ═══ HOOK PAGE (str. 13 — full dark) ═══ */
    .hook-page { background:var(--sp-navy); display:flex; flex-direction:column; justify-content:center; padding:0; position:relative; overflow:hidden; }
    .hook-page::before { content:none; }
    .hook-page::after { content:none; }
    .hook-body { position:relative; z-index:1; padding:56px 72px 40px; flex:1; display:flex; flex-direction:column; justify-content:space-between; }
    .hook-tag { font-size:9px; font-weight:600; letter-spacing:.25em; text-transform:uppercase; color:rgba(212,175,90,.5); margin-bottom:24px; display:flex; align-items:center; gap:12px; }
    .hook-tag::before { content:''; width:32px; height:1px; background:rgba(212,175,90,.4); }
    .hook-headline { font-family:var(--font-serif); font-size:42px; font-weight:400; font-style:italic; color:var(--white); line-height:1.15; margin-bottom:22px; max-width:680px; }
    .hook-headline em { color:var(--sp-gold-light); font-style:normal; }
    .hook-vision { display:grid; grid-template-columns:1fr 1fr 1fr; gap:1px; background:var(--border); margin-bottom:28px; }
    .hook-vis-cell { padding:22px 20px; background:var(--white); }
    .hook-vis-period { font-size:9px; font-weight:700; letter-spacing:.18em; text-transform:uppercase; color:var(--sp-navy); margin-bottom:10px; display:flex; align-items:center; gap:8px; }
    .hook-vis-period::before { content:''; width:16px; height:2px; background:var(--sp-gold); }
    .hook-vis-amount { font-family:var(--font-serif); font-size:28px; color:var(--success); line-height:1; margin-bottom:8px; }
    .hook-vis-text { font-size:11px; color:var(--sp-text-muted); line-height:1.6; }
    .hook-cta-block { border-top:1px solid rgba(255,255,255,.1); padding-top:24px; display:grid; grid-template-columns:1fr auto; gap:40px; align-items:end; }
    .hook-cta-eyebrow { font-size:9px; font-weight:600; letter-spacing:.2em; text-transform:uppercase; color:var(--sp-gold-light); margin-bottom:10px; }
    .hook-cta-title { font-family:var(--font-serif); font-size:24px; color:var(--white); margin-bottom:10px; line-height:1.2; }
    .hook-cta-steps { display:flex; gap:16px; flex-wrap:wrap; }
    .hook-cta-step { display:flex; align-items:center; gap:8px; font-size:11.5px; color:rgba(255,255,255,.55); }
    .hook-cta-step .n { width:22px; height:22px; background:var(--sp-gold); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:var(--white); flex-shrink:0; }
    .hook-cta-right { text-align:right; }
    .hook-deadline { display:inline-block; border:1px solid rgba(212,175,90,.4); padding:16px 22px; margin-bottom:14px; text-align:center; }
    .hook-deadline-label { font-size:9px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; color:rgba(212,175,90,.6); margin-bottom:6px; }
    .hook-deadline-date { font-family:var(--font-serif); font-size:22px; color:var(--sp-gold-light); line-height:1; margin-bottom:4px; }
    .hook-deadline-sub { font-size:10px; color:rgba(255,255,255,.35); }
    .hook-contact { font-size:12px; color:rgba(255,255,255,.45); line-height:1.65; }
    .hook-contact strong { color:rgba(255,255,255,.75); }
    .hook-pf { border-top:1px solid rgba(255,255,255,.08); padding:10px 72px; display:flex; justify-content:space-between; font-size:9px; color:rgba(255,255,255,.25); letter-spacing:.05em; flex-shrink:0; }
`;

