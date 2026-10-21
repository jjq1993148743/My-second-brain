import { execFile } from 'node:child_process';
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const run=(a)=>new Promise(res=>execFile('curl',a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const list=JSON.parse(fs.readFileSync('_GIG_LOGINONLY.json','utf8'));
const out=[];
for(const p of list){
  const url='https://'+p.host;
  let raw=''; try{ raw=await run(['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','16','--compressed','-w','\n%{http_code}|%{size_download}|%{url_effective}',url]); }catch(e){}
  const idx=raw.lastIndexOf('\n'); const meta=idx>=0?raw.slice(idx+1):''; const html=idx>=0?raw.slice(0,idx):raw;
  const [code,size,finalUrl]=meta.split('|');
  const c=parseInt(code||'0',10)||0; const bytes=parseInt(size||'0',10)||html.length;
  const title=(html.match(/<title[^>]*>([\s\S]{0,90}?)<\/title>/i)||[])[1]||'';
  let status='存在';
  if(c===0) status='DNS失败';
  else if(c>=400) status='拦截('+c+')';
  else if(bytes<2000) status='空页';
  out.push({name:p.name,host:p.host,type:p.type,note:p.note,code:String(code||'0'),bytes,title:title.trim().slice(0,60),status,finalUrl:String(finalUrl||'').slice(0,70)});
  console.log(p.name.padEnd(20)+String(code||'0').padEnd(5)+String(Math.round(bytes/1000)+'k').padEnd(7)+status+' | '+title.trim().slice(0,45));
  await new Promise(r=>setTimeout(r,600));
}
fs.writeFileSync('_GIG_LOGINONLY_RESULT.json',JSON.stringify(out,null,1),'utf8');
const d={}; for(const o of out) d[o.status]=(d[o.status]||0)+1;
console.log('DONE'); console.log(JSON.stringify(d,null,1));