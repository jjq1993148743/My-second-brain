
import fs from 'node:fs';
const raw = JSON.parse(fs.readFileSync('_hn_raw.json','utf8'));
console.log('raw', raw.length);
// Filter: title contains a money figure or revenue-ish keyword
const MONEY = /\$\s?\d[\d,]*(?:\.\d+)?\s?(?:k|K|m|M|\/mo|per month|a month|MRR|ARR|month)?|\$\d+k|MRR|ARR|revenue|passive income|first \$|side income|\$\d+\/mo/i;
const hasMoney = /(?:\$\s?\d[\d,\.]*\s?(?:k|m)?\b(?:\/|\s?per\s?|\s?a\s?)?(?:mo|month)?|\bMRR\b|\bARR\b|revenue|passive income)/i;
const hits = raw.filter(h => hasMoney.test(h.title));
console.log('with money in title:', hits.length);
hits.sort((a,b)=>b.points-a.points);
for (const h of hits.slice(0,60)) {
  console.log((h.points+'').padStart(4), '|', h.title.slice(0,100));
}
fs.writeFileSync('_hn_money.json', JSON.stringify(hits, null, 1), 'utf8');
// also domain histogram
const dom = {};
for (const h of hits) {
  try { const d = new URL(h.url).hostname.replace(/^www\./,''); if(d) dom[d]=(dom[d]||0)+1; } catch(e){ dom['(text-post)']=(dom['(text-post)']||0)+1; }
}
const top = Object.entries(dom).sort((a,b)=>b[1]-a[1]).slice(0,25);
console.log('\nTOP DOMAINS:'); for (const [d,c] of top) console.log(' ', c, d);
