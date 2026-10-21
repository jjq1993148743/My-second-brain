import { execFile } from 'node:child_process';
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const run=(a)=>new Promise(res=>execFile('curl',a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:24000},(e,so)=>res(so||'')));
const list=JSON.parse(fs.readFileSync('_GIG_MORE.json','utf8'));
const out=[];
const clean=s=>s.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
for(const p of list){
  let raw=''; try{ raw=await run(['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept-Language: en-US,en;q=0.9','--max-time','20','--compressed','-w','\n%{http_code}|%{size_download}',p.url]); }catch(e){}
  const idx=raw.lastIndexOf('\n'); const meta=idx>=0?raw.slice(idx+1):''; const html=idx>=0?raw.slice(0,idx):raw;
  const [code,size]=meta.split('|');
  const c=parseInt(code||'0',10)||0; const bytes=parseInt(size||'0',10)||html.length;
  const text=clean(html);
  const cards=(html.match(/class="[^"]*(?:project|job|gig|task|card|posting|listing|contest|order|tutor)[^"]*"/gi)||[]).length;
  const moneyMentions=(html.match(/[$\u20ac\u00a3\u00a5\uffe5]\s?[0-9][0-9,.]*/g)||[]).length;
  let verdict='看不到活';
  if(c===0) verdict='打不开';
  else if(c===403||c===429) verdict='反爬';
  else if(c===401) verdict='需登录';
  else if(c>=400||bytes<2000) verdict='空/极小';
  else if(cards>=20 && moneyMentions>=3) verdict='✅活多且带价';
  else if(cards>=20) verdict='✅活多';
  else if(cards>=5) verdict='🟡有活';
  else if(moneyMentions>=5) verdict='🟡有价格';
  else verdict='看不到活';
  out.push({name:p.name,host:p.host,type:p.type,url:p.url,code:String(code||'0'),bytes,cards,moneyMentions,verdict});
  console.log(p.name.padEnd(20)+String(code||'0').padEnd(5)+String(Math.round(bytes/1000)+'k').padEnd(7)+'cards='+String(cards).padEnd(5)+'$='+String(moneyMentions).padEnd(4)+verdict);
  await new Promise(r=>setTimeout(r,800));
}
fs.writeFileSync('_GIG_MORE_RESULT.json',JSON.stringify(out,null,1),'utf8');
const d={}; for(const o of out) d[o.verdict]=(d[o.verdict]||0)+1;
console.log('DONE'); console.log(JSON.stringify(d,null,1));