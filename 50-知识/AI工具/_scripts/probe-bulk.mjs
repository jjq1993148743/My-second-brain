import { get, gbk, strip, sleep } from './proxy-fetch.mjs';
import fs from 'node:fs';

const CATS = JSON.parse(fs.readFileSync('_candidates.json', 'utf8'));
const OUT = '_probe_bulk.json';

let results = [];
try { results = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch {}
const done = new Set(results.map(r => r.url));

const tasks = [];
for (const [cat, hosts] of Object.entries(CATS)) {
  for (const h of hosts) tasks.push({ cat, host: h });
}

let n = 0;
for (const t of tasks) {
  const url = 'https://' + t.host + '/';
  if (done.has(url)) continue;
  n++;
  const rec = { cat: t.cat, host: t.host, url, status: 0, len: 0, blocked: false, title: '', note: '' };
  try {
    const r = await get(url, 'text/html,application/json,*/*');
    rec.status = r.status;
    rec.len = r.body.length;
    const raw = r.body.toString('utf8');
    const isGBK = /charset=.(gb2312|gbk)/i.test(raw.slice(0, 2000));
    const txt = isGBK ? gbk(r.body) : raw;
    const tm = /<title[^>]*>([^<]{2,80})</.exec(txt);
    rec.title = tm ? strip(tm[1]).slice(0, 70) : '';
    rec.blocked = /Just a moment|Attention Required|captcha|are a robot|Checking your browser|enable JavaScript|403 Forbidden/i.test(txt);
    if (rec.status === 403 || rec.blocked) rec.note = 'blocked';
  } catch (e) {
    rec.status = -1;
    rec.note = e.message.slice(0, 45);
  }
  results.push(rec);
  if (n % 10 === 0) fs.writeFileSync(OUT, JSON.stringify(results), 'utf8');
  if (n % 25 === 0) console.log('[' + n + '/' + tasks.length + '] ' + t.host + ' -> ' + rec.status + ' ' + rec.len);
  await sleep(350 + Math.random() * 250);
}
fs.writeFileSync(OUT, JSON.stringify(results), 'utf8');
const ok = results.filter(r => r.status >= 200 && r.status < 400 && !r.blocked && r.len > 500);
console.log('BULK-PROBE-COMPLETE');
console.log('new: ' + n + ' | total: ' + results.length + ' | usable: ' + ok.length);
