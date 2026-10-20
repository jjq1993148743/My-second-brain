import fs from 'node:fs';
import path from 'node:path';
const dir='_raw_flcl';
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.html'));
const all=[]; const seen=new Set();
for(const f of files){
  const html=fs.readFileSync(path.join(dir,f),'utf8');
  const parts=html.split('class="JobSearchCard-item');
  for(let k=1;k<parts.length;k++){
    const c=parts[k].slice(0,6000);
    const um=c.match(/href="(\/projects\/[^"]+)"/);
    if(!um) continue;
    const url=um[1];
    if(seen.has(url)) continue; seen.add(url);
    const tm=c.match(/class="JobSearchCard-primary-heading-link"[^>]*>\s*([^<]{5,150})</);
    const bm=c.match(/\$\s?([0-9][0-9,.]*)/);
    const om=c.match(/([0-9]+)\s*(?:ofertas?|bids?|pujas?)/i);
    all.push({url, title:tm?tm[1].trim().slice(0,140):'', budget:bm?parseFloat(bm[1].replace(/,/g,'')):null, offers:om?+om[1]:null});
  }
}
fs.writeFileSync('_flcl_projects.json',JSON.stringify(all,null,1),'utf8');
console.log('TOTAL='+all.length);
console.log('withBudget='+all.filter(a=>a.budget).length+' withOffers='+all.filter(a=>a.offers!==null).length);
for(const a of all.slice(0,5)) console.log('  $'+a.budget+' | '+a.offers+' offers | '+a.title.slice(0,45));