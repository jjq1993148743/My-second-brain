import { execFile } from 'node:child_process';
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const run=(a)=>new Promise(res=>execFile('curl',a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:15000},(e,so)=>res(so||'')));
const queue=JSON.parse(fs.readFileSync('_FINAL_QUEUE.json','utf8'));
const out=[];
for(const q of queue){
  const url='https://'+q.host;
  let raw=''; try{ raw=await run(['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','10','--compressed','-w','\n%{http_code}|%{size_download}',url]); }catch(e){}
  const idx=raw.lastIndexOf('\n'); const meta=idx>=0?raw.slice(idx+1):''; const html=idx>=0?raw.slice(0,idx):raw;
  const [code,size]=meta.split('|');
  const c=parseInt(code||'0',10)||0; const bytes=parseInt(size||'0',10)||html.length;
  const text=html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  const title=(html.match(/<title[^>]*>([\s\S]{0,90}?)<\/title>/i)||[])[1]||'';
  const jobHits=(text.match(/\b(job|career|position|hiring|opening)s?\b/gi)||[]).length;
  const moneyHits=(text.match(/[$\u20ac\u00a3\u00a5]\s?[0-9]{2,}|\b(budget|salary|rate|payout|price)s?\b/gi)||[]).length;
  let verdict='营销/静态';
  if(c>=500) verdict='死站('+c+')';
  else if(c===403||c===429) verdict='反爬('+c+')';
  else if(c>=400||bytes<1500) verdict='空/极小';
  else if((html.match(/<div id="(root|app|__next)"/i)||[]).length && text.length<400) verdict='SPA需JS';
  else if(jobHits>=3) verdict='职位列表';
  else if(moneyHits>=3) verdict='金额/营销';
  out.push({host:q.host, code:String(code||'0'), bytes, title:title.trim().slice(0,70), jobHits, moneyHits, verdict});
  console.log(q.host.padEnd(30)+(code||'0')+' '+Math.round(bytes/1000)+'k jobs='+jobHits+' -> '+verdict);
  await new Promise(r=>setTimeout(r,250));
}
fs.writeFileSync('_FINAL_RESULT.json',JSON.stringify(out,null,1),'utf8');
const dist={}; for(const o of out) dist[o.verdict]=(dist[o.verdict]||0)+1;
console.log('DONE'); console.log(JSON.stringify(dist,null,1));