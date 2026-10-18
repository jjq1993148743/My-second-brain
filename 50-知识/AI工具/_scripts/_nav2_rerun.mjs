
// _nav2_rerun.mjs — 重建域名清单并落盘到绝对路径
import { get, gbk, sleep, strip } from './proxy-fetch.mjs';
import { links, pickCharset } from './links.mjs';
import fs from 'node:fs';
const ABS='D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/';
const OUT=ABS+'_nav2_sites.json';
const acc=new Map();
function add(host,name,from){ host=String(host||'').toLowerCase().replace(/^www\./,''); if(!host||!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host))return; if(!acc.has(host))acc.set(host,{host,name:name||'',from:[from],count:0}); const x=acc.get(host); x.count++; if(name&&name.length>x.name.length)x.name=name.slice(0,60); if(!x.from.includes(from))x.from.push(from); }
function parse(html, from) {
  const parts = html.split('<div class="cc-cd"').slice(1);
  const names = parts.map(c=>{const m=/cc-cd-lb[^>]*>[\s\S]{0,300}?<span>([\s\S]{1,40}?)<\/span>/.exec(c);return m?m[1].replace(/\s+/g,' ').trim():'';});
  let n=0;
  parts.forEach((c,i)=>{
    const img=/assets\/images\/media\/([a-z0-9][a-z0-9.-]*\.[a-z]{2,})\.png/i.exec(c);
    if(img){ add(img[1],names[i]||'',from); n++; return; }
    const m=/<a\s+href="(https?:\/\/[^"]+)"/i.exec(c.slice(0,4000));
    if(m){ try{ add(new URL(m[1]).hostname, names[i]||'', from); n++; }catch{} }
  });
  return n;
}
// 1) 本地已抓的 realtech 页
for (const [f,from] of [['_nav2_t_realtech.html','tophub_realtech'],['_nav2_t_prog.html','tophub_prog'],['_nav2_t_startup.html','tophub_startup'],['_nav2_t_life.html','tophub_life'],['_nav2_t_study.html','tophub_study'],['_nav2_uisdc_font.html','uisdc_font'],['_nav2_pro.html','uisdc_pro'],['_nav2_hotsearch.html','uisdc_hotsearch']]) {
  let html; try { html=fs.readFileSync(ABS+f,'utf8'); } catch { console.log('skip '+f); continue; }
  if (!html.length) { console.log('empty '+f); continue; }
  if (/cc-cd/.test(html)) { const n=parse(html,from); console.log(f+' nodecards='+n); }
  else { let c=0; for (const l of links(html, 'https://x/')) { try { const u=new URL(l.href); if(/\.uisdc\.com$/.test(u.hostname))continue; if(/libs\.baidu\.com/.test(u.hostname))continue; add(u.hostname,l.anchor,from); c++; } catch {} } console.log(f+' anchors='+c); }
}
// 2) tophub 分类页
const slugs=['news','tech','ent','community','shopping','finance','developer','ai','design','university','organization','blog','epaper','brief'];
for (const s of slugs) {
  try {
    const r=await get('https://tophub.today/c/'+s,'text/html,*/*',30000);
    const t=pickCharset(r.body)==='gbk'?gbk(r.body):r.body.toString('utf8');
    const n=parse(t,'tophub_'+s);
    console.log('c/'+s+' '+r.status+' cards='+n+' total='+acc.size);
  } catch(e){ console.log('FAIL c/'+s+' '+String(e.message).slice(0,50)); }
  fs.writeFileSync(OUT, JSON.stringify([...acc.values()]));
  await sleep(800+Math.random()*300);
}
fs.writeFileSync(OUT, JSON.stringify([...acc.values()]));
console.log('REBUILD-DONE hosts='+acc.size);
