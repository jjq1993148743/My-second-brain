import fs from 'node:fs';
import path from 'node:path';
const dir='_raw_datajobs';
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.html')).sort();
const all=[]; const seen=new Set();
for(const f of files){
  const html=fs.readFileSync(path.join(dir,f),'utf8');
  // 找 job 链接模式
  const parts=html.split(/href="(\/jobs?\/[a-z0-9\-]{6,})"/);
  for(let k=1;k<parts.length;k+=2){
    const slug=parts[k];
    if(seen.has(slug)) continue; seen.add(slug);
    const c=(parts[k+1]||'').slice(0,1500);
    const text=c.replace(/<[^>]+>/g,'\n');
    const u=[...new Set(text.split('\n').map(s=>s.trim()).filter(s=>s.length>3))];
    const title=u[0]||'';
    all.push({slug, title:title.slice(0,100)});
  }
}
fs.writeFileSync('_datajobs_projects.json',JSON.stringify(all,null,1),'utf8');
console.log('TOTAL='+all.length);
for(const a of all.slice(0,6)) console.log('  '+a.title.slice(0,60));