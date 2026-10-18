
import http from 'node:http';
import fs from 'node:fs';
const PROXY = { host: '127.0.0.1', port: 7897 };
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36';
function get(url, accept='*/*', tries=4) {
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
      await new Promise(x=>setTimeout(x,2000));
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
    out.push({ slug,
      name: ((b.match(/product-card__name">([^<]*)</)||[])[1]||'').trim(),
      tagline: ((b.match(/product-card__tagline">([^<]*)</)||[])[1]||'').trim(),
      monthlyRevenue: ((b.match(/product-card__revenue-number">\$?([\d,\.]+)/)||[])[1]||null),
      revenuePeriod: ((b.match(/product-card__revenue-period">([^<]*)</)||[])[1]||null),
      revenueNote: (((b.match(/product-card__revenue-explanation">([\s\S]*?)<\/span>/)||[])[1]||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim()),
      stripeVerified: /class="product-card__stripe-logo"/.test(b),
      url: 'https://www.indiehackers.com/product/'+slug,
    });
  }
  return out;
}
if (!fs.existsSync('_ih_html')) fs.mkdirSync('_ih_html');
let all = []; const seen = new Set();
const QUERIES = [];
for (const s of ['verified-revenue','recently-updated','recently-added','highest-revenue','lowest-revenue']) QUERIES.push('https://www.indiehackers.com/products?sorting='+s);
for (const b of ['commission','transactions','subscriptions']) QUERIES.push('https://www.indiehackers.com/products?businessModel='+b);
for (const [a,b] of [[0,100],[100,500],[500,1000],[1000,5000],[5000,10000],[10000,50000],[50000,100000],[100000,250000],[1,1000],[1000,10000],[10000,100000]]) QUERIES.push('https://www.indiehackers.com/products?minRevenue='+a+'&maxRevenue='+b);
for (const c of ['ai','utilities','productivity','wordpress','e-commerce','design','finance','marketing','social-media','games','communication']) {
  for (const [a,b] of [[1000,5000],[5000,20000],[20000,100000]]) QUERIES.push('https://www.indiehackers.com/products?category='+c+'&minRevenue='+a+'&maxRevenue='+b);
}
for (const s of ['verified-revenue','recently-updated','recently-added','highest-revenue','lowest-revenue']) QUERIES.push('https://www.indiehackers.com/products?sorting='+s);
const LIMIT = parseInt(process.argv[2]||'40');
for (let qi=0; qi<Math.min(LIMIT,QUERIES.length); qi++) {
  const q = QUERIES[qi];
  const r = await get(q);
  if (r.error) { console.log('FAIL', q, r.error); continue; }
  const h = r.body.toString('utf8');
  fs.writeFileSync('_ih_html/q'+qi+'.html', h, 'utf8');
  const cards = parseCards(h);
  let added=0;
  for (const c of cards) if (!seen.has(c.slug)) { seen.add(c.slug); all.push(c); added++; }
  console.log(qi, q.replace('https://www.indiehackers.com/products',''), 'cards', cards.length, 'new', added, 'total', all.length, 'withRev', all.filter(x=>x.monthlyRevenue).length);
  fs.writeFileSync('_ih_products.json', JSON.stringify(all, null, 1), 'utf8');
  await sleep(700);
}
console.log('DONE', all.length);
