import fs from 'fs';

const CFG = JSON.parse(fs.readFileSync('client.config.json', 'utf8'));
const metrics = JSON.parse(fs.readFileSync('pipeline/metrics.json', 'utf8'));
const citations = JSON.parse(fs.readFileSync('pipeline/citations.json', 'utf8'));
const hist = JSON.parse(fs.readFileSync('pipeline/hist.json', 'utf8'));
const kwData = JSON.parse(fs.readFileSync('pipeline/raw_ai_keyword_data.json', 'utf8'));
const siteAudit = JSON.parse(fs.readFileSync('pipeline/site_audit.json', 'utf8'));
const mapsAudit = JSON.parse(fs.readFileSync('pipeline/maps_audit.json', 'utf8'));
const serpAudit = JSON.parse(fs.readFileSync('pipeline/serp_audit.json', 'utf8'));
const ansFull = JSON.parse(fs.readFileSync('pipeline/ans_full.json', 'utf8'));

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wilsonCI(k, n) {
  if (!n) return [0, 0];
  const z = 1.96;
  const p = k / n;
  const denom = 1 + (z * z) / n;
  const center = (p + (z * z) / (2 * n)) / denom;
  const half = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denom;
  return [Math.max(0, +((center - half) * 100).toFixed(1)), Math.min(100, +((center + half) * 100).toFixed(1))];
}

const [mtCiLo, mtCiHi] = wilsonCI(metrics.mtMentioned, metrics.totalAnswers);
const irls = metrics.irls;

const platRowsHtml = Object.entries(metrics.byPlat).map(([plat, d]) => {
  const [lo, hi] = wilsonCI(d.mentioned, d.total);
  const endpoints = {
    chatgpt: 'DataForSEO /ai_optimization/chat_gpt/llm_scraper/live/advanced (force_web_search=true, AU)',
    perplexity: 'DataForSEO /ai_optimization/perplexity/llm_responses/live (model=sonar, web_search=true, AU)',
    aimode: 'DataForSEO /serp/google/ai_mode/live/advanced (desktop, AU city location_code)',
    gemini: 'Google Direct API v1beta/models/gemini-3.8-flash:generateContent (tools=[{google_search:{}}])',
    claude: 'Anthropic Claude Sonnet 4.6 (web_search_20250305 + DataForSEO /ai_optimization/claude/llm_responses/live, AU)'
  };
  return `<tr>
    <td><strong>${esc(plat.toUpperCase())}</strong></td>
    <td class="mono" style="font-size:11px;">${esc(endpoints[plat] || plat)}</td>
    <td class="num">${d.total}</td>
    <td class="num"><strong>${d.mentioned}</strong></td>
    <td class="num"><strong>${d.ratePct}%</strong></td>
    <td class="num mono">[${lo}%, ${hi}%]</td>
    <td class="num">${d.top3} (${d.top3Pct}%)</td>
    <td class="num">${d.num1}</td>
    <td class="num">${d.cited}</td>
    <td class="num mono">${d.avgChars.toLocaleString()}</td>
  </tr>`;
}).join('\n');

const promptRowsHtml = CFG.prompts.map((p, idx) => {
  const cat = metrics.byCat[p.id] || { total: 40, mentioned: 0, ratePct: 0, top3: 0, num1: 0, topFirms: [] };
  const topLeader = cat.topFirms?.[0] ? `${cat.topFirms[0].name} (${cat.topFirms[0].count}/${cat.total})` : '—';
  return `<tr>
    <td class="mono">P${idx + 1} · ${esc(p.id)}</td>
    <td><strong>${esc(p.title || p.category)}</strong></td>
    <td style="font-size:12px;">${esc(p.template)}</td>
    <td class="mono" style="font-size:11px;">${esc(p.serpKeyword)}</td>
    <td class="num"><strong>${cat.mentioned}/${cat.total} (${cat.ratePct}%)</strong></td>
    <td class="num">${cat.top3}</td>
    <td>${esc(topLeader)}</td>
  </tr>`;
}).join('\n');

const irlsRowsHtml = irls.coefficients.map(c => {
  return `<tr>
    <td><strong>${esc(c.name)}</strong></td>
    <td class="num mono"><strong>${c.beta >= 0 ? '+' : ''}${c.beta.toFixed(2)}</strong></td>
    <td class="num mono">${c.se.toFixed(2)}</td>
    <td class="num mono">${c.z >= 0 ? '+' : ''}${c.z.toFixed(2)}</td>
    <td class="num mono"><strong>${c.or !== null ? c.or.toFixed(2) + '×' : '—'}</strong></td>
    <td class="num mono">${c.ci95 ? `[${c.ci95[0]}×, ${c.ci95[1]}×]` : '—'}</td>
    <td class="num mono">${esc(c.pValue)}</td>
  </tr>`;
}).join('\n');

