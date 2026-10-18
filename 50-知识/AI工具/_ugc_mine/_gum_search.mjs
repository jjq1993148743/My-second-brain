
import { get, sleep } from './proxy.mjs';
import fs from 'node:fs';
const OUT = process.env.UGCOUT;
const queries = ['notion template','vrchat asset','3d model','blender','procreate','figma','raycast','obsidian','notion','ebook','template','course','photoshop','lightroom','unity','unreal','godot','game asset','printable','planner','resume','chatgpt prompt','midjourney','spreadsheet','notion dashboard','icon pack','font','luts','presets','sound effect','trading','fitness','cookbook','pattern','sewing','crochet','embroidery','coloring','comic','illustration','wordpress plugin','shopify theme','ios shortcut','automation','n8n','digital planner','google sheets','excel','notion template second brain','notion crm','study template','teacher','lesson','budget','invoice','social media template','branding kit','presentation','slide deck','mockup','texture','hdri','rigged','vtuber','avatar','stream overlay','emote','sticker pack'];
const prods = []; const shops = {};
for (const q of queries) {
  const u = 'https://gumroad.com/discover?query=' + encodeURIComponent(q);
  try {
    const r = await get(u, 'text/html');
    if (r.status !== 200) { await sleep(900); continue; }
    const t = r.body.toString('utf8');
    const dp = t.match(/data-page="([\s\S]*?)"/);
    if (!dp) { await sleep(900); continue; }
    const inner = dp[1].replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&');
    const arr = inner.match(/"products":\[([\s\S]*?)\]\s*,\s*"/);
    const body = arr ? arr[1] : '';
    for (const c of body.split(/(?=\{"id":")/)) {
      const nm = (c.match(/"name":"([^"]{2,140})"/)||[])[1];
      const url = (c.match(/"url":"https:\/\/([a-z0-9-]+)\.gumroad\.com\/l\/([a-z0-9-]+)/)||[]);
      const price = (c.match(/"price_cents":(\d+)/)||[])[1];
      const cur = (c.match(/"currency_code":"([a-z]{3})"/)||[])[1];
      const rc = (c.match(/"ratings":\{"count":(\d+),"average":([\d.]+)\}/)||[]);
      const ntype = (c.match(/"native_type":"([a-z_]+)"/)||[])[1];
      if (!nm || !url) continue;
      const shop = url[1];
      if (!shops[shop]) shops[shop]=0; shops[shop]++;
      prods.push({ name:nm, shop, url:'https://'+shop+'.gumroad.com/l/'+url[2], price_cents: price?+price:0, currency: cur||'usd', rating_count: rc?+rc[1]:0, rating_avg: rc?+rc[2]:null, native_type: ntype||null, query:q });
    }
    console.log(q + ' OK shops=' + Object.keys(shops).length + ' prods=' + prods.length);
    await sleep(950);
  } catch(e){ await sleep(900); }
}
fs.writeFileSync(OUT + '/gum_products.json', JSON.stringify(prods,null,1),'utf8');
fs.writeFileSync(OUT + '/gum_shops.json', JSON.stringify(Object.entries(shops).sort((a,b)=>b[1]-a[1]).map(([shop,c])=>({shop,appearances:c,url:'https://'+shop+'.gumroad.com'})),null,1),'utf8');
console.log('DONE products=' + prods.length + ' shops=' + Object.keys(shops).length);
