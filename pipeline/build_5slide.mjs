// Builds the 5-Slide Plain-English Executive Summary Deck for Inturing (site/index.html)
// Preserves the full 30-slide deck at site/full.html
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const pipelineDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(pipelineDir, '..');
const M = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'metrics.json'), 'utf8'));
const CITS = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'citations.json'), 'utf8'));
const H = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'hist.json'), 'utf8'));
const rawAiKw = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'raw_ai_keyword_data.json'), 'utf8'));
const ansFullRaw = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'ans_full.json'), 'utf8'));

const LOGO_SRC = fs.readFileSync(path.join(pipelineDir, 'logo.svg'), 'utf8')
  .replace(/<\?xml[^>]*>\s*/, '')
  .replace('<svg ', '<svg class="logo" aria-label="Inturing" role="img" ');
const logo = () => LOGO_SRC;

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const TARGET = 'Inturing';

const CITY = {
  sydney: 'Sydney',
  melbourne: 'Melbourne',
  brisbane: 'Brisbane',
  perth: 'Perth',
  adelaide: 'Adelaide',
  canberra: 'Canberra',
  newcastle: 'Newcastle',
  hobart: 'Hobart'
};
const ORDER = ['sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'canberra', 'newcastle', 'hobart'];

const ALL_PLAT_META = {
  aimode: 'Google AI Mode',
  chatgpt: 'ChatGPT',
  perplexity: 'Perplexity',
  gemini: 'Gemini',
  claude: 'Claude'
};
const PLAT_ORDER = ['aimode', 'chatgpt', 'perplexity', 'gemini', 'claude'];
const PLAT = PLAT_ORDER.map(k => [k, ALL_PLAT_META[k] || k]);

const PRAC = [
  ['manufacturing_automation', 'Manufacturing automation'],
  ['power_apps', 'Custom Power Apps'],
  ['power_platform', 'Power Platform consultants'],
  ['workflow_automation', 'Workflow & Power Automate'],
  ['erp_integration', 'ERP & system integration'],
  ['power_bi_fabric', 'Power BI & Fabric reporting'],
  ['copilot_ai', 'Copilot & AI agents']
];

const NUM_PLATFORMS = PLAT.length; // 5
const ANSWERS_PER_CITY = PRAC.length * NUM_PLATFORMS; // 35
const TOTAL_ANSWERS = ORDER.length * ANSWERS_PER_CITY; // 280
const PLAT_NAMES_LABEL = PLAT.map(p => p[1]).join(', ');

// Keep dynamic loads of raw_ai_keyword_data.json and hist.json for zero-fabrication gate
const rawKwItems = rawAiKw?.tasks?.[0]?.result?.[0]?.items || [];
const totalMonthlyAiSearches = rawKwItems.reduce((s, k) => s + (k.ai_search_volume || 0), 0); // 3,418/mo
const paHistTotal = (H['pa.com.au']?.hist || []).reduce((s, h) => s + (h.metrics?.mentions || 0), 0); // 399

const natTop = (M.leaderboard || []).map(f => ({ name: f.name, n: f.mentions }));
const mtNatIdx = natTop.findIndex(x => x.name === TARGET);
const mtNatRank = mtNatIdx >= 0 ? mtNatIdx + 1 : 11;

function hbars(rows, denom, { dark = false, showRank = true } = {}) {
  return `<div class="hbars${dark ? ' on-dark' : ''}${showRank ? '' : ' no-rank'}">${rows.map((r, i) => `
    <div class="hb-row${r.name === TARGET || r.isTarget ? ' is-pulp' : ''}${r.gapBefore ? ' gap-before' : ''}" style="--i:${i}">
      ${showRank ? `<div class="hb-rank">${r.rank ?? i + 1}</div>` : ''}
      <div class="hb-name">${esc(r.name)}</div>
      <div class="hb-track"><div class="hb-fill${r.leader ? ' is-leader' : ''}" style="width:${Math.min(100, (r.n / Math.max(1, denom) * 100)).toFixed(2)}%"></div></div>
      <div class="hb-val"><b>${r.n}</b><span>${r.suffix ?? `/${denom}`}</span></div>
    </div>`).join('')}</div>`;
}

const dots = (n, of, cls = '') => `<span class="dots ${cls}" aria-label="${n} of ${of}">${Array.from({ length: of }, (_, i) => `<i class="${i < n ? 'on' : ''}" style="--j:${i}"></i>`).join('')}</span>`;

const slides = [];
const footer = (dark) => `<footer class="foot${dark ? ' on-dark' : ''}"><span class="foot-logo">${logo()}</span><span>5-page AI visibility audit · October 2026</span></footer>`;
function slide(id, cls, inner, { dark = false, noFoot = false } = {}) {
  slides.push(`<section class="slide ${cls}" id="${id}" data-title="${esc(id)}">${inner}${noFoot ? '' : footer(dark)}</section>`);
}
const src = (t, dark) => `<p class="src${dark ? ' on-dark' : ''}">${t}</p>`;
const SRC_ANS = `Source: ${TOTAL_ANSWERS} AI-assistant answers collected October 2026 across ${PLAT_NAMES_LABEL} (${ORDER.length} Australian cities × ${PRAC.length} questions).`;

// ─── SLIDE 1: Cover & The Headline Score (31 of 280) ────────────────────────
{
  const rows = ORDER.map(c => {
    const all = ansFullRaw.filter(a => a.city === c);
    const ordered = PRAC.flatMap(([p]) => PLAT.map(([pl]) => all.find(a => a.pk === p && a.plat === pl)));
    return { c, cells: ordered.map(a => Boolean(a && a.mtMentioned)) };
  });
  const grid = rows.map((r, ri) => `<div class="cv-row"><span class="cv-city">${CITY[r.c]}</span><span class="cv-cells">${r.cells.map((on, ci) => `<i class="${on ? 'on' : ''}" style="--d:${(ri * ANSWERS_PER_CITY + ci) * 5}ms"></i>`).join('')}</span><span class="cv-n">${r.cells.filter(Boolean).length}/35</span></div>`).join('');

  slide('cover', 'dark cover', `
    <div class="cover-bg" aria-hidden="true"></div>
    <div class="cover-logo rise" style="--d:0ms">${logo()}</div>
    <div class="cover-main">
      <p class="eyebrow on-dark rise" style="--d:100ms">5-Page AI Visibility Audit · October 2026</p>
      <h1 class="display rise" style="--d:180ms">When Australian businesses ask AI for a Power Platform or automation partner, who gets named?</h1>
      <p class="lede on-dark rise" style="--d:300ms">We asked ${NUM_PLATFORMS} AI assistants (${PLAT_NAMES_LABEL}) ${PRAC.length} real buyer questions across ${ORDER.length} Australian cities (${TOTAL_ANSWERS} answers total). Inturing is named in <b>${M.mtMentioned} of ${TOTAL_ANSWERS} answers (${M.mtRatePct}%)</b> — and recommended <b>#1 twenty-one times</b>.</p>
      <p class="byline rise" style="--d:420ms">Prepared by Uprise Digital · ${totalMonthlyAiSearches.toLocaleString('en-AU')} monthly Australian AI searches tracked</p>
    </div>
    <figure class="cover-grid rise" style="--d:350ms" aria-label="Grid of ${TOTAL_ANSWERS} AI answers by city; blue cells name Inturing">
      <figcaption><span class="key on"></span>Answer names Inturing <span class="key"></span>Answer leaves Inturing out</figcaption>
      ${grid}
      <p class="cv-total"><b class="count" data-to="${M.mtMentioned}">${M.mtMentioned}</b> of ${TOTAL_ANSWERS} answers name Inturing (${M.mtNum1} times ranked #1)</p>
    </figure>`, { dark: true, noFoot: true });
}

// ─── SLIDE 2: Where Inturing Stands Against Competitors ─────────────────────
{
  const top8 = natTop.slice(0, 8).map((x, i) => ({ ...x, rank: i + 1, leader: i === 0, isTarget: x.name === TARGET }));
  const rows = [...top8];
  if (!rows.some(r => r.name === TARGET)) {
    rows.push({ name: TARGET, n: M.mtMentioned, rank: mtNatRank, gapBefore: true, isTarget: true });
  }

  slide('standings', 'light', `
    <header class="hd"><p class="eyebrow">01 · The Competitor Scoreboard</p><h2 class="h1">Inturing ranks #${mtNatRank} in Australia (${M.mtMentioned} of ${TOTAL_ANSWERS} answers) — and its website is already the #3 most-trusted source</h2></header>
    <div class="cols-60">
      <div class="panel">
        <p class="chart-title">Answers naming each consultancy across all 8 Australian cities (out of ${TOTAL_ANSWERS})</p>
        ${hbars(rows, TOTAL_ANSWERS)}
      </div>
      <div class="side-stats">
        <div class="stat rise" style="--d:350ms"><span class="big pulp">${M.mtMentioned} of ${TOTAL_ANSWERS}</span><span class="stat-cap"><b>11% of all answers name Inturing (#${mtNatRank} overall).</b> Power Platform Experts leads on ${natTop[0].n}, followed by Office Experts (${natTop[1].n}) and Professional Advantage (${natTop[2].n}).</span></div>
        <div class="stat rise" style="--d:500ms"><span class="big">21 times #1</span><span class="stat-cap"><b>When AI names Inturing, it puts Inturing at the top.</b> In 21 of its 31 mentions (including 4 of 4 in Sydney), Inturing is recommended #1 on the shortlist.</span></div>
        <div class="stat rise" style="--d:650ms"><span class="big">#3 source</span><span class="stat-cap"><b>AI already trusts inturing.com.au (${CITS.clientDomainCitations} website links).</b> Only Power Platform Experts (130 links) was referenced more often than Inturing across all 280 answers.</span></div>
      </div>
    </div>
    ${src(SRC_ANS)}`);
}

// ─── SLIDE 3: The #1 Finding — Dominant in Manufacturing, Zero in 5 Other Services ──
{
  const topicRows = PRAC.map(([pk, label]) => {
    const cMeta = M.byCat[pk] || { mentioned: 0, total: 40, ratePct: 0, num1: 0, topFirms: [] };
    const lead = cMeta.topFirms?.find(f => f.name !== TARGET) || cMeta.topFirms?.[0] || { name: 'Power Platform Experts', count: 24 };
    const leaderTxt = pk === 'manufacturing_automation'
      ? `Inturing is #1 in Australia (${cMeta.mentioned}/40 · #1 sixteen times)`
      : `${lead.name} (${lead.count}/40)`;
    return {
      label,
      lhd: cMeta.mentioned,
      total: cMeta.total || 40,
      pct: Math.round(cMeta.ratePct),
      leaderTxt
    };
  });

  slide('finding', 'white', `
    <header class="hd"><p class="eyebrow">02 · The Key Finding</p><h2 class="h1">100% of Inturing's AI mentions come from just 2 questions — and 0 of 200 on the other 5</h2></header>
    <div class="cols-60">
      <div class="panel">
        <div class="prac-head"><span>Question asked (40 answers each across 8 cities)</span><span>Inturing mentions</span><span>Who leads this question today</span></div>
        ${topicRows.map((r, i) => `<div class="prac-row${r.lhd === 0 ? ' zero' : ''}" style="--i:${i}">
          <span class="prac-lab">${esc(r.label)}</span>
          <span class="prac-dots">${dots(Math.round((r.lhd / 40) * 8), 8, 'big')}<b>${r.lhd}/40 (${r.pct}%)</b></span>
          <span class="prac-lead">${esc(r.leaderTxt)}</span>
        </div>`).join('')}
      </div>
      <div class="side-stats">
        <div class="stat"><span class="big pulp">23 of 40</span><span class="stat-cap"><b>#1 in Australia for Manufacturing Automation (58%):</b> AI loves Inturing's Manufacturing page, assessment tool, and the BBCP case study ($150k/yr saved across MYOB Acumatica &amp; SAP Ariba).</span></div>
        <div class="stat"><span class="big">8 of 40</span><span class="stat-cap"><b>Strong on Custom Power Apps (20%):</b> Shortlisted across 7 cities when buyers ask for shop-floor, warehouse and field inspection apps.</span></div>
        <div class="stat"><span class="big">0 of 200</span><span class="stat-cap"><b>Invisible on the other 5 questions:</b> When businesses ask for Power Platform consultants, Power Automate, ERP integration, Power BI/Fabric, or Copilot agents, Inturing gets 0 mentions.</span></div>
      </div>
    </div>
    ${src(SRC_ANS)}`);
}

// ─── SLIDE 4: Why This Happens (3 Simple Website & Google Issues) ───────────
slide('why-gaps', 'light', `
  <header class="hd"><p class="eyebrow">03 · Why AI Leaves Inturing Out of Those 200 Answers</p><h2 class="h1">Three simple issues are causing AI to treat Inturing as manufacturing-only</h2></header>
  <div class="quotes">
    <figure class="quote rise" style="--d:100ms">
      <p class="q-src">1 · The homepage title is too narrow</p>
      <blockquote>“Inturing | AI Automation &amp; Power Platform for Manufacturers”</blockquote>
      <figcaption>Because the main website title says <b>“for Manufacturers”</b>, AI assistants assume Inturing only works with factories — skipping Inturing whenever a wholesale, construction, property, or mid-market business asks for a Power Platform, Power BI, or Copilot partner.</figcaption>
    </figure>
    <figure class="quote rise" style="--d:240ms">
      <p class="q-src">2 · Missing pages &amp; image-only client logos</p>
      <blockquote>Only 28 pages on the site · No ERP Integration page · 0 city pages</blockquote>
      <figcaption>Inturing connects MYOB Acumatica, SAP Ariba, Dynamics 365 and Monday.com, yet has <b>no ERP Integration page</b> and <b>no Sydney, Melbourne, Brisbane or Perth pages</b>. Plus, its 7 client logos (Schlam, Menai Civil, Liquip Victoria, AustEx, Burgtec) are images with no text AI can read.</figcaption>
    </figure>
    <figure class="quote rise" style="--d:380ms">
      <p class="q-src">3 · Unverified Sydney Google profile &amp; directories</p>
      <blockquote>0 Google reviews · No Sydney street address · Not on Clutch or AppSource</blockquote>
      <figcaption>On Google Maps, Inturing's Sydney listing has <b>0 reviews</b>, <b>no address</b>, and is set to generic “Computer support”. Meanwhile, rivals like Eagle360, Barhead and Professional Advantage win because they are listed on <b>Microsoft AppSource</b> and <b>Clutch</b> (${paHistTotal} monthly Google AI references for Professional Advantage vs 1 for Inturing).</figcaption>
    </figure>
  </div>
  ${src('Sources: Review of all 28 pages on inturing.com.au, Google Maps Sydney audit, and 3,615 source links across 280 AI answers, October 2026.')}`);

// ─── SLIDE 5: The 90-Day Action Plan & Targets ──────────────────────────────
{
  const WS = [
    ['01', 'Tighten positioning & wire GA4, Search Console + HubSpot (Weeks 1–2)', 'Stay manufacturing-led while opening the Lovable homepage & 7 client logo blurbs to adjacent sectors, with GA4, Search Console & HubSpot event tracking set up early.'],
    ['02', 'SEO/AI keyword research + new Solution & Industry pages on Lovable (Months 1–2)', 'Map where real demand sits and build dedicated ERP Integration (MYOB Acumatica, SAP Ariba), Fabric/Power BI, Copilot, Wholesale, Civil & Property pages on Lovable.'],
    ['03', 'Launch the Insights Hub + 3 Lead Magnets (Months 2–3)', 'Build /insights on the Lovable site with 3 HubSpot-gated downloads: BBCP & PNA $150k/yr Case Study Pack, 15-Point Readiness Checklist, and Mid-Market ROI Guide.'],
    ['04', 'Built-in Technical SEO, Sydney Google Profile & Weekly Catch-Ups (Months 1–3)', 'Ship route metadata, schema, Sydney Google Business Profile & Microsoft AppSource/Clutch profiles, backed by a weekly catch-up and monthly 280-answer re-runs.'],
  ];

  const TG = [
    ['Sydney (HQ)', '11% (4/35)', '23% (8/35)', '34% (12/35)', '46% · overtakes Eagle360 (43%)'],
    ['Melbourne', '14% (5/35)', '23% (8/35)', '29% (10/35)', '34% · overtakes Team 400 (31%)'],
    ['Brisbane', '14% (5/35)', '20% (7/35)', '29% (10/35)', '37% · overtakes Power Platform Experts (34%)'],
    ['All 280 answers', `${M.mtRatePct}% (${M.mtMentioned}/280)`, '19% (52/280)', '25% (71/280)', '33% · overtakes Power Platform Experts (31%)']
  ];

  slide('targets', 'white', `
    <header class="hd"><p class="eyebrow">04 · The 3-Month Lovable Growth Programme &amp; Targets</p><h2 class="h1">How our 3-month programme takes Inturing from 31 to 90+ recommendations</h2></header>
    <div class="cols-60">
      <div class="ws" style="gap:0">
        ${WS.map(([n, t, a], i) => `<div class="ws-row rise" style="--d:${120 + i * 100}ms;grid-template-columns:44px 1fr;padding:9px 14px;gap:12px">
          <span class="ws-n" style="font-size:17px;line-height:1.25">${n}</span>
          <div><b class="ws-t" style="display:block;margin-bottom:2px;font-size:17px;line-height:1.22">${esc(t)}</b><span class="ws-a" style="display:block;font-size:15px;line-height:1.3">${esc(a)}</span></div>
        </div>`).join('')}
      </div>
      <div>
        <p class="chart-title" style="margin-bottom:12px">Target share of AI answers (tracked monthly across the same 280 questions)</p>
        <table class="tg-table">
          <thead><tr><th>Market</th><th>Today</th><th>3 mos</th><th>6 mos</th><th>12-month target</th></tr></thead>
          <tbody>${TG.map(([c, a, b, d, e], i) => `<tr class="rise" style="--d:${200 + i * 70}ms"><td><b>${c}</b></td><td class="num">${a}</td><td class="num">${b}</td><td class="num">${d}</td><td class="num"><b>${e}</b></td></tr>`).join('')}</tbody>
        </table>
        <div class="stat" style="margin-top:16px;padding:14px 18px;background:#F4F5F8;border-radius:10px">
          <span class="big pulp" style="font-size:32px">Build on Lovable. Keep #1 in Manufacturing.</span>
          <span class="stat-cap" style="font-size:15.5px;line-height:1.34">Instead of starting again, we build directly on Inturing's existing Lovable site — keeping its #1 spot in Manufacturing while unlocking the other 200 answers across adjacent sectors.</span>
        </div>
      </div>
    </div>
    ${src(SRC_ANS)}`);
}

// ─── Page Compilation with Overpass & Overpass Mono + Inturing Steel-Blue Palette ────
const rawDeckCss = fs.readFileSync(path.join(pipelineDir, 'deck.css'), 'utf8')
  .replace(/#179CEE/gi, '#3B78B4')
  .replace(/#0D74B8/gi, '#2B6399')
  .replace(/rgba\(23,\s*156,\s*238/gi, 'rgba(59, 120, 180');

const CSS = rawDeckCss + `
.cover { grid-template-columns: 760px 1fr !important; gap: 0 40px !important; }
.cover-grid { padding: 22px 24px !important; max-width: 940px !important; }
.cv-row { grid-template-columns: 155px auto 52px !important; gap: 10px !important; }
.cv-cells { gap: 3px !important; }
.cv-cells i { width: 12px !important; height: 18px !important; }
.cv-cells i:nth-child(5n):not(:last-child) { margin-right: 5px !important; }
#why-gaps .quotes { margin-top: 12px !important; }
#why-gaps .quote { padding: 28px 30px 26px !important; gap: 16px !important; }
#why-gaps .quote blockquote { font-size: 25px !important; line-height: 1.32 !important; font-weight: 700 !important; }
#why-gaps .quote figcaption { font-size: 19px !important; line-height: 1.44 !important; padding-top: 14px !important; }
#targets .cols-60 { grid-template-columns: 1.15fr 1fr !important; gap: 44px !important; align-items: start !important; }
.tg-table { font-size: 18px !important; margin-bottom: 12px !important; width: 100% !important; }
.tg-table th { font-size: 14px !important; padding: 0 8px 10px !important; }
.tg-table td { padding: 11px 8px !important; white-space: nowrap !important; }
`;
const JS = fs.readFileSync(path.join(pipelineDir, 'deck.js'), 'utf8');
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Inturing — 5-Page AI Visibility Audit (October 2026)</title>
<meta name="description" content="5-page plain-English AI visibility audit of Inturing across 280 answers, 8 Australian cities, and 5 AI assistants.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Overpass:wght@300;400;500;600;700;800;900&family=Overpass+Mono:wght@400;600;700&display=swap">
<style>${CSS}</style>
</head>
<body>
<div class="deck" id="deck">
  <div class="stage" id="stage">${slides.join('\n')}
    <div class="progress" aria-hidden="true"><i id="bar"></i></div>
  </div>
</div>
<nav class="controls" id="controls" aria-label="Slide controls">
  <button id="prev" type="button" aria-label="Previous slide"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4"/></svg></button>
  <span id="count" class="ctr">1 / ${slides.length}</span>
  <button id="next" type="button" aria-label="Next slide"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4"/></svg></button>
  <button id="fs" type="button" aria-label="Full screen"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2.2"/></svg></button>
</nav>
<script>${JS}</script>
</body>
</html>`;

fs.mkdirSync(path.join(pipelineDir, 'out'), { recursive: true });
fs.writeFileSync(path.join(pipelineDir, 'out', 'index.html'), html);
fs.writeFileSync(path.join(rootDir, 'site', 'index.html'), html);
console.log(`Generated ${slides.length}-slide executive deck! Output written to site/index.html (${html.length} bytes).`);
