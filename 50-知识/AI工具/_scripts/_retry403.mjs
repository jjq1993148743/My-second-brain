import { execFile } from 'node:child_process';
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const H=['-H','User-Agent: '+UA,'-H','Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8','-H','Accept-Language: en-US,en;q=0.9','-H','Accept-Encoding: gzip, deflate, br','-H','Sec-Fetch-Dest: document','-H','Sec-Fetch-Mode: navigate','-H','Sec-Fetch-Site: none','-H','Sec-Fetch-User: ?1','-H','Upgrade-Insecure-Requests: 1','-H','Cache-Control: max-age=0','-H','Connection: keep-alive'];
const run=(a)=>new Promise(res=>execFile('curl',a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const list=JSON.parse(fs.readFileSync('_RETRY403.json','utf8'));
const out=[];
for(const p of list){
  const args=['-sL','--http1.1','-x','http://127.0.0.1:7897',...H,'--max-time','16','--compressed','-w','\n%{http_code}|%{url_effective}|%{size_download}',p.url];
  let raw=''; try{ raw=await run(args); }catch(e){}
  const idx=raw.lastIndexOf('\n');
  const meta=idx>=0?raw.slice(idx+1):''; const html=idx>=0?raw.slice(0,idx):raw;
  const [code,finalUrl,size]=meta.split('|');
  const text=html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
  const title=(html.match(/<title[^>]*>([\s\S]{0,100}?)<\/title>/i)||[])[1]||'';
  const jobHits=(text.match(/\b(job|career|position|hiring|opening|project|freelance)s?\b/gi)||[]).length;
  const money=(text.match(/[$\u20ac\u00a3\u00a5]\s?[0-9]{2,}/g)||[]).length;
  out.push({host:p.host, code, finalUrl:String(finalUrl||'').slice(0,100), bytes:parseInt(size||'0',10)||html.length, title:title.trim().slice(0,70), textLen:text.length, jobHits, money});
  console.log(p.host.padEnd(22)+(code||'0')+' '+Math.round((parseInt(size||'0',10)||html.length)/1000)+'k jobs='+jobHits+' $='+money+' | '+title.trim().slice(0,40));
  await new Promise(r=>setTimeout(r,600));
}
fs.writeFileSync('_RETRY403_RESULT.json',JSON.stringify(out,null,1),'utf8');
const ok=out.filter(o=>parseInt(o.code||'0',10)===200 && o.bytes>5000).length;
console.log('DONE ok200='+ok+'/'+out.length);