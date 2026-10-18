
import { get, gbk, sleep, strip } from './proxy-fetch.mjs';
import { pickCharset } from './links.mjs';
import fs from 'node:fs';
const TARGETS = ['zcool.com.cn','uisdc.com','logonews.cn','behance.net','remai.today','uiiiuiii.com','aixzd.com','uicreater.com','designmodo.com','hellogithub.com','ui.cn','m.adquan.com','xiaoe-tech.com','chongbuluo.com'];
const OUT='_nav2_batch2.json';
const res=[];
for (const host of TARGETS) {
  const rec={ host, status:0, len:0, title:'', from:'nav', name:'', cat:'', url:'' };
  for (const u of ['https://'+host+'/','https://www.'+host+'/']) {
    try {
      const r=await get(u,'text/html,*/*',25000);
      if (r.status>=300&&r.status<400&&r.body.length<400) { rec.follow=r.headers.location||''; continue; }
      rec.status=r.status; rec.len=r.body.length; rec.url=u;
      const enc=pickCharset(r.body); const txt=enc==='gbk'?gbk(r.body):r.body.toString('utf8');
      const m=/<title[^>]*>([\s\S]{1,90}?)<\/title>/i.exec(txt);
      rec.title=m?strip(m[1]).slice(0,70):'';
      break;
    } catch(e){ rec.status=-1; rec.title='ERR '+String(e.message).slice(0,40); break; }
  }
  const CATKW=[['赚钱/副业',/赚钱|副业|接单|外包|威客|网赚|创收|变现|电商|带货|佣金/i],['素材/模板',/素材|模板|主题|图标|icon|字体|psd|矢量|图库|封面|海报|banner/i],['设计',/设计|design|ui|ux|创意|视觉|海报|插画|配色/i],['开发者工具',/开发|dev|代码|code|api|github|工具|tool|框架|程序|script|开源/i],['独立开发',/独立|indie|startup|创业|产品|product|saas|maker/i],['数字商品',/数字|商品|课程|教程|学习|专栏|知识|付费|电子书|ebook/i]];
  const all=rec.title+' '+host;
  for (const [c,re] of CATKW) if (re.test(all)) { rec.cat=c; break; }
  res.push(rec);
  console.log(host+' -> '+rec.status+' len='+rec.len+' cat='+rec.cat+' :: '+(rec.title||rec.follow||'').slice(0,60));
  fs.writeFileSync(OUT, JSON.stringify(res,null,1));
  await sleep(900+Math.random()*300);
}
console.log('BATCH2-DONE ok='+res.filter(r=>r.status>=200&&r.status<400).length+'/'+res.length);
