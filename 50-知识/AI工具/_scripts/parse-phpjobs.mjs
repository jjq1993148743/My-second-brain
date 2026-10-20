import fs from 'node:fs';
import path from 'node:path';
const dir='_raw_phpjobs';
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.html'));
const all=[]; const seen=new Set();

for(const f of files){
  const html=fs.readFileSync(path.join(dir,f),'utf8');
  const parts=html.split('job-list-item');
  for(let k=1;k<parts.length;k++){
    const chunk=parts[k].slice(0,6000);
    const um=chunk.match(/href="(https:\/\/phpjobs\.io\/jobs\/([a-z0-9\-]+)\/([a-f0-9\-]+))"/);
    if(!um) continue;
    const id=um[3];
    if(seen.has(id)) continue; seen.add(id);

    const slug=um[2];
    const title=slug.replace(/-/g,' ').replace(/\b\w/g, c=>c.toUpperCase());

    const sm=chunk.match(/([$\u20ac\u00a3]\s?[0-9]{2,3}[,.]?[0-9]{3}(?:\s*[-\u2013]\s*[$\u20ac\u00a3]?\s?[0-9]{2,3}[,.]?[0-9]{3})?(?:\/yr)?)/);
    const salary=sm?sm[1]:'';

    const wm=chunk.match(/(\d+)\s*(day|days|hour|hours|week|weeks)\s*ago/i);
    const when=wm?wm[0]:'';

    // 地点
    const lm=chunk.match(/(Remote|Worldwide|Europe|USA|UK|Germany|Netherlands)/i);
    const loc=lm?lm[1]:'';

    all.push({id,url:um[1],title:title.slice(0,120),salary,when,loc,cat:f.replace('.html','')});
  }
}
fs.writeFileSync('_phpjobs_projects.json',JSON.stringify(all,null,1),'utf8');
console.log('TOTAL='+all.length);
console.log('withSalary='+all.filter(a=>a.salary).length+' withTime='+all.filter(a=>a.when).length);
for(const a of all.slice(0,10)) console.log('  ['+a.salary+'] '+a.when+' | '+a.title.slice(0,50));