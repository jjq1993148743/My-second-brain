import { execFile } from 'node:child_process';
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const run=(a)=>new Promise(res=>execFile('curl',a,{maxBuffer:16*1024*1024,windowsHide:true,timeout:12000},(e,so)=>res(so||'')));
const hosts=["flatironschool","89.106.83.95.sslip.io","81.70.209.246","72.62.52.171","203.194.112.129","ze","blog","146.56.217.87","alili","localhost","contop.com"];
const out=[];
for(const h of hosts){
  let target=h, url='https://'+h;
  if(/^\d+\.\d+\.\d+\.\d+$/.test(h)) url='http://'+h;
  let raw=''; try{ raw=await run(['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','10','--compressed','-w','\n%{http_code}|%{size_download}',url]); }catch(e){}
  const idx=raw.lastIndexOf('\n'); const meta=idx>=0?raw.slice(idx+1):''; const html=idx>=0?raw.slice(0,idx):raw;
  const [code,size]=meta.split('|');
  const c=parseInt(code||'0',10)||0; const bytes=parseInt(size||'0',10)||html.length;
  const text=html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  const title=(html.match(/<title[^>]*>([\s\S]{0,80}?)<\/title>/i)||[])[1]||'';
  const jobHits=(text.match(/\b(job|career|position|hiring|opening)s?\b/gi)||[]).length;
  const moneyHits=(text.match(/[$\u20ac\u00a3\u00a5]\s?[0-9]{2,}|\b(budget|salary|rate|price)s?\b/gi)||[]).length;
  let verdict='营销/静态';
  if(c===0) verdict='无效域名';
  else if(c>=400||bytes<1200) verdict='空/极小';
  else if(jobHits>=3&&moneyHits>=1) verdict='职位+金额';
  else if(jobHits>=3) verdict='职位列表';
  else if(moneyHits>=3) verdict='金额/营销';
  out.push({host:h, code:String(code||'0'), bytes, title:title.trim().slice(0,60), jobHits, moneyHits, verdict});
  console.log(h.padEnd(24)+(code||'0')+' '+Math.round(bytes/1000)+'k jobs='+jobHits+' -> '+verdict);
  await new Promise(r=>setTimeout(r,400));
}
fs.writeFileSync('_LAST11_RESULT.json',JSON.stringify(out,null,1),'utf8');
console.log('DONE');