
import fs from 'node:fs';
const shopsMap = {}; const prods = [];
const files = fs.readdirSync('D:/GitHub/My-second-brain/50-知识/AI工具/_scripts').filter(f=>/^_gum.*\.html$/.test(f) || /^_gumcat_.*\.html$/.test(f));
for (const f of files) {
  const raw = fs.readFileSync('D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/'+f, 'utf8');
  // HTML entities -> json string
  const dec = raw.replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&');
  // split on {"id":"  product objects
  const objs = dec.split(/(?=\{"id":")/);
  for (const o of objs) {
    const nm = (o.match(/"name":"([^"]{2,140})"/)||[])[1];
    const seller = (o.match(/"seller":\{"id":"[^"]*","name":"([^"]{1,60})"/)||[])[1];
    const prof = (o.match(/"profile_url":"https:\/\/([a-z0-9-]+)\.gumroad\.com/)||[])[1];
    const url = (o.match(/"url":"https:\/\/([a-z0-9-]+)\.gumroad\.com\/l\/([a-z0-9-]+)/)||[]);
    const price = (o.match(/"price_cents":(\d+)/)||[])[1];
    const cur = (o.match(/"currency_code":"([a-z]{3})"/)||[])[1];
    const rc = (o.match(/"ratings":\{"count":(\d+),"average":([\d.]+)\}/)||[]);
    const ntype = (o.match(/"native_type":"([a-z_]+)"/)||[])[1];
    const perm = (o.match(/"permalink":"([A-Za-z0-9_-]+)"/)||[])[1];
    if (!nm || !url) continue;
    const shop = url[1];
    shopsMap[shop] = (shopsMap[shop]||0)+1;
    prods.push({ name:nm, seller, shop, url: 'https://'+shop+'.gumroad.com/l/'+url[2], price_cents: price?+price:null, currency: cur||'usd', rating_count: rc?+rc[1]:null, rating_avg: rc?+rc[2]:null, native_type: ntype||null, permalink: perm });
  }
}
const uniq = new Map();
for (const p of prods) { if(!uniq.has(p.url)) uniq.set(p.url, p); }
const list = [...uniq.values()].filter(p=>['assets','public-files','static-1','static-2'].includes(p.shop)===false);
const shops = Object.entries(shopsMap).sort((a,b)=>b[1]-a[1]).map(([s,c])=>({shop:s,count:c,url:'https://'+s+'.gumroad.com'}));
fs.writeFileSync('D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/_gum_products.json', JSON.stringify(list,null,1),'utf8');
fs.writeFileSync('D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/_gum_shops_final.json', JSON.stringify(shops,null,1),'utf8');
console.log('FILES', files.length, 'PRODUCTS', list.length, 'SHOPS', shops.length);
const sums = {}; for (const p of list) sums[p.shop]=(sums[p.shop]||0)+1;
console.log('TOP SHOPS: ' + Object.entries(sums).sort((a,b)=>b[1]-a[1]).slice(0,25).map(([s,c])=>s+'('+c+')').join(', '));
console.log('--- sample products ---');
for (const p of list.slice(0,25)) console.log(['$'+((p.price_cents||0)/100)+' '+(p.currency||'').toUpperCase(), (p.rating_count||0)+'r/'+(p.rating_avg||'-'), p.shop+' :: '+p.name.slice(0,60), p.native_type].join(' | '));