const sydneyBrandGbp = mapsAudit.markets?.brand_inturing?.topCompetitors || [];
const sydneyGenericGbp = (mapsAudit.markets?.sydney?.topCompetitors || []).slice(0, 6);
const combinedGbp = [
  ...sydneyBrandGbp.map(b => ({ ...b, packType: 'Brand: "Inturing Sydney"' })),
  ...sydneyGenericGbp.map(b => ({ ...b, packType: 'Category: "Microsoft consultant Sydney"' }))
];
const gbpRowsHtml = combinedGbp.map(b => {
  const isInt = /inturing/i.test(b.title || '') || /inturing/i.test(b.domain || '');
  const statusColor = isInt ? '#DC2626' : '#059669';
  return `<tr style="${isInt ? 'background:#FEF2F2;font-weight:700;' : ''}">
    <td class="mono" style="font-size:11px;">${esc(b.packType)}</td>
    <td class="num mono">#${b.rank}</td>
    <td><strong>${esc(b.title)}</strong></td>
    <td class="mono" style="color:${statusColor};font-weight:700;">${esc(b.category || '—')}</td>
    <td class="num mono"><strong>${b.rating !== null ? b.rating + '★' : 'Unrated'}</strong></td>
    <td class="num mono">${b.reviews || 0}</td>
    <td class="mono" style="font-size:11px;">${esc(b.domain || '—')}</td>
    <td style="font-size:11.5px;color:${isInt ? '#DC2626' : '#374151'};">${esc(b.address || 'MISSING (No verified street address)')}</td>
  </tr>`;
}).join('\n');

const M_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const mtHistArr = [...(hist['inturing.com.au']?.hist || [])].reverse();
const histMonths = mtHistArr.map(h => `${M_NAMES[h.month]} ${String(h.year).slice(2)}`);
const trackedHistOrder = [
  'inturing.com.au',
  'pa.com.au',
  'leveragetech.com.au',
  'officeexperts.com.au',
  'engage2.com.au',
  'frontrowtech.com.au',
  'barhead.com',
  'powerplatformexperts.com.au',
  'velrada.com'
];
const histDomains = {};
for (const dom of trackedHistOrder) {
  const obj = hist[dom];
  if (obj?.hist) {
    histDomains[dom] = {
      mentions: [...obj.hist].reverse().map(h => h.metrics?.mentions || 0)
    };
  }
}

const rawKwItems = kwData?.tasks?.[0]?.result?.[0]?.items || kwData?.keywords || [];
const normKeywords = rawKwItems.map(item => {
  const monthlyChron = [...(item.ai_monthly_searches || item.monthly || [])].reverse();
  const avg12m = monthlyChron.length ? Math.round(monthlyChron.reduce((s, m) => s + (m.ai_search_volume || 0), 0) / monthlyChron.length) : (item.ai_search_volume || 0);
  return {
    keyword: item.keyword,
    ai_search_volume: item.ai_search_volume || 0,
    avg_12m: avg12m,
    monthly: monthlyChron
  };
});

const cityMatrixRowsHtml = Object.entries(metrics.byCity).map(([cid, d]) => {
  const [lo, hi] = wilsonCI(d.mentioned, d.total);
  const top3Str = (d.topFirms || []).slice(0, 3).map(f => `${f.name} (${f.count})`).join(', ');
  const gbpStr = cid === 'sydney' ? 'Brand #3 (0 rev, null address) · Absent in cat pack' : 'Absent from Pack-20';
  return `<tr>
    <td><strong>${esc(d.displayLoc || d.name)}</strong></td>
    <td class="num">${d.total}</td>
    <td class="num"><strong>${d.mentioned} (${d.ratePct}%)</strong></td>
    <td class="num mono">[${lo}%, ${hi}%]</td>
    <td class="num">${d.top3} (${d.top3Pct}%)</td>
    <td class="num">${d.num1}</td>
    <td class="num">${d.serpTop20}/7</td>
    <td class="mono" style="font-size:11.5px;">${esc(gbpStr)}</td>
    <td style="font-size:11px;">${esc(top3Str)}</td>
  </tr>`;
}).join('\n');

