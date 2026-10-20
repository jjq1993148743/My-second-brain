import fs from 'node:fs';
import path from 'node:path';
const dir='_raw_wf';
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.html')).sort();
const all=[]; const seen=new Set();
for(const f of files){
  const html=fs.readFileSync(path.join(dir,f),'utf8');
  const text=html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ')
    .replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&#x27;/g,"'");
  const lines=text.split('\n').map(s=>s.trim()).filter(s=>s.length>0);
  const u=[]; for(const l of lines) if(u[u.length-1]!==l) u.push(l);
  // 找「职位名 + 薪资」配对
  for(let i=0;i<u.length;i++){
    const sal=u[i].match(/^\$[0-9]{2,3}k\s*[-\u2013]\s*\$?[0-9]{2,3}k/);
    if(!sal) continue;
    // 薪资前一个较长文本是职位名
    let title='';
    for(let j=i-1;j>=Math.max(0,i-4);j--){
      const c=u[j];
      if(c.length>10 && c.length<90 && /[A-Za-z]/.test(c) && !/^\$/.test(c)){ title=c; break; }
    }
    if(!title) continue;
    const key=title+'|'+sal[0];
    if(seen.has(key)) continue; seen.add(key);
    const eq=u[i].match(/[0-9.]+%\s*[-\u2013]\s*[0-9.]+%/);
    all.push({title:title.slice(0,110), salary:sal[0], equity:eq?eq[0]:'', src:f});
  }
}
fs.writeFileSync('_wellfound_jobs.json',JSON.stringify(all,null,1),'utf8');
console.log('TOTAL='+all.length);
console.log('withEquity='+all.filter(a=>a.equity).length);
for(const a of all.slice(0,8)) console.log('  ['+a.salary+'] '+(a.equity||'')+' | '+a.title.slice(0,45));