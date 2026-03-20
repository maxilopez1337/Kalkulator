export const getOfferPdfV2Styles = () => `
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
        padding: 20px 50px; 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        border-top: 1px solid var(--border); 
        background: var(--white); 
    }
    .footer-text { font-size: 9px; color: var(--sp-text-muted); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 1px; }

    .page-body { flex: 1; padding: 40px 50px; overflow: hidden; }

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
`;
