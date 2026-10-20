import { execFile } from 'node:child_process';
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const run=(a)=>new Promise(res=>execFile('curl',a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const pool=JSON.parse(fs.readFileSync('_POOL_MASTER.json','utf8'));
const out=[];
const total=pool.length;
for(let i=0;i<total;i++){
  const p=pool[i];
  const args=['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','14','--compressed','-w','\n%{http_code}|%{url_effective}|%{size_download}',p.url];
  let raw='';
  try{ raw=await run(args); }catch(e){ raw=''; }
  const idx=raw.lastIndexOf('\n');
  const meta=idx>=0? raw.slice(idx+1):'';
  const html=idx>=0? raw.slice(0,idx):raw;
  const parts=meta.split('|');
  const code=parts[0]||'0';
  const finalUrl=parts[1]||p.url;
  const bytes=parseInt(parts[2]||'0',10)||html.length;
  const text=html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
  const title=(html.match(/<title[^>]*>([\s\S]{0,120}?)<\/title>/i)||[])[1]||'';
  const jobHits=(text.match(/\b(job|jobs|career|careers|position|vacancy|hiring|opening)s?\b/gi)||[]).length;
  const projHits=(text.match(/\b(project|projects|freelance|gig|task|tasks|bounty|contractor)s?\b/gi)||[]).length;
  const moneyHits=(text.match(/[$\u20ac\u00a3\u00a5]\s?[0-9]{2,}|\b(budget|salary|rate|hourly|payout|reward)\b/gi)||[]).length;
  const spa=/<div id="(root|app|__next)"[^>]*>\s*<\/div>/i.test(html) || (text.length<400 && /react|vue|next|nuxt|angular/i.test(html));
  const nlHits=(text.match(/\n/g)||[]).length;
  let verdict='营销/静态';
  const c=parseInt(code,10)||0;
  if(c>=400) verdict='死站/阻断('+code+')';
  else if(bytes<2500) verdict='空/极小';
  else if(spa) verdict='SPA需JS';
  else if(jobHits>=3 && moneyHits>=1) verdict='职位+金额';
  else if(jobHits>=3) verdict='职位列表';
  else if(projHits>=3) verdict='项目特征';
  else if(moneyHits>=3) verdict='金额/营销';
  out.push({host:p.host,url:p.url,type:p.type,region:p.region,code,finalUrl:finalUrl.slice(0,120),bytes,title:title.trim().slice(0,80),textLen:text.length,spa,jobHits,projHits,moneyHits,verdict});
  if(i%20===0){ fs.writeFileSync('_POOL_PROBE.json',JSON.stringify(out,null,1),'utf8'); console.log('progress '+i+'/'+total+' '+p.host+' -> '+verdict); }
  await new Promise(r=>setTimeout(r,500));
}
fs.writeFileSync('_POOL_PROBE.json',JSON.stringify(out,null,1),'utf8');
const dist={}; for(const o of out) dist[o.verdict]=(dist[o.verdict]||0)+1;
console.log('DONE total='+out.length);
console.log(JSON.stringify(dist,null,1));
