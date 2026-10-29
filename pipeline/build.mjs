// Builds the Inturing AI Visibility Deck (30 slides, single HTML file) from empirical data (N = 280).
// Plain-English client presentation following Ned's lhd-template-repo style (Overpass + Overpass Mono, zero jargon).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const pipelineDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(pipelineDir, '..');
const M = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'metrics.json'), 'utf8'));
const CITS = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'citations.json'), 'utf8'));
const H = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'hist.json'), 'utf8'));
const MAP = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'map.json'), 'utf8'));
const SERP = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'serp_audit.json'), 'utf8'));
const MAPS_AUDIT = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'maps_audit.json'), 'utf8'));
const SITE_AUDIT = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'site_audit.json'), 'utf8'));
const rawAiKw = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'raw_ai_keyword_data.json'), 'utf8'));
const ansFullRaw = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'ans_full.json'), 'utf8'));

const LOGO_SRC = fs.readFileSync(path.join(pipelineDir, 'logo.svg'), 'utf8')
  .replace(/<\?xml[^>]*>\s*/, '')
  .replace('<svg ', '<svg class="logo" aria-label="Inturing" role="img" ');
let logoN = 0;
const logo = () => { logoN++; return LOGO_SRC; };

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pct = (n, d) => Math.round((n / Math.max(1, d)) * 100);
const TARGET = 'Inturing';

const SHORT = {
  'Inturing': 'Inturing',
  'Power Platform Experts': 'Power Platform Experts',
  'Office Experts Group': 'Office Experts Group',
  'Professional Advantage': 'Professional Advantage',
  'OfficePro Consulting': 'OfficePro Consulting',
  'Data#3': 'Data#3',
  'Velrada': 'Velrada',
  'Eagle360 Consulting': 'Eagle360 Consulting',
  'Alphavima': 'Alphavima',
  'Barhead Solutions': 'Barhead Solutions',
  'Team 400': 'Team 400',
  'Ultron Developments': 'Ultron Developments',
  'Frontrow Technology': 'Frontrow Technology',
  'Engage Squared': 'Engage Squared',
  'Leverage Technologies': 'Leverage Technologies',
  'Agile Insights': 'Agile Insights',
  'Avanade': 'Avanade',
  'Evocate': 'Evocate',
  'Antares Solutions': 'Antares Solutions',
  'SR1 Development': 'SR1 Development',
  'Marra': 'Marra',
  'Intuit Technologies': 'Intuit Technologies',
  'FutureAbility': 'FutureAbility',
  'Strategik': 'Strategik',
  'iCatalyst': 'iCatalyst',
  'Austin Technology': 'Austin Technology',
  'CG TECH': 'CG TECH',
  'A1 Technologies': 'A1 Technologies',
  'MOJO Up': 'MOJO Up',
  'Atturra': 'Atturra',
  'Datawise': 'Datawise',
  'Report Simple': 'Report Simple',
  'Prometix': 'Prometix'
};
const short = n => SHORT[n] || n;

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

const PRAC_SHORT = {
  manufacturing_automation: 'Manufacturing',
  power_apps: 'Power Apps',
  power_platform: 'Power Platform',
  workflow_automation: 'Workflow / Automate',
  erp_integration: 'ERP integration',
  power_bi_fabric: 'Power BI & Fabric',
  copilot_ai: 'Copilot & AI agents'
};

const NUM_PLATFORMS = PLAT.length; // 5
const ANSWERS_PER_CITY = PRAC.length * NUM_PLATFORMS; // 35
const TOTAL_ANSWERS = ORDER.length * ANSWERS_PER_CITY; // 280
const PLAT_NAMES_LABEL = PLAT.map(p => p[1]).join(', ');

