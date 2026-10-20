import fs from 'node:fs';
import path from 'node:path';
const dir='_raw_euro';
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.html'));
const all=[]; const seen=new Set();

for(const f of files){
  const html=fs.readFileSync(path.join(dir,f),'utf8');
  const text=html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ')
    .replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"');
  const lines=text.split('\n').map(s=>s.trim()).filter(s=>s.length>0);
  const u=[]; for(const l of lines) if(u[u.length-1]!==l) u.push(l);

  for(let i=0;i<u.length;i++){
    // 找 'Posted N days ago' 作为锚点
    const m=u[i].match(/^Posted (\d+) (day|days|hour|hours) ago$/i);
    if(!m) continue;
    // 往前找标题（较长字符串，且不是地点）
    let title='',company='',loc='';
    for(let j=i-1;j>=Math.max(0,i-12);j--){
      const c=u[j];
      if(!title && c.length>12 && c.length<120 && /[A-Za-z]/.test(c) && !/(Germany|Netherlands|Remote|Europe|UK|France|Spain|Poland|Sweden|,$)/i.test(c)){ title=c; continue; }
      if(!company && c.length>2 && c.length<60 && /^[A-Z]/.test(c) && !title){ continue; }
      if(!loc && /(Germany|Netherlands|Remote|Europe|UK|France|Spain|Poland|Sweden)/i.test(c) && c.length<50){ loc=c; }
    }
    if(!title) continue;
    const key=title+'|'+u[i];
    if(seen.has(key)) continue; seen.add(key);
    all.push({title:title.slice(0,120), loc, when:u[i], src:f});
  }
}
fs.writeFileSync('_euro_projects.json',JSON.stringify(all,null,1),'utf8');
console.log('TOTAL='+all.length);
const withLoc=all.filter(a=>a.loc).length;
console.log('withLoc='+withLoc);
for(const a of all.slice(0,10)) console.log('  '+a.when+' | '+a.loc+' | '+a.title.slice(0,50));