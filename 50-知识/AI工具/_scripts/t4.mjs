
import { get, sleep } from './proxy-fetch.mjs';
import fs from 'node:fs';
const OUT='D:/GitHub/_intel/';
const sellers = new Map();
async function grab(u, label) {
  for (let a=0;a<3;a++) {
    try { const r = await get(u, 'text/html'); 
      if (r.status!==200) { console.log(label,u,r.status); return null; }
      const html=r.body.toString('utf8');
      const s=html.indexOf('data-page="'); if(s<0){console.log(label,u,'nodata');return null;}
      const e=html.indexOf('"></div>',s);
      const raw=html.slice(s+11,e).replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&#39;/g,"'");
      const d=JSON.parse(raw);
      return d;
    } catch(e){ console.log(label,'retry',a,e.message); await sleep(2500); }
  }
  return null;
}
const cats = ['3d','audio','business-and-money','comics-and-graphic-novels','design','drawing-and-painting','education','fiction-books','films','fitness-and-health','gaming','music-and-sound-design','other','photography','recorded-music','self-improvement','software-development','writing-and-publishing'];
for (const c of cats) {
  const d = await grab('https://gumroad.com/'+c, c);
  if (d) {
    const prods = (d.props.search_results||{}).products||[];
    let added=0;
    for (const pr of prods) if (pr.seller) { const u=pr.seller.profile_url.split('?')[0]; if(!sellers.has(u)){sellers.set(u,pr.seller.name);added++;} }
    console.log(c,'prods',prods.length,'new',added,'tot',sellers.size, 'title', d.props.title);
  }
  await sleep(1000);
}
fs.writeFileSync(OUT+'gum-sellers-all.json', JSON.stringify([...sellers.entries()], null, 1));
