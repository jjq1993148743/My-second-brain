import fs from 'node:fs';
import path from 'node:path';
const dir='_raw_useme_pl';
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.html')).sort();
const all=[]; const seen=new Set();
for(const f of files){
  const html=fs.readFileSync(path.join(dir,f),'utf8');
  const parts=html.split('class="job__content');
  for(let k=1;k<parts.length;k++){
    const c=parts[k].slice(0,5000);
    const um=c.match(/href="(\/pl\/jobs\/([a-z0-9\-]+)[^"]*)"/);
    if(!um) continue;
    const slug=um[2];
    if(seen.has(slug)) continue; seen.add(slug);
    const tm=c.match(/<a href="[^"]+"[^>]*>\s*([^<]{5,150})/);
    const bm=c.match(/([0-9][0-9,.]*)\s*(?:z\u0142|PLN|EUR)/);
    const om=c.match(/offers?[sS]{0,300}?<span>([0-9]+)<\/span>/);
    all.push({slug, title:tm?tm[1].trim().slice(0,140):'', budget:bm?bm[1]:'', offers:om?+om[1]:null});
  }
}
fs.writeFileSync('_useme_pl_projects.json',JSON.stringify(all,null,1),'utf8');
console.log('TOTAL='+all.length);
console.log('withBudget='+all.filter(a=>a.budget).length+' withOffers='+all.filter(a=>a.offers!==null).length);
for(const a of all.slice(0,5)) console.log('  ['+a.budget+'] '+(a.offers||'-')+' | '+a.title.slice(0,45));