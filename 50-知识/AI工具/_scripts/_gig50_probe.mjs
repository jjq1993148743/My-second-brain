import { execFile } from 'node:child_process';
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const run=(a)=>new Promise(res=>execFile('curl',a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const list=JSON.parse(fs.readFileSync('_GIG50_CANDIDATES.json','utf8'));
const out=[];
const clean=s=>s.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
for(const p of list){
  const url='https://'+p.host;
  let raw=''; try{ raw=await run(['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept-Language: en-US,en;q=0.9','--max-time','18','--compressed','-w','\n%{http_code}|%{url_effective}|%{size_download}',url]); }catch(e){}
  const idx=raw.lastIndexOf('\n'); const meta=idx>=0?raw.slice(idx+1):''; const html=idx>=0?raw.slice(0,idx):raw;
  const [code,finalUrl,size]=meta.split('|');
  const c=parseInt(code||'0',10)||0; const bytes=parseInt(size||'0',10)||html.length;
  const text=clean(html);
  const title=(html.match(/<title[^>]*>([\s\S]{0,100}?)<\/title>/i)||[])[1]||'';
  const jobHits=(text.match(/\b(job|career|position|hiring|opening|vacanc)s?\b/gi)||[]).length;
  const projHits=(text.match(/\b(project|freelance|gig|task|bounty|mission|offer)s?\b/gi)||[]).length;
  const moneyHits=(text.match(/[$\u20ac\u00a3\u00a5]\s?[0-9]{2,}|\b(budget|salary|rate|payout|price|bid)s?\b/gi)||[]).length;
  const spa=/<div id="(root|app|__next)"/i.test(html) && text.length<500;
  let status='营销/需登录';
  if(c===0) status='打不开';
  else if(c===403||c===429) status='反爬拦截';
  else if(c>=500) status='服务器错误';
  else if(c>=400||bytes<2000) status='空页面';
  else if(spa) status='SPA需JS';
  else if((jobHits+projHits)>=5 && moneyHits>=2) status='✅有活有价';
  else if((jobHits+projHits)>=3) status='✅有活无价';
  else status='营销/需登录';
  out.push({name:p.name,host:p.host,note:p.note,code:String(code||'0'),bytes,title:title.trim().slice(0,70),jobHits,projHits,moneyHits,status,finalUrl:String(finalUrl||'').slice(0,80)});
  console.log(p.name.padEnd(18)+String(code||'0').padEnd(5)+String(Math.round(bytes/1000)+'k').padEnd(7)+'j='+String(jobHits).padEnd(4)+'p='+String(projHits).padEnd(4)+'$='+String(moneyHits).padEnd(4)+status);
  await new Promise(r=>setTimeout(r,700));
}
fs.writeFileSync('_GIG50_RESULT.json',JSON.stringify(out,null,1),'utf8');
const d={}; for(const o of out) d[o.status]=(d[o.status]||0)+1;
console.log('DONE'); console.log(JSON.stringify(d,null,1));