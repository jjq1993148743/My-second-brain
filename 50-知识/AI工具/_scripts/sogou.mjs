import { get, strip, sleep } from './proxy-fetch.mjs';
const q = process.argv[2];
const pages = parseInt(process.argv[3] || '1', 10);
if (!q) { console.error('need query'); process.exit(1); }
const all = [];
for (let p = 1; p <= pages; p++) {
  const url = 'https://weixin.sogou.com/weixin?type=2&query=' + encodeURIComponent(q) + '&page=' + p;
  try {
    const r = await get(url, 'text/html');
    const h = r.body.toString('utf8');
    if (r.status !== 200) { console.error('status ' + r.status); break; }
    const blocks = h.split('<h3>').slice(1);
    for (const b of blocks) {
      const tm = /<a[^>]+href=.([^"]+).[^>]*>([\s\S]{4,200}?)<\/a>/.exec(b);
      if (!tm) continue;
      const title = strip(tm[2]).replace(/&ldquo;|&rdquo;/g, '').replace(/&nbsp;/g, ' ');
      const sm = /<p class=.txt-info.[^>]*>([\s\S]*?)<\/p>/.exec(b);
      const snippet = sm ? strip(sm[1]).replace(/&ldquo;|&rdquo;/g, '') : '';
      const am = /class=.account.[^>]*>([\s\S]{2,60}?)<\/a>/.exec(b);
      const account = am ? strip(am[1]) : '';
      const dm = /time_convert\((\d+)\)/.exec(b);
      const date = dm ? new Date(parseInt(dm[1], 10) * 1000).toISOString().slice(0, 10) : '';
      if (title.length > 3) all.push({ title, account, date, snippet: snippet.slice(0, 200) });
    }
  } catch (e) { console.error('err ' + e.message.slice(0, 50)); }
  await sleep(1500 + Math.random() * 1500);
}
const seen = new Set(), out = [];
for (const it of all) { const k = it.title.slice(0, 30); if (seen.has(k)) continue; seen.add(k); out.push(it); }
console.log(JSON.stringify({ query: q, total: out.length, items: out }));
