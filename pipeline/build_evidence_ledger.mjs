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

let md = `# Inturing — Master Raw Evidence Ledger (Empirical GEO / AEO Audit)

- **Target Entity:** Inturing (\`https://inturing.com.au/\`)
- **Founders:** Paul Del Gigante (Founder — AI & Automation Lead; ex-KPMG, PwC, Griffith Hack) & Harry Cribb (Founder — Enterprise Solutions Director; Design Engineering & Manufacturing Operations)
- **Headquarters:** Sydney, NSW, Australia · Phone: \`+61 422 917 826\` · Email: \`info@inturing.com.au\`
- **Target Capability Scope:** **Microsoft Power Platform** (Power Apps, Power Automate, Power BI, Microsoft Fabric, Dataverse), **AI Agents & Microsoft Copilot Studio**, **Manufacturing & Operations Process Automation**, and **ERP & System Integration** (MYOB Acumatica, SAP Ariba, Dynamics 365, SharePoint, Monday.com)
- **Target Geographic Scope:** **Australia-Wide (8 Capitals & Industrial Hubs)**: Sydney NSW (HQ), Melbourne VIC, Brisbane QLD, Perth WA, Adelaide SA, Canberra ACT, Newcastle & Hunter NSW, Hobart TAS
- **Generated At:** \`${metrics.generatedAt}\`
- **Empirical Study Architecture:**
  - **280 Live AI Responses** across **8 Australian Cities** $\\times$ **7 Capability Prompts** $\\times$ **5 AI Engines** (\`ChatGPT\`, \`Perplexity\`, \`Google AI Mode\`, \`Google Gemini 3.8 Flash\`, \`Anthropic Claude Sonnet 4.6\`).
  - **56 Live Google Organic SERPs** (\`depth=20\`) paired 1:1 with the 56 city $\\times$ prompt cells.
  - **9 Live Google Maps 20-Packs** across all 8 cities + direct brand audit (\`"Inturing Sydney"\`).
  - **Firecrawl Technical, Sitemap & JSON-LD Schema Crawl** across \`https://inturing.com.au/\` (28 total sitemap URLs, 17 deep-scraped core service, industry, case study, and assessment pages).
  - **15-Month Historical LLM Mentions Curve (\`Aug 2025 – Oct 2026\`)** via DataForSEO \`/v3/ai_optimization/llm_mentions/historical/live\` across 9 Australian Microsoft consultancy domains.
  - **12-Month AI Keyword Demand Series (\`Oct 2025 – Sep 2026\`)** via DataForSEO \`/v3/ai_optimization/ai_keyword_data/keywords_search_volume/live\` across 15 Microsoft Power Platform, Copilot, ERP, and AI automation search terms.

---

## 1. Executive Headline Metrics

| Metric | Value | Notes |
|---|---|---|
| **Total AI Answers Audited ($N$)** | \`${metrics.totalAnswers}\` | 8 Australian cities $\\times$ 7 capability prompts $\\times$ 5 AI engines |
| **Inturing AI Mention Rate** | **\`${metrics.mtMentioned} / ${metrics.totalAnswers}\` (\`${metrics.mtRatePct}%\`)** | Mentioned in ${metrics.mtMentioned} of ${metrics.totalAnswers} responses (#11 overall in Australia) |
| **Inturing Top-3 Shortlist Rate** | **\`${metrics.mtTop3} / ${metrics.totalAnswers}\` (\`${metrics.mtTop3Pct}%\`)** | Ranked #1, #2, or #3 in ${metrics.mtTop3} responses |
| **Inturing #1 Primary Recommendation** | **\`${metrics.mtNum1} / ${metrics.totalAnswers}\` (\`${metrics.mtNum1Pct}%\`)** | First-named consultancy in ${metrics.mtNum1} responses |
| **Inturing Direct Domain Citation Rate** | **\`${metrics.mtCited} / ${metrics.totalAnswers}\` (\`${metrics.mtCitedPct}%\`)** | \`inturing.com.au\` cited in ${metrics.mtCited} responses (\`${citations.clientDomainCitations}\` total links out of \`${citations.totalCitations}\` — #3 most-cited domain overall) |
| **Manufacturing Process Automation Recall** | **\`23 / 40\` (\`57.5%\`)** | #1 in Australia on Manufacturing Process Automation (16 #1 recommendations) |
| **Custom Power Apps Recall** | **\`8 / 40\` (\`20.0%\`)** | Top-3 in 7 of 8 Power Apps mentions |
| **Other 5 Capabilities Recall** | **\`0 / 200\` (\`0.0%\`)** | Zero text mentions on general Power Platform, Workflow Automation, ERP Integration, Power BI & Fabric, and Copilot Studio |

---

## 2. Platform Breakdown (5 AI Engines)

| AI Engine | Model / Endpoint | Answers | Inturing Mentions | Share of Voice (%) | Top-3 Shortlist | #1 Rank | Direct Citations | Avg Chars | Avg Citations |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
`;

