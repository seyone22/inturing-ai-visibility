import fs from 'fs';
import path from 'path';
import { runIrlsLogisticRegression } from 'file:///C:/Users/SGSey/.gemini/config/skills/geo-ai-visibility-audit/scripts/04_compute_metrics_and_irls.mjs';

const CFG = JSON.parse(fs.readFileSync('client.config.json', 'utf8'));
const rawDir = path.resolve('pipeline/raw');
const mapsAudit = JSON.parse(fs.readFileSync('pipeline/maps_audit.json', 'utf8'));

// Comprehensive canonical dictionary of Australian Microsoft Power Platform, AI Automation, ERP Integration & Data Analytics consultancies
export const KNOWN_FIRMS = [
  ['Inturing', /\binturing\b|inturing\.com\.au/i, 'inturing.com.au'],
  ['Frontrow Technology', /\bfrontrow(?:\s+technology|\s+tech)?\b|frontrowtech\.com\.au/i, 'frontrowtech.com.au'],
  ['Power Platform Experts', /\bpower\s+platform\s+experts\b|powerplatformexperts\.com\.au/i, 'powerplatformexperts.com.au'],
  ['OfficePro Consulting', /\boffice\s*pro(?:\s+consulting)?\b|officeproconsulting\.com\.au/i, 'officeproconsulting.com.au'],
  ['Agile Insights', /\bagile\s+insights\b|agile-insights\.com\.au/i, 'agile-insights.com.au'],
  ['Report Simple', /\breport\s+simple\b|reportsimple\.com\.au/i, 'reportsimple.com.au'],
  ['Professional Advantage', /\bprofessional\s+advantage\b|\bpa\.com\.au\b/i, 'pa.com.au'],
  ['Barhead Solutions', /\bbarhead(?:\s+solutions)?\b|barhead\.com/i, 'barhead.com'],
  ['Leverage Technologies', /\bleverage\s+technologies\b|leveragetech\.com\.au/i, 'leveragetech.com.au'],
  ['Team 400', /\bteam\s*400\b|team400\.com\.au/i, 'team400.com.au'],
  ['Ultron Developments', /\bultron\s+developments\b|ultrondevelopments\.com\.au/i, 'ultrondevelopments.com.au'],
  ['Cloud Factory', /\bcloud\s+factory\b|cloudfactory\.com\.au/i, 'cloudfactory.com.au'],
  ['Eagle360 Consulting', /\beagle\s*360(?:\s+consulting)?\b|eagle360\.consulting/i, 'eagle360.consulting'],
  ['Velrada', /\bvelrada\b|velrada\.com/i, 'velrada.com'],
  ['Engage Squared', /\bengage\s+squared\b|\bengage2\b|engage2\.com\.au/i, 'engage2.com.au'],
  ['Alphavima', /\balphavima(?:\s+technologies)?\b|alphavima\.com/i, 'alphavima.com'],
  ['A1 Technologies', /\ba1\s+technologies\b|a1technologies\.com\.au/i, 'a1technologies.com.au'],
  ['CG TECH', /\bcg\s+tech\b|cgtech\.com\.au/i, 'cgtech.com.au'],
  ['Evocate', /\bevocate\b|evocate\.com\.au/i, 'evocate.com.au'],
  ['Bright Labs', /\bbright\s+labs\b|brightlabs\.com\.au/i, 'brightlabs.com.au'],
  ['OneKloudX', /\bone\s*kloud\s*x\b|onekloudx\.com\.au/i, 'onekloudx.com.au'],
  ['Office Experts Group', /\boffice\s+experts(?:\s+group)?\b|officeexperts\.com\.au/i, 'officeexperts.com.au'],
  ['AGER BI', /\bager\s+bi\b|agerbi\.com\.au/i, 'agerbi.com.au'],
  ['Marra', /\bmarra\b|marra\.com\.au/i, 'marra.com.au'],
  ['SR1 Development', /\bsr1\s+development\b|sr1development\.com/i, 'sr1development.com'],
  ['SSW', /\bssw(?:\s+consulting)?\b|ssw\.com\.au/i, 'ssw.com.au'],
  ['IOTAI', /\biotai\b|iotai\.com\.au/i, 'iotai.com.au'],
  ['Antares Solutions', /\bantares(?:\s+solutions)?\b|antaressolutions\.com\.au/i, 'antaressolutions.com.au'],
  ['AMBR IT', /\bambr\s+it(?:\s+consulting)?\b|ambrit\.com\.au/i, 'ambrit.com.au'],
  ['Intuit Technologies', /\bintuit\s+technologies\b|intuit\.net\.au/i, 'intuit.net.au'],
  ['Dynamic Aspect', /\bdynamic\s+aspect\b|dynamicaspect\.com\.au/i, 'dynamicaspect.com.au'],
  ['Avanade', /\bavanade\b|avanade\.com/i, 'avanade.com'],
  ['FutureAbility', /\bfuture\s*ability\b|futureability\.com\.au/i, 'futureability.com.au'],
  ['Arinco', /\barinco\b|arinco\.com\.au/i, 'arinco.com.au'],
  ['Ential', /\bential\b|ential\.com\.au/i, 'ential.com.au'],
  ['Austin Technology', /\baustin\s+technology\b|austintechnology\.com\.au/i, 'austintechnology.com.au'],
  ['Synenza', /\bsynenza\b|synenza\.com\.au/i, 'synenza.com.au'],
  ['Roar Data', /\broar\s+data\b|roardata\.com\.au/i, 'roardata.com.au'],
  ['Rapid Circle', /\brapid\s+circle\b|rapidcircle\.com/i, 'rapidcircle.com'],
  ['SolveBI', /\bsolve\s*bi\b|solvebi\.com\.au/i, 'solvebi.com.au'],
  ['Fusion5', /\bfusion\s*5\b|fusion5\.com\.au/i, 'fusion5.com.au'],
  ['MOJO Up', /\bmojo\s+up\b|mojoup\.io/i, 'mojoup.io'],
  ['Datawise', /\bdatawise\b|datawise\.com\.au/i, 'datawise.com.au'],
  ['TechBrain', /\btech\s*brain\b|techbrain\.com\.au/i, 'techbrain.com.au'],
  ['Prometix', /\bprometix\b|prometix\.com\.au/i, 'prometix.com.au'],
  ['Strategik', /\bstrategik\b|strategik\.com\.au/i, 'strategik.com.au'],
  ['iCatalyst', /\bicatalyst\b|icatalyst\.com\.au/i, 'icatalyst.com.au'],
  ['Brennan IT', /\bbrennan(?:\s+it)?\b|brennanit\.com\.au/i, 'brennanit.com.au'],
  ['Empirics', /\bempirics\b|empirics\.com\.au/i, 'empirics.com.au'],
  ['Artis Group', /\bartis\s+group\b|artisgroup\.com\.au/i, 'artisgroup.com.au'],
  ['Data#3', /\bdata\s*#\s*3\b|data3\.com/i, 'data3.com'],
  ['Insight Enterprises', /\binsight\s+enterprises\b|au\.insight\.com/i, 'au.insight.com'],
  ['DXC Technology', /\bdxc(?:\s+technology)?\b|dxc\.com/i, 'dxc.com'],
  ['KPMG', /\bkpmg\b|kpmg\.com/i, 'kpmg.com'],
  ['PwC', /\bpwc\b|pwc\.com\.au/i, 'pwc.com.au'],
  ['Deloitte', /\bdeloitte\b|deloitte\.com/i, 'deloitte.com'],
  ['Accenture', /\baccenture\b|accenture\.com/i, 'accenture.com'],
  ['SAGE Automation', /\bsage\s+automation\b|\bsage\s+group\b|gototheedge\.com/i, 'gototheedge.com'],
  [' Nukon', /\bnukon\b|nukon\.com/i, 'nukon.com'],
  ['Control Logic', /\bcontrol\s+logic\b|controllogic\.com\.au/i, 'controllogic.com.au'],
  ['365 Mechanix', /\b365\s+mechanix\b|365mechanix\.com\.au/i, '365mechanix.com.au'],
  ['MicroChannel', /\bmicro\s*channel\b|microchannel\.com\.au/i, 'microchannel.com.au'],
  ['Wiise', /\bwiise\b|wiise\.com/i, 'wiise.com'],
  ['Attaché /The Access Group', /\bthe\s+access\s+group\b|theaccessgroup\.com/i, 'theaccessgroup.com'],
  ['MYOB Enterprise Partners', /\bkilimanjaro\s+consulting\b|kilimanjaro-consulting\.com\.au/i, 'kilimanjaro-consulting.com.au'],
  ['Dialog Information Technology', /\bdialog\s+(?:it|information\s+technology)\b|dialog\.com\.au/i, 'dialog.com.au'],
  ['Atturra', /\batturra\b|atturra\.com/i, 'atturra.com'],
  ['BizData', /\bbizdata\b|bizdata\.com\.au/i, 'bizdata.com.au'],
  ['Three6', /\bthree6\b|three6\.com\.au/i, 'three6.com.au'],
  ['macanta', /\bmacanta\b|macanta\.com\.au/i, 'macanta.com.au']
];

function cleanDomain(urlStr) {
  try {
    const u = new URL(urlStr);
    return u.hostname.replace(/^www\./i, '').toLowerCase();
  } catch (_) {
    return '';
  }
}

function classifySourceType(domain) {
  if (!domain) return 'Other';
  if (domain === 'inturing.com.au') return 'Client Owned';
  if (/(clutch\.co|goodfirms\.co|techbehemoths\.com|designrush\.com|themanifest\.com|g2\.com|capterra\.com|softwareadvice\.com|sortlist\.com|upcity\.com|bark\.com|trustpilot\.com|productreview\.com\.au|yelp\.com\.au|localsearch\.com\.au|yellowpages\.com\.au|truelocal\.com\.au|hotfrog\.com\.au|australianbusinessdirectory\.com\.au)/i.test(domain)) return 'B2B Tech Directory / Review';
  if (/(microsoft\.com|appsource\.microsoft\.com|powerbi\.microsoft\.com|powerplatform\.microsoft\.com|learn\.microsoft\.com|partner\.microsoft\.com|gov\.au|csiro\.au|imcrc\.org|amgc\.org\.au)/i.test(domain)) return 'Vendor / Government / Standards';
  if (/(afr\.com|itnews\.com\.au|crn\.com\.au|arnnet\.com\.au|zdnet\.com|manufacturersmonthly\.com\.au|australianmanufacturing\.com\.au|smartcompany\.com\.au|forbes\.com|techrepublic\.com)/i.test(domain)) return 'Tech & Industry Media';
  if (/(reddit\.com|whirlpool\.net\.au|facebook\.com|linkedin\.com|youtube\.com|instagram\.com|medium\.com|github\.com)/i.test(domain)) return 'Social / Community';
  for (const [, , compDom] of KNOWN_FIRMS) {
    if (compDom && domain.includes(compDom)) return 'Competitor Consultancy';
  }
  if (/(consulting|tech|solutions|data|digital|cloud|power|automate|dynamics|software|it|analytics|bi)/i.test(domain)) return 'Competitor Consultancy';
  return 'Other Web Source';
}

function parsePlatformResponse(plat, rawObj) {
  let text = '';
  const citations = [];
  const addCit = (url, title) => {
    if (!url || !/^https?:\/\//i.test(url)) return;
    const domain = cleanDomain(url);
    if (!domain || domain.includes('vertexaisearch.cloud.google.com')) return;
    if (!citations.some(c => c.url === url)) {
      citations.push({ url, domain, title: title || domain, type: classifySourceType(domain) });
    }
  };

  const res = rawObj.result;
  if (!res) return { text, citations };

  if (plat === 'chatgpt') {
    const item = Array.isArray(res) ? res[0] : res;
    text = item?.markdown || '';
    if (!text && Array.isArray(item?.items)) {
      text = item.items.map(x => x.markdown || x.text || '').join('\n');
    }
    for (const s of (item?.sources || [])) addCit(s.url, s.title || s.source_name);
    for (const s of (item?.search_results || [])) addCit(s.url, s.title || s.domain);
  } else if (plat === 'perplexity') {
    const item = Array.isArray(res) ? res[0] : res;
    for (const it of (item?.items || [])) {
      for (const sec of (it?.sections || [])) {
        if (sec.text) text += sec.text + '\n';
        for (const a of (sec.annotations || [])) addCit(a.url, a.title);
      }
    }
  } else if (plat === 'aimode') {
    const item = Array.isArray(res) ? res[0] : res;
    for (const it of (item?.items || [])) {
      if (it.markdown) text += it.markdown + '\n';
      for (const sub of (it.items || [])) {
        if (sub.markdown) text += sub.markdown + '\n';
        for (const r of (sub.references || [])) addCit(r.url, r.title || r.source);
      }
      for (const r of (it.references || [])) addCit(r.url, r.title || r.source);
    }
  } else if (plat === 'gemini') {
    const cand = res.candidates?.[0];
    for (const part of (cand?.content?.parts || [])) {
      if (part.text) text += part.text + '\n';
    }
    const chunks = cand?.groundingMetadata?.groundingChunks || [];
    for (const ch of chunks) {
      if (ch.web?.uri) {
        const title = ch.web.title || '';
        const domFromTitle = /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(title.trim()) ? title.trim().replace(/^www\./i, '').toLowerCase() : '';
        if (domFromTitle) {
          citations.push({
            url: `https://${domFromTitle}`,
            domain: domFromTitle,
            title: title,
            type: classifySourceType(domFromTitle)
          });
        } else {
          addCit(ch.web.uri, title);
        }
      }
    }
  } else if (plat === 'claude') {
    if (Array.isArray(res.content)) {
      for (const block of res.content) {
        if (block.type === 'text' && block.text) {
          text += block.text + '\n';
          for (const cit of (block.citations || [])) {
            addCit(cit.url, cit.title);
          }
        } else if (block.type === 'web_search_tool_result' && Array.isArray(block.content)) {
          for (const sr of block.content) {
            addCit(sr.url, sr.title);
          }
        }
      }
    } else {
      const item = Array.isArray(res) ? res[0] : res;
      for (const it of (item?.items || [])) {
        for (const sec of (it?.sections || [])) {
          if (sec.text) text += sec.text + '\n';
          for (const a of (sec.annotations || [])) addCit(a.url, a.title);
        }
      }
    }
  }

  return { text: text.trim(), citations };
}

function extractMentions(text, citations) {
  const hay = (text + ' ' + citations.map(c => c.url + ' ' + c.title).join(' '));
  const found = [];
  for (const [rawName, rx] of KNOWN_FIRMS) {
    const name = rawName.trim();
    const m = rx.exec(hay);
    if (m) {
      found.push({ name, pos: m.index });
    }
  }
  found.sort((a, b) => a.pos - b.pos);
  return found.map((f, idx) => ({ name: f.name, rank: idx + 1, pos: f.pos }));
}

// 1. Parse all 56 SERPs first so we know organic rankings per (city, prompt)
const serpAudit = [];
const serpLookup = new Map();

for (const city of CFG.cities) {
  for (const prompt of CFG.prompts) {
    const serpFile = path.join(rawDir, `${city.id}__${prompt.id}__serp.json`);
    if (!fs.existsSync(serpFile)) continue;
    const raw = JSON.parse(fs.readFileSync(serpFile, 'utf8'));
    const items = raw.result?.[0]?.items || [];
    const organic = items.filter(x => x.type === 'organic').map((x, idx) => ({
      rank: idx + 1,
      rank_absolute: x.rank_absolute,
      domain: cleanDomain(x.url),
      url: x.url,
      title: x.title
    }));
    const intHit = organic.find(o => o.domain === 'inturing.com.au');
    const row = {
      city: city.id,
      cityName: city.name,
      displayLoc: city.displayLoc,
      pk: prompt.id,
      cat: prompt.category || prompt.title,
      keyword: raw.text,
      mtRank: intHit ? intHit.rank : null,
      mtUrl: intHit ? intHit.url : null,
      mtInTop10: Boolean(intHit && intHit.rank <= 10),
      mtInTop20: Boolean(intHit && intHit.rank <= 20),
      // Keep wf* aliases for compatibility with shared scripts
      wfRank: intHit ? intHit.rank : null,
      wfUrl: intHit ? intHit.url : null,
      wfInTop10: Boolean(intHit && intHit.rank <= 10),
      wfInTop20: Boolean(intHit && intHit.rank <= 20),
      top10: organic.slice(0, 10),
      top20: organic.slice(0, 20)
    };
    serpAudit.push(row);
    serpLookup.set(`${city.id}__${prompt.id}`, row);
  }
}

// 2. Map GBP attributes per city from maps_audit.json
const cityGbpMap = new Map();
for (const city of CFG.cities) {
  const branches = (mapsAudit.inturingBranches || []).filter(b => b.market === city.id);
  const bestReviews = branches.reduce((acc, b) => acc + (b.reviews || 0), 0);
  const ratedBranches = branches.filter(b => typeof b.rating === 'number');
  const maxRating = ratedBranches.length ? Math.max(...ratedBranches.map(b => b.rating)) : 0;
  const pack20 = mapsAudit[city.id]?.topCompetitors || [];
  const intInPack = pack20.find(p => /inturing/i.test(p.title || '') || (p.domain && p.domain.includes('inturing')));
  cityGbpMap.set(city.id, {
    branchCount: branches.length,
    totalReviews: bestReviews,
    maxRating,
    hasRatedGbp43Plus: maxRating >= 4.3 && bestReviews >= 5,
    inMapsPack20: Boolean(intInPack),
    mapsPackRank: intInPack ? intInPack.rank : null
  });
}

// 3. Parse all 280 AI answers
const ansFull = [];
const citationDomainCounts = new Map();
const citationUrlCounts = new Map();
const citationTypeCounts = new Map();
let totalCitations = 0;

const AI_PLATFORMS = ['chatgpt', 'perplexity', 'aimode', 'gemini', 'claude'];

for (const city of CFG.cities) {
  for (const prompt of CFG.prompts) {
    const serpRow = serpLookup.get(`${city.id}__${prompt.id}`);
    const gbpInfo = cityGbpMap.get(city.id) || {};
    for (const plat of AI_PLATFORMS) {
      const f = path.join(rawDir, `${city.id}__${prompt.id}__${plat}.json`);
      if (!fs.existsSync(f)) continue;
      const raw = JSON.parse(fs.readFileSync(f, 'utf8'));
      const { text, citations } = parsePlatformResponse(plat, raw);
      const mentions = extractMentions(text, citations);
      // Specifically check if Inturing is named in the visible answer text or cited
      const textMentionMatch = /\binturing\b|inturing\.com\.au/i.exec(text);
      const intMention = mentions.find(m => m.name === 'Inturing');
      const intCited = citations.some(c => c.domain === 'inturing.com.au');
      const isNamedInText = Boolean(textMentionMatch);

      for (const c of citations) {
        totalCitations++;
        citationDomainCounts.set(c.domain, (citationDomainCounts.get(c.domain) || 0) + 1);
        citationUrlCounts.set(c.url, (citationUrlCounts.get(c.url) || 0) + 1);
        citationTypeCounts.set(c.type, (citationTypeCounts.get(c.type) || 0) + 1);
      }

      const hasDirectoryCitation = citations.some(c => c.type === 'B2B Tech Directory / Review' || c.type === 'Vendor / Government / Standards' || c.type === 'Tech & Industry Media');

      ansFull.push({
        city: city.id,
        cityName: city.name,
        displayLoc: city.displayLoc,
        pk: prompt.id,
        cat: prompt.category || prompt.title,
        plat,
        prompt: raw.text,
        at: raw.at,
        cost: raw.cost || 0,
        chars: text.length,
        snippet: text.slice(0, 420).replace(/\s+/g, ' ').trim(),
        text: text,
        fullText: text,
        mtMentioned: isNamedInText,
        mtRank: isNamedInText && intMention ? intMention.rank : null,
        mtTop3: Boolean(isNamedInText && intMention && intMention.rank <= 3),
        mtNumber1: Boolean(isNamedInText && intMention && intMention.rank === 1),
        mtCited: intCited,
        // Keep wf* aliases for compatibility
        wfMentioned: isNamedInText,
        wfRank: isNamedInText && intMention ? intMention.rank : null,
        wfTop3: Boolean(isNamedInText && intMention && intMention.rank <= 3),
        wfNumber1: Boolean(isNamedInText && intMention && intMention.rank === 1),
        wfCited: intCited,
        mentions: mentions.map(m => m.name),
        mentionRanks: mentions,
        citations,
        citationCount: citations.length,
        // Predictors for live IRLS logistic regression
        inOrganicTop10: Boolean(serpRow?.mtInTop10),
        inOrganicTop20: Boolean(serpRow?.mtInTop20),
        hasThirdPartyCitation: hasDirectoryCitation,
        hasStrongGbpCity: Boolean(gbpInfo.hasRatedGbp43Plus),
        inMapsPack20: Boolean(gbpInfo.inMapsPack20)
      });
    }
  }
}

fs.writeFileSync('pipeline/serp_audit.json', JSON.stringify(serpAudit, null, 2));
fs.writeFileSync('pipeline/ans_full.json', JSON.stringify(ansFull, null, 2));

// 4. Build citations.json
const topDomains = [...citationDomainCounts.entries()]
  .map(([domain, count]) => ({ domain, count, sharePct: +((count / Math.max(1, totalCitations)) * 100).toFixed(2), type: classifySourceType(domain) }))
  .sort((a, b) => b.count - a.count);

const topUrls = [...citationUrlCounts.entries()]
  .map(([url, count]) => ({ url, domain: cleanDomain(url), count }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 50);

const byType = [...citationTypeCounts.entries()]
  .map(([type, count]) => ({ type, count, sharePct: +((count / Math.max(1, totalCitations)) * 100).toFixed(1) }))
  .sort((a, b) => b.count - a.count);

const citationsSummary = {
  totalCitations,
  uniqueDomains: citationDomainCounts.size,
  uniqueUrls: citationUrlCounts.size,
  clientDomainCitations: citationDomainCounts.get('inturing.com.au') || 0,
  byType,
  topDomains: topDomains.slice(0, 30),
  topUrls
};
fs.writeFileSync('pipeline/citations.json', JSON.stringify(citationsSummary, null, 2));

// 5. Compute aggregates + Live IRLS Logistic Regression for metrics.json
const N = ansFull.length;
const mtTotal = ansFull.filter(a => a.mtMentioned).length;
const mtTop3Total = ansFull.filter(a => a.mtTop3).length;
const mtNum1Total = ansFull.filter(a => a.mtNumber1).length;
const mtCitedTotal = ansFull.filter(a => a.mtCited).length;

const byPlat = {};
for (const p of AI_PLATFORMS) {
  const sub = ansFull.filter(a => a.plat === p);
  const m = sub.filter(a => a.mtMentioned).length;
  const t3 = sub.filter(a => a.mtTop3).length;
  const n1 = sub.filter(a => a.mtNumber1).length;
  const cit = sub.filter(a => a.mtCited).length;
  byPlat[p] = {
    total: sub.length,
    mentioned: m,
    ratePct: +((m / Math.max(1, sub.length)) * 100).toFixed(1),
    top3: t3,
    top3Pct: +((t3 / Math.max(1, sub.length)) * 100).toFixed(1),
    num1: n1,
    cited: cit,
    avgChars: Math.round(sub.reduce((s, a) => s + a.chars, 0) / Math.max(1, sub.length)),
    avgCitations: +(sub.reduce((s, a) => s + a.citationCount, 0) / Math.max(1, sub.length)).toFixed(1)
  };
}

const byCity = {};
for (const c of CFG.cities) {
  const sub = ansFull.filter(a => a.city === c.id);
  const m = sub.filter(a => a.mtMentioned).length;
  const t3 = sub.filter(a => a.mtTop3).length;
  const n1 = sub.filter(a => a.mtNumber1).length;
  const serpSub = serpAudit.filter(s => s.city === c.id);
  const serpTop10 = serpSub.filter(s => s.mtInTop10).length;
  const serpTop20 = serpSub.filter(s => s.mtInTop20).length;
  const compCounts = {};
  for (const a of sub) {
    for (const firm of a.mentions) {
      if (firm === 'Inturing' && !a.mtMentioned) continue;
      compCounts[firm] = (compCounts[firm] || 0) + 1;
    }
  }
  const topFirms = Object.entries(compCounts)
    .map(([name, count]) => ({ name, count, pct: +((count / Math.max(1, sub.length)) * 100).toFixed(1) }))
    .sort((a, b) => b.count - a.count);

  byCity[c.id] = {
    name: c.name,
    displayLoc: c.displayLoc,
    state: c.state,
    total: sub.length,
    mentioned: m,
    ratePct: +((m / Math.max(1, sub.length)) * 100).toFixed(1),
    top3: t3,
    top3Pct: +((t3 / Math.max(1, sub.length)) * 100).toFixed(1),
    num1: n1,
    serpTop10,
    serpTop20,
    serpTotal: serpSub.length,
    gbp: cityGbpMap.get(c.id),
    topFirms: topFirms.slice(0, 10)
  };
}

const byCat = {};
for (const p of CFG.prompts) {
  const sub = ansFull.filter(a => a.pk === p.id);
  const m = sub.filter(a => a.mtMentioned).length;
  const t3 = sub.filter(a => a.mtTop3).length;
  const n1 = sub.filter(a => a.mtNumber1).length;
  const compCounts = {};
  for (const a of sub) {
    for (const firm of a.mentions) {
      if (firm === 'Inturing' && !a.mtMentioned) continue;
      compCounts[firm] = (compCounts[firm] || 0) + 1;
    }
  }
  const topFirms = Object.entries(compCounts)
    .map(([name, count]) => ({ name, count, pct: +((count / Math.max(1, sub.length)) * 100).toFixed(1) }))
    .sort((a, b) => b.count - a.count);

  byCat[p.id] = {
    category: p.category || p.title,
    title: p.title,
    template: p.template,
    total: sub.length,
    mentioned: m,
    ratePct: +((m / Math.max(1, sub.length)) * 100).toFixed(1),
    top3: t3,
    num1: n1,
    topFirms: topFirms.slice(0, 8)
  };
}

// National competitor leaderboard across all 280 answers
const regionalComp = {};
for (const a of ansFull) {
  for (const mr of a.mentionRanks) {
    if (mr.name === 'Inturing' && !a.mtMentioned) continue;
    if (!regionalComp[mr.name]) {
      regionalComp[mr.name] = { name: mr.name, mentions: 0, top3: 0, num1: 0, byPlat: { chatgpt: 0, perplexity: 0, aimode: 0, gemini: 0, claude: 0 }, byCity: {}, byCat: {} };
    }
    regionalComp[mr.name].mentions++;
    if (mr.rank <= 3) regionalComp[mr.name].top3++;
    if (mr.rank === 1) regionalComp[mr.name].num1++;
    regionalComp[mr.name].byPlat[a.plat] = (regionalComp[mr.name].byPlat[a.plat] || 0) + 1;
    regionalComp[mr.name].byCity[a.city] = (regionalComp[mr.name].byCity[a.city] || 0) + 1;
    regionalComp[mr.name].byCat[a.pk] = (regionalComp[mr.name].byCat[a.pk] || 0) + 1;
  }
}
const leaderboard = Object.values(regionalComp)
  .map(f => ({
    ...f,
    sharePct: +((f.mentions / Math.max(1, N)) * 100).toFixed(1),
    top3Pct: +((f.top3 / Math.max(1, N)) * 100).toFixed(1)
  }))
  .sort((a, b) => b.mentions - a.mentions);

// Live IRLS Logistic Regression over all 280 empirical answers
// Predictors:
// X1: Named Operational Stack & Case Study Proof in Retrieval Context (MYOB Acumatica, SAP Ariba, BBCP, order-to-invoice, Canvas App)
// X2: Live Web Search Grounding Engine (ChatGPT Search, Perplexity Sonar, Google AI Mode vs non-citing synthesis)
// X3: Major East-Coast Industrial & Enterprise Hub (Sydney, Melbourne, Brisbane)
const predNames = [
  'Intercept (β₀)',
  'Named Operational Stack & Case Study Proof (X₁)',
  'Live Web-Search Grounding Engine (X₂)',
  'East-Coast Enterprise & Manufacturing Hub (X₃)'
];
const X = ansFull.map(a => [
  1,
  (/acumatica|ariba|bbcp|order-to-invoice|canvas\s+app/i.test(a.text)) ? 1 : 0,
  (a.plat === 'chatgpt' || a.plat === 'perplexity' || a.plat === 'aimode') ? 1 : 0,
  (a.city === 'sydney' || a.city === 'melbourne' || a.city === 'brisbane') ? 1 : 0
]);
const y = ansFull.map(a => (a.mtMentioned ? 1 : 0));
const rawCoefs = runIrlsLogisticRegression(X, y);
const irls = {
  n: N,
  positives: mtTotal,
  iterations: 30,
  coefficients: rawCoefs.map((c, idx) => ({
    name: predNames[idx],
    beta: c.beta,
    se: c.se,
    z: c.z,
    or: idx === 0 ? null : c.oddsRatio,
    ci95: idx === 0 ? null : [
      +Math.exp(c.beta - 1.96 * c.se).toFixed(2),
      +Math.exp(c.beta + 1.96 * c.se).toFixed(2)
    ],
    pValue: c.pValue < 0.001 ? '<0.001' : c.pValue.toFixed(4)
  }))
};

const metrics = {
  generatedAt: new Date().toISOString(),
  totalAnswers: N,
  totalSerps: serpAudit.length,
  mtMentioned: mtTotal,
  mtRatePct: +((mtTotal / Math.max(1, N)) * 100).toFixed(1),
  mtTop3: mtTop3Total,
  mtTop3Pct: +((mtTop3Total / Math.max(1, N)) * 100).toFixed(1),
  mtNum1: mtNum1Total,
  mtNum1Pct: +((mtNum1Total / Math.max(1, N)) * 100).toFixed(1),
  mtCited: mtCitedTotal,
  mtCitedPct: +((mtCitedTotal / Math.max(1, N)) * 100).toFixed(1),
  // Keep wf* aliases for shared template helpers
  wfMentioned: mtTotal,
  wfRatePct: +((mtTotal / Math.max(1, N)) * 100).toFixed(1),
  wfTop3: mtTop3Total,
  wfTop3Pct: +((mtTop3Total / Math.max(1, N)) * 100).toFixed(1),
  wfNum1: mtNum1Total,
  wfNum1Pct: +((mtNum1Total / Math.max(1, N)) * 100).toFixed(1),
  wfCited: mtCitedTotal,
  wfCitedPct: +((mtCitedTotal / Math.max(1, N)) * 100).toFixed(1),
  serpTop10Count: serpAudit.filter(s => s.mtInTop10).length,
  serpTop20Count: serpAudit.filter(s => s.mtInTop20).length,
  byPlat,
  byCity,
  byCat,
  leaderboard: leaderboard.slice(0, 30),
  irls
};

fs.writeFileSync('pipeline/metrics.json', JSON.stringify(metrics, null, 2));
console.log(`Parsed ${N} answers and ${serpAudit.length} SERPs.`);
console.log(`Inturing Mention Rate: ${mtTotal}/${N} (${metrics.mtRatePct}%), Top-3: ${mtTop3Total}/${N} (${metrics.mtTop3Pct}%), #1: ${mtNum1Total}, Cited: ${mtCitedTotal}`);
console.log(`Top 12 Firms across Australia:`, leaderboard.slice(0, 12).map(x => `${x.name}: ${x.mentions} (${x.sharePct}%)`).join(' | '));
console.log(`IRLS Coefficients:`, JSON.stringify(irls.coefficients));
