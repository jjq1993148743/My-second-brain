
import http from 'node:http';
import fs from 'node:fs';
const PROXY = { host: '127.0.0.1', port: 7897 };
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36';
function get(url, accept='*/*', tries=3) {
  return new Promise(async (resolve) => {
    for (let i=0;i<tries;i++) {
      const r = await new Promise((res)=>{
        const pu = new URL(url);
        const req = http.get({ host: PROXY.host, port: PROXY.port, path: url, agent: false,
          headers: { Host: pu.host, 'User-Agent': UA, Accept: accept, Connection: 'close' } },
          (resp)=>{ const c=[]; resp.on('data',d=>c.push(d)); resp.on('end',()=>res({status:resp.statusCode, body:Buffer.concat(c)})); });
        req.on('error',(e)=>res({error:e.message}));
        req.setTimeout(30000,()=>{req.destroy(); res({error:'timeout'});});
      });
      if (!r.error) return resolve(r);
      await new Promise(x=>setTimeout(x,1500));
    }
    resolve({error:'all tries failed'});
  });
}
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
function parseCards(h) {
  const out = [];
  const re = /<div class="product-card">([\s\S]*?)<\/a><\/div>/g;
  let m;
  while ((m = re.exec(h))) {
    const b = m[1];
    const slug = (b.match(/href="\/product\/([^"]+)"/)||[])[1];
    const name = (b.match(/product-card__name">([^<]*)</)||[])[1];
    const tag = (b.match(/product-card__tagline">([^<]*)</)||[])[1];
    const rev = (b.match(/product-card__revenue-number">([\d,\.]+)/)||[])[1];
    const period = (b.match(/product-card__revenue-period">([^<]*)</)||[])[1];
    const expl = (b.match(/product-card__revenue-explanation">(.*?)<\/span>/s)||[])[1];
    const ver = /Stripe/i.test(b||'');
    if (slug) out.push({
      slug, name: (name||'').trim(), tagline: (tag||'').trim(),
      revenueNumber: rev||null, revenuePeriod: period||null,
      revenueExplanation: (expl||'').replace(/<[^>]+>/g,'').trim(),
      stripeVerified: ver,
      url: 'https://www.indiehackers.com/product/'+slug,
    });
  }
  return out;
}
const all = [];
const seen = new Set();
// paginate: check for next page link
const base = 'https://www.indiehackers.com/products';
let url = base;
let pages = 0;
while (url && pages < 25) {
  const r = await get(url);
  if (r.error) { console.log('FAIL', url, r.error); break; }
  const h = r.body.toString('utf8');
  const cards = parseCards(h);
  for (const c of cards) { if (!seen.has(c.slug)) { seen.add(c.slug); all.push(c); } }
  pages++;
  console.log('page', pages, url.slice(-40), 'cards', cards.length, 'total', all.length);
  // find pagination next
  const nextM = h.match(/<a[^>]+href="(\/products\?page=\d+)"[^>]*>\s*(?:Next|›|&gt;|»)/i) || h.match(/<a[^>]*rel="next"[^>]*href="([^"]+)"/i);
  const anyNext = [...h.matchAll(/href="(\/products\?[^"]*page=\d+[^"]*)"/g)].map(x=>x[1]);
  const curPage = parseInt((url.match(/page=(\d+)/)||[null,'1'])[1]);
  let next = null;
  for (const n of anyNext) { const pn = parseInt((n.match(/page=(\d+)/)||[null])[1]); if (pn === curPage+1) { next = 'https://www.indiehackers.com'+n; break; } }
  fs.writeFileSync('_ih_products.json', JSON.stringify(all, null, 1), 'utf8');
  url = next;
  await sleep(1000);
  if (!next) break;
}
console.log('TOTAL IH PRODUCTS', all.length);
