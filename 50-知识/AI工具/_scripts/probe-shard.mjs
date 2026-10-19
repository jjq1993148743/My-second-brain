import { get, gbk, strip, sleep } from './proxy-fetch.mjs';
import fs from 'node:fs';

const IN = process.argv[2];
const OUT = process.argv[3];
if (!IN || !OUT) { console.log('usage: node probe-shard.mjs <in.json> <out.json>'); process.exit(1); }

const HOSTS = JSON.parse(fs.readFileSync(IN, 'utf8'));
let results = [];
try { results = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch {}
const done = new Set(results.map(r => r.host));

let n = 0;
for (const item of HOSTS) {
  const host = typeof item === 'string' ? item : item.host;
  const from = typeof item === 'string' ? 'shard' : (item.from || 'shard');
  if (!host || done.has(host)) continue;
  n++;
  const rec = { host, from, status: 0, len: 0, blocked: false, title: '' };
  try {
    const r = await get('https://' + host + '/', 'text/html,application/json,*/*');
    rec.status = r.status;
    rec.len = r.body.length;
    const raw = r.body.toString('utf8');
    const isGBK = /charset=.(gb2312|gbk)/i.test(raw.slice(0, 2000));
    const txt = isGBK ? gbk(r.body) : raw;
    const tm = /<title[^>]*>([^<]{2,80})</.exec(txt);
    rec.title = tm ? strip(tm[1]).slice(0, 70) : '';
    rec.blocked = /Just a moment|Attention Required|captcha|are a robot|Checking your browser|enable JavaScript|403 Forbidden/i.test(txt);
  } catch (e) { rec.status = -1; }
  results.push(rec);
  if (n % 20 === 0) { fs.writeFileSync(OUT, JSON.stringify(results), 'utf8'); console.log('[' + n + '/' + HOSTS.length + '] ' + host + ' -> ' + rec.status); }
  await sleep(300 + Math.random() * 250);
}
fs.writeFileSync(OUT, JSON.stringify(results), 'utf8');
const ok = results.filter(r => r.status >= 200 && r.status < 400 && !r.blocked && r.len > 500);
console.log('SHARD-COMPLETE new=' + n + ' total=' + results.length + ' usable=' + ok.length + ' out=' + OUT);
