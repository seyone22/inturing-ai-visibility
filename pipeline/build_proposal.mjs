// Builds the Uprise Digital AEO / SEO / Lovable Proposal for Inturing (matching the Rayamp-AEO-Proposal-Uprise.pdf design & pricing 1:1)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const pipelineDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(pipelineDir, '..');

const M = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'metrics.json'), 'utf8'));
const CITS = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'citations.json'), 'utf8'));
const H = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'hist.json'), 'utf8'));
const rawAiKw = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'raw_ai_keyword_data.json'), 'utf8'));
const serpAudit = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'serp_audit.json'), 'utf8'));
const ansFull = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'ans_full.json'), 'utf8'));

const logoBase64 = fs.readFileSync(path.join(pipelineDir, 'uprise_official_logo.png')).toString('base64');
const upriseLogoImg = `<img src="data:image/png;base64,${logoBase64}" alt="Uprise Digital" class="uprise-logo" />`;

// Dynamic empirical calculations from saved JSON artifacts (Hard Rule #0)
const rawKwItems = rawAiKw?.tasks?.[0]?.result?.[0]?.items || [];
const totalAiVolume = rawKwItems.reduce((s, k) => s + (k.ai_search_volume || 0), 0); // 3,418/mo
const mfgMentioned = M.byCat?.manufacturing_automation?.mentioned ?? 23;
const mfgNum1 = M.byCat?.manufacturing_automation?.num1 ?? 16;
const paMentioned = M.byCat?.power_apps?.mentioned ?? 8;
const paNum1 = M.byCat?.power_apps?.num1 ?? 5;
const totalMentioned = M.mtMentioned ?? 31;
const totalNum1 = M.mtNum1 ?? 21;
const totalCitedAnswers = M.mtCited ?? 35;
const totalDomainCitations = CITS.clientDomainCitations ?? 91;
const serpTop20Count = serpAudit.filter(q => q.mtInTop20).length; // 0 of 56

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function getPeakLabel(item) {
  const arr = item.ai_monthly_searches || [];
  if (!arr.length) return '—';
  let maxVal = -1;
  let maxEntry = arr[0];
  for (const m of arr) {
    if ((m.ai_search_volume || 0) > maxVal) {
      maxVal = m.ai_search_volume || 0;
      maxEntry = m;
    }
  }
  return `${maxVal.toLocaleString('en-AU')} (${MONTH_NAMES[maxEntry.month]} ${maxEntry.year})`;
}

