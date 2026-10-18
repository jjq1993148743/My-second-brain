import { get, strip } from './proxy-fetch.mjs';
const q = process.argv[2];
const max = parseInt(process.argv[3] || '10', 10);
if (!q) { console.error('用法: node ddg.mjs "查询词" [条数]'); process.exit(1); }
const r = await get('https://html.duckduckgo.com/html/?q=' + encodeURIComponent(q));
if (r.status !== 200) { console.error('DDG status ' + r.status); process.exit(2); }
const h = r.body.toString('utf8');
const items = [];
const blocks = h.split('result__a').slice(1);
for (const b of blocks) {
  const um = /href="([^"]+)"[^>]*>([^<]{3,200})</.exec(b);
  if (!um) continue;
  let url = um[1];
  const m = /uddg=([^&]+)/.exec(url);
  if (m) url = decodeURIComponent(m[1]);
  const title = strip(um[2]).replace(/&amp;/g, '&');
  const sm = /result__snippet[^>]*>([^<]{3,400})/.exec(b);
  const snippet = sm ? strip(sm[1]).replace(/&amp;/g, '&') : '';
  if (title) items.push({ title, url, snippet: snippet.slice(0, 300) });
  if (items.length >= max) break;
}
console.log(JSON.stringify({ query: q, engine: 'duckduckgo', total: items.length, items }));
