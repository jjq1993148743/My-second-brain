import { execFile } from 'node:child_process';
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const run=(a)=>new Promise(res=>execFile('curl',a,{maxBuffer:48*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const list=JSON.parse(fs.readFileSync('_B_CANDIDATES.json','utf8'));
const out=[];
const clean=s=>s.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
for(const p of list){
  let raw=''; try{ raw=await run(['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept-Language: zh-CN,zh;q=0.9,en;q=0.8','--max-time','18','--compressed','-w','\n%{http_code}|%{size_download}|%{url_effective}',p.url]); }catch(e){}
  const idx=raw.lastIndexOf('\n'); const meta=idx>=0?raw.slice(idx+1):''; const html=idx>=0?raw.slice(0,idx):raw;
  const [code,size,finalUrl]=meta.split('|');
  const c=parseInt(code||'0',10)||0; const bytes=parseInt(size||'0',10)||html.length;
  const text=clean(html);
  const title=(html.match(/<title[^>]*>([\s\S]{0,90}?)<\/title>/i)||[])[1]||'';
  // 学生相关信号
  const stuHits=(text.match(/(学生|大学生|校园|考研|四六级|论文|作业|教材|笔记|家教|辅导|课程|study|student|college|university|homework|essay|tutor|exam)/gi)||[]).length;
  const moneyHits=(text.match(/[$\u20ac\u00a3\u00a5\uffe5]\s?[0-9,]+|\d+\s*元/g)||[]).length;
  const sellHits=(text.match(/(卖|出售|发布|开店|上架|接单|服务|sell|shop|listing|gig|offer)/gi)||[]).length;
  let status='需登录/营销';
  if(c===0) status='打不开';
  else if(c===403||c===429) status='反爬';
  else if(c>=400||bytes<2000) status='空/极小';
  else if(stuHits>=10 && (sellHits>=3||moneyHits>=2)) status='✅学生+可交易';
  else if(stuHits>=6) status='✅学生聚集';
  else if(stuHits>=2) status='🟡弱相关';
  else status='未见学生';
  out.push({name:p.name,host:p.host,url:p.url,type:p.type,note:p.note,code:String(code||'0'),bytes,title:title.trim().slice(0,60),stuHits,moneyHits,sellHits,status});
  console.log(p.name.padEnd(14)+String(code||'0').padEnd(5)+String(Math.round(bytes/1000)+'k').padEnd(7)+'stu='+String(stuHits).padEnd(5)+'$='+String(moneyHits).padEnd(4)+'sell='+String(sellHits).padEnd(4)+status+' | '+title.trim().slice(0,26));
  await new Promise(r=>setTimeout(r,700));
}
fs.writeFileSync('_B_RESULT.json',JSON.stringify(out,null,1),'utf8');
const d={}; for(const o of out) d[o.status]=(d[o.status]||0)+1;
console.log('DONE'); console.log(JSON.stringify(d,null,1));