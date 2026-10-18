
import { get, strip, sleep } from './proxy-fetch.mjs';
import fs from 'node:fs';
const URLS = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const OUT = process.argv[3];
const results = [];
for (const u of URLS) {
  const t0 = Date.now();
  try {
    const r = await get(u, 'text/html,application/xhtml+xml,*/*;q=0.8', 18000);
    const txt = strip(r.body.toString('utf8'));
    const titleM = r.body.toString('utf8').match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const links = [...new Set([...r.body.toString('utf8').matchAll(/https?:\/\/[a-z0-9.-]+\.[a-z]{2,}/gi)].map(m=>m[0].toLowerCase()))];
    results.push({ url: u, status: r.status, len: r.body.length, ms: Date.now()-t0,
      title: titleM ? titleM[1].replace(/\s+/g,' ').trim().slice(0,120) : null,
      text: txt.slice(0, 1200),
      hosts: [...new Set(links.map(l=>{try{return new URL(l).hostname.replace(/^www\./,'')}catch{return null}}).filter(Boolean))].slice(0,400) });
    console.log(r.status + ' ' + r.body.length + ' ' + u);
  } catch (e) {
    results.push({ url: u, status: 0, err: String(e.message||e).slice(0,120) });
    console.log('ERR ' + u + ' ' + String(e.message||e).slice(0,80));
  }
  fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
  await sleep(1000);
}
console.log('DONE ' + results.length);
