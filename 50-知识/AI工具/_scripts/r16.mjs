
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
    if (!slug) continue;
    out.push({
      slug,
      name: ((b.match(/product-card__name">([^<]*)</)||[])[1]||'').trim(),
      tagline: ((b.match(/product-card__tagline">([^<]*)</)||[])[1]||'').trim(),
      revenueNumber: ((b.match(/product-card__revenue-number">([\d,\.]+)/)||[])[1]||null),
      revenuePeriod: ((b.match(/product-card__revenue-period">([^<]*)</)||[])[1]||null),
      revenueExplanation: (((b.match(/product-card__revenue-explanation">([\s\S]*?)<\/span>/)||[])[1]||'').replace(/<[^>]+>/g,'').trim()),
      stripeVerified: /Stripe/i.test(b),
      url: 'https://www.indiehackers.com/product/'+slug,
    });
  }
  return out;
}
let all = JSON.parse(fs.readFileSync('_ih_products.json','utf8'));
const seen = new Set(all.map(x=>x.slug));
const QUERIES = [];
for (const s of ['verified-revenue','recently-updated','recently-added','highest-revenue','lowest-revenue']) QUERIES.push('https://www.indiehackers.com/products?sorting='+s);
const CATS = ['ai','analytics','apis','bots','content','design','e-commerce','education','email-marketing','finance','growth','marketing','marketplaces','productivity','programming','sales','social-media','task-management','utilities','wordpress','writing','communication','community','open-source','photography','podcasting','news-magazines','mailing-lists','jobs-hiring','investing','legal','medical','health-fitness','transportation','travel','weather','shopping','sports','home-automation','hardware','games','food-drinks','cryptocurrency','payments'];
for (const c of CATS) QUERIES.push('https://www.indiehackers.com/products?category='+c);
const BM = ['free','ads','commission','transactions','subscriptions'];
for (const b of BM) QUERIES.push('https://www.indiehackers.com/products?businessModel='+b);
// revenue buckets
const BUCKETS = [[0,100],[100,500],[500,1000],[1000,5000],[5000,10000],[10000,50000],[50000,100000],[100000,250000]];
for (const [a,b] of BUCKETS) QUERIES.push('https://www.indiehackers.com/products?minRevenue='+a+'&maxRevenue='+b);

console.log('queries', QUERIES.length);
for (const q of QUERIES) {
  const r = await get(q);
  if (r.error) { console.log('FAIL', q, r.error); continue; }
  const cards = parseCards(r.body.toString('utf8'));
  let added = 0;
  for (const c of cards) if (!seen.has(c.slug)) { seen.add(c.slug); all.push(c); added++; }
  console.log(q.replace('https://www.indiehackers.com/products',''), '->', cards.length, 'new', added, 'total', all.length);
  fs.writeFileSync('_ih_products.json', JSON.stringify(all, null, 1), 'utf8');
  await sleep(900);
}
console.log('FINAL', all.length);
