
import { get, gbk, sleep, strip } from './proxy-fetch.mjs';
import { pickCharset } from './links.mjs';
import fs from 'node:fs';
const LIST=JSON.parse(fs.readFileSync('_nav2_probe_list.json','utf8'));
const SITE=JSON.parse(fs.readFileSync('_nav2_sites.json','utf8'));
const map={}; for(const r of SITE) map[r.host]={name:r.name||'',from:(r.from||[]).join(','),cat:''};
const OUT='_nav2_batch1.json';
const res=[];
const CATKW=[['赚钱/副业',/赚钱|副业|接单|外包|威客|网赚|创收|收入|被动|变现|电商|带货|佣金/i],['素材/模板',/素材|模板|主题|图标|icon|字体|psd|矢量|png|图库|封面|海报|banner/i],['设计',/设计|design|ui|ux|创意|视觉|海报|插画|配色/i],['开发者工具',/开发|dev|代码|code|api|github|工具|tool|框架|前端|后端|程序|script/i],['独立开发',/独立|indie|startup|创业|产品|product|saas|maker|创业者/i],['数字商品',/数字|商品|课程|教程|学习|专栏|知识|付费|电子书|ebook/i]];
let n=0;
for (const host of LIST) {
  n++;
  const rec={ host, status:0, len:0, title:'', from: map[host]?.from||'nav', name: map[host]?.name||'', cat:'' };
  try {
    const r=await get('https://'+host+'/','text/html,application/xhtml+xml,*/*',25000);
    rec.status=r.status; rec.len=r.body.length;
    const enc=pickCharset(r.body);
    const txt=enc==='gbk'?gbk(r.body):r.body.toString('utf8');
    const m=/<title[^>]*>([\s\S]{1,90}?)<\/title>/i.exec(txt);
    rec.title=m?strip(m[1]).slice(0,70):'';
    const all=rec.title+' '+(rec.name||'');
    for (const [c,re] of CATKW) if (re.test(all)) { rec.cat=c; break; }
  } catch(e) { rec.status=-1; rec.title='ERR '+String(e.message).slice(0,40); }
  res.push(rec);
  console.log('['+n+'/'+LIST.length+'] '+host+' -> '+rec.status+' len='+rec.len+' cat='+rec.cat+' :: '+rec.title.slice(0,50));
  fs.writeFileSync(OUT, JSON.stringify(res,null,1));
  await sleep(800+Math.random()*400);
}
fs.writeFileSync(OUT, JSON.stringify(res,null,1));
console.log('BATCH1-DONE n='+res.length+' ok='+res.filter(r=>r.status>=200&&r.status<400).length);
