
import { get, sleep } from './proxy-fetch.mjs';
import fs from 'node:fs';
const t = fs.readFileSync('D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/_gum_https_gumroad_com_discover.html','utf8');
const prices = [...t.matchAll(/\$\d[\d,.]*/g)].map(x=>x[0]).slice(0,20);
console.log('prices:', prices.join(','));
const anchors = [...t.matchAll(/<a[^>]*>([^<]{6,90})<\/a>/g)].map(x=>x[1]).slice(0,30);
console.log('anchors:', anchors.slice(0,20).join(' | '));
const cats = [...t.matchAll(/href="(\/discover\?[^"]{2,120})"/g)].map(x=>x[1]);
console.log('discover links:', [...new Set(cats)].slice(0,20).join(' | '));
console.log('has __NEXT_DATA__:', /__NEXT_DATA__/.test(t), '| has application/json:', /application\/json/.test(t));
const nd = t.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
if (nd) { fs.writeFileSync('D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/_gum_next.json', nd[1]); console.log('NEXT_DATA len', nd[1].length); }
async function shop(slug){
  try {
    const r = await get('https://'+slug+'.gumroad.com/','text/html');
    const h = r.body.toString('utf8');
    const ttl = (h.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||'';
    const products = [...h.matchAll(/\/l\/([a-z0-9-]{3,60})/gi)].map(x=>x[1]);
    const priceMatches = [...h.matchAll(/\$\d[\d,.]*/g)].map(x=>x[0]);
    const followers = (h.match(/([\d,]+)\s*followers/i)||[])[1];
    const rating = (h.match(/(\d+(?:\.\d+)?)\s*(?:out of 5|stars)/i)||[])[1];
    console.log('SHOP ' + slug + ' [' + r.status + '] ' + ttl.replace(/\s+/g,' ').slice(0,60) + ' | prods:' + [...new Set(products)].length + ' | $:' + [...new Set(priceMatches)].slice(0,5).join(',') + ' | fol:' + (followers||'-') + ' | rate:' + (rating||'-'));
    return {slug, status:r.status, title:ttl.replace(/\s+/g,' ').trim().slice(0,120), products:[...new Set(products)].slice(0,25), prices:[...new Set(priceMatches)].slice(0,10), followers, rating};
  } catch(e){ console.log('ERR '+slug+' '+e.message.slice(0,50)); return null; }
}
const res = [];
for (const s of ['twostraws','codegrid','promptblueprint','noahnuebling','simplemarketmetrics','elitegeentsss','thebindery','chasitykwill','laserpreneur','markkashef']) {
  const x = await shop(s); if(x) res.push(x); await sleep(950);
}
fs.writeFileSync('D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/_gum_shop_samples.json', JSON.stringify(res,null,1),'utf8');
