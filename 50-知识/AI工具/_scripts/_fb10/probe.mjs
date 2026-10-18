
// 实测域名：HTTP/HTTPS + 标题 + 长度 + 是否被墙/无法访问；每 40 个落盘
import { get, strip, sleep } from './proxy-fetch.mjs';
import fs from 'node:fs';
const file = process.argv[2];
const start = Number(process.argv[3] || 0);
const count = Number(process.argv[4] || 40);
const all = JSON.parse(fs.readFileSync(file, 'utf8'));
const slice = all.slice(start, start + count);
const CONC = 4;
const out = new Array(slice.length);
let idx = 0;
async function worker() {
  while (true) {
    const i = idx++;
    if (i >= slice.length) return;
    const b = slice[i];
    const rec = { id: b.id, name: b.name, host: b.host, cat: b.cat, status: b.status, year: b.year, url: 'https://' + b.host + '/', http: 0, len: 0, title: '', blocked: false, final_host: '' };
    for (const scheme of ['https', 'http']) {
      try {
        const r = await get(scheme + '://' + b.host + '/', 'text/html,application/xhtml+xml', 20000);
        rec.http = r.status;
        rec.len = r.body.length;
        const ct = String(r.headers['content-type'] || '');
        const t = r.body.toString(ct.includes('gbk') || ct.includes('gb2312') ? 'binary' : 'utf8');
        const tm = t.match(/<title[^>]*>([\s\S]{0,200}?)<\/title>/i);
        if (tm) rec.title = strip(tm[1]).slice(0, 120);
        if (r.headers.location) rec.final_host = r.headers.location;
        if (r.status > 0) break;
      } catch (e) {
        rec.http = -1;
        rec.title = '';
      }
      await sleep(150);
    }
    out[i] = rec;
    console.log('  [' + (i+1) + '/' + slice.length + ']', b.host, rec.http, rec.len, rec.title.slice(0, 30));
    await sleep(700 + Math.floor(Math.random() * 500));
  }
}
await Promise.all([0,1,2,3].map(worker));
fs.writeFileSync('./_probe10_' + start + '.json', JSON.stringify(out, null, 1), 'utf8');
console.log('WROTE _probe10_' + start + '.json', out.filter(x=>x.http>=200&&x.http<400).length + '/' + out.length + ' reachable');