const kwMap = Object.fromEntries(rawKwItems.map(i => [i.keyword, i]));

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Website, SEO &amp; AEO Growth Proposal: Inturing | Uprise Digital</title>
<meta name="description" content="Empirical Search & AI Visibility Audit + 3-Month Lovable Website, SEO & Growth Programme Proposal for Inturing (inturing.com.au).">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap">
<style>
  :root {
    --dark: #000018;
    --ink: #0D0B18;
    --body: #3E3A50;
    --muted: #6E6A80;
    --purple: #8B75F5;
    --purple-light: #A998FF;
    --purple-pill: #DCD3FF;
    --purple-tint: #FAF9FF;
    --border: #EAE6F5;
    --red: #B3261E;
    --green: #1B7F4D;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    background: #FFFFFF;
    color: var(--ink);
    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 15.5px;
    line-height: 1.72;
    -webkit-font-smoothing: antialiased;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Top Header Bar */
  .top-bar {
    background: var(--dark);
    color: #FFFFFF;
    padding: 24px 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .uprise-logo {
    height: 28px;
    width: auto;
    filter: brightness(0) invert(1);
    display: block;
  }

  .top-bar-tag {
    color: var(--purple-light);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }

  /* Main Container */
  .page-wrap {
    max-width: 780px;
    margin: 0 auto;
    padding: 30px 44px 44px;
    background: radial-gradient(ellipse 520px 320px at 88% 2%, rgba(169, 152, 255, 0.12), transparent 70%);
  }

  /* Hero Section */
  .hero-h1 {
    font-size: 31px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.02em;
    color: var(--ink);
    margin-bottom: 18px;
  }

  .hero-h1 .accent {
    color: var(--purple);
    display: block;
  }

  .lede {
    font-size: 14.2px;
    line-height: 1.66;
    color: var(--body);
    margin-bottom: 20px;
  }

  /* Meta Bar */
  .meta-bar {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 12px 0;
    margin-bottom: 16px;
    font-size: 12px;
    line-height: 1.55;
    color: var(--muted);
  }

  .meta-bar b {
    color: var(--ink);
    font-weight: 600;
  }

  .meta-col-right {
    border-left: 1px solid var(--border);
    padding-left: 24px;
  }

  /* 2x2 Stat Grid */
  .stat-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    margin-bottom: 36px;
    break-inside: avoid;
  }

  .stat-cell {
    padding: 18px 20px 18px 12px;
  }

  .stat-cell:nth-child(1),
  .stat-cell:nth-child(2) {
    border-bottom: 1px solid var(--border);
  }

  .stat-cell:nth-child(2),
  .stat-cell:nth-child(4) {
    border-left: 1px solid var(--border);
    padding-left: 24px;
  }

  .stat-num {
    font-size: 31px;
    font-weight: 700;
    line-height: 1.15;
    color: var(--purple);
    margin-bottom: 6px;
    letter-spacing: -0.02em;
  }

  .stat-desc {
    font-size: 11.8px;
    line-height: 1.52;
    color: var(--muted);
  }

  /* Section Headings */
  .sec-eyebrow {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--purple);
    margin-bottom: 10px;
    break-after: avoid;
    page-break-after: avoid;
  }

  .sec-h2 {
    font-size: 27px;
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: -0.015em;
    color: var(--ink);
    margin-bottom: 16px;
    break-after: avoid;
    page-break-after: avoid;
  }

  .sec-p {
    font-size: 14.5px;
    line-height: 1.7;
    color: var(--body);
    margin-bottom: 18px;
    break-after: avoid;
    page-break-after: avoid;
  }

  .sec-p b {
    color: var(--ink);
    font-weight: 600;
  }

  /* Quote Callouts */
  .ai-quote {
    border-left: 3.5px solid var(--purple);
    padding: 4px 0 4px 22px;
    margin: 26px 0 30px;
  }

  .ai-quote-text {
    font-size: 15.5px;
    line-height: 1.72;
    color: var(--ink);
    margin-bottom: 12px;
  }

  .pill {
    background: var(--purple-pill);
    color: var(--ink);
    font-weight: 500;
    padding: 1px 6px;
    border-radius: 3px;
  }

  .ai-quote-meta {
    font-size: 12.5px;
    line-height: 1.65;
    color: var(--muted);
  }

  /* Diagnostic Cards */
  .diag-card {
    background: #FFFFFF;
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 26px 30px;
    margin-bottom: 18px;
    break-inside: avoid;
  }

  .diag-tag {
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .diag-tag.red {
    color: var(--red);
  }

  .diag-tag.green {
    color: var(--green);
  }

  .diag-title {
    font-size: 16.5px;
    font-weight: 700;
    line-height: 1.38;
    color: var(--ink);
    margin-bottom: 10px;
  }

  .diag-body {
    font-size: 14px;
    line-height: 1.72;
    color: var(--body);
  }

  .diag-body b {
    color: var(--ink);
    font-weight: 600;
  }

  /* Tables */
  .table-card {
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    margin: 24px 0 18px;
    background: #FFFFFF;
    break-inside: avoid;
  }

  table.uprise-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }

  table.uprise-table thead th {
    background: var(--purple-tint);
    color: var(--muted);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 13px 16px;
    border-bottom: 1px solid var(--border);
  }

  table.uprise-table tbody td {
    padding: 12px 16px;
    font-size: 12px;
    line-height: 1.55;
    color: var(--body);
    border-bottom: 1px solid var(--border);
    vertical-align: top;
  }

  table.uprise-table tbody tr:last-child td {
    border-bottom: none;
  }

  table.uprise-table tbody td.bold {
    color: var(--ink);
    font-weight: 600;
  }

  table.uprise-table tbody td.purple {
    color: var(--purple);
    font-weight: 600;
  }

  table.uprise-table tbody td.num {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  table.uprise-table thead th.num {
    text-align: right;
  }

  table.uprise-table tbody tr.highlight-row td {
    background: var(--purple-tint);
  }

  .table-note {
    font-size: 13px;
    line-height: 1.72;
    color: var(--muted);
    margin: 14px 0 32px;
  }

  /* Section Spacers */
  .sec-block {
    margin-top: 40px;
  }

  /* Workstreams (01 - 06) */
  .ws-item {
    display: grid;
    grid-template-columns: 82px 1fr;
    gap: 16px;
    padding: 22px 0;
    border-bottom: 1px solid var(--border);
    break-inside: avoid;
  }

  .ws-item:last-of-type {
    border-bottom: none;
  }

  .ws-num {
    font-size: 54px;
    font-weight: 700;
    line-height: 1;
    color: transparent;
    -webkit-text-stroke: 1.6px var(--purple-pill);
    user-select: none;
    letter-spacing: -0.03em;
  }

  .ws-title {
    font-size: 19px;
    font-weight: 600;
    line-height: 1.35;
    color: var(--ink);
    margin-bottom: 10px;
  }

  .ws-intro {
    font-size: 14px;
    line-height: 1.7;
    color: var(--body);
    margin-bottom: 12px;
  }

  .ws-list {
    list-style: none;
    padding: 0;
  }

  .ws-list li {
    position: relative;
    padding-left: 18px;
    font-size: 14px;
    line-height: 1.72;
    color: var(--body);
    margin-bottom: 10px;
  }

  .ws-list li::before {
    content: "•";
    position: absolute;
    left: 2px;
    top: 0;
    color: var(--body);
    font-weight: 700;
  }

  .ws-list li b {
    color: var(--ink);
    font-weight: 600;
  }

  /* Timeline (The first 90 days) */
  .timeline {
    position: relative;
    margin: 28px 0 32px 10px;
    padding-left: 32px;
    border-left: 2px solid var(--purple-pill);
  }

  .tl-step {
    position: relative;
    margin-bottom: 30px;
    break-inside: avoid;
  }

  .tl-step:last-child {
    margin-bottom: 0;
  }

  .tl-step::before {
    content: "";
    position: absolute;
    left: -40px;
    top: 3px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #FFFFFF;
    border: 2.5px solid var(--purple);
  }

  .tl-eyebrow {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--purple);
    margin-bottom: 6px;
  }

  .tl-body {
    font-size: 14px;
    line-height: 1.74;
    color: var(--body);
  }

  .tl-body b {
    color: var(--ink);
    font-weight: 600;
  }

  /* Pricing Cards (Three ways to get started) */
  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    padding-top: 16px;
    margin: 12px 0 18px;
    align-items: stretch;
    break-inside: avoid;
  }

  .price-card {
    background: var(--purple-tint);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px 18px;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .price-card.recommended {
    background: var(--purple);
    border-color: var(--purple);
    color: #FFFFFF;
  }

  .rec-badge {
    position: absolute;
    top: -13px;
    left: 22px;
    background: var(--dark);
    color: #FFFFFF;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    padding: 5px 12px;
    border-radius: 999px;
  }

  .tier-name {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--purple);
    margin-bottom: 10px;
  }

  .price-card.recommended .tier-name {
    color: rgba(255, 255, 255, 0.85);
  }

  .tier-price {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.15;
    color: var(--ink);
    margin-bottom: 2px;
  }

  .price-card.recommended .tier-price {
    color: #FFFFFF;
  }

  .tier-sub {
    font-size: 12px;
    color: var(--muted);
    margin-bottom: 4px;
  }

  .price-card.recommended .tier-sub {
    color: rgba(255, 255, 255, 0.85);
  }

  .tier-3mo {
    font-size: 11.5px;
    font-weight: 600;
    color: var(--purple);
    padding-bottom: 16px;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--border);
  }

  .price-card.recommended .tier-3mo {
    color: #FFFFFF;
    border-bottom-color: rgba(255, 255, 255, 0.24);
  }

  .tier-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .tier-list li {
    position: relative;
    padding-left: 16px;
    font-size: 12.2px;
    line-height: 1.58;
    color: var(--body);
    margin-bottom: 11px;
  }

  .price-card.recommended .tier-list li {
    color: rgba(255, 255, 255, 0.95);
  }

  .tier-list li::before {
    content: "";
    position: absolute;
    left: 0;
    top: 7px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--purple);
  }

  .price-card.recommended .tier-list li::before {
    background: var(--dark);
  }

  .tier-list li b {
    color: var(--ink);
    font-weight: 600;
  }

  .price-card.recommended .tier-list li b {
    color: #FFFFFF;
  }

  /* 4-Box Guarantee Grid */
  .guarantee-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin: 26px 0 32px;
    break-inside: avoid;
  }

  .g-box {
    background: var(--purple-tint);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 18px 16px;
  }

  .g-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--ink);
    margin-bottom: 6px;
  }

  .g-body {
    font-size: 12px;
    line-height: 1.58;
    color: var(--muted);
  }

  /* Footer Bar */
  .bottom-bar {
    background: var(--dark);
    color: rgba(255, 255, 255, 0.72);
    padding: 36px 48px;
    display: flex;
    align-items: center;
    gap: 48px;
    font-size: 12.5px;
    line-height: 1.75;
  }

  .bottom-bar a {
    color: var(--purple-light);
    text-decoration: none;
    font-weight: 500;
  }

  @media screen and (max-width: 600px) {
    .top-bar, .page-wrap, .bottom-bar {
      padding-left: 22px;
      padding-right: 22px;
    }
    .meta-bar, .stat-grid, .pricing-grid, .guarantee-grid {
      grid-template-columns: 1fr;
    }
    .meta-col-right, .stat-cell:nth-child(2), .stat-cell:nth-child(4) {
      border-left: none;
      padding-left: 0;
    }
    .ws-item {
      grid-template-columns: 1fr;
      gap: 6px;
    }
  }

  @page {
    size: A4;
    margin: 14mm 0 14mm 0;
  }

  @page :first {
    margin-top: 0;
  }

  @media print {
    .page-wrap {
      padding-top: 34px;
      padding-bottom: 34px;
    }
  }