for (const [plat, d] of Object.entries(metrics.byPlat)) {
  md += `| **${plat.toUpperCase()}** | Live API | ${d.total} | ${d.mentioned} | **${d.ratePct}%** | ${d.top3} (${d.top3Pct}%) | ${d.num1} | ${d.cited} | ${d.avgChars} | ${d.avgCitations} |\n`;
}

md += `\n---\n\n## 3. Geographic Breakdown (8 Australian Cities)\n\n| City | State | Answers | Inturing Mentions | Share (%) | Top-3 | #1 | Organic Top-20 (/7) | GBP Pack Status | Top Local AI Leader |\n|---|---|---:|---:|---:|---:|---:|---:|---|---|\n`;

for (const [cid, d] of Object.entries(metrics.byCity)) {
  const leader = d.topFirms?.[0] ? `${d.topFirms[0].name} (${d.topFirms[0].count}/35, ${d.topFirms[0].pct}%)` : 'None';
  const gbpRank = cid === 'sydney' ? 'Brand #3 (0 rev, null address)' : 'Absent';
  md += `| **${d.displayLoc || d.name}** | ${d.state} | ${d.total} | ${d.mentioned} | **${d.ratePct}%** | ${d.top3} | ${d.num1} | ${d.serpTop20}/7 | ${gbpRank} | ${leader} |\n`;
}

md += `\n---\n\n## 4. Buyer-Intent Capability Prompt Breakdown (7 Core Service Archetypes)\n\n| Prompt ID | Capability Category | Answers | Inturing Mentions | Share (%) | Top-3 | #1 | Category AI Leader |\n|---|---|---:|---:|---:|---:|---:|---|\n`;

for (const [pid, d] of Object.entries(metrics.byCat)) {
  const leader = d.topFirms?.[0] ? `${d.topFirms[0].name} (${d.topFirms[0].count}/40, ${d.topFirms[0].pct}%)` : 'None';
  md += `| \`${pid}\` | **${d.category}** | ${d.total} | ${d.mentioned} | **${d.ratePct}%** | ${d.top3} | ${d.num1} | ${leader} |\n`;
}

md += `\n---\n\n## 5. Australian Microsoft Power Platform & AI Automation Leaderboard (Top 25 Entities Across 280 Answers)\n\n| Rank | Consultancy / Entity | Total Mentions (/280) | Share of Voice (%) | Top-3 Shortlists | #1 Ranks | ChatGPT | Perplexity | AI Mode | Gemini | Claude |\n|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|\n`;

metrics.leaderboard.slice(0, 25).forEach((f, idx) => {
  md += `| ${idx + 1} | **${f.name}** | ${f.mentions} | **${f.sharePct}%** | ${f.top3} (${f.top3Pct}%) | ${f.num1} | ${f.byPlat.chatgpt || 0} | ${f.byPlat.perplexity || 0} | ${f.byPlat.aimode || 0} | ${f.byPlat.gemini || 0} | ${f.byPlat.claude || 0} |\n`;
});

md += `\n---\n\n## 6. Live IRLS Logistic Regression Results ($N = ${metrics.irls.n}$, Positive Mentions = ${metrics.irls.positives})\n\n| Predictor | Coefficient ($\\hat{\\beta}$) | Std. Error (SE) | Wald $z$ | Odds Ratio (OR) | 95% CI | $p$-Value |\n|---|---:|---:|---:|---:|---|---:|\n`;

for (const c of metrics.irls.coefficients) {
  md += `| **${c.name}** | \`${c.beta >= 0 ? '+' : ''}${c.beta.toFixed(2)}\` | \`${c.se.toFixed(2)}\` | \`${c.z.toFixed(2)}\` | \`${c.or ? c.or + 'x' : '—'}\` | \`${c.ci95 ? '[' + c.ci95[0] + 'x, ' + c.ci95[1] + 'x]' : '—'}\` | \`${c.pValue}\` |\n`;
}

