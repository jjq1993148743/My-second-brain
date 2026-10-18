import { get, gbk, strip, sleep } from './proxy-fetch.mjs';
import fs from 'node:fs';

const ROSTER = JSON.parse(fs.readFileSync('_fb_roster.json', 'utf8'));
const OUT = '_fb_domains.json';

let out = [];
try { out = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch {}
const done = new Set(out.map(r => r.id));

let n = 0;
for (const b of ROSTER) {
  if (done.has(b.id)) continue;
  n++;
  const rec = { id: b.id, name: b.name, cat: b.cat || '', domains: [], status: 0 };
  try {
    const r = await get('https://www.foreverblog.cn/blog/' + b.id + '.html', 'text/html,*/*');
    rec.status = r.status;
    const h = r.body.toString('utf8');
    const ls = [...h.matchAll(/href="(https?:\/\/([^\/"]+))/g)].map(m => m[2])
      .filter(d => !/foreverblog|gravatar|miit|qq\.com|beian|google|gstatic|w3\.org/i.test(d));
    rec.domains = [...new Set(ls)].map(d => d.replace(/^www\./, ''));
  } catch (e) { rec.status = -1; }
  out.push(rec);
  if (n % 40 === 0) { fs.writeFileSync(OUT, JSON.stringify(out), 'utf8'); console.log('[' + n + '/' + ROSTER.length + '] ' + b.name + ' -> ' + rec.domains.slice(0, 2).join(',')); }
  await sleep(280 + Math.random() * 220);
}
fs.writeFileSync(OUT, JSON.stringify(out), 'utf8');
const totalDomains = new Set();
for (const r of out) for (const d of r.domains) totalDomains.add(d);
console.log('FB-DOMAINS-COMPLETE totalBlogs=' + out.length + ' uniqueDomains=' + totalDomains.size);
