import fs from 'node:fs';
import path from 'node:path';
const dir='_raw_jsw';
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.html')).sort();
const all=[]; const seen=new Set();
for(const f of files){
  const html=fs.readFileSync(path.join(dir,f),'utf8');
  const parts=html.split('jobcardStyle1');
  for(let k=1;k<parts.length;k++){
    const c=parts[k].slice(0,3000);
    // 标题在 tw-text-lg 的 div 里
    const tm=c.match(/tw-text-lg tw-font-medium">\s*([^<]{5,120})</);
    if(!tm) continue;
    const title=tm[1].trim();
    if(seen.has(title)) continue; seen.add(title);
    // 时间：1W / 2D / 1M
    const wm=c.match(/mt-1 tw-pl-3">\s*([0-9]+[WDMh])\s*</);
    const when=wm?wm[1]:'';
    // 薪资
    const sm=c.match(/\$\s?[0-9][0-9,.]*(?:\s*[-\u2013]\s*\$?\s?[0-9][0-9,.]*)?(?:\s*an Hour)?/);
    all.push({title:title.slice(0,120), when, salary:sm?sm[0]:''});
  }
}
fs.writeFileSync('_jsw_projects.json',JSON.stringify(all,null,1),'utf8');
console.log('TOTAL='+all.length);
console.log('withSalary='+all.filter(a=>a.salary).length+' withTime='+all.filter(a=>a.when).length);
for(const a of all.slice(0,8)) console.log('  ['+a.when+'] ['+a.salary+'] '+a.title.slice(0,48));