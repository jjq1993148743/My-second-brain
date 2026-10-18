
import { get, strip, sleep } from './proxy-fetch.mjs';
import fs from 'node:fs';
const START = Number(process.argv[2]);
const COUNT = Number(process.argv[3] || 50);
const TAG = process.argv[4] || String(START);
const CONC = Number(process.argv[5] || 3);
const ids = JSON.parse(fs.readFileSync('./_fb_ids.json', 'utf8')).slice(START, START + COUNT);
const out = new Array(ids.length);
let idx = 0, okHost = 0;
async function worker() {
  while (true) {
    const i = idx++;
    if (i >= ids.length) return;
    const id = ids[i];
    let rec = { id: String(id), host: '', name: '', cat: '', cats: '', status: '', year: '', len: 0 };
    for (let a = 0; a < 3; a++) {
      try {
        const r = await get('https://www.foreverblog.cn/blog/' + id + '.html');
        if (r.status !== 200) { rec.status = 'http_' + r.status; if (r.status === 404) break; await sleep(1200); continue; }
        const h = r.body.toString('utf8');
        rec.len = h.length;
        const hostM = h.match(/class="blog-detail-hero__host">\s*([^<]+?)\s*</);
        if (hostM) rec.host = hostM[1].trim();
        const nameM = h.match(/<h1[^>]*>([\s\S]{0,120}?)<\/h1>/);
        if (nameM) rec.name = strip(nameM[1]).slice(0, 60);
        const stM = h.match(/roster-status roster-status--(\w+)"[^>]*>\s*<i><\/i>([^<]+)</);
        if (stM) rec.status = stM[1] + ':' + strip(stM[2]);
        const yrM = h.match(/blog-detail-hero__years[^>]*>([\s\S]{0,60}?)<\/span>/);
        if (yrM) rec.year = strip(yrM[1]).slice(0, 20);
        const catM = h.match(/topic-label" data-category="([^"]*)"[\s\S]{0,160}?>([\s\S]{0,200}?)<\/span>/);
        if (catM) { rec.cat = catM[1]; rec.cats = strip(catM[2]).slice(0, 40); }
        if (!rec.host) {
          const m2 = h.match(/"https?:\/\/([a-z0-9.\-]+\.[a-z]{2,})"/i);
          if (m2 && !/foreverblog|qq\.com/.test(m2[1])) rec.host = m2[1];
        }
        break;
      } catch (e) { rec.status = 'err_' + String(e.message).slice(0, 28); await sleep(1500); }
    }
    out[i] = rec;
    if (rec.host) okHost++;
    if (i % 10 === 0) console.log('  ' + (i+1) + '/' + ids.length, id, rec.host || rec.status);
    await sleep(800 + Math.floor(Math.random() * 400));
  }
}
await Promise.all([0,1,2].map(worker));
fs.writeFileSync('./_blogs_' + TAG + '.json', JSON.stringify(out, null, 1), 'utf8');
console.log('BATCH', TAG, 'done', out.length, 'hosts', okHost);
