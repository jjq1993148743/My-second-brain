import fs from 'node:fs';
import path from 'node:path';
const dir='_raw_nodesk';
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.html')).sort();
const all=[]; const seen=new Set();
for(const f of files){
  const cat=f.replace('.html','');
  const html=fs.readFileSync(path.join(dir,f),'utf8');
  const re=/<h4[^>]*>\s*([$\u20ac\u00a3][^<]{2,40})<\/h4>/g;
  let m;
  while((m=re.exec(html))!==null){
    const salary=m[1].trim();
    const before=html.slice(Math.max(0,m.index-2000), m.index);
    // 找最近的一个较长文本作为职位
    const cands=[...before.matchAll(/>([A-Z][^<>]{10,100})</g)].map(x=>x[1].trim()).filter(x=>!/^Remote:?$/.test(x));
    const title=cands.length?cands[cands.length-1]:'';
    if(!title||title.length<8) continue;
    const key=title+'|'+salary;
    if(seen.has(key)) continue; seen.add(key);
    all.push({cat, title:title.slice(0,110), salary});
  }
}
fs.writeFileSync('_nodesk_jobs.json',JSON.stringify(all,null,1),'utf8');
console.log('TOTAL='+all.length);
const cats={}; for(const a of all) cats[a.cat]=(cats[a.cat]||0)+1;
console.log('BY_CAT='+JSON.stringify(cats));
for(const a of all.slice(0,10)) console.log('  ['+a.salary+'] '+a.title.slice(0,52));