import { execFile } from 'node:child_process';
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const run=(a)=>new Promise(res=>execFile('curl',a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const list=JSON.parse(fs.readFileSync('_CN_GIG.json','utf8'));
const out=[];
const clean=s=>s.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
for(const p of list){
  let raw=''; try{ raw=await run(['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept-Language: zh-CN,zh;q=0.9','--max-time','18','--compressed','-w','\n%{http_code}|%{size_download}|%{url_effective}',p.url]); }catch(e){}
  const idx=raw.lastIndexOf('\n'); const meta=idx>=0?raw.slice(idx+1):''; const html=idx>=0?raw.slice(0,idx):raw;
  const [code,size,finalUrl]=meta.split('|');
  const c=parseInt(code||'0',10)||0; const bytes=parseInt(size||'0',10)||html.length;
  const text=clean(html);
  const title=(html.match(/<title[^>]*>([\s\S]{0,90}?)<\/title>/i)||[])[1]||'';
  const projHits=(text.match(/(项目|任务|需求|悬赏|接单|外包|兼职|招标)/g)||[]).length;
  const moneyHits=(text.match(/[\u00a5\uffe5]\s?[0-9,]+|\d+\s*元/g)||[]).length;
  let status='营销/需登录';
  if(c===0) status='DNS失败';
  else if(c>=400) status='拦截('+c+')';
  else if(bytes<2000) status='空页';
  else if(projHits>=8 && moneyHits>=3) status='✅有活有价';
  else if(projHits>=5) status='✅有活';
  else if(moneyHits>=5) status='🟡有价格';
  out.push({name:p.name,host:p.host,url:p.url,type:p.type,code:String(code||'0'),bytes,title:title.trim().slice(0,60),projHits,moneyHits,status,finalUrl:String(finalUrl||'').slice(0,70)});
  console.log(p.name.padEnd(14)+String(code||'0').padEnd(5)+String(Math.round(bytes/1000)+'k').padEnd(7)+'proj='+String(projHits).padEnd(4)+'¥='+String(moneyHits).padEnd(4)+status+' | '+title.trim().slice(0,32));
  await new Promise(r=>setTimeout(r,700));
}
fs.writeFileSync('_CN_GIG_RESULT.json',JSON.stringify(out,null,1),'utf8');
const d={}; for(const o of out) d[o.status]=(d[o.status]||0)+1;
console.log('DONE'); console.log(JSON.stringify(d,null,1));