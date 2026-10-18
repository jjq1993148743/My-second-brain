
import { get, sleep } from './proxy-fetch.mjs';
import fs from 'node:fs';
const OUT='D:/GitHub/_intel/';
const sellers = new Map();
const cats = ['3d','audio','business-and-money','comics-and-graphic-novels','design','drawing-and-painting','education','fiction-books','films','fitness-and-health','gaming','music-and-sound-design','other','photography','recorded-music','self-improvement','software-development','writing-and-publishing'];
for (const c of cats) {
  for (const q of ['', '?sort=most_recent', '?page=2']) {
    try {
      const r = await get('https://gumroad.com/discover/'+c+q, 'text/html');
      const html = r.body.toString('utf8');
      const s = html.indexOf('data-page="');
      if (s<0) { console.log(c,q,'status',r.status,'no data'); continue; }
      const e = html.indexOf('"></div>', s);
      const raw = html.slice(s+11, e).replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&#39;/g,"'");
      const data = JSON.parse(raw);
      const prods = (data.props.search_results||{}).products||[];
      let added=0;
      for (const pr of prods) if (pr.seller) { const u=pr.seller.profile_url.split('?')[0]; if(!sellers.has(u)){sellers.set(u,pr.seller.name);added++;} }
      console.log(c, JSON.stringify(q), r.status, 'prods',prods.length,'new',added,'tot',sellers.size);
    } catch(e){ console.log(c,q,'ERR',e.message); }
    await sleep(1000);
  }
}
fs.writeFileSync(OUT+'gum-sellers-all.json', JSON.stringify([...sellers.entries()], null, 1));
