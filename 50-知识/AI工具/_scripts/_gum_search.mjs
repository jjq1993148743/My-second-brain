
import { get, sleep } from './proxy-fetch.mjs';
import fs from 'node:fs';
const queries = ['notion template','vrchat asset','3d model','blender','procreate','figma','raycast','obsidian','notion','ebook','template','course','photoshop','lightroom','unity','unreal','godot','game asset','printable','planner','resume','chatgpt prompt','midjourney','spreadsheet','notion dashboard','icon pack','font','luts','presets','sound effect','trading','fitness','cookbook','pattern','sewing','crochet','embroidery','coloring','comic','illustration','wordpress plugin','shopify theme','ios shortcut','automation','n8n'];
const shops = {}; const prods = [];
for (const q of queries) {
  const u = 'https://gumroad.com/discover?query=' + encodeURIComponent(q);
  try {
    const r = await get(u, 'text/html');
    if (r.status !== 200) { console.log('-- '+q+' ['+r.status+']'); await sleep(900); continue; }
    const t = r.body.toString('utf8');
    const dp = t.match(/data-page="([\s\S]*?)"/);
    if (!dp) { console.log('-- '+q+' no data-page'); await sleep(900); continue; }
    const inner = dp[1].replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&');
    const arr = inner.match(/"products":\[([\s\S]*?)\]\s*,\s*"/);
    const body = arr ? arr[1] : '';
    const chunks = body.split(/(?=\{"id":")/);
    let n = 0;
    for (const c of chunks) {
      const nm = (c.match(/"name":"([^"]{2,140})"/)||[])[1];
      const url = (c.match(/"url":"https:\/\/([a-z0-9-]+)\.gumroad\.com\/l\/([a-z0-9-]+)/)||[]);
      const price = (c.match(/"price_cents":(\d+)/)||[])[1];
      const cur = (c.match(/"currency_code":"([a-z]{3})"/)||[])[1];
      const rc = (c.match(/"ratings":\{"count":(\d+),"average":([\d.]+)\}/)||[]);
      const ntype = (c.match(/"native_type":"([a-z_]+)"/)||[])[1];
      if (!nm || !url) continue;
      const shop = url[1];
      if (!shops[shop]) { shops[shop]=0; n++; }
      shops[shop]++;
      prods.push({ name:nm, shop, url:'https://'+shop+'.gumroad.com/l/'+url[2], price_cents: price?+price:0, currency: cur||'usd', rating_count: rc?+rc[1]:0, rating_avg: rc?+rc[2]:null, native_type: ntype||null, query:q });
    }
    console.log('-- '+q+' ['+r.status+'] chunks:'+chunks.length+' new shops:'+n+' total shops:'+Object.keys(shops).length);
    await sleep(950);
  } catch(e){ console.log('ERR '+q+' '+e.message.slice(0,50)); await sleep(900); }
}
const seen=new Set(); const out=[];
for (const p of prods) { if(seen.has(p.url))continue; seen.add(p.url); out.push(p); }
fs.writeFileSync('D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/_gum_products2.json', JSON.stringify(out,null,1),'utf8');
const shopList = Object.entries(shops).sort((a,b)=>b[1]-a[1]).map(([s,c])=>({shop:s,count:c,url:'https://'+s+'.gumroad.com'}));
fs.writeFileSync('D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/_gum_shops2.json', JSON.stringify(shopList,null,1),'utf8');
console.log('DONE products:'+out.length+' shops:'+shopList.length);
