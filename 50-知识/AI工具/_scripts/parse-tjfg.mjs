import fs from 'node:fs';
import path from 'node:path';
const dir='_raw_tjfg';
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.html')).sort();
const all=[]; const seen=new Set();
for(const f of files){
  const html=fs.readFileSync(path.join(dir,f),'utf8');
  const parts=html.split('job-card');
  for(let k=1;k<parts.length;k++){
    const c=parts[k].slice(0,3000);
    // 多模式匹配标题
    const tm = c.match(/job-title"\s+title="([^"]{3,120})"/) ||
               c.match(/class="header[^"]*"[^>]*title="([^"]{3,120})"/) ||
               c.match(/job-title"[^>]*>\s*([^<]{3,120})</);
    if(!tm) continue;
    const title=tm[1].trim();
    const idm=c.match(/href="\/jobs\/(\d+)\//);
    const id=idm?idm[1]:title;
    if(seen.has(id)) continue; seen.add(id);
    const cm = c.match(/company-name"\s+title="([^"]{2,80})"/) || c.match(/company-name"[^>]*>\s*([^<]{2,80})</);
    const sm=c.match(/\$[0-9]{2,3}K(?:\s*[-\u2013]\s*\$?[0-9]{2,3}K)?/);
    all.push({id, title:title.slice(0,110), company:cm?cm[1].trim():'', salary:sm?sm[0]:''});
  }
}
fs.writeFileSync('_tjfg_jobs.json',JSON.stringify(all,null,1),'utf8');
console.log('TOTAL='+all.length);
console.log('withSalary='+all.filter(a=>a.salary).length+' withCompany='+all.filter(a=>a.company).length);
for(const a of all.slice(0,8)) console.log('  ['+a.salary+'] '+a.company.slice(0,22)+' | '+a.title.slice(0,42));