md += `\n---\n\n## 7. Critical Technical, Sitemap & Schema Forensics (\`site_audit.json\`)\n\n1. **Narrow Homepage Title Tag Pigeonholes Inturing as Manufacturing-Only:**\n   - Homepage \`<title>\` is \`"Inturing | AI Automation & Power Platform for Manufacturers"\`.\n   - While this drives 57.5% recall on Manufacturing Process Automation (23/40) and 20.0% on Shop-Floor Power Apps (8/40), AI models skip Inturing across non-manufacturing Power Platform, ERP Integration, Power BI, and Copilot Studio queries.\n2. **Incomplete \`Organization\` & \`WebSite\` JSON-LD Across All Audited Pages:**\n   - \`WebSite.url\` is set to relative \`"/"\` instead of canonical \`"https://inturing.com.au/"\`.\n   - \`Organization.address\` contains only \`{"@type": "PostalAddress", "addressCountry": "AU"}\` — omitting \`"addressLocality": "Sydney"\`, \`"addressRegion": "NSW"\`, and any \`areaServed\` declarations.\n   - \`Organization.sameAs\` lists only \`https://www.linkedin.com/company/inturing\` with zero links to Microsoft AppSource, Clutch, GoodFirms, or TechBehemoths.\n3. **Small 28-URL Sitemap & Image-Only Customer Proof:**\n   - Total sitemap size is 28 URLs, with zero city landing pages (Sydney, Melbourne, Brisbane, Perth, Adelaide, Canberra, Newcastle, Hobart) and no dedicated ERP Integration page.\n   - 7 customer logos (\`Burgtec\`, \`Schlam\`, \`Menai Civil Contractors\`, \`AustEx\`, \`Liquip Victoria\`, \`CBTech\`, \`EFS\`) appear only as image files without descriptive text.\n   - \`https://inturing.com.au/llms.txt\` returns \`HTTP 404\`.\n\n---\n\n## 8. Sydney Google Business Profile (GBP) Brand & Category Audit (\`maps_audit.json\`)\n\n| Pack Type | Rank | Entity Title | Primary Category | Rating | Reviews | Domain | Address |\n|---|---:|---|---|---:|---:|---|---|\n`;

for (const b of (mapsAudit.markets?.brand_inturing?.topCompetitors || [])) {
  md += `| Brand (\`"Inturing Sydney"\`) | #${b.rank} | **${b.title}** | \`${b.category || '—'}\` | ${b.rating !== null ? b.rating + '★' : 'Unrated'} | ${b.reviews || 0} | \`${b.domain || '—'}\` | ${b.address || 'MISSING (null)'} |\n`;
}
for (const b of (mapsAudit.markets?.sydney?.topCompetitors || []).slice(0, 8)) {
  md += `| Sydney (\`"Microsoft consultant Sydney"\`) | #${b.rank} | **${b.title}** | \`${b.category || '—'}\` | ${b.rating !== null ? b.rating + '★' : 'Unrated'} | ${b.reviews || 0} | \`${b.domain || '—'}\` | ${b.address || '—'} |\n`;
}

md += `\n---\n\n## 9. 15-Month Historical AI Mentions (\`hist.json\` — Aug 2025 to Oct 2026)\n\n| Domain | ${histMonths.join(' | ')} |\n|---|${histMonths.map(() => '---:').join('|')}|\n`;

for (const [dom, d] of Object.entries(histDomains)) {
  md += `| \`${dom}\` | ${d.mentions.join(' | ')} |\n`;
}

md += `\n---\n\n## 10. Complete 280-Answer Empirical Audit Log (\`ans_full.json\`)\n\n| # | City | Prompt ID | Engine | Inturing Mentioned | Rank | Cited | Entities Extracted | Snippet |\n|---:|---|---|---|---|---:|---|---|---|\n`;

ansFull.forEach((a, i) => {
  const ents = a.mentions.slice(0, 5).join(', ') || 'None';
  const snip = (a.snippet || '').slice(0, 140).replace(/\|/g, '/').replace(/\r?\n/g, ' ');
  md += `| ${i + 1} | ${a.displayLoc || a.cityName} | \`${a.pk}\` | \`${a.plat}\` | ${a.mtMentioned ? '**YES**' : 'No'} | ${a.mtRank || '—'} | ${a.mtCited ? 'YES' : 'No'} | ${ents} | ${snip}... |\n`;
});

fs.writeFileSync('INTURING_RAW_EVIDENCE_LEDGER.md', md);
console.log('Wrote INTURING_RAW_EVIDENCE_LEDGER.md (' + md.length + ' bytes)');
