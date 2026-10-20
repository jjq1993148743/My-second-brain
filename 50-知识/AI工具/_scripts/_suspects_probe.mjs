import { execFile } from 'node:child_process';
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const run=(a)=>new Promise(res=>execFile('curl',a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:16000},(e,so)=>res(so||'')));
const queue=JSON.parse(fs.readFileSync('_SUSPECTS_UNMONEY.json','utf8'));
let out=[]; try{ out=JSON.parse(fs.readFileSync('_SUSPECTS_RESULT.json','utf8')); }catch(e){}
const seen=new Set(out.map(o=>o.host));
console.log('resume already='+out.length+' queue='+queue.length);
let n=0;
for(const q of queue){
  if(seen.has(q.host)) continue;
  const url='https://'+q.host;
  let raw=''; try{ raw=await run(['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','11','--compressed','-w','\n%{http_code}|%{url_effective}|%{size_download}',url]); }catch(e){}
  const idx=raw.lastIndexOf('\n'); const meta=idx>=0?raw.slice(idx+1):''; const html=idx>=0?raw.slice(0,idx):raw;
  const [code,finalUrl,size]=meta.split('|');
  const c=parseInt(code||'0',10)||0;
  const bytes=parseInt(size||'0',10)||html.length;
  const text=html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
  const title=(html.match(/<title[^>]*>([\s\S]{0,100}?)<\/title>/i)||[])[1]||'';
  const jobHits=(text.match(/\b(job|career|position|hiring|opening|vacancy)s?\b/gi)||[]).length;
  const projHits=(text.match(/\b(project|freelance|gig|task|bounty|mission|offer|sell|store)s?\b/gi)||[]).length;
  const moneyHits=(text.match(/[$\u20ac\u00a3\u00a5]\s?[0-9]{2,}|\b(budget|salary|rate|payout|reward|price|commission)s?\b/gi)||[]).length;
  const spa=/<div id="(root|app|__next)"[^>]*>\s*<\/div>/i.test(html) || (text.length<400 && /react|vue|next|nuxt|angular/i.test(html));
  let verdict='营销/静态';
  if(c>=500) verdict='死站('+c+')';
  else if(c===403||c===429) verdict='反爬('+c+')';
  else if(c>=400||bytes<1500) verdict='空/极小';
  else if(spa) verdict='SPA需JS';
  else if(jobHits>=3&&moneyHits>=1) verdict='职位+金额';
  else if(jobHits>=3) verdict='职位列表';
  else if(projHits>=3) verdict='项目特征';
  else if(moneyHits>=3) verdict='金额/营销';
  out.push({host:q.host, cat:q.cat, code:String(code||'0'), bytes, title:title.trim().slice(0,70), jobHits, projHits, moneyHits, verdict, finalUrl:String(finalUrl||'').slice(0,100)});
  n++;
  if(n%25===0){ fs.writeFileSync('_SUSPECTS_RESULT.json',JSON.stringify(out,null,1),'utf8'); console.log('progress new='+n+' total='+out.length+' '+q.host+' -> '+verdict); }
  await new Promise(r=>setTimeout(r,250));
}
fs.writeFileSync('_SUSPECTS_RESULT.json',JSON.stringify(out,null,1),'utf8');
const dist={}; for(const o of out) dist[o.verdict]=(dist[o.verdict]||0)+1;
console.log('DONE total='+out.length);
console.log(JSON.stringify(dist,null,1));