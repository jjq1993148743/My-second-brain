
import { get, gbk, sleep, strip } from './proxy-fetch.mjs';
import { pickCharset } from './links.mjs';
import fs from 'node:fs';
const ABS='D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/';
const LIST=JSON.parse(fs.readFileSync(ABS+'_nav2_probe_list.json','utf8'));
const SITE={}; for(const r of JSON.parse(fs.readFileSync(ABS+'_nav2_sites.json','utf8'))) SITE[r.host]={name:r.name||'',from:(r.from||[]).join(',')};
const OUT=ABS+'_nav2_batch1.json';
const res=[]; const done=new Set();
try { for (const r of JSON.parse(fs.readFileSync(OUT,'utf8'))) { res.push(r); done.add(r.host); } } catch {}
const CATKW=[['赚钱/副业',/赚钱|副业|接单|外包|威客|网赚|创收|变现|电商|带货|佣金|私域/i],['素材/模板',/素材|模板|主题|图标|icon|字体|psd|矢量|图库|封面|海报|banner|视觉中国/i],['设计',/设计|design|ui|ux|创意|视觉|海报|插画|配色|logo/i],['开发者工具',/开发|dev|代码|code|api|github|工具|tool|框架|程序|script|开源/i],['独立开发',/独立|indie|startup|创业|产品|product|saas|maker/i],['数字商品',/数字|商品|课程|教程|学习|专栏|知识|付费|电子书|ebook/i]];
for (const host of LIST) {
  if (done.has(host)) { console.log('skip '+host); continue; }
  const rec={ host, status:0, len:0, title:'', from:SITE[host]?.from||'nav', name:SITE[host]?.name||'', cat:'', note:'' };
  for (const u of ['https://'+host+'/','https://www.'+host+'/']) {
    try {
      const r=await get(u,'text/html,application/xhtml+xml,*/*',25000);
      if (r.status>=300&&r.status<400) { rec.note='-> '+(r.headers.location||'').slice(0,50); continue; }
      rec.status=r.status; rec.len=r.body.length;
      const enc=pickCharset(r.body); const txt=enc==='gbk'?gbk(r.body):r.body.toString('utf8');
      const m=/<title[^>]*>([\s\S]{1,90}?)<\/title>/i.exec(txt);
      rec.title=m?strip(m[1]).slice(0,70):'';
      break;
    } catch(e){ rec.status=-1; rec.title='ERR '+String(e.message).slice(0,35); break; }
  }
  const all=rec.title+' '+rec.name+' '+host;
  for (const [c,re] of CATKW) if (re.test(all)) { rec.cat=c; break; }
  res.push(rec); done.add(host);
  console.log(host+' -> '+rec.status+' len='+rec.len+' cat='+(rec.cat||'-')+(rec.note?' '+rec.note:'')+' :: '+(rec.title||'').slice(0,45));
  fs.writeFileSync(OUT, JSON.stringify(res,null,1));
  await sleep(700+Math.random()*350);
}
fs.writeFileSync(OUT, JSON.stringify(res,null,1));
console.log('BATCH1-DONE n='+res.length+' ok='+res.filter(r=>r.status>=200&&r.status<400).length+' size='+fs.statSync(OUT).size);
