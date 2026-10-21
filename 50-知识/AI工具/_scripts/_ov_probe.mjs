import { execFile } from 'node:child_process';
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const run=(a)=>new Promise(res=>execFile('curl',a,{maxBuffer:48*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const list=JSON.parse(fs.readFileSync('_OV_CANDIDATES.json','utf8'));
const out=[];
const clean=s=>s.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
for(const p of list){
  let raw=''; try{ raw=await run(['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept-Language: en-US,en;q=0.9','--max-time','18','--compressed','-w','\n%{http_code}|%{size_download}',p.url]); }catch(e){}
  const idx=raw.lastIndexOf('\n'); const meta=idx>=0?raw.slice(idx+1):''; const html=idx>=0?raw.slice(0,idx):raw;
  const [code,size]=meta.split('|');
  const c=parseInt(code||'0',10)||0; const bytes=parseInt(size||'0',10)||html.length;
  const text=clean(html);
  const title=(html.match(/<title[^>]*>([\s\S]{0,90}?)<\/title>/i)||[])[1]||'';
  const stuHits=(text.match(/\b(student|students|study|notes|exam|tutor|course|university|college|homework|essay|lecture|class)\b/gi)||[]).length;
  const moneyHits=(text.match(/[$\u20ac\u00a3]\s?[0-9][0-9,.]*/g)||[]).length;
  const sellHits=(text.match(/\b(sell|earn|upload|become a|join as|payout|instructor|creator|partner)\b/gi)||[]).length;
  let status='弱相关';
  if(c===0) status='打不开';
  else if(c===403||c===429) status='反爬';
  else if(c>=400||bytes<2000) status='空/极小';
  else if(stuHits>=25 && sellHits>=3 && moneyHits>=3) status='✅学生+招募卖家+标价';
  else if(stuHits>=20 && sellHits>=2) status='✅学生+招募卖家';
  else if(stuHits>=15) status='✅学生市场';
  else if(stuHits>=5) status='🟡弱';
  else status='未见学生信号';
  out.push({name:p.name,host:p.host,url:p.url,type:p.type,note:p.note,code:String(code||'0'),bytes,title:title.trim().slice(0,60),stuHits,moneyHits,sellHits,status});
  console.log(p.name.padEnd(20)+String(code||'0').padEnd(5)+String(Math.round(bytes/1000)+'k').padEnd(7)+'stu='+String(stuHits).padEnd(5)+'$='+String(moneyHits).padEnd(4)+'sell='+String(sellHits).padEnd(4)+status);
  await new Promise(r=>setTimeout(r,700));
}
fs.writeFileSync('_OV_RESULT.json',JSON.stringify(out,null,1),'utf8');
const d={}; for(const o of out) d[o.status]=(d[o.status]||0)+1;
console.log('DONE'); console.log(JSON.stringify(d,null,1));