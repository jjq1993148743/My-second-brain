
import { get, sleep } from './proxy-fetch.mjs';
import fs from 'node:fs';
const cats = ['3d','audio','business-and-money','comics-and-graphic-novels','design','drawing-and-painting','education','fiction-books','fitness-and-health','gaming','music-and-sound-design','photography','recorded-music','self-improvement','software-development','writing-and-publishing'];
const shops = {};
for (const c of cats) {
  for (const page of [1,2]) {
    const u = 'https://gumroad.com/discover?category=' + c + '&page=' + page;
    try {
      const r = await get(u, 'text/html');
      if (r.status !== 200) { console.log('-- '+c+' p'+page+' ['+r.status+']'); await sleep(900); continue; }
      const t = r.body.toString('utf8');
      let n = 0;
      for (const m of t.matchAll(/(?:https?:)?\/\/([a-z0-9-]+)\.gumroad\.com\/l\//gi)) {
        const s = m[1].toLowerCase();
        if (['assets','public-files','static-1','static-2'].includes(s)) continue;
        if (!shops[s]) { shops[s]=0; n++; } shops[s]++;
      }
      for (const m of t.matchAll(/href="\/([a-z0-9-]{2,40})\/l\/([a-z0-9-]{3,80})"/gi)) {
        const s = m[1].toLowerCase();
        if (['discover','products','pricing','login','signup','features','about','apps','help','blog','terms','privacy'].includes(s)) continue;
        if (!shops[s]) { shops[s]=0; n++; } shops[s]++;
      }
      fs.writeFileSync('D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/_gumcat_'+c+'_'+page+'.html', t);
      console.log('-- '+c+' p'+page+' ['+r.status+'] '+r.body.length+'B new:'+n+' total:'+Object.keys(shops).length);
      await sleep(900);
    } catch(e){ console.log('ERR '+c+' '+e.message.slice(0,50)); await sleep(900); }
  }
}
const list = Object.entries(shops).sort((a,b)=>b[1]-a[1]).map(([s,c])=>({shop:s,count:c,url:'https://'+s+'.gumroad.com'}));
fs.writeFileSync('D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/_gum_shops_all.json', JSON.stringify(list,null,1),'utf8');
console.log('TOTAL '+list.length);
console.log(list.map(x=>x.shop).join(','));
