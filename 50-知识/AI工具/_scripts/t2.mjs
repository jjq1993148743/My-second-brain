
import { get, sleep } from './proxy-fetch.mjs';
import fs from 'node:fs';
const OUT='D:/GitHub/_intel/';
const sellers = new Map();
for (let p=1; p<=8; p++) {
  try {
    const r = await get('https://gumroad.com/discover?page='+p, 'text/html');
    if (r.status!==200) { console.log('page',p,'status',r.status); break; }
    const html = r.body.toString('utf8');
    const s = html.indexOf('data-page="'); if (s<0) { console.log('page',p,'no data-page'); continue; }
    let e = html.indexOf('"></div>', s);
    let raw = html.slice(s+11, e).replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&#39;/g,"'");
    const data = JSON.parse(raw);
    const prods = data.props.search_results.products || [];
    for (const pr of prods) { if (pr.seller) sellers.set(pr.seller.profile_url.split('?')[0], pr.seller.name); }
    console.log('page',p,'products',prods.length,'total sellers',sellers.size);
  } catch(e) { console.log('page',p,'ERR',e.message); }
  await sleep(1100);
}
fs.writeFileSync(OUT+'gum-sellers-all.json', JSON.stringify([...sellers.entries()], null, 1));