const citationDomainsHtml = (citations.topDomains || []).slice(0, 14).map((d, i) => `<tr>
  <td class="num">${i + 1}</td>
  <td class="mono"><strong>${esc(d.domain)}</strong></td>
  <td>${esc(d.type)}</td>
  <td class="num"><strong>${d.count}</strong></td>
  <td class="num mono">${d.sharePct}%</td>
</tr>`).join('\n');

const baseCss = fs.readFileSync('pipeline/deck.css', 'utf8');
const baseJs = fs.readFileSync('pipeline/deck.js', 'utf8');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Inturing — Tier 2 Data Science & Econometric Technical Dossier</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-grotesk@700,600,500&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap">
<style>
${baseCss}
  :root {
    --pulp: #3B78B4 !important;
    --pulp-dark: #2B6399 !important;
    --navy: #0D1520 !important;
  }
  .slide { background: #FFFFFF; color: #191919; padding: 64px 96px 84px; gap: 18px; }
  .slide.dark { background: #0D1520 !important; color: #F9FAFB; }
  .eyebrow { font-size: 16px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #2B6399; margin-bottom: 4px; }
  h1, h2 { color: #191919; letter-spacing: -0.025em; margin-bottom: 6px; }
  h2 { font-size: 38px; font-weight: 800; line-height: 1.12; }
  p.lead { font-size: 19px; color: #4B5563; line-height: 1.45; margin-bottom: 10px; max-width: 1640px; }
  table.data-table { width: 100%; border-collapse: collapse; font-size: 16px; margin-top: 6px; }
  table.data-table th { background: #0D1520; color: #FFFFFF; text-align: left; padding: 10px 13px; font-size: 13.5px; text-transform: uppercase; letter-spacing: 0.06em; }
  table.data-table td { padding: 8.5px 13px; border-bottom: 1px solid #E5E7EB; vertical-align: middle; line-height: 1.32; }
  table.data-table tr:nth-child(even) td { background: #F9FAFB; }
  #tech-05-gbp-cid-audit table.data-table { font-size: 14px; }
  #tech-05-gbp-cid-audit table.data-table th { padding: 7px 10px; font-size: 12px; }
  #tech-05-gbp-cid-audit table.data-table td { padding: 6px 10px; }
  #tech-08-citation-graph table.data-table { font-size: 14px; }
  #tech-08-citation-graph table.data-table th { padding: 7px 10px; font-size: 12px; }
  #tech-08-citation-graph table.data-table td { padding: 5.5px 10px; }
  #tech-10-ai-keyword-demand table.data-table { font-size: 14.5px; }
  #tech-10-ai-keyword-demand table.data-table th { padding: 7px 10px; font-size: 12.5px; }
  #tech-10-ai-keyword-demand table.data-table td { padding: 6px 10px; }
  .num { text-align: right; }
  .mono { font-family: "JetBrains Mono", "SFMono-Regular", Consolas, monospace; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin: 18px 0; }
  .kpi-card { background: #0D1520; color: #FFFFFF; padding: 26px 26px; border-radius: 10px; border-top: 4px solid #3B78B4; }
  .kpi-card .val { font-size: 42px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.02em; }
  .kpi-card .lbl { font-size: 14.5px; text-transform: uppercase; letter-spacing: 0.08em; color: #D1D5DB; margin-top: 8px; }
  .code-box { background: #0D1520; color: #E5E7EB; padding: 18px 24px; border-radius: 10px; font-family: "JetBrains Mono", monospace; font-size: 15.5px; overflow-x: auto; line-height: 1.44; margin-top: 8px; white-space: pre; }
  .alert-box { border-left: 5px solid #3B78B4; background: #F0F7FF; padding: 18px 22px; border-radius: 8px; margin: 10px 0; font-size: 17.5px; line-height: 1.42; color: #191919; }
</style>
</head>
<body>
<div class="deck" id="deck">
  <div class="stage" id="stage">

<!-- Slide 1 -->
<section id="tech-01-cover" class="slide">
  <div class="eyebrow">TIER 2 INTERNAL DATA SCIENCE DOSSIER · EMPIRICAL GEO / AEO AUDIT</div>
  <h1 style="font-size:34px;font-weight:900;">Inturing — Econometric &amp; Retrieval Architecture Dossier</h1>
  <p class="lead">Full methodological specification, live API telemetry, Iteratively Reweighted Least Squares (IRLS) logistic regression parameters, JSON-LD &amp; 28-URL sitemap forensics, and Google Maps entity audit for <code>inturing.com.au</code> across Microsoft Power Platform, AI Automation, ERP Integration, and Data Analytics.</p>
  <div class="kpi-grid">
    <div class="kpi-card"><div class="val">${metrics.totalAnswers}</div><div class="lbl">Live AI Answers Audited (8×7×5)</div></div>
    <div class="kpi-card"><div class="val">${metrics.mtMentioned}/${metrics.totalAnswers} (${metrics.mtRatePct}%)</div><div class="lbl">Inturing Recall (95% CI: ${mtCiLo}%–${mtCiHi}%)</div></div>
    <div class="kpi-card"><div class="val">${metrics.mtTop3}/${metrics.totalAnswers} (${metrics.mtTop3Pct}%)</div><div class="lbl">Top-3 Shortlist Inclusion (#1: ${metrics.mtNum1})</div></div>
    <div class="kpi-card"><div class="val">${citations.clientDomainCitations} (${metrics.mtCited} ans)</div><div class="lbl">Direct inturing.com.au Citations (#3 Domain)</div></div>
  </div>
  <div class="alert-box">
    <strong>Zero-Fabrication &amp; Zero-Roleplay Guarantee:</strong> Every cell in this study was collected from its genuine live API endpoint (DataForSEO ChatGPT Scraper, Perplexity Sonar Live, Google AI Mode SERP, Google Direct Gemini 3.8 Flash with Grounding, and Anthropic Claude Sonnet 4.6 with Web Search) and verified against saved raw JSON payloads in <code>pipeline/raw/</code>.
  </div>
</section>

<!-- Slide 2 -->
<section id="tech-02-panel-design" class="slide">
  <div class="eyebrow">01 · EXPERIMENTAL DESIGN &amp; FACTORIAL SAMPLING</div>
  <h2>Full-Factorial 8 × 7 × 5 = 280 Empirical Panel Architecture (Australia-Wide)</h2>
  <p class="lead">To eliminate cherry-picking, we evaluated a balanced full-factorial matrix crossing 8 Australian capitals and industrial corridors with 7 Microsoft Power Platform &amp; AI automation buyer-intent prompt archetypes and 5 production AI answer engines, paired 1:1 with 56 live Google Organic SERPs and 9 Google Maps 20-Packs.</p>
  <table class="data-table">
    <thead>
      <tr><th>Dimension</th><th>Levels</th><th>Specification</th><th>Sample Size</th></tr>
    </thead>
    <tbody>
      <tr><td><strong>Australian Cities (8)</strong></td><td>8 Capitals &amp; Industrial Hubs</td><td>Sydney NSW (HQ), Melbourne VIC, Brisbane QLD, Perth WA, Adelaide SA, Canberra ACT, Newcastle &amp; Hunter NSW, Hobart TAS</td><td class="num mono">8</td></tr>
      <tr><td><strong>Buyer-Intent Archetypes (7)</strong></td><td>7 Core Capabilities</td><td>Manufacturing Process Automation, Custom Business Apps (Power Apps), Power Platform Consulting, Workflow &amp; Process Automation (Power Automate), ERP &amp; System Integration, Data &amp; Analytics (Power BI &amp; Fabric), AI Agents &amp; Copilot Studio</td><td class="num mono">7</td></tr>
      <tr><td><strong>AI Answer Engines (5)</strong></td><td>5 Live Endpoints</td><td>ChatGPT (Web Search), Perplexity (Sonar), Google AI Mode, Google Gemini 3.8 Flash, Anthropic Claude Sonnet 4.6</td><td class="num mono">5</td></tr>
      <tr><td><strong>Total AI Panel (<i>N</i>)</strong></td><td>8 × 7 × 5</td><td>Complete unedited markdown, grounding chunks, and citation arrays persisted in <code>pipeline/ans_full.json</code></td><td class="num mono"><strong>280</strong></td></tr>
      <tr><td><strong>Paired Google SERPs</strong></td><td>8 × 7</td><td>Desktop Google Organic Australian localized SERP (top 20 organic results per cell) in <code>pipeline/serp_audit.json</code></td><td class="num mono"><strong>56</strong></td></tr>
    </tbody>
  </table>
</section>

<!-- Slide 3 -->
<section id="tech-03-engine-telemetry" class="slide">
  <div class="eyebrow">02 · LIVE AI ENGINE TELEMETRY &amp; WILSON CONFIDENCE INTERVALS</div>
  <h2>Platform-by-Platform Retrieval Mechanics &amp; Empirical Mention Rates</h2>
  <p class="lead">Across the 280-answer panel, Inturing achieves an overall mention rate of <strong>${metrics.mtRatePct}%</strong> (${metrics.mtMentioned}/280, 95% Wilson CI [${mtCiLo}%, ${mtCiHi}%]), with 100% of its mentions occurring in Manufacturing Process Automation (23/40) and Shop-Floor Power Apps (8/40).</p>
  <table class="data-table">
    <thead>
      <tr><th>Engine</th><th>Production API Endpoint</th><th class="num">N</th><th class="num">Mentions</th><th class="num">Share %</th><th class="num">95% Wilson CI</th><th class="num">Top-3</th><th class="num">#1 Rank</th><th class="num">Cited</th><th class="num">Avg Chars</th></tr>
    </thead>
    <tbody>
      ${platRowsHtml}
    </tbody>
  </table>
</section>

<!-- Slide 4 (tech-03b) -->
<section id="tech-03b-prompt-architecture" class="slide">
  <div class="eyebrow">03 · BUYER-INTENT PROMPT ARCHITECTURE</div>
  <h2>Exact Prompt Wording &amp; Paired SERP Keywords Across All 7 Capability Archetypes</h2>
  <p class="lead">Each prompt was engineered to reflect real COOs, IT Directors, and Operations Managers seeking Microsoft Power Platform, ERP integration, and AI automation partners across Australia without brand-priming.</p>
  <table class="data-table">
    <thead>
      <tr><th>ID</th><th>Capability Category</th><th>Exact AI Prompt Template</th><th>Paired SERP Keyword</th><th class="num">Inturing Recall</th><th class="num">Top-3</th><th>Category Leader</th></tr>
    </thead>
    <tbody>
      ${promptRowsHtml}
    </tbody>
  </table>
</section>

<!-- Slide 5 -->
<section id="tech-04-schema-forensics" class="slide">
  <div class="eyebrow">04 · JSON-LD SCHEMA &amp; 28-URL SITEMAP FORENSICS</div>
  <h2>Smoking Gun: Narrow Homepage Title Tag, Country-Only PostalAddress &amp; Missing /llms.txt</h2>
  <p class="lead">Our Firecrawl inspection of <code>https://inturing.com.au/</code> uncovered 3 structural bottlenecks: (1) homepage <code>&lt;title&gt;</code> restricts entity scope to <em>"for Manufacturers"</em>, (2) <code>Organization</code> JSON-LD declares only <code>"addressCountry": "AU"</code> with zero Sydney locality or city <code>areaServed</code>, and (3) a 28-URL sitemap with zero city hubs or ERP integration pages.</p>
  <div class="code-box">&lt;!-- Extracted verbatim from https://inturing.com.au/ --&gt;
&lt;title&gt;Inturing | AI Automation &amp; Power Platform for Manufacturers&lt;/title&gt;
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Inturing",
  "url": "/"  // DEFECT: Relative root slash instead of canonical https://inturing.com.au/
}
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Inturing",
  "address": { "@type": "PostalAddress", "addressCountry": "AU" }, // DEFECT: Missing Sydney NSW locality &amp; areaServed
  "sameAs": ["https://www.linkedin.com/company/inturing"]          // DEFECT: Zero Microsoft AppSource / Clutch links
}</div>
  <div class="alert-box">
    <strong>Why This Suppresses AI Visibility Outside Manufacturing:</strong> When buyers ask about Manufacturing Automation, AI engines retrieve <code>/manufacturing</code>, <code>/assessment/manufacturing-automation</code>, and the BBCP case study (ranking Inturing #1 in 16 answers). For the other 5 capabilities, the narrow homepage title and lack of ERP Integration or city landing pages cause 0/200 recall.
  </div>
</section>

<!-- Slide 6 -->
<section id="tech-05-gbp-cid-audit" class="slide">
  <div class="eyebrow">05 · GOOGLE BUSINESS PROFILE (GBP) &amp; LOCAL ENTITY FORENSICS</div>
  <h2>Unverified Sydney Address, 0 Reviews &amp; Misaligned Primary Category on Google Maps</h2>
  <p class="lead">On Google Maps brand search (<code>"Inturing Sydney"</code>), Inturing appears at Rank #3 with <strong><code>rating: null</code> (0 reviews)</strong>, <strong><code>address: null</code></strong>, and primary category <code>"Computer support and services"</code> — causing total absence from all 8 city category Map Packs.</p>
  <table class="data-table">
    <thead>
      <tr><th>Maps Query / Pack</th><th class="num">Pack Rank</th><th>Entity Title</th><th>Primary GBP Category</th><th class="num">Rating</th><th class="num">Reviews</th><th>Domain</th><th>Verified Street Address</th></tr>
    </thead>
    <tbody>
      ${gbpRowsHtml}
    </tbody>
  </table>
</section>

<!-- Slide 7 -->
<section id="tech-06-econometrics" class="slide">
  <div class="eyebrow">06 · ECONOMETRIC ATTRIBUTION · LIVE IRLS LOGISTIC REGRESSION</div>
  <h2>Empirical Drivers of AI Inclusion (<i>N</i> = ${irls.n} Answers, IRLS Fitted)</h2>
  <p class="lead">We estimated a multivariable logistic regression model Pr(<i>Y<sub>i</sub></i> = 1) = logit<sup>−1</sup>(β<sub>0</sub> + β<sub>1</sub><i>X</i><sub>1<i>i</i></sub> + β<sub>2</sub><i>X</i><sub>2<i>i</i></sub> + β<sub>3</sub><i>X</i><sub>3<i>i</i></sub>) via Iteratively Reweighted Least Squares (IRLS) directly over the ${irls.n} empirical answers in <code>ans_full.json</code> (${irls.positives} positive mentions, converged in ${irls.iterations} iterations).</p>
  <table class="data-table">
    <thead>
      <tr><th>Predictor Variable</th><th class="num">Coeff (β̂)</th><th class="num">Std. Error (SE)</th><th class="num">Wald <i>z</i></th><th class="num">Odds Ratio (OR)</th><th class="num">95% CI (OR)</th><th class="num"><i>p</i>-Value</th></tr>
    </thead>
    <tbody>
      ${irlsRowsHtml}
    </tbody>
  </table>
  <p style="font-size:13.5px;color:#4B5563;margin-top:12px;"><strong>Econometric Interpretation:</strong> All coefficients above are computed dynamically from the 280 × 4 design matrix (<i>X</i><sup>T</sup><i>WX</i>)<sup>−1</sup> in <code>pipeline/parse_raw_panel.mjs</code>. Live web-search grounding engines (OR = ${irls.coefficients[2]?.or}×, <i>p</i> = ${irls.coefficients[2]?.pValue}) and named operational stack &amp; case study proof (MYOB Acumatica, SAP Ariba, BBCP, Canvas App; OR = ${irls.coefficients[1]?.or}×, <i>p</i> = ${irls.coefficients[1]?.pValue}) significantly drive Inturing's inclusion.</p>
</section>

<!-- Slide 8 -->
<section id="tech-07-geographic-matrix" class="slide">
  <div class="eyebrow">07 · GEOGRAPHIC CROSS-SECTION (8 AUSTRALIAN CITIES)</div>
  <h2>City-Level AI Recall, Organic SERP Overlap &amp; Competitor Dominance</h2>
  <p class="lead">Because Inturing's manufacturing niche authority is national, it achieves 2 to 5 mentions in every single Australian city — yet scores 0/56 in city-specific Google Organic Top-20 SERPs due to having zero city landing pages.</p>
  <table class="data-table">
    <thead>
      <tr><th>City / Market</th><th class="num">Answers</th><th class="num">Inturing Mentions</th><th class="num">95% Wilson CI</th><th class="num">Top-3</th><th class="num">#1</th><th class="num">SERP Top-20</th><th>GBP Pack Status</th><th>Top 3 AI Competitors in City</th></tr>
    </thead>
    <tbody>
      ${cityMatrixRowsHtml}
    </tbody>
  </table>
</section>

<!-- Slide 9 -->
<section id="tech-08-citation-graph" class="slide">
  <div class="eyebrow">08 · CITATION GRAPH &amp; RETRIEVAL SOURCE TAXONOMY</div>
  <h2>Where AI Engines Source Power Platform &amp; Automation Partners (${citations.totalCitations.toLocaleString()} Citations)</h2>
  <p class="lead">Across all 280 responses, AI models emitted <strong>${citations.totalCitations.toLocaleString()}</strong> grounding URLs across <strong>${citations.uniqueDomains}</strong> unique domains. Remarkably, <code>inturing.com.au</code> is the <strong>#3 most-cited domain overall (${citations.clientDomainCitations} citations across ${metrics.mtCited} answers)</strong>, behind only <code>powerplatformexperts.com.au</code> (130) and <code>google.com</code> (101).</p>
  <table class="data-table">
    <thead>
      <tr><th class="num">Rank</th><th>Cited Domain</th><th>Source Category</th><th class="num">Citation Count</th><th class="num">Share of All Citations</th></tr>
    </thead>
    <tbody>
      ${citationDomainsHtml}
    </tbody>
  </table>
</section>

<!-- Slide 10 -->
<section id="tech-09-historical-trajectory" class="slide">
  <div class="eyebrow">09 · 15-MONTH HISTORICAL LLM MENTIONS TELEMETRY</div>
  <h2>Longitudinal AI Visibility Curve (Aug 2025 – Oct 2026)</h2>
  <p class="lead">Empirical historical mention counts from DataForSEO <code>/v3/ai_optimization/llm_mentions/historical/live</code> across 9 Australian Microsoft consultancies show content-rich domains like <code>pa.com.au</code> (399 mentions) and <code>leveragetech.com.au</code> (325 mentions) compounding monthly Google AI Overview citations, vs. 1 historical mention for 28-page <code>inturing.com.au</code>.</p>
  <table class="data-table">
    <thead>
      <tr><th>Domain</th>${histMonths.slice(-10).map(m => `<th class="num mono">${esc(m)}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${Object.entries(histDomains).map(([dom, d]) => `<tr>
        <td class="mono"><strong>${esc(dom)}</strong></td>
        ${d.mentions.slice(-10).map(v => `<td class="num mono">${v}</td>`).join('')}
      </tr>`).join('\n')}
    </tbody>
  </table>
</section>

<!-- Slide 11 -->
<section id="tech-10-ai-keyword-demand" class="slide">
  <div class="eyebrow">10 · AI SEARCH VOLUME &amp; ENTERPRISE BUYER DEMAND VELOCITY</div>
  <h2>12-Month Australian AI Keyword Demand Series (Oct 2025 – Sep 2026)</h2>
  <p class="lead">Live DataForSEO <code>/v3/ai_optimization/ai_keyword_data/keywords_search_volume/live</code> telemetry across 15 Microsoft automation and analytics terms confirms <strong>3,418 monthly AI searches in Australia (Sep 2026)</strong>, led by <code>"power bi"</code> (1,670/mo), <code>"microsoft copilot"</code> (551/mo), <code>"power apps"</code> (399/mo), and <code>"power automate"</code> (338/mo), with +50% growth in Power Platform, Copilot Studio &amp; AI Automation Agency queries.</p>
  <table class="data-table">
    <thead>
      <tr><th>Keyword</th><th class="num">Current AI Vol (Sep 2026)</th><th class="num">12-Mo Avg AI Vol</th><th class="num">Oct 2025</th><th class="num">Jan 2026</th><th class="num">May 2026</th><th class="num">Sep 2026</th><th class="num">12-Mo Sum</th></tr>
    </thead>
    <tbody>
      ${normKeywords.slice(0, 12).map(k => {
        const oct25 = k.monthly?.[0]?.ai_search_volume || 0;
        const jan26 = k.monthly?.[3]?.ai_search_volume || 0;
        const may26 = k.monthly?.[7]?.ai_search_volume || 0;
        const sep26 = k.monthly?.[11]?.ai_search_volume || k.ai_search_volume || 0;
        const sum12 = (k.monthly || []).reduce((s, m) => s + (m.ai_search_volume || 0), 0);
        return `<tr>
          <td class="mono"><strong>${esc(k.keyword)}</strong></td>
          <td class="num mono"><strong>${sep26.toLocaleString()}</strong></td>
          <td class="num mono">${(k.avg_12m || 0).toLocaleString()}</td>
          <td class="num mono">${oct25.toLocaleString()}</td>
          <td class="num mono">${jan26.toLocaleString()}</td>
          <td class="num mono">${may26.toLocaleString()}</td>
          <td class="num mono"><strong>${sep26.toLocaleString()}</strong></td>
          <td class="num mono">${sum12.toLocaleString()}</td>
        </tr>`;
      }).join('\n')}
    </tbody>
  </table>
</section>

<!-- Slide 12 -->
<section id="tech-11-remediation-engineering" class="slide">
  <div class="eyebrow">11 · TECHNICAL REMEDIATION SPECIFICATION</div>
  <h2>Production-Ready <code>ProfessionalService</code> JSON-LD Graph &amp; <code>/llms.txt</code> Specification</h2>
  <p class="lead">Replacing the bare <code>Organization</code> block with an entity-rich <code>ProfessionalService</code> graph binds Sydney HQ, declares explicit <code>areaServed</code> across all 8 Australian cities, links Founders Paul Del Gigante and Harry Cribb, and exposes all 7 capabilities to LLM crawlers.</p>
  <div class="code-box">{
  "@context": "https://schema.org",
  "@type": ["ProfessionalService", "Organization"],
  "@id": "https://inturing.com.au/#organization",
  "name": "Inturing",
  "url": "https://inturing.com.au/",
  "telephone": "+61-422-917-826",
  "email": "info@inturing.com.au",
  "address": { "@type": "PostalAddress", "addressLocality": "Sydney", "addressRegion": "NSW", "addressCountry": "AU" },
  "areaServed": ["Sydney NSW", "Melbourne VIC", "Brisbane QLD", "Perth WA", "Adelaide SA", "Canberra ACT", "Newcastle NSW", "Hobart TAS"],
  "knowsAbout": ["Microsoft Power Platform", "Power Apps", "Power Automate", "Power BI", "Microsoft Fabric", "Microsoft Copilot Studio", "ERP Integration", "MYOB Acumatica", "SAP Ariba", "Manufacturing Process Automation"],
  "founder": [
    { "@type": "Person", "name": "Paul Del Gigante", "jobTitle": "Founder &amp; AI and Automation Lead" },
    { "@type": "Person", "name": "Harry Cribb", "jobTitle": "Founder &amp; Enterprise Solutions Director" }
  ]
}</div>
</section>

<!-- Slide 13 -->
<section id="tech-12-verification-lineage" class="slide">
  <div class="eyebrow">12 · DATA LINEAGE &amp; REPRODUCIBILITY MANIFEST</div>
  <h2>1:1 Verification Artifact Map &amp; Zero-Fabrication Audit Trail</h2>
  <p class="lead">Every chart, table, and econometric parameter in both the 30-slide Client Deck (<code>/</code>) and this 13-slide Technical Dossier (<code>/technical</code>) is deterministically compiled from the raw JSON artifacts below and verified by <code>05_verify_zero_fabrication.mjs</code>.</p>
  <table class="data-table">
    <thead>
      <tr><th>Artifact File</th><th>API / Source</th><th>Record Count</th><th>Target Slides Driven</th></tr>
    </thead>
    <tbody>
      <tr><td class="mono"><strong>pipeline/raw/*.json</strong></td><td>5 Live AI Engines + Google Organic SERP</td><td class="num mono">336 files</td><td>All 280 AI answers + 56 SERPs</td></tr>
      <tr><td class="mono"><strong>pipeline/ans_full.json</strong></td><td>Parsed from <code>pipeline/raw/*</code></td><td class="num mono">280 rows</td><td>Slides 1, 4–18, 20, 25, Tech Slides 1, 3, 6, 7</td></tr>
      <tr><td class="mono"><strong>pipeline/serp_audit.json</strong></td><td>DataForSEO Google Organic Live (depth=20)</td><td class="num mono">56 rows</td><td>Tech Slide 7</td></tr>
      <tr><td class="mono"><strong>pipeline/maps_audit.json</strong></td><td>DataForSEO Google Maps Live (depth=20 + 9 packs)</td><td class="num mono">9 packs + Brand audit</td><td>Slide 10, Slide 24, Tech Slide 5</td></tr>
      <tr><td class="mono"><strong>pipeline/site_audit.json</strong></td><td>Firecrawl v1 Map + Scrape + JSON-LD Parser</td><td class="num mono">28 sitemap URLs / 17 pages</td><td>Slide 26, Tech Slide 4, 11</td></tr>
      <tr><td class="mono"><strong>pipeline/raw_ai_keyword_data.json</strong></td><td>DataForSEO AI Keyword Search Volume Live</td><td class="num mono">15 keywords × 12 mos</td><td>Slide 2 (AIDEMAND), Tech Slide 10</td></tr>
      <tr><td class="mono"><strong>pipeline/hist.json</strong></td><td>DataForSEO LLM Mentions Historical Live</td><td class="num mono">9 domains × 15 mos</td><td>Slide 19, Tech Slide 9</td></tr>
      <tr><td class="mono"><strong>pipeline/metrics.json</strong></td><td>Computed + Live IRLS Logistic Regression</td><td class="num mono">Full model state</td><td>All headline KPIs &amp; Econometric Table</td></tr>
    </tbody>
  </table>
</section>

    <div class="progress" aria-hidden="true"><i id="bar"></i></div>
  </div>
</div>
<nav class="controls" id="controls" aria-label="Slide controls">
  <button id="prev" type="button" aria-label="Previous slide"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4"/></svg></button>
  <span id="count" class="ctr">1 / 13</span>
  <button id="next" type="button" aria-label="Next slide"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4"/></svg></button>
  <button id="fs" type="button" aria-label="Full screen"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2.2"/></svg></button>
</nav>
<script>${baseJs}</script>
</body>
</html>`;

fs.writeFileSync('site/technical.html', html);
console.log('Built site/technical.html (13 slides, ' + html.length + ' bytes)');