</style>
</head>
<body>

  <!-- TOP UPRISE HEADER -->
  <header class="top-bar">
    ${upriseLogoImg}
    <div class="top-bar-tag">PROPOSAL · OCTOBER 2026</div>
  </header>

  <main class="page-wrap">

    <!-- PAGE 1: HERO & 2x2 SCORECARD -->
    <section>
      <h1 class="hero-h1">
        We asked AI 280 ways who to hire for Power Platform, ERP integration and workflow automation.
        <span class="accent">Inturing is #1 in Manufacturing — and 0 of 200 everywhere else.</span>
      </h1>

      <p class="lede">
        Before writing this we tested Inturing the way an Australian COO, Operations Director or Finance Lead would. We asked ChatGPT, Perplexity, Google AI Mode, Gemini and Claude seven commercial buyer questions across eight Australian cities (280 answers total), alongside 56 live Google searches. When buyers ask who to hire for manufacturing process automation, Inturing is #1 in Australia — named in ${mfgMentioned} of 40 answers and recommended first ${mfgNum1} times. When buyers ask for custom Power Apps, Inturing is named in ${paMentioned} of 40. Across the other five questions (Power Platform consultants, Power Automate workflows, ERP and system integration, Power BI and Microsoft Fabric, and Copilot Studio agents), the five assistants returned 200 answers and named Inturing zero times. Your rebuilt Lovable site is already bringing in quality enquiries, and AI already cites inturing.com.au ${totalDomainCitations} times (#3 in Australia). The homepage title just says "for Manufacturers", and the pages for ERP integration, adjacent industries, and an Insights Hub with downloadable lead magnets are not built yet. This document explains the gap and the 3-month programme on your existing Lovable site that closes it.
      </p>

      <div class="meta-bar">
        <div>
          Prepared for <b>Inturing (Harry Cribb &amp; Paul Del Gigante)</b>, Sydney NSW<br>
          All data <b>29 October 2026</b>
        </div>
        <div class="meta-col-right">
          Site tested <b>inturing.com.au</b> (28-page Lovable site)
        </div>
      </div>

      <div class="stat-grid">
        <div class="stat-cell">
          <div class="stat-num">${mfgMentioned} of 40</div>
          <div class="stat-desc">Manufacturing automation answers naming Inturing (#1 in Australia, and ranked first ${mfgNum1} times across ChatGPT, Perplexity, AI Mode, Gemini and Claude)</div>
        </div>
        <div class="stat-cell">
          <div class="stat-num">0 of 200</div>
          <div class="stat-desc">Answers naming Inturing across Power Platform consulting, Power Automate, ERP integration, Power BI / Fabric, and Copilot Studio</div>
        </div>
        <div class="stat-cell">
          <div class="stat-num">${totalDomainCitations} links</div>
          <div class="stat-desc">Times AI assistants cited inturing.com.au across ${totalCitedAnswers} answers — already the #3 most-cited consultancy website in Australia</div>
        </div>
        <div class="stat-cell">
          <div class="stat-num">${serpTop20Count} of 56</div>
          <div class="stat-desc">Commercial Google searches across 8 cities where inturing.com.au ranks in the organic Top 20 today, plus 0 reviews on your Sydney Google profile</div>
        </div>
      </div>
    </section>

    <!-- SECTION 2: WHAT WE FOUND -->
    <section class="sec-block">
      <div class="sec-eyebrow">WHAT WE FOUND</div>
      <h2 class="sec-h2">The Australian shortlist is built from page titles, named ERPs and partner directories.</h2>

      <div class="ai-quote">
        <p class="ai-quote-text">
          "My shortlist: 1. <span class="pill">Inturing</span> (Best overall fit) — Inturing explicitly targets manufacturers already running Microsoft 365 alongside ERP, MES and engineering systems. Its stated services include automated quote and order processing, shop-floor and inspection apps, supplier workflows, document extraction and operational dashboards. 2. <span class="pill">Norbrik</span> 3. <span class="pill">TechRam</span>."
        </p>
        <p class="ai-quote-meta">
          ChatGPT (web search on), asked live on 29 Oct 2026 for a Sydney partner to automate order processing and operations without replacing the ERP. Cited inturing.com.au and inturing.com.au/about directly. Inturing: ranked #1.
        </p>
      </div>

      <div class="ai-quote">
        <p class="ai-quote-text">
          "For a Sydney-based project spanning ERP, CRM, MYOB Acumatica, SAP, and Microsoft 365, the strongest shortlist is: 1. <span class="pill">Eagle360 Consulting</span> (Best for MYOB Acumatica + Microsoft 365 integration) 2. <span class="pill">Leverage Technologies</span> (Best for MYOB Acumatica, SAP, CRM, and broader ERP integration) 3. <span class="pill">OneKloudX</span>."
        </p>
        <p class="ai-quote-meta">
          Perplexity (Sonar Pro, web search on), asked live on 29 Oct 2026 for a Sydney integration partner to connect MYOB Acumatica, SAP, CRM and Microsoft 365. Inturing: not named, not cited.
        </p>
      </div>

      <p class="sec-p">
        That second question is the exact work Inturing already delivers. Your published <b>BBCP</b> case study connects <b>MYOB Acumatica, SAP Ariba and SharePoint</b> to cut order processing time by over 90% and save roughly $150,000 a year, and your <b>Property Network of Australia (PNA)</b> case study saves another $150,000 a year automating multi-party property workflows. Perplexity named Eagle360 and Leverage Technologies instead because both publish dedicated ERP integration pages naming MYOB Acumatica and SAP in the page heading, whereas inturing.com.au has no ERP integration page at all.
      </p>

      <!-- DIAGNOSTIC CARDS -->
      <div class="diag-card">
        <div class="diag-tag green">ALREADY WORKING</div>
        <div class="diag-title">Your rebuilt Lovable site is fast, crawlable, and #1 in Australia for Manufacturing</div>
        <div class="diag-body">
          We inspected all 28 URLs on inturing.com.au. Access is not the problem: AI crawlers and Google receive clean responses, your 3-Minute Assessments (<b>/assessment/manufacturing-automation</b> and <b>/assessment/power-platform</b>) and ROI Calculator give buyers an immediate next step, and AI assistants cited your website ${totalDomainCitations} times across ${totalCitedAnswers} answers (behind only Power Platform Experts on 130 links). You do not need to rebuild the site — you need to build on it.
        </div>
      </div>

      <div class="diag-card">
        <div class="diag-tag red">COSTING YOU ADJACENT SECTORS</div>
        <div class="diag-title">Your homepage title says "for Manufacturers" — so Google and AI filter you out of 200 buyer searches</div>
        <div class="diag-body">
          The homepage title tag on inturing.com.au is literally <b>"Inturing | AI Automation &amp; Power Platform for Manufacturers"</b>. That single line is why you win 58% of manufacturing answers (${mfgMentioned} of 40) and 0% of general Power Platform, Power Automate, ERP integration, Power BI and Copilot answers (0 of 200). When a wholesale distributor, civil contractor, property group, or mid-market COO searches for the exact same Microsoft workflows, search engines and AI assistants read your homepage title and assume you only work with factories.
        </div>
      </div>

      <div class="diag-card">
        <div class="diag-tag red">COSTING YOU TRUST</div>
        <div class="diag-title">Your 7 adjacent-sector client logos are locked inside image files with zero text on the page</div>
        <div class="diag-body">
          Your site displays client logos for <b>Burgtec, Schlam, Menai Civil Contractors, AustEx, Liquip Victoria, CBTech and EFS</b>. Those seven names prove Inturing works across mining equipment, civil engineering, commercial interiors, industrial fluid handling and heavy distribution — not just factory floors. Because they sit on the page as image files with no written captions or workflow summaries, neither Google nor AI assistants can read them.
        </div>
      </div>

      <div class="diag-card">
        <div class="diag-tag red">COSTING YOU RANKINGS</div>
        <div class="diag-title">No dedicated ERP Integration page, no Insights Hub or lead magnets, and no city delivery pages</div>
        <div class="diag-body">
          Across 56 live commercial Google searches in Sydney, Melbourne, Brisbane, Perth, Adelaide, Canberra, Newcastle and Hobart, inturing.com.au ranked in the organic Top 20 on <b>0 of 56 searches</b>. Rivals with smaller case studies outrank you because they publish dedicated pages for <b>ERP &amp; System Integration</b>, <b>Microsoft Fabric &amp; Power BI</b>, adjacent industries (Wholesale, Construction, Property), city delivery hubs, and gated ROI guides and checklists.
        </div>
      </div>

      <div class="diag-card">
        <div class="diag-tag red">COSTING YOU CONSISTENCY</div>
        <div class="diag-title">Bare country-only schema, an unverified Sydney Google profile (0 reviews), and no Microsoft AppSource listing</div>
        <div class="diag-body">
          Every page on inturing.com.au outputs a bare Organization schema that sets <b>"areaServed": "AU"</b> with a relative <b>"/"</b> URL — omitting your Sydney headquarters, founders <b>Harry Cribb</b> and <b>Paul Del Gigante</b>, Service schema, and FAQ schema. On Google Maps, Inturing's Sydney profile shows <b>0 reviews</b>, <b>no street address</b>, and is filed under generic "Computer support and services". And when ChatGPT and Gemini check <b>Microsoft's official Partner Directory (AppSource)</b> and <b>Clutch</b>, Inturing is not listed.
        </div>
      </div>
    </section>

    <!-- SECTION 3: THE COMPARISON THAT MATTERS -->
    <section class="sec-block">
      <div class="sec-eyebrow">THE COMPARISON THAT MATTERS</div>
      <h2 class="sec-h2">You already beat every national rival in Manufacturing. They beat you on the other five topics by publishing pages you haven't built yet.</h2>

      <p class="sec-p">
        Power Platform Experts (88 mentions) and Eagle360 Consulting (61 mentions, #1 in Sydney overall) do not have stronger operational case studies than Inturing's $150,000/year BBCP and PNA builds. They win the general Power Platform, ERP and reporting shortlists because their websites publish separate pages for each integration, industry and city.
      </p>

      <div class="table-card">
        <table class="uprise-table">
          <thead>
            <tr>
              <th style="width:28%">SIGNAL READ BY GOOGLE &amp; AI</th>
              <th style="width:36%">INTURING (INTURING.COM.AU)</th>
              <th style="width:36%">POWER PLATFORM EXPERTS &amp; EAGLE360</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="bold">Manufacturing automation AI answers</td>
              <td class="purple">${mfgMentioned} of 40 (#1 in Australia · ${mfgNum1}× ranked #1)</td>
              <td>Power Platform Experts: 9/40 · Eagle360: 14/40</td>
            </tr>
            <tr>
              <td class="bold">Custom Power Apps AI answers</td>
              <td class="purple">${paMentioned} of 40 (${paNum1}× ranked #1)</td>
              <td class="purple">Power Platform Experts: 24/40 · Barhead: 14/40</td>
            </tr>
            <tr>
              <td class="bold">Other 5 topics (Power Platform, Automate, ERP, BI/Fabric, Copilot)</td>
              <td>0 of 200</td>
              <td class="purple">Power Platform Experts: 55/200 · Eagle360: 36/200 · Professional Advantage: 59/200</td>
            </tr>
            <tr>
              <td class="bold">Homepage title positioning</td>
              <td>"AI Automation &amp; Power Platform for Manufacturers" (filters out non-manufacturers)</td>
              <td class="purple">Broad commercial Microsoft Power Platform, ERP &amp; BI positioning</td>
            </tr>
            <tr>
              <td class="bold">Dedicated ERP Integration page</td>
              <td>None (MYOB Acumatica &amp; SAP Ariba buried inside BBCP case study)</td>
              <td class="purple">Dedicated MYOB Acumatica, Dynamics 365, SAP &amp; API integration pages</td>
            </tr>
            <tr>
              <td class="bold">Industry pages on website</td>
              <td>Manufacturing and Public Sector only</td>
              <td class="purple">Manufacturing, Wholesale/Distribution, Construction, Property, Finance &amp; Government</td>
            </tr>
            <tr>
              <td class="bold">Insights Hub &amp; Lead Magnets</td>
              <td>3 blog posts; no gated Case Study PDF, Checklist or ROI Guide</td>
              <td class="purple">Resource hubs, implementation guides, and downloadable templates</td>
            </tr>
            <tr>
              <td class="bold">City delivery pages</td>
              <td>None ("Sydney &amp; Australia-wide" mentioned in footer only)</td>
              <td class="purple">Dedicated Sydney, Melbourne, Brisbane &amp; Perth consultant pages</td>
            </tr>
            <tr>
              <td class="bold">Sydney Google Business Profile</td>
              <td>0 reviews, no street address, "Computer support and services"</td>
              <td class="purple">Verified street address, reviews &amp; software/consulting categories</td>
            </tr>
            <tr>
              <td class="bold">Structured data &amp; /llms.txt</td>
              <td>Bare Organization schema only; /llms.txt returns 404</td>
              <td class="purple">Service &amp; LocalBusiness schema + Microsoft AppSource / Clutch profiles</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="table-note">
        Closing the gap between 31 and 90+ AI recommendations does not require reinventing Inturing's delivery model. It requires tightening the positioning on your existing Lovable site so adjacent sectors are welcomed in, and building out the solution, industry, and Insights Hub pages that answer the other five buyer questions.
      </p>

      <div class="table-card">
        <table class="uprise-table">
          <thead>
            <tr>
              <th>CONSULTANCIES AI NAMED ACROSS AUSTRALIA</th>
              <th class="num">AI ANSWERS (/280)</th>
              <th class="num">DOMAIN LINKS IN AI</th>
              <th>WHAT AI SHORTLISTS THEM FOR</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="bold">Power Platform Experts</td>
              <td class="num">88</td>
              <td class="num">130</td>
              <td>Power Platform consulting (21/40), Power Automate (24/40), Power Apps (24/40), Power BI (10/40)</td>
            </tr>
            <tr>
              <td class="bold">Office Experts</td>
              <td class="num">72</td>
              <td class="num">35</td>
              <td>Power Platform, Power Automate &amp; Microsoft 365 workflow automation across all 8 cities</td>
            </tr>
            <tr>
              <td class="bold">Professional Advantage</td>
              <td class="num">70</td>
              <td class="num">20</td>
              <td>ERP integration (17/40), Power Platform (21/40) &amp; Power BI/Fabric (15/40); 399 historical Google AI Overview mentions</td>
            </tr>
            <tr>
              <td class="bold">Eagle360 Consulting</td>
              <td class="num">61</td>
              <td class="num">51</td>
              <td>#1 in Sydney overall (15/35); Manufacturing automation (14/40), ERP integration (12/40), Power Automate (12/40)</td>
            </tr>
            <tr>
              <td class="bold">Barhead Solutions</td>
              <td class="num">57</td>
              <td class="num">18</td>
              <td>Power Platform consulting (19/40), Power Apps (14/40) &amp; Copilot Studio agents (14/40)</td>
            </tr>
            <tr>
              <td class="bold">Velrada</td>
              <td class="num">46</td>
              <td class="num">20</td>
              <td>Enterprise Power Platform (19/40), Copilot Studio (9/40) &amp; Perth/National Microsoft workloads</td>
            </tr>
            <tr>
              <td class="bold">Leverage Technologies</td>
              <td class="num">18</td>
              <td class="num">14</td>
              <td>#1 specialist for MYOB Acumatica &amp; SAP ERP integration (18/40); 315 historical Google AI Overview mentions</td>
            </tr>
            <tr class="highlight-row">
              <td class="bold">Inturing</td>
              <td class="num purple">${totalMentioned}</td>
              <td class="num purple">${totalDomainCitations}</td>
              <td class="purple">#1 in Manufacturing automation (${mfgMentioned}/40, ${mfgNum1}× #1) &amp; Custom Power Apps (${paMentioned}/40); 0/200 on the other 5 questions</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- SECTION 4: THE DIAGNOSTIC -->
    <section class="sec-block">
      <div class="sec-eyebrow">THE DIAGNOSTIC</div>
      <h2 class="sec-h2">What buyers and AI actually searched for</h2>
      <p class="sec-p">
        When operations leaders and AI assistants evaluate a consultancy, they look for specific pages matching the system, workflow or industry in question. Here are the seven buyer questions we tested across all eight cities, and what they found on inturing.com.au.
      </p>

      <div class="table-card">
        <table class="uprise-table">
          <thead>
            <tr>
              <th style="width:42%">WHAT BUYERS &amp; AI SEARCHED FOR</th>
              <th style="width:58%">WHAT THEY COULD FIND ON INTURING.COM.AU</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="bold">Manufacturing process &amp; shop-floor automation without replacing ERP</td>
              <td><b>A clean hit (${mfgMentioned}/40 answers, ${mfgNum1}× #1).</b> Assistants found <b>/manufacturing</b>, the Manufacturing Assessment tool, and the BBCP case study (&gt;90% faster order processing, ~$150k/yr saved).</td>
            </tr>
            <tr>
              <td class="bold">Custom Power Apps developer for field, warehouse &amp; quality inspections</td>
              <td><b>Partial hit (${paMentioned}/40 answers, ${paNum1}× #1).</b> Assistants found <b>/power-apps</b> and your offline mobile app examples across Sydney, Melbourne, Brisbane, Perth, Adelaide, Canberra and Newcastle.</td>
            </tr>
            <tr>
              <td class="bold">Microsoft Power Platform consultants (general mid-market operations)</td>
              <td><b>Filtered out (0/40 answers).</b> The homepage title says "for Manufacturers", so assistants skip Inturing when non-manufacturing businesses ask for a Power Platform partner.</td>
            </tr>
            <tr>
              <td class="bold">Power Automate &amp; workflow automation (approvals, POs, onboarding)</td>
              <td><b>Cited in background only (0/40 named, cited twice).</b> Perplexity cited <b>/workflow-automation</b> and <b>/power-automate</b> as reference articles, but did not shortlist Inturing for non-manufacturing buyers.</td>
            </tr>
            <tr>
              <td class="bold">ERP, CRM, MYOB Acumatica, SAP Ariba &amp; SharePoint integration</td>
              <td><b>Nothing dedicated (0/40 answers).</b> You have delivered live MYOB Acumatica, SAP Ariba and Dynamics 365 integrations, but there is no ERP Integration page on the site.</td>
            </tr>
            <tr>
              <td class="bold">Power BI &amp; Microsoft Fabric executive and operational reporting</td>
              <td><b>Nothing on Fabric (0/40 answers).</b> <b>/data-analytics</b> covers general dashboards, but never names Microsoft Fabric or CFO/COO multi-entity reporting across ERP and finance systems.</td>
            </tr>
            <tr>
              <td class="bold">Microsoft Copilot Studio &amp; custom AI agents connected to internal data</td>
              <td><b>Too thin to shortlist (0/40 answers).</b> <b>/ai-automation</b> and <b>/copilot</b> describe AI readiness, but lack concrete Copilot Studio agent architectures and governance proof.</td>
            </tr>
            <tr>
              <td class="bold">Wholesale, Civil Construction &amp; Property operations automation</td>
              <td><b>Locked in image logos.</b> Menai Civil Contractors, Schlam, Liquip Victoria, AustEx and Burgtec are shown as image logos only, and PNA is not linked from an industry hub.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="table-note">
        Seven buyer questions, two strong hits and five misses caused by missing pages and a narrow homepage title. Every row above maps directly to the 3-month Lovable build programme Harry outlined.
      </p>
    </section>

    <!-- SECTION 5: THE DEMAND -->
    <section class="sec-block">
      <div class="sec-eyebrow">THE DEMAND</div>
      <h2 class="sec-h2">Where real Australian demand sits across AI and search</h2>
      <p class="sec-p">
        Before building new solution and industry pages on Lovable, we measured monthly Australian AI prompt volume across the core Microsoft Power Platform, reporting, AI agent and ERP integration terms (${totalAiVolume.toLocaleString('en-AU')} tracked monthly AI prompts in Australia), alongside our 56-query Google organic benchmark.
      </p>

      <div class="table-card">
        <table class="uprise-table">
          <thead>
            <tr>
              <th>SEARCH / AI TOPIC</th>
              <th class="num">AU AI PROMPTS / MO</th>
              <th class="num">12-MONTH PEAK</th>
              <th>INTURING PAGE &amp; CURRENT STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="bold">power bi &amp; power bi consultant</td>
              <td class="num purple">${((kwMap['power bi']?.ai_search_volume || 1670) + (kwMap['power bi consultant']?.ai_search_volume || 4)).toLocaleString('en-AU')}</td>
              <td class="num">${getPeakLabel(kwMap['power bi'] || {})}</td>
              <td>/data-analytics — 0/40 AI mentions, not ranking in Google Top 20</td>
            </tr>
            <tr>
              <td class="bold">microsoft copilot</td>
              <td class="num purple">${(kwMap['microsoft copilot']?.ai_search_volume || 551).toLocaleString('en-AU')}</td>
              <td class="num">${getPeakLabel(kwMap['microsoft copilot'] || {})}</td>
              <td>/copilot — 0/40 AI mentions, not ranking in Google Top 20</td>
            </tr>
            <tr>
              <td class="bold">power apps</td>
              <td class="num purple">${(kwMap['power apps']?.ai_search_volume || 399).toLocaleString('en-AU')}</td>
              <td class="num">${getPeakLabel(kwMap['power apps'] || {})}</td>
              <td>/power-apps — <b>${paMentioned}/40 AI mentions (${paNum1}× #1)</b>, not in Google Top 20</td>
            </tr>
            <tr>
              <td class="bold">power automate</td>
              <td class="num purple">${(kwMap['power automate']?.ai_search_volume || 338).toLocaleString('en-AU')}</td>
              <td class="num">${getPeakLabel(kwMap['power automate'] || {})}</td>
              <td>/power-automate — 0/40 AI mentions (cited twice), not in Google Top 20</td>
            </tr>
            <tr>
              <td class="bold">ai automation &amp; ai automation agency</td>
              <td class="num purple">${((kwMap['ai automation']?.ai_search_volume || 143) + (kwMap['ai automation agency']?.ai_search_volume || 23)).toLocaleString('en-AU')}</td>
              <td class="num">${getPeakLabel(kwMap['ai automation'] || {})}</td>
              <td>/ai-automation — strong in Manufacturing (${mfgMentioned}/40), 0/40 for general buyers</td>
            </tr>
            <tr>
              <td class="bold">copilot studio</td>
              <td class="num purple">${(kwMap['copilot studio']?.ai_search_volume || 117).toLocaleString('en-AU')}</td>
              <td class="num">${getPeakLabel(kwMap['copilot studio'] || {})}</td>
              <td>No dedicated Copilot Studio agent page (+38% YoY growth in AU)</td>
            </tr>
            <tr>
              <td class="bold">microsoft fabric</td>
              <td class="num purple">${(kwMap['microsoft fabric']?.ai_search_volume || 79).toLocaleString('en-AU')}</td>
              <td class="num">${getPeakLabel(kwMap['microsoft fabric'] || {})}</td>
              <td>None — Microsoft Fabric is never given a dedicated page on the site</td>
            </tr>
            <tr>
              <td class="bold">workflow &amp; business process automation</td>
              <td class="num">${((kwMap['workflow automation']?.ai_search_volume || 46) + (kwMap['business process automation']?.ai_search_volume || 10)).toLocaleString('en-AU')}</td>
              <td class="num">${getPeakLabel(kwMap['workflow automation'] || {})}</td>
              <td>/workflow-automation — needs adjacent-sector proof (wholesale, civil, property)</td>
            </tr>
            <tr>
              <td class="bold">microsoft power platform</td>
              <td class="num">${(kwMap['microsoft power platform']?.ai_search_volume || 21).toLocaleString('en-AU')}</td>
              <td class="num">${getPeakLabel(kwMap['microsoft power platform'] || {})}</td>
              <td>Homepage &amp; /assessment/power-platform — blocked by "for Manufacturers" title</td>
            </tr>
            <tr>
              <td class="bold">erp integration (MYOB Acumatica, SAP, D365)</td>
              <td class="num">${(kwMap['erp integration']?.ai_search_volume || 16).toLocaleString('en-AU')}</td>
              <td class="num">${getPeakLabel(kwMap['erp integration'] || {})}</td>
              <td>None — highest commercial deal value, zero dedicated page today</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="table-note">
        Notice the commercial pattern: the highest-volume searches (Power BI, Copilot, Power Apps, Power Automate) and the highest-margin project searches (ERP integration across MYOB Acumatica, SAP Ariba and Dynamics 365) are the exact areas where Inturing already has delivery proof, but lacks the dedicated Lovable pages and positioning to capture them.
      </p>
    </section>

    <!-- SECTION 6: SCOPE OF WORK (6 WORKSTREAMS MAPPED TO HARRY'S BRIEF) -->
    <section class="sec-block">
      <div class="sec-eyebrow">SCOPE OF WORK</div>
      <h2 class="sec-h2">Six workstreams on your existing Lovable site</h2>
      <p class="sec-p">
        Everything below maps directly to Harry's 3-month brief and the audit findings above. We build directly inside your existing Lovable site — keeping what already converts while opening up adjacent sectors, search rankings, and lead capture. Per your brief, <b>social media, ongoing blog/newsletter content and PR are out of scope</b>.
      </p>

      <div class="ws-item">
        <div class="ws-num">01</div>
        <div>
          <h3 class="ws-title">GA4, Search Console, event tracking and HubSpot lead capture set up early</h3>
          <p class="ws-intro">
            Before new pages and lead magnets launch, we wire end-to-end analytics and CRM attribution across the Lovable site in Weeks 1–2 so every enquiry is traced back to its exact Google, AI or referral source.
          </p>
          <ul class="ws-list">
            <li><b>GA4 and Google Search Console setup:</b> Clean installation across Lovable's client-side routing, domain verification, XML sitemap submission, and baseline indexation audit.</li>
            <li><b>Custom event tracking built in:</b> Track 3-Minute Assessment starts and completions (<b>/assessment</b>, <b>/assessment/manufacturing-automation</b>, <b>/assessment/power-platform</b>), ROI Calculator usage, lead magnet downloads, and meeting bookings.</li>
            <li><b>HubSpot lead capture and attribution:</b> Connect all Lovable forms and gated asset downloads directly into HubSpot with hidden UTM, landing page, and AI referrer capture (tracking leads from ChatGPT, Perplexity and Google).</li>
          </ul>
        </div>
      </div>

      <div class="ws-item">
        <div class="ws-num">02</div>
        <div>
          <h3 class="ws-title">Tighten positioning and messaging (manufacturing-led, open to adjacent sectors)</h3>
          <p class="ws-intro">
            You keep your #1 authority in Australian manufacturing while removing the "factories only" filter that currently costs you 200 out of 280 buyer shortlists.
          </p>
          <ul class="ws-list">
            <li><b>Positioning overhaul on the Lovable homepage:</b> Shift from "for Manufacturers" to <b>"Operational AI, Power Platform &amp; ERP Automation — Built in Manufacturing, Proven Across Wholesale, Construction, Property &amp; Mid-Market Operations."</b></li>
            <li><b>Turn your 7 image-only client logos into quotable proof:</b> Add concise written industry and workflow summaries beneath <b>Burgtec, Schlam (mining/heavy equipment), Menai Civil Contractors (civil engineering), AustEx, Liquip Victoria, CBTech and EFS</b> in plain HTML text.</li>
            <li><b>Surface your $150,000/yr savings proof site-wide:</b> Bring the <b>BBCP</b> (&gt;90% faster order processing across MYOB Acumatica, SAP Ariba &amp; SharePoint) and <b>Property Network of Australia (PNA)</b> outcomes onto your core service headers.</li>
          </ul>
        </div>
      </div>

      <div class="ws-item">
        <div class="ws-num">03</div>
        <div>
          <h3 class="ws-title">SEO &amp; keyword research + build out solution and industry pages on Lovable</h3>
          <p class="ws-intro">
            We complete full commercial SEO and AI keyword research to map where real demand sits, then design, write and ship the missing solution, adjacent industry, and city pages directly inside your existing Lovable codebase.
          </p>
          <ul class="ws-list">
            <li><b>Commercial SEO and keyword blueprint:</b> Map high-intent search volume and buyer questions across ERP integration, Power Platform consulting, Power Automate, Power BI / Fabric, and Copilot Studio to specific Lovable routes.</li>
            <li><b>New Solution pages built on Lovable:</b> Dedicated <b>ERP &amp; System Integration</b> page (MYOB Acumatica, SAP Ariba, Dynamics 365, SharePoint, Monday.com), upgraded <b>Power BI &amp; Microsoft Fabric</b> operational reporting page, and <b>Copilot Studio &amp; AI Agents</b> page.</li>
            <li><b>New Adjacent Industry pages built on Lovable:</b> Dedicated industry pages for <b>Wholesale, Distribution &amp; Supply Chain</b>, <b>Civil Construction, Engineering &amp; Field Services</b>, and <b>Property &amp; Multi-Party Operations</b>, plus an expanded Public Sector page.</li>
            <li><b>City delivery hubs:</b> Commercial landing pages for <b>Sydney (HQ), Melbourne, Brisbane and Perth</b> so Inturing ranks in local Google searches and city-level AI shortlists.</li>
          </ul>
        </div>
      </div>

      <div class="ws-item">
        <div class="ws-num">04</div>
        <div>
          <h3 class="ws-title">Build an Insights Hub (/insights) plus 3 HubSpot-gated lead magnets</h3>
          <p class="ws-intro">
            Operations directors and CFOs often research architectures and ROI internally before booking a call. We will build a clean Insights Hub on the Lovable site and produce the three exact lead magnets from your brief:
          </p>
          <ul class="ws-list">
            <li><b>Insights Hub (/insights) on Lovable:</b> Filterable resource hub matching your current UI, wired to HubSpot lead capture forms, your 3-minute assessments, and Harry's booking calendar.</li>
            <li><b>Lead Magnet 1 — Case Study Download:</b> <i>"How Australian Operations Teams Save $150,000+/Year Automating Order-to-Invoice &amp; ERP Workflows"</i> (technical and commercial breakdown of the BBCP and PNA builds).</li>
            <li><b>Lead Magnet 2 — Practical Checklist:</b> <i>"The 15-Point ERP &amp; Spreadsheet Automation Readiness Checklist for COOs and Operations Leaders."</i></li>
            <li><b>Lead Magnet 3 — Executive ROI Guide:</b> <i>"The Mid-Market ROI Guide to Microsoft Power Platform &amp; Copilot Studio: Realistic Costs, Timeframes and Payback Windows in Australia."</i></li>
          </ul>
        </div>
      </div>

      <div class="ws-item">
        <div class="ws-num">05</div>
        <div>
          <h3 class="ws-title">On-page and technical SEO built in (plus Google profile &amp; partner directories)</h3>
          <p class="ws-intro">
            Because Lovable sites render as modern web apps, we build clean technical SEO, route metadata, and machine-readable entity schema directly into every page.
          </p>
          <ul class="ws-list">
            <li><b>On-page and technical SEO across all Lovable routes:</b> Unique title tags, meta descriptions, canonical tags, OpenGraph tags, H1–H3 hierarchy, internal linking, XML sitemap, and a complete <b>/llms.txt</b> file.</li>
            <li><b>Full JSON-LD schema on every page:</b> Replace the bare country-only schema with <b>ProfessionalService</b> schema (Sydney HQ, ABN, founders Harry Cribb and Paul Del Gigante), <b>Service</b> schema for each solution, and <b>FAQPage</b> schema.</li>
            <li><b>Sydney Google Business Profile &amp; Partner Directories:</b> Verify your Sydney Google profile, update categories from "Computer support" to <b>Business Management Consultant &amp; Software Company</b>, set up a simple client review flow, and publish profiles on <b>Microsoft AppSource</b> and <b>Clutch</b>.</li>
          </ul>
        </div>
      </div>

      <div class="ws-item">
        <div class="ws-num">06</div>
        <div>
          <h3 class="ws-title">Weekly catch-up throughout &amp; fixed monthly measurement</h3>
          <ul class="ws-list">
            <li><b>Standing weekly catch-up call:</b> Weekly 30-minute sprint catch-up with Harry and Paul throughout the 3 months to review shipped Lovable pages, lead magnet progress, Search Console indexing, and HubSpot enquiries.</li>
            <li><b>Fixed 280-answer &amp; 56-SERP yardstick:</b> Every 30 days we re-run the exact same 280 AI buyer questions and 56 commercial Google searches from this audit, alongside GA4 and HubSpot conversion reporting.</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- SECTION 7: TIMELINE (THE FIRST 90 DAYS) -->
    <section class="sec-block">
      <div class="sec-eyebrow">TIMELINE</div>
      <h2 class="sec-h2">The first 90 days</h2>

      <div class="timeline">
        <div class="tl-step">
          <div class="tl-eyebrow">MONTH 1 · TRACK, REPOSITION AND FIX FOUNDATIONS</div>
          <div class="tl-body">
            GA4, Google Search Console, custom event tracking and HubSpot lead capture set up in Weeks 1–2. Full SEO and AI keyword research signed off. Lovable homepage positioning tightened (manufacturing-led, open to adjacent sectors) and written proof added under all 7 client logos. Route-level technical SEO, JSON-LD schema, /llms.txt and the Sydney Google Business Profile aligned. Dedicated <b>ERP &amp; System Integration page</b> shipped on Lovable. Weekly catch-ups running from Week 1.
          </div>
        </div>

        <div class="tl-step">
          <div class="tl-eyebrow">MONTH 2 · SOLUTION PAGES, ADJACENT INDUSTRIES AND INSIGHTS HUB</div>
          <div class="tl-body">
            New adjacent industry pages (<b>Wholesale &amp; Distribution, Civil Construction &amp; Field Services, Property Operations</b>) and upgraded <b>Power BI / Microsoft Fabric</b> and <b>Copilot Studio</b> solution pages built and shipped on Lovable. <b>Insights Hub (/insights)</b> launched with <b>Lead Magnet #1 (Case Study Download)</b> gated via HubSpot. Sydney and Melbourne commercial delivery pages live. Microsoft AppSource and Clutch profiles submitted. Month 2 benchmark re-run.
          </div>
        </div>

        <div class="tl-step">
          <div class="tl-eyebrow">MONTH 3 · LEAD MAGNETS, CITY EXPANSION AND COMPOUND</div>
          <div class="tl-body">
            <b>Lead Magnet #2 (15-Point Readiness Checklist)</b> and <b>Lead Magnet #3 (Mid-Market ROI Guide)</b> published on the Insights Hub with HubSpot capture. Brisbane and Perth commercial delivery pages live. Internal linking and conversion pass across all Lovable pages, assessments, and ROI calculators. Iteration pass on any page that has not moved. Full 90-day review against the 280-answer and 56-search baseline.
          </div>
        </div>
      </div>

      <p class="table-note">
        To be straight with you about timing: GA4/HubSpot tracking, the tightened homepage positioning, the written client proof, and the Google profile fixes go live in the first few weeks. New Lovable solution and industry pages typically take six to ten weeks to climb Google rankings, and AI shortlist gains compound as those pages and partner directories index.
      </p>
    </section>

    <!-- SECTION 8: HOW TO WORK WITH US (3 PRICING TIERS: $3,000 / $4,500 / $6,000) -->
    <section class="sec-block">
      <div class="sec-eyebrow">HOW TO WORK WITH US</div>
      <h2 class="sec-h2">Three ways to get started</h2>
      <p class="sec-p">
        Three levels for the 3-month programme, all month-to-month with no lock-in. The difference between them is the pace of Lovable page builds, lead magnet production, and directory/authority placements each month. Early GA4, Search Console and HubSpot setup, positioning refinement, technical SEO, and the weekly catch-up are included at every level.
      </p>

      <div class="pricing-grid">
        <!-- FOUNDATION -->
        <div class="price-card">
          <div class="tier-name">FOUNDATION</div>
          <div class="tier-price">$3,000</div>
          <div class="tier-sub">per month + GST</div>
          <div class="tier-3mo">3-Month Total: $9,000 + GST</div>
          <ul class="tier-list">
            <li>GA4, Search Console &amp; HubSpot event tracking set up early (Weeks 1–2)</li>
            <li>SEO &amp; AI keyword research matrix + homepage positioning overhaul</li>
            <li>Technical SEO built into Lovable: route meta, JSON-LD schema, sitemap &amp; /llms.txt</li>
            <li>Written proof blurbs added for all 7 client logos on the site</li>
            <li><b>4 new Lovable solution/industry pages</b> + Insights Hub setup with 1 lead magnet across the 3 months</li>
            <li>Weekly 30-min catch-up &amp; monthly 280-answer benchmark report</li>
          </ul>
        </div>

        <!-- GROWTH (RECOMMENDED) -->
        <div class="price-card recommended">
          <div class="rec-badge">RECOMMENDED</div>
          <div class="tier-name">GROWTH</div>
          <div class="tier-price">$4,500</div>
          <div class="tier-sub">per month + GST</div>
          <div class="tier-3mo">3-Month Total: $13,500 + GST</div>
          <ul class="tier-list">
            <li><b>Everything in Foundation</b> (full Harry Cribb 3-month brief covered end-to-end)</li>
            <li><b>Full solution &amp; industry page build on Lovable</b> (ERP Integration, Fabric/BI, Copilot Studio, Wholesale, Civil, Property + 4 city hubs)</li>
            <li><b>Insights Hub (/insights) + all 3 HubSpot-gated lead magnets</b> (Case Study download, 15-Point Checklist &amp; ROI Guide)</li>
            <li>Sydney Google Business Profile overhaul &amp; client review flow</li>
            <li>Microsoft AppSource, Clutch &amp; partner directory placements</li>
            <li>Weekly catch-up call + HubSpot &amp; AI lead attribution tracking</li>
          </ul>
        </div>

        <!-- AUTHORITY -->
        <div class="price-card">
          <div class="tier-name">AUTHORITY</div>
          <div class="tier-price">$6,000</div>
          <div class="tier-sub">per month + GST</div>
          <div class="tier-3mo">3-Month Total: $18,000 + GST</div>
          <ul class="tier-list">
            <li><b>Everything in Growth</b></li>
            <li><b>Accelerated Lovable build pace:</b> additional ERP-specific sub-pages (MYOB Acumatica, SAP Ariba, Dynamics 365, Pronto) + all 8 Australian city hubs</li>
            <li><b>5 gated lead magnets &amp; interactive tools</b> + conversion rate optimisation on the 3-minute assessments</li>
            <li>Aggressive earned mention &amp; directory push (7 placements/mo)</li>
            <li>One original Australian manufacturing &amp; operations automation data study for industry citations</li>
            <li>Live Looker/GA4 attribution dashboard &amp; priority strategy support</li>
          </ul>
        </div>
      </div>

      <p class="table-note">
        All plans are month-to-month with no lock-in, and prices exclude GST. Social media, ongoing blog/newsletter content and PR are excluded per your brief. Given that the 3-month brief includes early GA4/Search Console/HubSpot setup, positioning, building out the missing solution and adjacent industry pages on Lovable, and launching the Insights Hub with all three lead magnets (Case Study download, Checklist, and ROI Guide), <b>Growth ($4,500/mo + GST · $13,500 + GST over 3 months)</b> is the level we recommend starting on.
      </p>

      <!-- 4 GUARANTEE BOXES -->
      <div class="guarantee-grid">
        <div class="g-box">
          <div class="g-title">Month to month</div>
          <div class="g-body">30 days notice, no exit fees, no setup fee.</div>
        </div>
        <div class="g-box">
          <div class="g-title">You own everything</div>
          <div class="g-body">All Lovable pages, lead magnets, schema, GA4/HubSpot setups and reports stay in your accounts.</div>
        </div>
        <div class="g-box">
          <div class="g-title">Fixed yardstick</div>
          <div class="g-body">The 280-answer prompt panel and 56-search pool are set at baseline and never swapped.</div>
        </div>
        <div class="g-box">
          <div class="g-title">Honest promise</div>
          <div class="g-body">We promise the work, shipped on Lovable and measured weekly. Nobody can guarantee rankings or AI placements.</div>
        </div>
      </div>

      <p class="sec-p" style="margin-bottom:0">
        To start: reply with the plan you want and we send the agreement and the Week 1 onboarding checklist (Lovable, GA4, Search Console and HubSpot access) the same day. Happy to walk through any line of this with you and Paul on a call first, including running the live ChatGPT and Perplexity tests together.
      </p>
    </section>

  </main>

  <!-- BOTTOM UPRISE FOOTER -->
  <footer class="bottom-bar">
    ${upriseLogoImg}
    <div>
      Prepared by Uprise Digital · <a href="https://www.uprisedigital.com.au" target="_blank" rel="noopener">uprisedigital.com.au</a><br>
      All rankings, volumes, website checks and 280 AI tests dated 29 October 2026.<br>
      Pricing valid for 30 days.
    </div>
  </footer>

</body>
</html>`;

fs.mkdirSync(path.join(pipelineDir, 'out'), { recursive: true });
fs.writeFileSync(path.join(pipelineDir, 'out', 'proposal.html'), html);
fs.writeFileSync(path.join(rootDir, 'site', 'proposal.html'), html);
console.log(`Generated Rayamp-style Uprise Proposal! Written to site/proposal.html (${html.length} bytes).`);
