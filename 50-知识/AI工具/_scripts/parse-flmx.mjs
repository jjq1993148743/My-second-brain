import fs from 'node:fs';
import path from 'node:path';
const dir='_raw_flmx';
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
    const title=tm?tm[1].trim():'';
    const bm=c.match(/\$\s?([0-9][0-9,.]*)/);
    const budget=bm?parseFloat(bm[1].replace(/,/g,'')):null;
    const om=c.match(/([0-9]+)\s*(?:ofertas?|bids?|pujas?)/i);
    const offers=om?+om[1]:null;
    const wm=c.match(/(\d+)\s*(minute|hour|day|week)s?\s*ago/i);
    const when=wm?wm[0]:'';
    all.push({url,title:title.slice(0,140),budget,offers,when});
  }
}
fs.writeFileSync('_flmx_projects.json',JSON.stringify(all,null,1),'utf8');
console.log('TOTAL='+all.length);
console.log('withBudget='+all.filter(a=>a.budget).length+' withOffers='+all.filter(a=>a.offers!==null).length+' withTitle='+all.filter(a=>a.title).length);
for(const a of all.slice(0,6)) console.log('  $'+a.budget+' | '+(a.offers||'-')+' offers | '+a.title.slice(0,45));