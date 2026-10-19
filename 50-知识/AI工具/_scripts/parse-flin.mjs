import fs from 'node:fs';
import path from 'node:path';
const dir = process.argv[2] || '_raw_flin';
const out = process.argv[3] || '_flin_projects.json';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html')).sort();
const all = [];
const seen = new Set();
for (const f of files) {
  const html = fs.readFileSync(path.join(dir, f), 'utf8');
  const text = html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ')
    .replace(/<[^>]+>/g,'\n').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&rsquo;/g,"'").replace(/&bull;/g,'-').replace(/&mdash;/g,'-');
  const lines = text.split('\n').map(s=>s.trim()).filter(s=>s.length>0);
  const uniq = [];
  for (const l of lines) if (uniq[uniq.length-1] !== l) uniq.push(l);

  for (let i = 0; i < uniq.length; i++) {
    const l = uniq[i];
    // 预算行
    const moneyMatch = l.match(/^([₹$€£]\s?[0-9][0-9,]*(?:\.[0-9]{2})?(?:\s?-\s?[₹$€£]?\s?[0-9][0-9,]*)?(?:\s?\/\s?hr)?)$/);
    if (!moneyMatch) continue;
    // 前一行常是技能标签，往后找 bids
    let bids = null, title = '';
    for (let j = i + 1; j < Math.min(i + 5, uniq.length); j++) {
      const bm = uniq[j].match(/^([0-9]+)\s*bids?$/i);
      if (bm) { bids = +bm[1]; break; }
    }
    // 标题：从 money 往前找最长的一句（>20字，非技能词）
    for (let j = i - 1; j > Math.max(0, i - 12); j--) {
      const c = uniq[j];
      if (c.length > 25 && /[a-z]/i.test(c) && !/^[A-Z][a-z]+(\s[A-Z][a-z]+)*$/.test(c)) { title = c; break; }
    }
    const key = title.slice(0, 40) + '|' + moneyMatch[1];
    if (seen.has(key)) continue;
    seen.add(key);
    all.push({ title: title.slice(0, 160), budget: moneyMatch[1], bids, source: f });
  }
}
fs.writeFileSync(out, JSON.stringify(all, null, 1), 'utf8');
console.log('EXTRACTED=' + all.length);
const withBids = all.filter(a => a.bids !== null).length;
const withTitle = all.filter(a => a.title.length > 20).length;
console.log('withBids=' + withBids + ' withTitle=' + withTitle);
for (const a of all.slice(0,5)) console.log('  [' + a.budget + '] bids=' + a.bids + ' | ' + a.title.slice(0,70));