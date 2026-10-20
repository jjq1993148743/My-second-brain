import fs from 'node:fs';
import path from 'node:path';
const dir='_raw_dice';
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.html')).sort();
const all=[]; const seen=new Set();
for(const f of files){
  const html=fs.readFileSync(path.join(dir,f),'utf8');
  const parts=html.split('data-testid="job-card"');
  for(let k=1;k<parts.length;k++){
    const c=parts[k].slice(0,4000);
    // 标题通常在 h2/h3 或 a 的 title 属性
    const tm=c.match(/<a[^>]*(?:title|aria-label)="([^"]{8,120})"/) || c.match(/<h[23][^>]*>\s*([^<]{8,120})</);
    const title=tm?tm[1].trim():'';
    // 公司
    const cm=c.match(/data-testid="company-name"[^>]*>\s*([^<]{2,60})</);
    const company=cm?cm[1].trim():'';
    // 地点
    const lm=c.match(/data-testid="job-location"[^>]*>\s*([^<]{2,60})</);
    const loc=lm?lm[1].trim():'';
    // 薪资
    const sm=c.match(/\$\s?[0-9][0-9,.]*(?:\s*-\s*\$?\s?[0-9][0-9,.]*)?(?:\s*(?:per year|per hour|\/hr|\/year|annually))?/);
    const salary=sm?sm[0]:'';
    // 时间
    const wm=c.match(/(\d+)\s*(minute|hour|day|week)s?\s*ago/i);
    const when=wm?wm[0]:'';
    if(!title) continue;
    const key=company+'|'+title;
    if(seen.has(key)) continue; seen.add(key);
    all.push({title:title.slice(0,120), company, loc, salary, when});
  }
}
fs.writeFileSync('_dice_projects.json',JSON.stringify(all,null,1),'utf8');
console.log('TOTAL='+all.length);
console.log('withSalary='+all.filter(a=>a.salary).length+' withCompany='+all.filter(a=>a.company).length+' withWhen='+all.filter(a=>a.when).length);
for(const a of all.slice(0,8)) console.log('  '+a.company.slice(0,20)+' | '+a.title.slice(0,42)+' | '+a.salary);