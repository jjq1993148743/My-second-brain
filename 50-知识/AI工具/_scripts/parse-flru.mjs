import fs from 'node:fs';
import path from 'node:path';
const dir='_raw_flru2';
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.html')).sort();
const all=[]; const seen=new Set();
for(const f of files){
  const html=fs.readFileSync(path.join(dir,f),'utf8');
  // fl.ru 项目块：找含 project 的容器
  const blocks=[...html.matchAll(/<div[^>]*class="[^"]*project[^"]*"[\s\S]{0,3000}?<\/div>\s*<\/div>/gi)];
  // 退化方案：按 budget 行定位
  const text=html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ')
    .replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&laquo;/g,'«').replace(/&raquo;/g,'»');
  const lines=text.split('\n').map(s=>s.trim()).filter(s=>s.length>0);
  const uniq=[]; for(const l of lines) if(uniq[uniq.length-1]!==l) uniq.push(l);
  for(let i=0;i<uniq.length;i++){
    const l=uniq[i];
    const mm=l.match(/^((?:до\s+)?[0-9][0-9\s]*(?:-[0-9\s]+)?\s*(?:₽|руб\.?)(?:\s*–\s*[0-9\s]*₽)?)/i);
    if(!mm) continue;
    // 标题：往前找较长的一行
    let title='';
    for(let j=i-1;j>Math.max(0,i-8);j--){
      const c=uniq[j];
      if(c.length>20 && c.length<200 && !/^(Откликнуться|Удалённо|Проект|Бюджет)/.test(c)) { title=c; break; }
    }
    // 时间
    let when='';
    for(let j=Math.max(0,i-6);j<Math.min(uniq.length,i+4);j++){
      if(/(минут|час|день|дня|дней)\s*назад/i.test(uniq[j])) { when=uniq[j]; break; }
    }
    const key=title.slice(0,50)+'|'+mm[1];
    if(seen.has(key)) continue; seen.add(key);
    all.push({title:title.slice(0,200),budget:mm[1].trim(),when,src:f});
  }
}
fs.writeFileSync('_flru_projects.json',JSON.stringify(all,null,1),'utf8');
console.log('EXTRACTED='+all.length);
const w = all.filter(a=>a.when).length;
console.log('withTime='+w);
for(const a of all.slice(0,6)) console.log('  ['+a.budget+'] '+a.when+' | '+a.title.slice(0,60));