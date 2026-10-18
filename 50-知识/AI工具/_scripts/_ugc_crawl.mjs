
// _ugc_crawl.mjs — 串行抓取，提取 title + 外链 host，落盘 json
import { get, gbk, strip, sleep } from './proxy-fetch.mjs';
import fs from 'node:fs';
const listFile = process.argv[2];
const outFile = process.argv[3];
const L = JSON.parse(fs.readFileSync(listFile, 'utf8'));
const out = [];
for (const u of L) {
  const rec = { url: u, status: 0, len: 0, title: '', hosts: [], snip: '' };
  try {
    const r = await get(u, 'text/html,*/*');
    rec.status = r.status; rec.len = r.body.length;
    const txt = r.body.toString('utf8');
    rec.title = (txt.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1] || '';
    rec.title = rec.title.replace(/\s+/g,' ').trim().slice(0,160);
    const hosts = [...txt.matchAll(/href=["']https?:\/\/([^\/"'?#:]+)[^"']*["']/gi)].map(m=>m[1].toLowerCase().replace(/^www\./,''));
    const pageHost = new URL(u).hostname.replace(/^www\./,'');
    rec.hosts = [...new Set(hosts.filter(h=>h && h!==pageHost && !h.endsWith(pageHost) && !/google|gstatic|facebook|twitter|cloudflare|w3\.org|schema|jquery|bootstrap|youtube\.com|vimeo/.test(h)))].slice(0,60);
    rec.snip = strip(txt).slice(0, 260);
  } catch (e) { rec.status = -1; rec.title = 'ERR ' + e.message.slice(0, 80); }
  out.push(rec);
  console.log('-- ' + u + ' [' + rec.status + '] ' + rec.len + 'B | ' + rec.title.slice(0,80));
  console.log('   H: ' + rec.hosts.slice(0,40).join(', '));
  await sleep(950);
}
fs.writeFileSync(outFile, JSON.stringify(out, null, 1), 'utf8');
console.log('DONE ' + outFile);
