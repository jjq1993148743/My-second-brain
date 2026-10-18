
// 循环实测全部域名，每批 40 个落盘，可断点续跑
import { get, strip, sleep } from './proxy-fetch.mjs';
import fs from 'node:fs';
const all = JSON.parse(fs.readFileSync('./_fb10_all.json', 'utf8'));
const CONC = 4;
async function probeOne(b) {
  const rec = { id: b.id, name: b.name, host: b.host, cat: b.cat, status: b.status, year: b.year,
    url: 'https://' + b.host + '/', http: 0, len: 0, title: '', blocked: false, final: '', err: '' };
  for (const scheme of ['https', 'http']) {
    try {
      const r = await get(scheme + '://' + b.host + '/', 'text/html,application/xhtml+xml', 20000);
      rec.http = r.status;
      rec.len = r.body.length;
      const ct = String(r.headers['content-type'] || '');
      const txt = r.body.toString('utf8');
      const tm = txt.match(/<title[^>]*>([\s\S]{0,200}?)<\/title>/i);
      if (tm) rec.title = strip(tm[1]).slice(0, 120);
      const loc = r.headers.location;
      if (loc) rec.final = String(loc).slice(0, 120);
      if (r.status >= 200 && r.status < 500) break;
    } catch (e) {
      rec.http = -1; rec.err = String(e.message || e.code || '').slice(0, 60);
      if (scheme === 'http') rec.err = 'unreachable';
    }
    await sleep(120);
  }
  return rec;
}
const files = fs.readdirSync('.').filter(f => /^_probe10_(\d+)\.json$/.test(f));
const covered = new Set();
for (const f of files) {
  const s = Number(f.match(/(\d+)\.json$/)[1]);
  for (let i = s; i < s + 40 && i < all.length; i++) covered.add(i);
}
console.log('resume: covered', covered.size, '/', all.length);
for (let s = 0; s < all.length; s += 40) {
  if (covered.has(s)) continue;
  const slice = all.slice(s, s + 40);
  let idx = 0;
  const out = new Array(slice.length);
  async function worker() {
    while (true) {
      const i = idx++;
      if (i >= slice.length) return;
      out[i] = await probeOne(slice[i]);
      if (i % 8 === 0) console.log('  [' + (s + i) + ']', slice[i].host, out[i].http, out[i].len);
      await sleep(600 + Math.floor(Math.random() * 500));
    }
  }
  await Promise.all([0,1,2,3].map(worker));
  fs.writeFileSync('./_probe10_' + s + '.json', JSON.stringify(out, null, 1), 'utf8');
  console.log('BATCH', s, 'written', out.filter(x=>x.http>=200&&x.http<400).length + '/' + out.length, 'reachable');
  await sleep(400);
}
console.log('PROBE ALL DONE');