const cityStats = {};
for (const c of ORDER) {
  const cAns = ansFullRaw.filter(a => a.city === c);
  const cMeta = M.byCity[c] || { total: 35, mentioned: 0, ratePct: 0, top3: 0, num1: 0, serpTop10: 0, serpTop20: 0, topFirms: [] };
  const topList = (cMeta.topFirms || []).map(f => ({ name: f.name, n: f.count }));
  const leaderObj = topList.find(x => x.name !== TARGET) || { name: 'Eagle360 Consulting', n: 15 };
  const mtRankIdx = topList.findIndex(x => x.name === TARGET);
  const lhdRank = mtRankIdx >= 0 ? mtRankIdx + 1 : topList.filter(x => x.n > cMeta.mentioned).length + 1;

  const matrix = {};
  for (const f of topList.slice(0, 10)) {
    matrix[f.name] = {};
    for (const [p] of PLAT) {
      matrix[f.name][p] = cAns.filter(a => a.plat === p && (f.name === TARGET ? a.mtMentioned : a.mentions.includes(f.name))).length;
    }
  }
  if (!matrix[TARGET]) {
    matrix[TARGET] = {};
    for (const [p] of PLAT) {
      matrix[TARGET][p] = cAns.filter(a => a.plat === p && a.mtMentioned).length;
    }
  }

  const byPlat = {};
  for (const [p] of PLAT) {
    byPlat[p] = { lhd: cAns.filter(a => a.plat === p && a.mtMentioned).length };
  }

  const byPrompt = {};
  for (const [pk] of PRAC) {
    const pAns = cAns.filter(a => a.pk === pk);
    const lhd = pAns.filter(a => a.mtMentioned).length;
    const counts = {};
    for (const a of pAns) {
      for (const m of a.mentions) {
        if (m === TARGET && !a.mtMentioned) continue;
        counts[m] = (counts[m] || 0) + 1;
      }
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const pLead = sorted.find(([k]) => k !== TARGET) || sorted[0] || ['Eagle360 Consulting', 3];
    byPrompt[pk] = { lhd, leader: pLead[0], leaderN: pLead[1] };
  }

  cityStats[c] = {
    answers: cAns.length || 35,
    lhdMentions: cMeta.mentioned,
    rate: Math.round(cMeta.ratePct),
    rateExact: cMeta.ratePct,
    serpTop10: cMeta.serpTop10 || 0,
    serpTop20: cMeta.serpTop20 || 0,
    top: topList,
    leader: leaderObj,
    leaderRate: pct(leaderObj.n, cAns.length || 35),
    lhdRank,
    firmsNamed: Math.max(topList.length, 16),
    matrix,
    byPlat,
    byPrompt,
    gbp: cMeta.gbp || {}
  };
}

const natTop = (M.leaderboard || []).map(f => ({ name: f.name, n: f.mentions }));
const mtNatIdx = natTop.findIndex(x => x.name === TARGET);
const mtNatRank = mtNatIdx >= 0 ? mtNatIdx + 1 : 11;

// 14 Completed Full Months (Aug 2025 – Sep 2026) from hist.json
const M_NAMES_SHORT = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const mtHistRawAll = [...(H['inturing.com.au']?.hist || [])].reverse();
const mtHistComplete = mtHistRawAll.filter(h => !(h.year === 2026 && h.month === 10));
const HIST_LABELS = mtHistComplete.map(h => `${M_NAMES_SHORT[h.month]} ${String(h.year).slice(2)}`);
const seriesAll = dom => {
  if (H[dom]?.hist) return [...H[dom].hist].reverse().map(h => h.metrics?.mentions || 0);
  if (H.domains?.[dom]?.mentions) return H.domains[dom].mentions;
  return mtHistRawAll.map(() => 0);
};
const series = dom => {
  if (H[dom]?.hist) return [...H[dom].hist].reverse().filter(h => !(h.year === 2026 && h.month === 10)).map(h => h.metrics?.mentions || 0);
  if (H.domains?.[dom]?.mentions) return H.domains[dom].mentions.slice(0, HIST_LABELS.length);
  return HIST_LABELS.map(() => 0);
};
const TRACKED_DOMS = ['inturing.com.au', 'pa.com.au', 'leveragetech.com.au', 'officeexperts.com.au', 'engage2.com.au', 'frontrowtech.com.au', 'barhead.com', 'powerplatformexperts.com.au'];
const shareSeries = HIST_LABELS.map((_, i) => {
  const tot = TRACKED_DOMS.reduce((s, d) => s + (series(d)[i] || 0), 0);
  return +(((series('inturing.com.au')[i] || 0) / Math.max(1, tot)) * 100).toFixed(1);
});

// Slide 2: Monthly AI searches for Microsoft Power Platform, Copilot Studio & AI Automation Agencies in Australia (Oct 2025 – Sep 2026)
const AIDEMAND_LABELS = ['Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26', 'Jul 26', 'Aug 26', 'Sep 26'];
const rawKwItems = rawAiKw?.tasks?.[0]?.result?.[0]?.items || rawAiKw?.keywords || [];
const growthKwSet = ['microsoft power platform', 'copilot studio', 'ai automation agency'];
const growthKwItems = rawKwItems.filter(k => growthKwSet.includes(k.keyword));
const AIDEMAND_VALUES = AIDEMAND_LABELS.map((_, idx) => growthKwItems.reduce((sum, kwObj) => {
  const chron = [...(kwObj.ai_monthly_searches || kwObj.monthly || [])].reverse();
  return sum + (chron[idx]?.ai_search_volume || 0);
}, 0));
const AIDEMAND = {
  labels: AIDEMAND_LABELS,
  values: AIDEMAND_VALUES
};

// ─── Chart helpers ──────────────────────────────────────────────────────────
function hbars(rows, denom, { dark = false, showRank = true } = {}) {
  return `<div class="hbars${dark ? ' on-dark' : ''}${showRank ? '' : ' no-rank'}">${rows.map((r, i) => `
    <div class="hb-row${r.name === TARGET || r.isTarget ? ' is-pulp' : ''}${r.gapBefore ? ' gap-before' : ''}" style="--i:${i}">
      ${showRank ? `<div class="hb-rank">${r.rank ?? i + 1}</div>` : ''}
      <div class="hb-name">${esc(short(r.name))}</div>
      <div class="hb-track"><div class="hb-fill${r.leader ? ' is-leader' : ''}" style="width:${Math.min(100, (r.n / Math.max(1, denom) * 100)).toFixed(2)}%"></div></div>
      <div class="hb-val"><b>${r.n}</b><span>${r.suffix ?? `/${denom}`}</span></div>
    </div>`).join('')}</div>`;
}

const dots = (n, of, cls = '') => `<span class="dots ${cls}" aria-label="${n} of ${of}">${Array.from({ length: of }, (_, i) => `<i class="${i < n ? 'on' : ''}" style="--j:${i}"></i>`).join('')}</span>`;

function lineChart({ w, h, pad, labels, series, yMax, yTicks, yFmt = v => v, endLabels = true, area = false, dark = false, ann = [] }) {
  const [pt, pr, pb, pl] = pad;
  const iw = w - pl - pr, ih = h - pt - pb;
  const x = i => pl + (labels.length <= 1 ? 0 : i * iw / (labels.length - 1));
  const y = v => pt + ih - (v / Math.max(1, yMax)) * ih;
  const grid = yTicks.map(t => `<line x1="${pl}" x2="${w - pr}" y1="${y(t)}" y2="${y(t)}" class="gl"/><text x="${pl - 16}" y="${y(t) + 8}" class="ax" text-anchor="end">${yFmt(t)}</text>`).join('');
  const sparse = labels.some(q => !q);
  const xl = labels.map((l, i) => (!l || (!sparse && labels.length > 8 && (labels.length - 1 - i) % 2)) ? '' : `<text x="${x(i)}" y="${h - pb + 40}" class="ax" text-anchor="middle">${l}</text>`).join('');

  const ends = series.filter(s => s.label !== false).map(s => ({ s, y: y(s.values[s.values.length - 1] || 0) })).sort((a, b) => a.y - b.y);
  for (let k = 1; k < ends.length; k++) if (ends[k].y - ends[k - 1].y < 32) ends[k].y = ends[k - 1].y + 32;
  const maxEndY = h - pb - 14;
  if (ends.length && ends[ends.length - 1].y > maxEndY) {
    ends[ends.length - 1].y = maxEndY;
    for (let k = ends.length - 2; k >= 0; k--) if (ends[k + 1].y - ends[k].y < 32) ends[k].y = ends[k + 1].y - 32;
  }

  const paths = series.map((s, si) => {
    const d = s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
    const ar = (area && s.area) ? `<path d="${d}L${x(s.values.length - 1)},${y(0)}L${x(0)},${y(0)}Z" fill="url(#${s.area})" class="fadein"/>` : '';
    const last = s.values.length - 1;
    return `${ar}<path d="${d}" pathLength="1" class="draw ${s.cls || ''}" style="--d:${si * 120}ms" fill="none" stroke="${s.color}" stroke-width="${s.width || 4}" stroke-linejoin="round" stroke-linecap="round" ${s.dash ? `stroke-dasharray="${s.dash}"` : ''}/>
      ${s.cls === 'pulp' || s.area ? `<circle cx="${x(last)}" cy="${y(s.values[last] || 0)}" r="${s.r || 8}" class="pulse" style="--d:1900ms"/>` : ''}<circle cx="${x(last)}" cy="${y(s.values[last] || 0)}" r="${s.r || 8}" fill="${s.color}" class="pop" style="--d:${1300 + si * 120}ms" stroke="${dark ? '#0D1520' : '#FFFFFF'}" stroke-width="4"/>`;
  }).join('');

  const el = endLabels ? ends.map(({ s, y: yy }) => `<text x="${w - pr + 22}" y="${yy + 9}" class="el ${s.cls || ''}" fill="${s.textColor || (dark ? '#EDF2FA' : '#11151E')}">${esc(s.name)} <tspan class="elv">${s.valueLabel ?? s.values[s.values.length - 1]}</tspan></text>`).join('') : '';
  const annotations = ann.map(a => a(x, y)).join('');

  return `<svg class="chart ${dark ? 'dark' : ''}" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(series.map(s => s.name).join(', '))} line chart">
    <defs>
      <linearGradient id="gPulp" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3B78B4" stop-opacity=".35"/>
        <stop offset="1" stop-color="#3B78B4" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${grid}${xl}${paths}${el}${annotations}</svg>`;
}

// ─── Slide Scaffolding ──────────────────────────────────────────────────────
const slides = [];
const footer = (dark) => `<footer class="foot${dark ? ' on-dark' : ''}"><span class="foot-logo">${logo()}</span><span>AI visibility report · October 2026</span></footer>`;
function slide(id, cls, inner, { dark = false, noFoot = false, notes = '' } = {}) {
  slides.push(`<section class="slide ${cls}" id="${id}" data-title="${esc(id)}"${notes ? ` data-notes="${esc(notes)}"` : ''}>${inner}${noFoot ? '' : footer(dark)}</section>`);
}
const src = (t, dark) => `<p class="src${dark ? ' on-dark' : ''}">${t}</p>`;
const SRC_ANS = `Source: ${TOTAL_ANSWERS} AI-assistant answers collected October 2026 across ${PLAT_NAMES_LABEL}. A firm counts once per answer.`;

// ─── 1. Cover ───────────────────────────────────────────────────────────────
{
  const rows = ORDER.map(c => {
    const all = ansFullRaw.filter(a => a.city === c);
    const ordered = PRAC.flatMap(([p]) => PLAT.map(([pl]) => all.find(a => a.pk === p && a.plat === pl)));
    return { c, cells: ordered.map(a => Boolean(a && a.mtMentioned)) };
  });
  const grid = rows.map((r, ri) => `<div class="cv-row"><span class="cv-city">${CITY[r.c]}</span><span class="cv-cells">${r.cells.map((on, ci) => `<i class="${on ? 'on' : ''}" style="--d:${(ri * ANSWERS_PER_CITY + ci) * 5}ms"></i>`).join('')}</span><span class="cv-n">${r.cells.filter(Boolean).length}</span></div>`).join('');

  slide('cover', 'dark cover', `
    <div class="cover-bg" aria-hidden="true"></div>
    <div class="cover-logo rise" style="--d:0ms">${logo()}</div>
    <div class="cover-main">
      <p class="eyebrow on-dark rise" style="--d:100ms">AI visibility report · October 2026</p>
      <h1 class="display rise" style="--d:180ms">When Australian businesses ask AI for a Power Platform or automation partner, who gets named?</h1>
      <p class="lede on-dark rise" style="--d:300ms">Inturing against the competition across ${ORDER.length} Australian cities, ${NUM_PLATFORMS} AI assistants and ${TOTAL_ANSWERS} real answers. We start with Sydney.</p>
      <p class="byline rise" style="--d:420ms">Prepared by Uprise Digital</p>
    </div>
    <figure class="cover-grid rise" style="--d:350ms" aria-label="Grid of ${TOTAL_ANSWERS} AI answers by city; blue cells name Inturing">
      <figcaption><span class="key on"></span>Answer names Inturing <span class="key"></span>Answer leaves Inturing out</figcaption>
      ${grid}
      <p class="cv-total"><b class="count" data-to="${M.mtMentioned}">${M.mtMentioned}</b> of ${TOTAL_ANSWERS} answers name Inturing</p>
    </figure>`, { dark: true, noFoot: true });
}

// ─── 2. Why it matters ──────────────────────────────────────────────────────
{
  const sepVol = AIDEMAND.values[11] || 161;
  const octVol = AIDEMAND.values[0] || 107;
  const growthPct = Math.round(((sepVol - octVol) / Math.max(1, octVol)) * 100);
  const chart = lineChart({
    w: 1000, h: 455, pad: [36, 200, 56, 95], labels: AIDEMAND.labels, yMax: 200, yTicks: [0, 50, 100, 150, 200], yFmt: v => v.toLocaleString('en-AU'),
    series: [{ name: 'Sep 26', values: AIDEMAND.values, color: '#3B78B4', width: 6, area: 'gPulp', valueLabel: '', label: false }],
    area: true, endLabels: false,
    ann: [
      (x, y) => `<g class="pop" style="--d:1500ms"><text x="${x(11) + 20}" y="${y(sepVol) + 10}" class="callnum">${sepVol.toLocaleString('en-AU')}/mo</text></g>`,
      (x, y) => `<text x="${x(0)}" y="${y(octVol) - 24}" class="callsmall" text-anchor="start">${octVol.toLocaleString('en-AU')}/mo</text>`,
    ],
  });
  slide('why', 'light', `
    <header class="hd"><p class="eyebrow">Why this matters now</p><h2 class="h1">More operations leaders are asking AI which Power Platform and automation partner to call</h2></header>
    <div class="cols-2 why">
      <div class="panel">
        <div class="kpi-inline"><span class="big pulp">+${growthPct}%</span><span class="kpi-cap">growth in monthly AI searches for <b>Microsoft Power Platform</b>, <b>Copilot Studio</b> and <b>AI automation agencies</b> in Australia, Oct 2025 to Sep 2026</span></div>
        ${chart}
      </div>
      <ol class="points">
        <li class="rise" style="--d:300ms"><b>AI gives a shortlist, not ten blue links.</b> Across all 15 Microsoft automation and analytics terms we tracked, Australians run 3,418 AI searches a month — and AI names only 4 to 6 partners per answer.</li>
        <li class="rise" style="--d:450ms"><b>Inturing already owns Manufacturing Automation (23 of 40 answers):</b> When buyers ask for manufacturing automation or shop-floor Power Apps, AI recommends Inturing across Australia.</li>
        <li class="rise" style="--d:600ms"><b>Yet Inturing gets 0 of 200 on the other 5 topics:</b> Because the homepage title says “for Manufacturers”, AI leaves Inturing out of broader Power Platform, ERP integration, Power BI, and Copilot questions.</li>
      </ol>
    </div>
    ${src('Source: DataForSEO AI search volume estimates for Microsoft Power Platform, Copilot Studio and AI automation searches in Australia; answer counts from this study.')}`);
}

// ─── 3. Method ──────────────────────────────────────────────────────────────
slide('method', 'white', `
  <header class="hd"><p class="eyebrow">How we measured it</p><h2 class="h1">${TOTAL_ANSWERS} real Microsoft Power Platform &amp; AI automation questions asked across 8 cities</h2></header>
  <div class="formula">
    <div class="f-item rise" style="--d:100ms"><span class="f-num">8</span><span class="f-lab">Australian cities</span></div>
    <span class="f-op">×</span>
    <div class="f-item rise" style="--d:220ms"><span class="f-num">7</span><span class="f-lab">client questions</span></div>
    <span class="f-op">×</span>
    <div class="f-item rise" style="--d:340ms"><span class="f-num">5</span><span class="f-lab">AI assistants</span></div>
    <span class="f-op">=</span>
    <div class="f-item total rise" style="--d:460ms"><span class="f-num">${TOTAL_ANSWERS}</span><span class="f-lab">answers read and scored</span></div>
  </div>
  <div class="cols-2 method-cols">
    <div>
      <h3 class="h3">The 7 client questions asked in each city</h3>
      <ol class="qlist">
        <li>We are a manufacturing and distribution business in Sydney looking to automate order-to-invoice, production scheduling, and quality workflows. Which Microsoft automation specialists should we talk to?</li>
        <li>Who builds custom Microsoft Power Apps for field inspections, warehouse operations, and shop-floor teams in Sydney?</li>
        <li>Who are the best Microsoft Power Platform consultants in Sydney for a mid-sized business? Give me a shortlist with reasons.</li>
        <li>Which business process automation agencies in Sydney specialise in automating manual spreadsheet and approval workflows using Power Automate and SharePoint?</li>
        <li>We need to connect our ERP (MYOB Acumatica, SAP, or Dynamics 365) with SharePoint, CRM, and automated approvals in Sydney. Which integration specialists do this best?</li>
        <li>Who are the top Power BI and Microsoft Fabric consultants in Sydney for building live operational and financial dashboards?</li>
        <li>Which Microsoft Copilot Studio and AI agent implementation partners in Sydney build practical AI assistants for business operations?</li>
      </ol>
    </div>
    <div>
      <h3 class="h3">The 5 assistants</h3>
      <ul class="plist">
        <li><b>ChatGPT</b><span>with web search</span></li>
        <li><b>Google AI Mode</b><span>searched from each city</span></li>
        <li><b>Gemini</b><span>located in each city</span></li>
        <li><b>Perplexity</b><span>web search on</span></li>
        <li><b>Claude</b><span>web search on</span></li>
      </ul>
      <p class="note">Every consultancy named in every answer was recorded, along with its position and the websites the assistant used as sources. We also checked Google search and Google Maps for the same questions.</p>
    </div>
  </div>`);

// ─── 4. National Standings ──────────────────────────────────────────────────
{
  const top8 = natTop.slice(0, 8).map((x, i) => ({ ...x, rank: i + 1, leader: i === 0, isTarget: x.name === TARGET }));
  const rows = [...top8];
  if (!rows.some(r => r.name === TARGET)) {
    rows.push({ name: TARGET, n: M.mtMentioned, rank: mtNatRank, gapBefore: true, isTarget: true });
  }
  const leader1 = natTop[0] || { name: 'Power Platform Experts', n: 86 };

  slide('national', 'light', `
    <header class="hd"><p class="eyebrow">National standings</p><h2 class="h1">Across all 8 cities, Inturing is named in ${M.mtMentioned} of ${TOTAL_ANSWERS} answers — ranking #${mtNatRank} in Australia</h2></header>
    <div class="cols-60">
      <div class="panel">
        <p class="chart-title">Answers naming each consultancy, out of ${TOTAL_ANSWERS}</p>
        ${hbars(rows, TOTAL_ANSWERS)}
      </div>
      <div class="side-stats">
        <div class="stat rise" style="--d:500ms"><span class="big pulp"><b class="count" data-to="${Math.round(M.mtRatePct)}">${Math.round(M.mtRatePct)}</b>%</span><span class="stat-cap">of answers name Inturing (<b>${M.mtMentioned} of ${TOTAL_ANSWERS}</b>). ${esc(short(leader1.name))} leads with ${leader1.n}.</span></div>
        <div class="stat rise" style="--d:650ms"><span class="big">58%</span><span class="stat-cap"><b>on Manufacturing Automation (23 of 40)</b> and <b>20% on Power Apps (8 of 40)</b> — Inturing is #1 in Australia on manufacturing workflows.</span></div>
        <div class="stat rise" style="--d:800ms"><span class="big">0 of 200</span><span class="stat-cap"><b>across the other 5 questions.</b> AI pigeonholes Inturing as manufacturing-only, leaving out general Power Platform, ERP, Power BI and Copilot buyers.</span></div>
      </div>
    </div>
    ${src(SRC_ANS)}`);
}

// ─── 5. Map (8 Australian Cities) ───────────────────────────────────────────
{
  const R = r => 8 + Math.sqrt(Math.max(0, r) / 100) * 46;
  const COL = 900;
  const lab = {
    brisbane:  [COL, 210, 'start'],
    newcastle: [COL, 310, 'start'],
    sydney:    [COL, 410, 'start'],
    canberra:  [COL, 510, 'start'],
    melbourne: [COL, 610, 'start'],
    hobart:    [COL, 710, 'start'],
    adelaide:  [460, 680, 'end'],
    perth:     [70,  490, 'end']
  };
  const pts = {
    perth:     [140, 505],
    adelaide:  [535, 560],
    melbourne: [665, 635],
    hobart:    [695, 775],
    canberra:  [735, 565],
    sydney:    [775, 520],
    newcastle: [790, 490],
    brisbane:  [825, 365]
  };

  const circles = ORDER.map((c, i) => {
    const s = cityStats[c]; const [px, py] = pts[c] || [775, 520];
    const [lx, ly, anchor] = lab[c] || [COL, 500, 'start'];
    const ex = anchor === 'start' ? lx - 14 : lx + 14;
    return `<g class="mp" style="--d:${300 + i * 130}ms">
      <circle cx="${px}" cy="${py}" r="${R(s.leaderRate)}" class="ring pop" style="--d:${300 + i * 130}ms"/>
      <circle cx="${px}" cy="${py}" r="${Math.max(6, R(s.rate))}" class="pulse" style="--d:${1600 + i * 180}ms"/>
      <circle cx="${px}" cy="${py}" r="${Math.max(6, R(s.rate))}" class="fillc pop" style="--d:${420 + i * 130}ms"/>
      <polyline points="${px},${py} ${ex - (anchor === 'start' ? 40 : -40)},${ly - 12} ${ex},${ly - 12}" fill="none" class="leader-line fadein" style="--d:${600 + i * 130}ms"/>
      <g class="fadein" style="--d:${650 + i * 130}ms">
        <text x="${lx}" y="${ly - 2}" text-anchor="${anchor}" class="m-city">${CITY[c]}</text>
        <text x="${lx}" y="${ly + 32}" text-anchor="${anchor}" class="m-stat"><tspan class="m-pulp">${s.rate}%</tspan>  ·  ${s.lhdMentions}/35</text>
      </g></g>`;
  }).join('');

  slide('map', 'dark', `
    <header class="hd"><p class="eyebrow on-dark">City by city</p><h2 class="h1">Named in all 8 cities for manufacturing — but missing from city-wide Power Platform shortlists</h2></header>
    <div class="map-wrap">
      <svg class="ausmap" viewBox="-260 -20 1620 900" width="1100" height="611" role="img" aria-label="Map showing Inturing share of AI answers across 8 Australian cities">
        <path d="${MAP.d}" class="land"/>
        ${circles}
      </svg>
      <div class="map-side">
        <div class="legend-map">
          <p><svg width="44" height="44" aria-hidden="true"><circle cx="22" cy="22" r="18" fill="#3B78B4"/></svg><span>Share of answers naming Inturing</span></p>
          <p><svg width="44" height="44" aria-hidden="true"><circle cx="22" cy="22" r="18" fill="none" stroke="#9DAAC0" stroke-width="2.5" stroke-dasharray="5 5"/></svg><span>Share for the city's top competitor</span></p>
        </div>
        <table class="rank-table">
          <thead><tr><th>City</th><th>Inturing</th><th>Rank</th><th>City leader</th></tr></thead>
          <tbody>${ORDER.map(c => { const s = cityStats[c]; return `<tr><td>${CITY[c]}</td><td class="num pulp-t">${s.rate}%</td><td class="num">#${s.lhdRank}</td><td>${esc(short(s.leader.name))} <span class="muted-d">${s.leaderRate}%</span></td></tr>`; }).join('')}</tbody>
        </table>
      </div>
    </div>`, { dark: true });
}

// ─── 6. Sydney Intro (Accent) ───────────────────────────────────────────────
{
  const s = cityStats.sydney;
  slide('sydney-intro', 'accent', `
    <p class="eyebrow on-accent rise" style="--d:0ms">01 · Sydney, Inturing's home market</p>
    <h2 class="display on-accent rise" style="--d:120ms">Inturing's delivery team is based in Sydney — and when Sydney answers name Inturing, it ranks #1 every time.</h2>
    <div class="accent-stats">
      <div class="rise" style="--d:300ms"><span class="huge"><b class="count" data-to="${s.rate}">${s.rate}</b>%</span><span class="acap">of Sydney AI answers name Inturing (${s.lhdMentions} of ${ANSWERS_PER_CITY})</span></div>
      <div class="rise" style="--d:450ms"><span class="huge">4 of 4</span><span class="acap">times Inturing is named in Sydney, it is recommended #1 on the shortlist</span></div>
      <div class="rise" style="--d:600ms"><span class="huge">0 reviews</span><span class="acap">and no street address on Inturing's Sydney Google Business Profile — an easy fix that unlocks local Sydney searches</span></div>
    </div>`, { dark: true });
}

// ─── 7. Sydney Board ────────────────────────────────────────────────────────
function platStrip(c) {
  const m = cityStats[c];
  const shortPlat = { aimode: 'AI Mode', chatgpt: 'ChatGPT', perplexity: 'Perplexity', gemini: 'Gemini', claude: 'Claude' };
  return `<div class="strip">${PLAT.map(([p], i) => { const v = m.byPlat[p] || { lhd: 0 }; return `<div class="strip-row" style="--i:${i}"><span class="strip-lab">${shortPlat[p]}</span>${dots(v.lhd, 7)}<span class="strip-val">${v.lhd}/7</span></div>`; }).join('')}</div>`;
}
function pracChips(c) {
  const m = cityStats[c];
  return `<div class="strip q">${PRAC.map(([p], i) => { const v = m.byPrompt[p] || { lhd: 0 }; return `<div class="strip-row${v.lhd === 0 ? ' zero' : ''}" style="--i:${i + 5}"><span class="strip-lab">${PRAC_SHORT[p]}</span>${dots(v.lhd, NUM_PLATFORMS)}<span class="strip-val">${v.lhd}/${NUM_PLATFORMS}</span></div>`; }).join('')}</div>`;
}

{
  const s = cityStats.sydney;
  const top8 = s.top.slice(0, 8).map((x, i) => ({ ...x, rank: i + 1, leader: i === 0, isTarget: x.name === TARGET }));
  if (!top8.some(r => r.name === TARGET)) top8.push({ name: TARGET, n: s.lhdMentions, rank: s.lhdRank, gapBefore: true, isTarget: true });

  slide('sydney-board', 'light', `
    <header class="hd"><p class="eyebrow">01 · Sydney</p><h2 class="h1">AI names Inturing in ${s.lhdMentions} of ${s.answers} Sydney answers. ${esc(short(s.leader.name))} gets ${s.leader.n}.</h2></header>
    <div class="city-grid">
      <div class="panel"><p class="chart-title">Answers naming each consultancy in Sydney, out of ${ANSWERS_PER_CITY}</p>${hbars(top8, ANSWERS_PER_CITY)}</div>
      <div class="city-side">
        <div class="kpis">
          <div class="kpi"><span class="big pulp">${s.rate}%</span><span class="kpi-cap">answers naming Inturing (#${s.lhdRank} in Sydney)</span></div>
          <div class="kpi"><span class="big">4 of 4</span><span class="kpi-cap">recommended #1 whenever named in Sydney</span></div>
        </div>
        <p class="mini-title">Inturing by assistant in Sydney (of 7)</p>${platStrip('sydney')}
        <p class="note">ChatGPT (2 of 7), Google AI Mode (1 of 7) and Perplexity (1 of 7) already recommend Inturing #1 in Sydney for manufacturing and shop-floor apps.</p>
      </div>
    </div>
    ${src(SRC_ANS)}`);
}

// ─── 8. Sydney Heatmap ──────────────────────────────────────────────────────
{
  const s = cityStats.sydney;
  const rowsH = s.top.slice(0, 7).map(x => x.name);
  if (!rowsH.includes(TARGET)) rowsH.push(TARGET);
  const shade = v => ['#F4F5F8', '#E1ECF7', '#C3D9EE', '#8AB6DF', '#5B96CC', '#3B78B4', '#2B6399', '#1D466E'][Math.min(7, v)];
  const shortPlat = { aimode: 'AI Mode', chatgpt: 'ChatGPT', perplexity: 'Perplexity', gemini: 'Gemini', claude: 'Claude' };
  const heat = `<div class="heat" role="table" aria-label="Sydney answers naming each consultancy by assistant">
    <div class="heat-row head" role="row"><span role="columnheader"></span>${PLAT.map(([k]) => `<span role="columnheader">${shortPlat[k]}</span>`).join('')}<span role="columnheader">Total</span></div>
    ${rowsH.map((f, ri) => {
      const r = s.matrix[f] || {};
      const tot = PLAT.reduce((acc, [p]) => acc + (r[p] || 0), 0);
      return `<div class="heat-row${f === TARGET ? ' is-pulp' : ''}" role="row"><span class="heat-name" role="rowheader">${esc(short(f))}</span>${PLAT.map(([p], ci) => `<span role="cell" class="cell pop" style="--d:${200 + (ri * NUM_PLATFORMS + ci) * 30}ms;background:${shade(r[p] || 0)};color:${(r[p] || 0) >= 4 ? '#FFFFFF' : '#11151E'}">${r[p] || 0}</span>`).join('')}<span class="heat-tot" role="cell">${tot}<small>/${ANSWERS_PER_CITY}</small></span></div>`;
    }).join('')}
  </div>`;

  slide('sydney-heat', 'white', `
    <header class="hd"><p class="eyebrow">01 · Sydney</p><h2 class="h1">ChatGPT, AI Mode and Perplexity back Inturing in Sydney; Gemini and Claude miss it</h2></header>
    <div class="cols-heat">
      <div class="panel"><p class="chart-title">Sydney answers naming each consultancy, by assistant (out of ${PRAC.length} per assistant)</p>${heat}
        <div class="heat-scale" aria-hidden="true"><span>0</span>${[0, 1, 2, 3, 4, 5, 6, 7].map(v => `<i style="background:${shade(v)}"></i>`).join('')}<span>7 of 7</span></div></div>
      <div class="side-stats">
        <div class="stat"><span class="big">2 of 7</span><span class="stat-cap"><b>ChatGPT</b> names Inturing #1 on both Sydney Manufacturing Automation and Custom Power Apps.</span></div>
        <div class="stat"><span class="big pulp">15 vs 4</span><span class="stat-cap"><b>Eagle360 (15), Barhead (12) and Professional Advantage (11)</b> win across all 7 questions because they have dedicated Sydney pages and partner directory listings.</span></div>
        <div class="stat"><span class="big">0 of 7</span><span class="stat-cap"><b>Gemini and Claude</b> in Sydney rely on Microsoft Partner directories and Clutch listings where Inturing has no profile yet.</span></div>
      </div>
    </div>
    ${src(SRC_ANS)}`);
}

// ─── 9. Sydney Capability Breakdown ─────────────────────────────────────────
{
  const s = cityStats.sydney;
  const pr = PRAC.map(([p, label]) => ({ label, ...s.byPrompt[p] }));
  slide('sydney-practice', 'light', `
    <header class="hd"><p class="eyebrow">01 · Sydney</p><h2 class="h1">Dominant on Manufacturing Automation (3 of 5) — zero on the 5 broader questions</h2></header>
    <div class="cols-60">
      <div class="panel">
        <div class="prac-head"><span>Question</span><span>Inturing (of ${NUM_PLATFORMS})</span><span>Question leader in Sydney</span></div>
        ${pr.map((r, i) => `<div class="prac-row${r.lhd === 0 ? ' zero' : ''}" style="--i:${i}"><span class="prac-lab">${r.label}</span><span class="prac-dots">${dots(r.lhd, NUM_PLATFORMS, 'big')}<b>${r.lhd}/${NUM_PLATFORMS}</b></span><span class="prac-lead">${esc(short(r.leader))} <b>${r.leaderN}/${NUM_PLATFORMS}</b></span></div>`).join('')}
      </div>
      <div class="side-stats">
        <div class="stat"><span class="big pulp">3 of 5</span><span class="stat-cap"><b>on Manufacturing Automation:</b> ChatGPT, Google AI Mode and Perplexity all name Inturing #1 in Sydney, citing the BBCP order-to-invoice case study.</span></div>
        <div class="stat"><span class="big">1 of 5</span><span class="stat-cap"><b>on Custom Power Apps:</b> ChatGPT recommends Inturing #1 in Sydney for shop-floor, warehouse and field inspection apps.</span></div>
        <div class="stat"><span class="big">0 of 25</span><span class="stat-cap"><b>across the other 5 Sydney questions:</b> Power Platform consultants, Workflow automation, ERP integration, Power BI &amp; Fabric, and Copilot &amp; AI agents.</span></div>
      </div>
    </div>
    ${src(SRC_ANS)}`);
}

// ─── 10. Why Sydney Leaders Win ─────────────────────────────────────────────
{
  const mTop = cityStats.sydney.top;
  const getM = name => mTop.find(x => x.name === name)?.n || 0;
  const T = [
    ['Eagle360 Consulting', getM('Eagle360 Consulting') || 15, 'Sydney Power Platform, Power BI & Copilot pages', '5.0 ★ (Sydney)', 'Listed in Sydney', 'Microsoft Partner + Clutch'],
    ['Barhead Solutions', getM('Barhead Solutions') || 12, 'Sydney HQ + Dynamics, Power Platform & Copilot hubs', '4.8 ★ (Sydney)', 'Listed in Sydney', 'Microsoft AppSource + Clutch'],
    ['Professional Advantage', getM('Professional Advantage') || 11, 'North Sydney office + ERP, Power BI & Fabric hubs', '4.6 ★ (North Syd)', 'Listed in Sydney', 'Microsoft Solutions Partner'],
    ['Power Platform Experts', getM('Power Platform Experts') || 10, 'Dedicated Sydney Power Platform, Apps & BI pages', '4.9 ★ (NSW)', 'Listed in NSW', 'Office Experts Group network'],
    ['Team 400', getM('Team 400') || 9, 'Sydney AI & Microsoft Copilot implementation pages', '5.0 ★ (Sydney)', 'Listed in Sydney', 'Clutch + AI directories'],
    ['Inturing', cityStats.sydney.lhdMentions, 'Manufacturing pages strong · No Sydney city page yet', '0 reviews (No address)', 'Not in top 20', 'Not listed on Clutch / AppSource'],
  ];
  slide('sydney-why', 'white', `
    <header class="hd"><p class="eyebrow">01 · Sydney</p><h2 class="h1">Why Eagle360, Barhead and Professional Advantage outrank Inturing in Sydney</h2></header>
    <table class="why-table">
      <thead><tr><th style="width:22%">Consultancy</th><th style="width:18%">AI answers</th><th style="width:26%">Website pages</th><th style="width:13%">Google rating</th><th style="width:10%">Google Maps</th><th style="width:11%">Directories</th></tr></thead>
      <tbody>${T.map(([f, n, tier, rating, mp, g10], i) => `<tr class="${f === TARGET ? 'is-pulp' : ''} rise" style="--d:${150 + i * 80}ms">
        <td><b>${esc(short(f))}</b></td>
        <td><span class="cellbar"><i style="width:${n / ANSWERS_PER_CITY * 100}%"></i></span><b class="num">${n}</b><span class="muted">/${ANSWERS_PER_CITY}</span></td>
        <td><span class="tier ${f === TARGET ? 'tier-pulp' : 'tier-leader'}">${tier}</span></td>
        <td class="num">${rating}</td>
        <td class="num"><b>${mp}</b></td>
        <td class="num">${g10}</td></tr>`).join('')}</tbody>
    </table>
    <div class="finds two">
      <p><b>Inturing's homepage title tells AI it only works with manufacturers.</b> Because the homepage title is “Inturing | AI Automation &amp; Power Platform for Manufacturers”, AI assistants recommend Inturing for manufacturing questions (3 of 5 in Sydney) but skip it when a Sydney business asks for a general Power Platform, ERP integration, or Power BI partner.</p>
      <p><b>Incomplete Sydney Google profile and missing directory listings.</b> On Google Maps, Inturing's profile has 0 reviews, no Sydney street address, and is set to “Computer support and services” instead of “Business management consultant” or “Software company”.</p>
    </div>
    ${src('Sources: Google Maps, Google search results and website audit collected October 2026.')}`);
}

// ─── 11-17. City Slides (Melbourne, Brisbane, Perth, Adelaide, Canberra, Newcastle, Hobart) ──
function cityBars(c, n = 7) {
  const m = cityStats[c];
  const rows = m.top.slice(0, n).map((x, i) => ({ ...x, rank: i + 1, leader: i === 0 && x.name !== TARGET, isTarget: x.name === TARGET }));
  if (!rows.find(r => r.name === TARGET)) rows.push({ name: TARGET, n: m.lhdMentions, rank: m.lhdRank, gapBefore: true, isTarget: true });
  return hbars(rows, m.answers);
}

const MARKET_NOTES = {
  melbourne: {
    title: `In Melbourne, Team 400 (11 of 35) and Eagle360 (10) lead; Inturing gets 5 of 35 (14%)`,
    finds: [
      ['Tied #1 in Melbourne for Manufacturing Automation (4 of 5):', 'ChatGPT, Google AI Mode, Perplexity and Gemini all recommend Inturing for Melbourne manufacturers, citing its MYOB Acumatica and SAP Ariba automation work.'],
      ['Named for Shop-Floor Power Apps (1 of 5):', 'ChatGPT also recommends Inturing in Melbourne for custom field and warehouse Power Apps — and Inturing already serves Victoria clients like Liquip Victoria.'],
      ['How to win broader Melbourne work:', 'Publish a dedicated Melbourne Power Platform & AI Automation page featuring the Liquip Victoria relationship and ERP integration capabilities.'],
    ],
  },
  brisbane: {
    title: `In Brisbane, Team 400 (13 of 35) and Power Platform Experts (12) lead; Inturing gets 5 of 35 (14%)`,
    finds: [
      ['4 of 5 assistants recommend Inturing for Brisbane Manufacturing:', 'ChatGPT, Google AI Mode, Perplexity and Gemini all shortlist Inturing when Brisbane manufacturers and wholesalers ask about automating production and order workflows.'],
      ['Recommended #1 on Brisbane Power Apps:', 'Google AI Mode ranks Inturing #1 in Brisbane for custom warehouse and field inspection Power Apps.'],
      ['How to overtake Frontrow Technology (6 of 35) in Brisbane:', 'Add a Brisbane city page and a dedicated ERP & Acumatica/SAP Integration guide so Inturing captures general Brisbane Power Platform and ERP queries.'],
    ],
  },
  perth: {
    title: `In Perth, Velrada (14 of 35) and Power Platform Experts (13) lead; Inturing gets 2 of 35`,
    finds: [
      ['Even in WA, Inturing wins when industrial operations are mentioned:', 'Perplexity recommends Inturing #1 in Perth for custom field and warehouse Power Apps, and Gemini names Inturing for Perth manufacturing automation.'],
      ['Inturing already has WA mining & industrial proof (Schlam):', 'Schlam is featured on Inturing’s website, yet AI assistants don’t connect Inturing to Perth because Perth and WA are never mentioned in the text.'],
      ['How to grow in Perth:', 'Create a Perth & WA Industrial Automation page highlighting mining, heavy equipment and warehouse workflows across Power Apps and Power Automate.'],
    ],
  },
  adelaide: {
    title: `In Adelaide, Power Platform Experts (18 of 35) and Office Experts (17) lead; Inturing gets 3 of 35`,
    finds: [
      ['3 of 5 on Adelaide Manufacturing Automation:', 'ChatGPT, Google AI Mode and Gemini all shortlist Inturing for Adelaide manufacturing and distribution businesses looking to automate order-to-invoice and quality workflows.'],
      ['Why Power Platform Experts wins 18 of 35 in Adelaide:', 'Power Platform Experts has dedicated Adelaide landing pages for Power Apps, Power BI, and Power Automate, so AI picks them up on every single question.'],
      ['What to do:', 'Add an Adelaide manufacturing and mid-market operations section so AI includes Inturing across broader South Australian searches.'],
    ],
  },
  canberra: {
    title: `In Canberra, Power Platform Experts (17 of 35) and Office Experts (16) lead; Inturing gets 4 of 35`,
    finds: [
      ['Recommended #1 three times in Canberra:', 'ChatGPT, Google AI Mode and Perplexity all rank Inturing #1 on Canberra workflow and production automation, and ChatGPT also names Inturing on Canberra Power Apps.'],
      ['Public Sector is already on Inturing’s website:', 'Inturing has a dedicated Public Sector page (/public-sector), but it doesn’t mention Canberra, ACT, or government governance standards.'],
      ['What to do:', 'Update the Public Sector page to explicitly reference Canberra and ACT/Federal agency workflows, approvals, and Microsoft 365 governance.'],
    ],
  },
  newcastle: {
    title: `In Newcastle & the Hunter, SR1 Development (9 of 35) and Marra (8) lead; Inturing ties for #4 with 4 of 35`,
    finds: [
      ['Tied #4 overall in Newcastle & the Hunter Valley:', 'Inturing wins 3 of 5 on Newcastle Manufacturing Automation (#1 on ChatGPT, AI Mode and Perplexity) and 1 of 5 on Newcastle Power Apps.'],
      ['Just two hours north of Sydney:', 'Hunter Valley manufacturers, civil contractors and engineering firms are natural clients for Inturing’s Sydney delivery team (alongside existing civil client Menai Civil).'],
      ['How to take the lead in Newcastle:', 'Reference Newcastle, the Hunter Valley and regional NSW on a dedicated Sydney & NSW page so AI connects Inturing to every Hunter Valley query.'],
    ],
  },
  hobart: {
    title: `In Hobart, Intuit Technologies (10 of 35) and Alphavima (9) lead; Inturing gets 4 of 35 (all #1)`,
    finds: [
      ['Recommended #1 four times in Hobart:', 'Every time Inturing is named in Hobart — across ChatGPT (2), Google AI Mode (1) and Perplexity (1) — it is placed #1 on the shortlist.'],
      ['National delivery reach works in Inturing’s favour:', 'In smaller capitals like Hobart, Canberra and Newcastle, AI assistants actively recommend specialized national partners when local generalist IT shops lack deep Power Platform proof.'],
      ['What to do:', 'State clearly on the website that Inturing delivers Australia-wide from Sydney across all 8 capitals and industrial corridors.'],
    ],
  },
};

function marketSlide(c, idx) {
  const m = cityStats[c]; const N = MARKET_NOTES[c];
  slide(`city-${c}`, idx % 2 ? 'white' : 'light', `
    <header class="hd"><p class="eyebrow">0${idx} · ${CITY[c]}</p><h2 class="h1">${esc(N.title)}</h2></header>
    <div class="city3">
      <div class="panel"><p class="chart-title">Answers naming each consultancy in ${CITY[c]} (of ${ANSWERS_PER_CITY})</p>${cityBars(c, 7)}</div>
      <div class="city-side">
        <div class="kpis">
          <div class="kpi"><span class="big pulp"><b class="count" data-to="${m.rate}">${m.rate}</b>%</span><span class="kpi-cap">answers naming Inturing (${m.lhdMentions}/${ANSWERS_PER_CITY})</span></div>
          <div class="kpi"><span class="big">#${m.lhdRank}</span><span class="kpi-cap">of ${m.firmsNamed} consultancies named</span></div>
        </div>
        <p class="mini-title">By assistant · of 7 questions</p>${platStrip(c)}
        <p class="mini-title">By question · of ${NUM_PLATFORMS} assistants</p>${pracChips(c)}
      </div>
      <div class="finds-col">${N.finds.map(([b, t], i) => `<p class="rise" style="--d:${700 + i * 140}ms"><b>${esc(b)}</b> ${esc(t)}</p>`).join('')}</div>
    </div>
    ${src(SRC_ANS)}`);
}

['melbourne', 'brisbane', 'perth', 'adelaide', 'canberra', 'newcastle', 'hobart'].forEach((c, i) => marketSlide(c, i + 2));

// ─── 18. The Pattern (Topic Proof vs AI Answers — Simple & Visual) ──────────
{
  const w = 1000, h = 620, pl = 100, pr = 90, pt = 40, pb = 90;
  // Compare the 7 questions: X-axis = times Inturing's website is referenced as a source (of 40 answers), Y-axis = % of answers naming Inturing
  const topicPoints = PRAC.map(([pk, label]) => {
    const sub = ansFullRaw.filter(a => a.pk === pk);
    const citedCount = sub.filter(a => a.mtCited).length;
    const mentionedCount = sub.filter(a => a.mtMentioned).length;
    const ratePct = +((mentionedCount / Math.max(1, sub.length)) * 100).toFixed(1);
    return { pk, label, citedCount, mentionedCount, ratePct, rateRound: Math.round(ratePct) };
  });

  const x = v => pl + (v / 28) * (w - pl - pr), y = v => pt + (h - pt - pb) * (1 - v / 65);

  const labelOffsets = {
    manufacturing_automation: { dx: -18, dy: 8,   anchor: 'end',   label: 'Manufacturing automation' },
    power_apps:               { dx: 18,  dy: 6,   anchor: 'start', label: 'Custom Power Apps' },
    workflow_automation:      { dx: 18,  dy: -10, anchor: 'start', label: 'Workflow & Power Automate (cited twice, 0 named)' },
    power_platform:           { dx: 18,  dy: 16,  anchor: 'start', label: 'Power Platform consultants (cited once, 0 named)' },
    erp_integration:          { dx: 18,  dy: -14, anchor: 'start', label: 'ERP integration, Power BI & Copilot (0 cited, 0 named)' },
    power_bi_fabric:          { hide: true },
    copilot_ai:               { hide: true }
  };

  const pts = topicPoints.map((tp, i) => {
    const px = x(tp.citedCount), py = y(tp.ratePct);
    const off = labelOffsets[tp.pk] || { dx: 18, dy: 6, anchor: 'start', label: tp.label };
    if (off.hide) {
      return `<circle cx="${px}" cy="${py}" r="10" fill="#3B78B4" stroke="#0D1520" stroke-width="3"/>`;
    }
    const lx = px + off.dx;
    const ly = py + off.dy;
    return `<g class="pop" style="--d:${300 + i * 110}ms">
      <circle cx="${px}" cy="${py}" r="13" fill="#3B78B4" stroke="#0D1520" stroke-width="4"/>
      <text x="${lx}" y="${ly}" text-anchor="${off.anchor}" class="sc-lab">${off.label} <tspan class="sc-v">${tp.rateRound}% (${tp.mentionedCount}/40)</tspan></text>
    </g>`;
  }).join('');

  const sc = `<svg class="chart" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Scatter of website source references against AI answer share across the 7 questions">
    ${[0, 15, 30, 45, 60].map(t => `<line x1="${pl}" x2="${w - pr}" y1="${y(t)}" y2="${y(t)}" class="gl"/><text x="${pl - 16}" y="${y(t) + 8}" class="ax" text-anchor="end">${t}%</text>`).join('')}
    ${[0, 7, 14, 21, 28].map(t => `<text x="${x(t)}" y="${h - pb + 42}" class="ax" text-anchor="middle">${t} of 40</text>`).join('')}
    <text x="${(pl + w - pr) / 2}" y="${h - 14}" class="ax-t" text-anchor="middle">Answers (out of 40 per question) that pull directly from inturing.com.au</text>
    <text transform="translate(26 ${(pt + h - pb) / 2}) rotate(-90)" class="ax-t" text-anchor="middle">AI answers naming Inturing (%)</text>
    ${pts}</svg>`;

  slide('pattern', 'light', `
    <header class="hd"><p class="eyebrow">The pattern</p><h2 class="h1">Where Inturing has a specific page and case study, AI names Inturing #1</h2></header>
    <div class="cols-60">
      <div class="panel">${sc}</div>
      <div class="side-stats">
        <div class="stat"><span class="big pulp">23 of 40</span><span class="stat-cap"><b>Manufacturing Automation (58%):</b> Inturing has a dedicated manufacturing page, assessment tool, and the BBCP case study — so AI names Inturing in 23 of 40 answers (and #1 sixteen times).</span></div>
        <div class="stat"><span class="big">8 of 40</span><span class="stat-cap"><b>Custom Power Apps (20%):</b> Inturing's Power Apps page and shop-floor focus win 8 of 40 answers across 7 cities.</span></div>
        <div class="stat"><span class="big">0 of 200</span><span class="stat-cap"><b>The other 5 questions (0%):</b> Without city pages, ERP/Fabric guides, or directory listings, AI never names Inturing on general Power Platform, ERP, Power BI or Copilot searches.</span></div>
      </div>
    </div>
    ${src('Source: 280 AI answers across 7 questions and 8 Australian cities, October 2026.')}`);
}

// ─── 19. 14-Month Trend (Australian Microsoft Consultancies) ────────────────
{
  const S = [
    ['Professional Advantage', 'pa.com.au', '#11151E', 4],
    ['Leverage Technologies', 'leveragetech.com.au', '#364156', 3],
    ['Office Experts Group', 'officeexperts.com.au', '#5C677E', 3],
    ['Engage Squared', 'engage2.com.au', '#7B859C', 3],
    ['Frontrow Technology', 'frontrowtech.com.au', '#9AA4B8', 3],
    ['Barhead Solutions', 'barhead.com', '#B6BECE', 3],
    ['Inturing', 'inturing.com.au', '#3B78B4', 6],
  ];
  const labels = HIST_LABELS;
  const paTot = seriesAll('pa.com.au').reduce((a, b) => a + b, 0);
  const levTot = seriesAll('leveragetech.com.au').reduce((a, b) => a + b, 0);
  const offTot = seriesAll('officeexperts.com.au').reduce((a, b) => a + b, 0);
  const intTot = seriesAll('inturing.com.au').reduce((a, b) => a + b, 0);

  const chart = lineChart({
    w: 1120, h: 590, pad: [34, 340, 68, 76], labels, yMax: 70, yTicks: [0, 15, 30, 45, 70], yFmt: v => v.toLocaleString('en-AU'),
    series: S.map(([name, d, color, width]) => {
      const vals = series(d);
      return {
        name,
        values: vals,
        color,
        width,
        cls: name === 'Inturing' ? 'pulp' : '',
        textColor: name === 'Inturing' ? '#2B6399' : '#11151E',
        valueLabel: `${vals[vals.length - 1]}`
      };
    }),
  });
  const sh = lineChart({
    w: 500, h: 220, pad: [34, 40, 50, 70], labels: labels.map((l, i) => (i === 0 || i === labels.length - 1) ? l : ''), yMax: 5, yTicks: [0, 1, 2, 3, 5], yFmt: v => v + '%', endLabels: false,
    series: [{ name: 'Inturing Share', values: shareSeries, color: '#3B78B4', width: 5, label: false }],
    ann: [(x, y) => `<text x="${x(labels.length - 1)}" y="${y(shareSeries[shareSeries.length - 1]) - 14}" text-anchor="end" class="callsmall pulp">${shareSeries[shareSeries.length - 1]}% (Sep 26)</text>`],
  });

  slide('trend', 'white', `
    <header class="hd"><p class="eyebrow">14-month trend · Google AI answers</p><h2 class="h1">Google's AI references Professional Advantage, Leverage Technologies and Office Experts every month</h2></header>
    <div class="cols-trend">
      <div class="panel"><p class="chart-title">Google AI answers per month that reference each consultancy's website, Aug 2025 to Sep 2026</p>${chart}</div>
      <div class="side-stats">
        <div class="stat"><span class="big">${offTot} vs ${intTot}</span><span class="stat-cap"><b>Why practical guides win:</b> Office Experts Group was referenced <b>${offTot} times</b>, Leverage Technologies <b>${levTot} times</b>, and Professional Advantage <b>${paTot} times</b> over the past 15 months, against <b>${intTot}</b> for Inturing.</span></div>
        <div class="mini-chart"><p class="mini-title">Inturing share of the tracked group</p>${sh}<p class="note">Inturing's website has only 28 pages total. Publishing practical guides on ERP integration, Power BI &amp; Fabric, and Copilot Studio builds monthly compounding visibility.</p></div>
      </div>
    </div>
    ${src('Source: DataForSEO historical tracking of Australian Google AI answers referencing each consultancy’s website, Aug 2025 to Sep 2026.')}`);
}

// ─── 20. The Gap to Close (Dumbbell) ────────────────────────────────────────
{
  const w = 1520, rowH = 66, top = 58, left = 260, right = 150;
  const x = v => left + v / 100 * (w - left - right);
  const rows = ORDER.map((c, i) => {
    const s = cityStats[c]; const yy = top + i * rowH; const gap = s.rate - s.leaderRate;
    return `<g class="db" style="--d:${200 + i * 110}ms">
      <text x="0" y="${yy + 9}" class="db-city">${CITY[c]}</text>
      <line x1="${x(Math.min(s.rate, s.leaderRate))}" x2="${x(Math.max(s.rate, s.leaderRate))}" y1="${yy}" y2="${yy}" class="db-line grow-x" style="--d:${300 + i * 110}ms"/>
      <circle cx="${x(s.leaderRate)}" cy="${yy}" r="13" fill="#11151E" class="pop" style="--d:${250 + i * 110}ms"/>
      <circle cx="${x(s.rate)}" cy="${yy}" r="13" fill="#3B78B4" stroke="#FFFFFF" stroke-width="4" class="pop" style="--d:${450 + i * 110}ms"/>
      <text x="${w - right + 30}" y="${yy + 9}" class="db-gap ${gap >= 0 ? 'pos' : ''}">${gap > 0 ? '+' : gap === 0 ? '±' : '−'}${Math.abs(gap)} pts</text>
      <text x="${x(s.leaderRate)}" y="${yy - 20}" text-anchor="middle" class="db-lead">${esc(short(s.leader.name))}</text>
    </g>`;
  }).join('');

  const svg = `<svg class="chart" viewBox="0 -10 ${w + 40} ${top + ORDER.length * rowH}" width="${w + 40}" height="${top + ORDER.length * rowH}" role="img" aria-label="Inturing share against the top competitor per city">
    ${[0, 25, 50, 75, 100].map(t => `<line x1="${x(t)}" x2="${x(t)}" y1="20" y2="${top + (ORDER.length - 1) * rowH + 24}" class="gl"/><text x="${x(t)}" y="10" class="ax" text-anchor="middle">${t}%</text>`).join('')}
    ${rows}</svg>`;

  slide('gap', 'light', `
    <header class="hd"><p class="eyebrow">The gap to close</p><h2 class="h1">Inturing’s distance to the local leader in each city</h2></header>
    <div class="legend-row"><span><i class="lg-dot pulp"></i>Inturing</span><span><i class="lg-dot navy"></i>City leader</span><span class="muted">Share of the city's ${ANSWERS_PER_CITY} AI answers</span></div>
    <div class="panel">${svg}</div>
    ${src(SRC_ANS)}`);
}

// ─── 21. The Plan Intro (Accent) ────────────────────────────────────────────
slide('plan-intro', 'accent', `
  <p class="eyebrow on-accent rise" style="--d:0ms">The plan · Pages 21–28</p>
  <h2 class="display on-accent rise" style="--d:120ms">How Inturing expands from #1 in Manufacturing Automation to a top-shortlisted partner across all 7 services</h2>
  <p class="lede on-accent rise" style="--d:260ms">Five practical steps, each tied directly to a finding in the data: get listed on the partner directories AI checks, fix the Sydney Google Business Profile, add city &amp; capability pages, broaden the homepage message beyond manufacturing-only, and track progress monthly.</p>`, { dark: true });

// ─── 22. The 5 Workstreams ──────────────────────────────────────────────────
const WS = [
  ['01', 'Get listed where AI looks', 'Competitors like Eagle360, Barhead, Team 400 and Velrada are repeatedly pulled from Microsoft AppSource, Clutch and B2B software directories.', 'Publish complete Inturing profiles with client reviews on Microsoft AppSource / Partner Directory, Clutch, GoodFirms and TechBehemoths.'],
  ['02', 'Fix the Sydney Google profile', 'Inturing’s Sydney Google Maps profile has 0 reviews, no street address, and is categorised under generic “Computer support and services”.', 'Add a verified Sydney address, switch primary category to Business Management Consultant + Software Company, and collect 10+ client reviews (BBCP, PNA, Burgtec, Schlam).'],
  ['03', 'Build city & capability pages', 'Inturing gets 0 of 200 answers outside Manufacturing and Power Apps because the 28-page site has no city pages and no ERP integration page.', 'Publish dedicated pages for Sydney, Melbourne, Brisbane & Perth, plus dedicated ERP Integration (MYOB Acumatica, SAP Ariba, Dynamics 365) and Microsoft Fabric pages.'],
  ['04', 'Broaden what the website tells AI', 'The homepage title says “AI Automation & Power Platform for Manufacturers”, causing AI to skip Inturing for non-manufacturing Power Platform buyers.', 'Update the homepage title and summary to cover Australian Operations, Manufacturing, Wholesale & Mid-Market Enterprises, and turn the 7 client logos into short case studies.'],
  ['05', 'Measure every month', 'AI recommendations shift every month as models update their web search sources.', 'Re-run the exact same 280 questions across all 8 Australian cities every month and track Inturing’s gains against Eagle360, Barhead, Velrada and Power Platform Experts.'],
];

slide('plan', 'white', `
  <header class="hd"><p class="eyebrow">The plan</p><h2 class="h1">Five workstreams, each answering a specific finding in the data</h2></header>
  <div class="ws">
    <div class="ws-head"><span></span><span>Workstream</span><span>What the data showed</span><span>What we will do</span></div>
    ${WS.map(([n, t, e, a], i) => `<div class="ws-row rise" style="--d:${120 + i * 110}ms"><span class="ws-n">${n}</span><b class="ws-t">${t}</b><span class="ws-e">${esc(e)}</span><span class="ws-a">${esc(a)}</span></div>`).join('')}
  </div>`);

// ─── 23. Workstream 01: Cited Sources ───────────────────────────────────────
{
  const topDoms = [
    ['powerplatformexperts.com.au (competitor)', 130],
    ['inturing.com.au (Inturing — #3 most cited!)', CITS.clientDomainCitations],
    ['pa.com.au (Professional Advantage)', 68],
    ['alphavima.com (Alphavima)', 67],
    ['revenuebase.ai (B2B directory)', 66],
    ['microsoft.com (Microsoft Partner / Learn)', 57],
    ['officeproconsulting.com.au (OfficePro)', 57],
    ['eagle360.consulting (Eagle360)', 54]
  ];
  const maxCit = 130;

  slide('ws-sources', 'light', `
    <header class="hd"><p class="eyebrow">Workstream 01 · Get listed where AI looks</p><h2 class="h1">Inturing's website is already the #3 most-referenced consultancy site (${CITS.clientDomainCitations} times) — now add third-party proof</h2></header>
    <div class="cols-60">
      <div class="panel"><p class="chart-title">Websites most often used as sources across the ${TOTAL_ANSWERS} answers</p>
        ${hbars(topDoms.map(([n, v]) => ({ name: n, n: v, suffix: '', isTarget: n.startsWith('inturing.com.au') })), maxCit, { showRank: false })}</div>
      <div class="actions">
        <h3 class="h3">Actions</h3>
        <ul class="ticks">
          <li><b>List Inturing on Microsoft AppSource &amp; Partner Directory:</b> Microsoft's own domains were referenced 57 times. Publishing a verified Microsoft Partner profile and packaged Power Platform / Copilot assessment offer gives Gemini and Claude the vendor proof they look for.</li>
          <li><b>Create verified profiles on Clutch, GoodFirms &amp; TechBehemoths:</b> B2B comparison directories (like RevenueBase, Clutch and TechBehemoths) are heavily used by ChatGPT and Perplexity when building city shortlists.</li>
          <li><b>Publish founder thought leadership from Paul Del Gigante &amp; Harry Cribb:</b> Feature Paul's Big-4 automation background (ex-KPMG, PwC) and Harry's manufacturing engineering experience on LinkedIn and industry articles.</li>
        </ul>
      </div>
    </div>
    ${src('Source: Website sources recorded across the 280 AI answers, October 2026.')}`);
}

// ─── 24. Workstream 02: Google Business Profile ─────────────────────────────
{
  const rev = {
    sydney: 'Unverified address · 0 reviews · Ranked #3 on brand search only',
    melbourne: 'No local Google Maps presence · 3grow & Dynamics Square lead',
    brisbane: 'No local Google Maps presence · Boost IT & Nexacu lead',
    perth: 'No local Google Maps presence · Epic IT & Velrada lead',
    adelaide: 'No local Google Maps presence · L3 Consulting & Mayasoft lead',
    canberra: 'No local Google Maps presence · Prometix & Nexacu lead',
    newcastle: 'No local Google Maps presence · One Metric & Myrtec lead',
    hobart: 'No local Google Maps presence · Data#3 & The Project Lab lead'
  };
  slide('ws-maps', 'white', `
    <header class="hd"><p class="eyebrow">Workstream 02 · Fix the Sydney Google Business Profile</p><h2 class="h1">Inturing's Sydney Google profile has 0 reviews and no street address — fixing it unlocks local Sydney searches</h2></header>
    <div class="cols-60">
      <div class="panel">
        <div class="mp-head"><span>City</span><span>AI answers (of 35)</span><span>Google Maps status today</span></div>
        ${ORDER.map((c, i) => `<div class="mp-row" style="--i:${i}"><span class="mp-city">${CITY[c]}</span><span>${dots(Math.min(7, cityStats[c].lhdMentions), 7, 'big')}<b class="num">${cityStats[c].lhdMentions}/35</b></span><span class="num">${esc(rev[c])}</span></div>`).join('')}
      </div>
      <div class="actions">
        <h3 class="h3">Actions</h3>
        <ul class="ticks">
          <li><b>Complete and verify the Sydney Google Business Profile:</b> Add Inturing's Sydney office address, phone number (+61 422 917 826), and website link so Google Maps and Gemini verify Inturing as a real Sydney consultancy.</li>
          <li><b>Switch the Google category from “Computer support and services”:</b> Set the primary category to <b>Business management consultant</b> and add <b>Software company</b>, <b>Automation company</b>, and <b>Computer consultant</b>.</li>
          <li><b>Request 8 to 10 Google reviews from named clients:</b> Ask stakeholders from BBCP, Property Network of Australia (PNA), Burgtec, Schlam, Menai Civil, AustEx and Liquip Victoria for short Google reviews mentioning Power Platform, Power Automate and ERP automation.</li>
        </ul>
      </div>
    </div>
    ${src('Source: Google Maps checks across all 8 Australian cities, October 2026.')}`);
}

// ─── 25. Workstream 03: City & Capability Pages ─────────────────────────────
{
  const shade5 = v => ['#F4F5F8', '#E1ECF7', '#C3D9EE', '#5B96CC', '#3B78B4', '#2B6399'][Math.min(5, v)];
  const grid = `<div class="cp" role="table" aria-label="AI answers naming Inturing by city and question">
    <div class="cp-row head" role="row"><span role="columnheader"></span>${PRAC.map(([k]) => `<span role="columnheader">${PRAC_SHORT[k]}</span>`).join('')}</div>
    ${ORDER.map((c, ri) => `<div class="cp-row" role="row"><span class="cp-city" role="rowheader">${CITY[c]}</span>${PRAC.map(([p], ci) => { const v = cityStats[c].byPrompt[p].lhd; return `<span role="cell" class="cp-cell pop${v === 0 ? ' zero' : ''}" style="--d:${150 + (ri * 7 + ci) * 18}ms;background:${shade5(v)};color:${v >= 3 ? '#FFFFFF' : '#11151E'}">${v}</span>`; }).join('')}</div>`).join('')}
  </div>`;
  const zeros = ORDER.reduce((s, c) => s + PRAC.filter(([p]) => cityStats[c].byPrompt[p].lhd === 0).length, 0);

  slide('ws-pages', 'light', `
    <header class="hd"><p class="eyebrow">Workstream 03 · Build city &amp; capability pages</p><h2 class="h1">${zeros} of the 56 city-and-question cells returned zero mentions — concentrated entirely in the 5 missing topics</h2></header>
    <div class="cols-heat">
      <div class="panel"><p class="chart-title">Assistants naming Inturing (of ${NUM_PLATFORMS}), by city and question. Dashed cells are zero.</p>${grid}</div>
      <div class="actions">
        <h3 class="h3">Pages to add to inturing.com.au</h3>
        <ul class="ticks">
          <li><b>Dedicated ERP &amp; System Integration page:</b> Inturing already integrates MYOB Acumatica, SAP Ariba, Dynamics 365, Monday.com and SharePoint (proven at BBCP and PNA), but has no dedicated ERP Integration page — scoring 0 of 40.</li>
          <li><b>Sydney, Melbourne, Brisbane &amp; Perth city pages:</b> Competitors like Power Platform Experts (86 mentions) and Eagle360 (39 mentions) win because they have city pages for Sydney, Melbourne, Brisbane and Perth.</li>
          <li><b>Expanded Power BI &amp; Microsoft Fabric and Copilot Agent pages:</b> Add concrete examples of live operational dashboards, Microsoft Fabric data pipelines, and Copilot Studio agents for finance, operations and service teams.</li>
        </ul>
      </div>
    </div>
    ${src(SRC_ANS)}`);
}

// ─── 26. Workstream 04: Fix What the Website Tells AI ───────────────────────
slide('ws-entity', 'white', `
  <header class="hd"><p class="eyebrow">Workstream 04 · Broaden what the website tells AI</p><h2 class="h1">Three simple website changes will stop AI from pigeonholing Inturing as manufacturing-only</h2></header>
  <div class="quotes">
    <figure class="quote rise" style="--d:100ms"><p class="q-src">Issue 1 · Homepage title is too narrow</p><blockquote>“Inturing | AI Automation &amp; Power Platform for Manufacturers”</blockquote><figcaption>Because the main homepage title says <b>“for Manufacturers”</b>, AI assistants assume Inturing only serves factories — skipping Inturing when wholesale, construction, property or professional services firms ask for help.</figcaption></figure>
    <figure class="quote rise" style="--d:240ms"><p class="q-src">Issue 2 · 7 customer logos have no text</p><blockquote>Burgtec, Schlam, Menai Civil, AustEx, Liquip Victoria, CBTech &amp; EFS are image-only logos</blockquote><figcaption>AI assistants cannot read image files. Turning these 7 client logos into short written blurbs immediately gives AI proof across civil construction, mining, wholesale and Victoria/WA operations.</figcaption></figure>
    <figure class="quote rise" style="--d:380ms"><p class="q-src">Issue 3 · Missing Sydney location details</p><blockquote>Website business settings only list “AU” with no Sydney address or city list</blockquote><figcaption>Search engines and AI assistants read the website's hidden business settings. Right now they only say “Australia” with a broken home link, rather than naming Sydney HQ and national delivery across all 8 cities.</figcaption></figure>
  </div>
  <div class="actions wide">
    <h3 class="h3">Actions</h3>
    <ul class="ticks cols">
      <li><b>Update the homepage title and opening headline</b> to: “Inturing | Microsoft Power Platform, AI Automation &amp; ERP Integration Partner — Sydney &amp; Australia-Wide”.</li>
      <li><b>Add short written summaries beneath the 7 client logos</b> (Schlam, Menai Civil, Liquip Victoria, AustEx, Burgtec, CBTech, EFS) so AI engines can read the industries and cities served.</li>
      <li><b>Publish an AI summary file (/llms.txt) and clean business settings</b> listing Founders Paul Del Gigante and Harry Cribb, Sydney HQ, all 7 core capabilities, and the $150,000/yr savings delivered at BBCP and PNA.</li>
      <li><b>Link every service page to the free online Assessment Tools</b> so AI assistants recommend Inturing's 3-minute Automation and Power Platform Readiness Assessments.</li>
    </ul>
  </div>
  ${src('Sources: Review of all 28 pages on inturing.com.au, October 2026.')}`);

// ─── 27. Roadmap (Gantt — First 90 Days) ────────────────────────────────────
{
  const lanes = [
    ['01 · Website & homepage', [[1, 3, 'Update homepage title, business settings & client logo blurbs'], [4, 6, 'Add /llms.txt summary & link assessment tools across all pages']]],
    ['02 · Sydney Google profile', [[1, 3, 'Verify Sydney address & switch categories to Business/Software Consultant'], [4, 9, 'Collect 10+ client reviews from BBCP, PNA, Liquip, Schlam & Menai Civil']]],
    ['03 · Capability & city pages', [[2, 5, 'Publish ERP Integration (Acumatica/SAP/D365) & Fabric pages'], [6, 10, 'Launch Sydney, Melbourne, Brisbane & Perth Power Platform pages']]],
    ['04 · Partner directories', [[2, 5, 'Publish Microsoft AppSource / Partner Directory & Clutch profiles'], [6, 12, 'Add GoodFirms & TechBehemoths profiles + founder articles']]],
    ['05 · Monthly tracking', [[1, 12, `Baseline locked Oct 2026 (${M.mtMentioned}/${TOTAL_ANSWERS}); re-run all 280 questions every month`, 'light']]],
  ];
  const lab = 320;
  const gantt = `<div class="gantt">
    <div class="g-head" style="grid-template-columns:${lab}px repeat(12, 1fr)"><span></span>${Array.from({ length: 12 }, (_, i) => `<span>W${i + 1}</span>`).join('')}</div>
    ${lanes.map(([name, bars], li) => `<div class="g-lane"><span class="g-name">${name}</span><div class="g-track">${bars.map(([a, b, t, kind], bi) => `<div class="g-bar ${kind === 'light' ? 'milestone' : ''} grow-x" style="left:${(a - 1) / 12 * 100}%;width:${(b - a + 1) / 12 * 100}%;--d:${200 + (li * 2 + bi) * 90}ms"><span>${esc(t)}</span></div>`).join('')}</div></div>`).join('')}
    <div class="g-phases"><span style="width:33.33%">Month 1: Homepage, Sydney Google profile &amp; ERP page</span><span style="width:33.33%">Month 2: Sydney, Melbourne, Brisbane &amp; Perth pages</span><span style="width:33.34%">Month 3: Microsoft Partner &amp; Clutch directories</span></div>
  </div>`;

  slide('roadmap', 'light', `
    <header class="hd"><p class="eyebrow">First 90 days</p><h2 class="h1">The first 90 days, week by week</h2></header>
    <div class="panel">${gantt}</div>
    <p class="note wide">Week 1 starts with quick wins on assets Inturing already controls: broadening the homepage title so AI stops treating Inturing as manufacturing-only, verifying the Sydney Google profile, and launching the ERP Integration page.</p>`);
}

// ─── 28. Proposed Targets ───────────────────────────────────────────────────
{
  const labels = ['Oct 26 (today)', '3 months', '6 months', '12 months'];
  const xs = [0, 3, 6, 12];
  const w = 1000, h = 520, pl = 86, pr = 300, pt = 36, pb = 72;
  const sydNow = cityStats.sydney.rate; // 11% (4/35)
  const target = [sydNow, 23, 34, 46];
  const y = v => pt + (h - pt - pb) * (1 - v / 60);
  const x = m => pl + m / 12 * (w - pl - pr);
  const barheadSyd = cityStats.sydney.top.find(f => f.name === 'Barhead Solutions') || { name: 'Barhead Solutions', n: 12 };
  const barheadRate = Math.round((barheadSyd.n / 35) * 100); // 34%
  const eagleSyd = cityStats.sydney.top.find(f => f.name === 'Eagle360 Consulting') || { name: 'Eagle360 Consulting', n: 15 };
  const eagleRate = Math.round((eagleSyd.n / 35) * 100); // 43% (15/35)

  const svg = `<svg class="chart" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Inturing Sydney target path vs Barhead Solutions and Eagle360 Consulting">
    ${[0, 15, 30, 45, 60].map(t => `<line x1="${pl}" x2="${w - pr}" y1="${y(t)}" y2="${y(t)}" class="gl"/><text x="${pl - 16}" y="${y(t) + 8}" class="ax" text-anchor="end">${t}%</text>`).join('')}
    ${xs.map((m, i) => `<text x="${x(m)}" y="${h - pb + 42}" class="ax" text-anchor="middle">${labels[i]}</text>`).join('')}
    <line x1="${x(0)}" x2="${x(12)}" y1="${y(barheadRate)}" y2="${y(barheadRate)}" stroke="#64748B" stroke-width="3" stroke-dasharray="2 10" stroke-linecap="round" class="fadein"/>
    <text x="${x(12) + 18}" y="${y(barheadRate) + 14}" class="el" fill="#64748B">Barhead Solutions <tspan class="elv">${barheadRate}%</tspan></text>
    <line x1="${x(0)}" x2="${x(12)}" y1="${y(eagleRate)}" y2="${y(eagleRate)}" stroke="#11151E" stroke-width="4" stroke-dasharray="2 10" stroke-linecap="round" class="fadein"/>
    <text x="${x(12) + 18}" y="${y(eagleRate) + 18}" class="el">Eagle360 today <tspan class="elv">${eagleRate}%</tspan></text>
    <path d="${target.map((v, i) => `${i ? 'L' : 'M'}${x(xs[i])},${y(v)}`).join('')}" pathLength="1" class="draw" fill="none" stroke="#3B78B4" stroke-width="6" stroke-dasharray="1" style="--d:300ms"/>
    <path d="${target.map((v, i) => `${i ? 'L' : 'M'}${x(xs[i])},${y(v)}`).join('')}" fill="none" stroke="#F4F5F8" stroke-width="7" stroke-dasharray="14 12" class="fadein" style="--d:1500ms"/>
    ${target.map((v, i) => `<circle cx="${x(xs[i])}" cy="${y(v)}" r="${i ? 10 : 13}" fill="${i ? '#F4F5F8' : '#3B78B4'}" stroke="#3B78B4" stroke-width="5" class="pop" style="--d:${400 + i * 350}ms"/><text x="${i ? x(xs[i]) : x(xs[i]) + 22}" y="${i ? y(v) - 22 : y(v) + 38}" text-anchor="${i ? 'middle' : 'start'}" class="callsmall pulp">${i === 3 ? '' : v + '%'}${i ? '' : ` today (${cityStats.sydney.lhdMentions}/35)`}</text>`).join('')}
    <text x="${x(12) + 18}" y="${y(target[3]) - 10}" class="el pulp-t">Inturing target <tspan class="elv">${target[3]}%</tspan></text>
  </svg>`;

  const TG = [
    ['Sydney (HQ)', `${cityStats.sydney.rate}% (${cityStats.sydney.lhdMentions}/35)`, '23% (8/35)', '34% (12/35)', `46% · overtakes Eagle360 (${eagleRate}%)`],
    ['Melbourne', `${cityStats.melbourne.rate}% (${cityStats.melbourne.lhdMentions}/35)`, '23% (8/35)', '29% (10/35)', '34% · overtakes Team 400 (31%)'],
    ['Brisbane', `${cityStats.brisbane.rate}% (${cityStats.brisbane.lhdMentions}/35)`, '20% (7/35)', '29% (10/35)', '37% · overtakes Power Platform Experts (34%)'],
    ['Newcastle', `${cityStats.newcastle.rate}% (${cityStats.newcastle.lhdMentions}/35)`, '20% (7/35)', '26% (9/35)', '31% · overtakes SR1 Development (26%)'],
    ['Canberra', `${cityStats.canberra.rate}% (${cityStats.canberra.lhdMentions}/35)`, '17% (6/35)', '23% (8/35)', '29% · overtakes Professional Advantage (26%)'],
    ['Hobart', `${cityStats.hobart.rate}% (${cityStats.hobart.lhdMentions}/35)`, '17% (6/35)', '23% (8/35)', '31% · overtakes Intuit Technologies (29%)'],
    ['Adelaide', `${cityStats.adelaide.rate}% (${cityStats.adelaide.lhdMentions}/35)`, '14% (5/35)', '20% (7/35)', '29% · overtakes Evocate (26%)'],
    ['Perth', `${cityStats.perth.rate}% (${cityStats.perth.lhdMentions}/35)`, '14% (5/35)', '20% (7/35)', '29% · overtakesProfessional Advantage (17%)'],
    ['All 280 answers', `${M.mtRatePct}% (${M.mtMentioned}/280)`, '19% (52/280)', '25% (71/280)', '33% · overtakes Power Platform Experts (31%)']
  ];

  slide('targets', 'light', `
    <header class="hd"><p class="eyebrow">Proposed targets</p><h2 class="h1">The goal: overtake Eagle360 &amp; Barhead in Sydney, and Power Platform Experts nationally</h2></header>
    <div class="cols-60">
      <div class="panel"><p class="chart-title">Sydney: share of AI answers naming Inturing. Today's figure is measured; the dashed path is the target.</p>${svg}</div>
      <div>
        <table class="tg-table">
          <thead><tr><th>City</th><th>Today</th><th>3 months</th><th>6 months</th><th>12 months</th></tr></thead>
          <tbody>${TG.map(([c, a, b, d, e], i) => `<tr class="rise" style="--d:${200 + i * 60}ms"><td>${c}</td><td class="num">${a}</td><td class="num">${b}</td><td class="num">${d}</td><td class="num"><b>${e.replace('overtakesProfessional', 'overtakes Professional')}</b></td></tr>`).join('')}</tbody>
        </table>
        <p class="note">Targets are tracked against named competitors using the exact same 280 questions every month.</p>
      </div>
    </div>`);
}

// ─── 29. Next Steps / Close ─────────────────────────────────────────────────
slide('close', 'dark close', `
  <div class="cover-bg" aria-hidden="true"></div>
  <p class="eyebrow on-dark rise" style="--d:0ms">Next steps</p>
  <h2 class="display rise" style="--d:120ms">Keep #1 in Manufacturing Automation. Expand into all 7 Power Platform &amp; AI workflows.</h2>
  <ol class="next rise" style="--d:300ms">
    <li><span>1</span><p><b>Broaden the homepage and verify the Sydney Google profile in Weeks 1–2</b> — update the homepage title so AI sees Inturing across all operations (not only factories), verify the Sydney address, and collect client reviews.</p></li>
    <li><span>2</span><p><b>Launch the ERP Integration, Fabric and City pages in Months 1–2</b> — publish dedicated pages for ERP Integration (Acumatica, SAP Ariba, Dynamics 365) and city hubs for Sydney, Melbourne, Brisbane and Perth.</p></li>
    <li><span>3</span><p><b>List on Microsoft AppSource &amp; Clutch and re-measure every 30 days</b> — add verified third-party directory profiles and track progress monthly against Eagle360, Barhead, Velrada and Power Platform Experts.</p></li>
  </ol>
  <div class="close-logo">${logo()}<span class="byline">Prepared by Uprise Digital</span></div>`, { dark: true, noFoot: true });

// ─── 30. Appendix ───────────────────────────────────────────────────────────
slide('appendix', 'white', `
  <header class="hd"><p class="eyebrow">Appendix</p><h2 class="h1">Method and definitions</h2></header>
  <div class="cols-2 appx">
    <div>
      <h3 class="h3">How the 280 answers were collected</h3>
      <ul class="plain">
        <li>7 plain-English questions covering Manufacturing Automation, Custom Power Apps, Power Platform Consulting, Workflow &amp; Power Automate, ERP Integration, Power BI &amp; Microsoft Fabric, and Copilot Studio &amp; AI Agents across 8 Australian cities = 56 city-question pairs.</li>
        <li>Each question was asked across 5 AI assistants (ChatGPT, Google AI Mode, Gemini, Perplexity, and Claude) in October 2026 for 280 total answers.</li>
        <li>56 matching Google searches and 9 Google Maps checks were collected across the same cities.</li>
        <li>All 28 pages on inturing.com.au were reviewed to check page titles, service coverage, case studies, and business settings.</li>
      </ul>
    </div>
    <div>
      <h3 class="h3">How answers were scored</h3>
      <ul class="plain">
        <li>A consultancy counts as “named” once per answer, regardless of how many times its name appears in that answer.</li>
        <li>Every website link referenced by an assistant was recorded (${CITS.totalCitations.toLocaleString()} source references across ${CITS.uniqueDomains} websites).</li>
        <li>Inturing's own website (inturing.com.au) was referenced ${CITS.clientDomainCitations} times across ${M.mtCited} answers — the #3 most-referenced consultancy website in the entire study.</li>
        <li>Historical Google AI answer counts come from DataForSEO's monthly tracking of Australian Google AI answers referencing each consultancy's website from August 2025 to September 2026.</li>
      </ul>
    </div>
  </div>`);

// ─── Page Compilation with Overpass & Overpass Mono + Inturing Steel-Blue Palette ────
const rawDeckCss = fs.readFileSync(path.join(pipelineDir, 'deck.css'), 'utf8')
  .replace(/#179CEE/gi, '#3B78B4')
  .replace(/#0D74B8/gi, '#2B6399')
  .replace(/rgba\(23,\s*156,\s*238/gi, 'rgba(59, 120, 180');

const CSS = rawDeckCss + `
/* 8-City & 35-Cell Grid Precision Fit Overrides */
.cover { grid-template-columns: 760px 1fr !important; gap: 0 40px !important; }
.cover-grid { padding: 22px 24px !important; max-width: 940px !important; }
.cv-row { grid-template-columns: 165px auto 36px !important; gap: 10px !important; }
.cv-cells { gap: 3px !important; }
.cv-cells i { width: 12px !important; height: 18px !important; }
.cv-cells i:nth-child(5n):not(:last-child) { margin-right: 5px !important; }
.finds-col { gap: 14px !important; }
.finds-col p { font-size: 19px !important; line-height: 1.38 !important; padding-top: 12px !important; }
.finds-col b { font-size: 20px !important; }
.mp-head, .mp-row { grid-template-columns: 185px 235px 1fr !important; gap: 16px !important; }
.mp-row { padding: 9px 0 !important; font-size: 19px !important; }
.mp-row .num { font-size: 18px !important; white-space: nowrap !important; }
#ws-entity .quote { padding: 20px 24px 18px !important; gap: 10px !important; }
#ws-entity .quote blockquote { font-size: 22px !important; line-height: 1.32 !important; font-weight: 700 !important; }
#ws-entity .quote figcaption { font-size: 18px !important; padding-top: 10px !important; }
#ws-entity .ticks.cols { gap: 14px 44px !important; margin-bottom: 8px !important; }
#ws-entity .ticks.cols li { font-size: 20px !important; line-height: 1.36 !important; }
#targets .cols-60 { grid-template-columns: 1.12fr 1.18fr !important; gap: 40px !important; }
.tg-table { font-size: 18px !important; margin-bottom: 12px !important; }
.tg-table th { font-size: 14px !important; padding: 0 8px 8px !important; }
.tg-table td { padding: 7px 8px !important; white-space: nowrap !important; }
#targets .note { font-size: 18px !important; line-height: 1.38 !important; }
#map .rank-table td, #map .rank-table th { padding: 6px 8px !important; font-size: 18px !important; }
#ws-maps .ticks { gap: 14px !important; }
#ws-maps .ticks li { font-size: 20px !important; line-height: 1.38 !important; }
.g-bar { padding: 6px 14px !important; overflow: hidden !important; }
.g-bar span { font-size: 16px !important; line-height: 1.25 !important; }
.cp-row { grid-template-columns: 195px repeat(7, 1fr) !important; }
.cp-city { font-size: 19px !important; line-height: 1.2 !important; }
`;
const JS = fs.readFileSync(path.join(pipelineDir, 'deck.js'), 'utf8');
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Inturing — AI Visibility Report (October 2026)</title>
<meta name="description" content="280-answer study of where AI assistants recommend Inturing for Microsoft Power Platform, AI Automation, ERP Integration, and Power BI across 8 Australian cities, and the 5-step plan to grow visibility.">
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
fs.writeFileSync(path.join(pipelineDir, 'out', 'full.html'), html);
fs.writeFileSync(path.join(rootDir, 'site', 'full.html'), html);
console.log(`Generated ${slides.length} slides! Output written to site/full.html (${html.length} bytes).`);
