import fs from 'node:fs';
import path from 'node:path';
const dir='_raw_mb';
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.html'));
const all=[]; const seen=new Set();
for(const f of files){
  const html=fs.readFileSync(path.join(dir,f),'utf8');
  const text=html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,'\n').replace(/&amp;/g,'&').replace(/&#x27;/g,"'").replace(/&nbsp;/g,' ');
  const u=[...new Set(text.split('\n').map(s=>s.trim()).filter(s=>s.length>3))];
  for(let i=0;i<u.length;i++){
    const sm=u[i].match(/^\$[0-9]{2,3},[0-9]{3}\s*[-\u2013]\s*\$?[0-9]{2,3},[0-9]{3}/);
    if(!sm) continue;
    let title='';
    for(let j=i-1;j>=Math.max(0,i-6);j--){
      const c=u[j];
      if(c.length>8 && c.length<90 && /[A-Za-z]/.test(c) && !/^\$/.test(c)){ title=c; break; }
    }
    if(!title) continue;
    const key=title+'|'+sm[0];
    if(seen.has(key)) continue; seen.add(key);
    all.push({title:title.slice(0,110), salary:sm[0], src:f});
  }
}
fs.writeFileSync('_mb_jobs.json',JSON.stringify(all,null,1),'utf8');
console.log('TOTAL='+all.length);
for(const a of all.slice(0,8)) console.log('  ['+a.salary+'] '+a.title.slice(0,52));