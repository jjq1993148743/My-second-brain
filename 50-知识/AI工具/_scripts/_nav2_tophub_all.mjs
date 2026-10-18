
import { get, gbk, sleep } from './proxy-fetch.mjs';
import { pickCharset } from './links.mjs';
import fs from 'node:fs';
const OUT='_nav2_sites.json';
const acc=new Map();
try { for (const r of JSON.parse(fs.readFileSync(OUT,'utf8'))) acc.set(r.host,{...r,from:[].concat(r.from)}); } catch {}
function add(host,name,from){ host=String(host||'').toLowerCase().replace(/^www\./,''); if(!host||!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host))return; if(!acc.has(host))acc.set(host,{host,name:name||'',from:[from],count:0}); const x=acc.get(host); x.count++; if(name&&name.length>x.name.length)x.name=name.slice(0,60); if(!x.from.includes(from))x.from.push(from); }
function parse(html, from) {
  const parts = html.split('<div class="cc-cd"').slice(1);
  const names = parts.map(c=>{const m=/cc-cd-lb[^>]*>[\s\S]{0,300}?<span>([\s\S]{1,40}?)<\/span>/.exec(c);return m?m[1].replace(/\s+/g,' ').trim():'';});
  let n=0;
  parts.forEach((c,i)=>{
    const img=/assets\/images\/media\/([a-z0-9][a-z0-9.-]*\.[a-z]{2,})\.png/i.exec(c);
    if(img){ add(img[1], names[i]||'', from); n++; return; }
    const m=/<a\s+href="(https?:\/\/[^"]+)"/i.exec(c.slice(0,4000));
    if(m){ try{ add(new URL(m[1]).hostname, names[i]||'', from); n++; }catch{} }
  });
  return n;
}
// 全部分类（含可能的其他 slug）
const slugs=['news','tech','ent','community','shopping','finance','developer','ai','design','university','organization','blog','epaper','brief','realtech','programmer','startup','life','study','finance2','video','picture','job','finance3'];
let pages=0;
for (const s of slugs) {
  try {
    const r=await get('https://tophub.today/c/'+s,'text/html,*/*',30000);
    const t=pickCharset(r.body)==='gbk'?gbk(r.body):r.body.toString('utf8');
    const n=parse(t,'tophub_'+s);
    pages++;
    console.log('c/'+s+' '+r.status+' cards='+n+' total='+acc.size);
  } catch(e){ console.log('FAIL c/'+s+' '+e.message.slice(0,40)); }
  fs.writeFileSync(OUT, JSON.stringify([...acc.values()]));
  await sleep(700+Math.random()*250);
}
fs.writeFileSync(OUT, JSON.stringify([...acc.values()]));
console.log('DONE hosts='+acc.size+' pages='+pages);
