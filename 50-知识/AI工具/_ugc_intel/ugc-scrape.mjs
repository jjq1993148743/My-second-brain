// ugc-scrape.mjs - non-English UGC/gig/sales platform scraper: fee/payout text + outbound link harvest
import { get, gbk, strip, decode, sleep } from './proxy-fetch.mjs';
import fs from 'node:fs';
const OUT = process.argv[2] || '_ugc_batch.json';
const GAP = [900, 1300];
const targets = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const FEE_RE = /(\u624b\u6570\u6599|\u624b\u8cc3|\u5831\u916c\u91d1|\u51fa\u91d1|\u632f\u308a\u8fbc\u307f|\u632f\u8fbc|\u9280\u884c\u53e3\u5ea7|\u6d88\u8cbb\u7a0e|\u6e90\u6cc9\u5fb3\u53ce|\u767b\u9332\u6599|\u6708\u984d|\u58f2\u4e0a|\u8fd4\u91d6|commission|payout|withdraw|fee|settlement|\uc218\uc218\ub8cc|\uc815\uc0b0|\ucd9c\uae08|\uc218\uc775|\uac15\uc0ac|\ud68c\uc6d0\uac00\uc785|\uc6d4 \uad6c\ub3c5|\u63d0\u73b0|\u7ed3\u7b97|\u624b\u7eed\u8d39|Umstellung|Provision|Auszahlung|Rechnung|Steuer|comision|retiro|pago|service fee|price|harga|biaya)/i;
function linksFrom(html, baseHost) {
  const out = []; const re = /<a\b[^>]*?href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]{0,200}?)<\/a>/gi; let m;
  while ((m = re.exec(html))) {
    const href = (m[2] || m[3] || m[4] || '').trim(); const text = strip(m[5]).slice(0, 90);
    if (!href || href.charAt(0) === '#' || href.toLowerCase().indexOf('javascript:') === 0) continue;
    let abs; try { abs = new URL(href, 'https://' + baseHost); } catch (e) { continue; }
    if (abs.protocol !== 'http:' && abs.protocol !== 'https:') continue;
    out.push({ href: abs.href.replace(/\/$/, ''), text: text, host: abs.hostname.replace(/^www\./, '') });
  } return out;
}
async function one(t) {
  const r = { key: t.key, url: t.url, note: t.note || '', status: 0, ok: false, title: '', host: '', fee: [], links: [], bytes: 0, err: '' };
  const started = Date.now();
  try {
    const res = await get(t.url, 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', 22000);
    r.status = res.status; r.bytes = res.body.length;
    if (res.status !== 200) { r.err = 'HTTP ' + res.status; return r; }
    const html = decode(res.body, 'utf-8');
    const tm = html.match(/<title[^>]*>([\s\S]{0,300}?)<\/title>/i); r.title = tm ? strip(tm[1]) : '';
    r.host = new URL(t.url).hostname.replace(/^www\./, '');
    const re = new RegExp(FEE_RE.source, 'g'); const seen = {}; const sent = [];
    const chunks = html.split(/(?<=[\u3002.!?\uff01\uff1f;\uff1b\n])/);
    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i]; if (c.length < 14 || c.length > 1200) continue;
      const t2 = strip(c); if (t2.length < 14) continue;
      if (re.test(t2)) { const k = t2.slice(0, 50); if (!seen[k]) { seen[k] = 1; sent.push(t2.slice(0, 420)); } }
      if (sent.length >= 40) break;
    }
    r.fee = sent; r.links = linksFrom(html, r.host); r.ok = true;
  } catch (e) { r.err = String(e.message || e).slice(0, 140); }
  r.ms = Date.now() - started; return r;
}
const results = [];
for (const t of targets) {
  const r = await one(t); results.push(r);
  console.log('[' + results.length + '/' + targets.length + '] ' + t.key + ' ' + r.status + ' ' + r.ms + 'ms fee=' + r.fee.length + ' links=' + r.links.length + ' ' + r.err);
  fs.writeFileSync(OUT, JSON.stringify(results, null, 1), 'utf8');
  if (results.length < targets.length) await sleep(GAP[0] + Math.floor(Math.random() * (GAP[1] - GAP[0])));
}
const hosts = {};
for (const r of results) for (const l of r.links) {
  if (!l.host || l.host === r.host) continue;
  if (/\.(png|jpe?g|gif|svg|css|js|ico|woff2?)(\?|$)/i.test(l.href)) continue;
  (hosts[l.host] = hosts[l.host] || []).push(r.key + ' :: ' + l.href + ' :: ' + l.text.slice(0, 60));
}
fs.writeFileSync(OUT.replace(/\.json$/, '.hosts.json'), JSON.stringify(hosts, null, 1), 'utf8');
console.log('DONE ' + results.length + ' -> ' + OUT);