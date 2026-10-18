
import { get, strip, sleep } from './proxy-fetch.mjs';
import fs from 'node:fs';
const urls = [
  'https://gumroad.com/discover',
  'https://gumroad.com/discover?sort=featured',
  'https://gumroad.com/discover?sort=newest',
  'https://gumroad.com/discover?page=2',
  'https://gumroad.com/discover?page=3',
  'https://gumroad.com/discover?page=4',
];
const shops = {}; const items = [];
for (const u of urls) {
  try {
    const r = await get(u, 'text/html');
    console.log('-- ' + u + ' [' + r.status + '] ' + r.body.length + 'B');
    if (r.status !== 200) { await sleep(1000); continue; }
    const t = r.body.toString('utf8');
    fs.writeFileSync('D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/_gum_' + u.replace(/[^a-z0-9]+/gi,'_') + '.html', t);
    // shop cards: /<shop>/l/<slug>  or  https://<shop>.gumroad.com/l/<slug>
    for (const m of t.matchAll(/(?:https?:)?\/\/([a-z0-9-]+)\.gumroad\.com\/l\/([a-z0-9-]+)/gi)) {
      const shop = m[1].toLowerCase(); const slug = m[2];
      if (shop==='assets'||shop==='public-files'||shop==='static-2'||shop==='static-1') continue;
      shops[shop] = (shops[shop]||0)+1;
    }
    // relative /shop/l/slug form
    for (const m of t.matchAll(/href="\/([a-z0-9-]{2,40})\/l\/([a-z0-9-]{3,80})"/gi)) {
      const shop = m[1].toLowerCase();
      if (['discover','products','pricing','login','signup','features','about','apps','help','blog','terms','privacy'].includes(shop)) continue;
      shops[shop] = (shops[shop]||0)+1;
    }
    // product titles near "gumroad-product-card" or data attributes
    const names = [...t.matchAll(/"name":"([^"]{4,120})"/g)].map(m=>m[1]).slice(0,80);
    console.log('   names sample: ' + names.slice(0,12).join(' ~ '));
    await sleep(950);
  } catch(e) { console.log('ERR ' + u + ' ' + e.message.slice(0,60)); }
}
const list = Object.entries(shops).sort((a,b)=>b[1]-a[1]).map(([s,c])=>({shop:s, count:c, url:'https://'+s+'.gumroad.com'}));
fs.writeFileSync('D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/_gum_shops.json', JSON.stringify(list, null, 1), 'utf8');
console.log('TOTAL SHOPS ' + list.length);
console.log(list.map(x=>x.shop).join(', '));
