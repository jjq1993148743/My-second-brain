import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:30000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const g=async(u,json)=>{const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,...(json?['-H','Accept: application/json']:[]),'--max-time','20','-w','\nCODE=%{http_code}',u]);const c=(h.match(/CODE=(\d+)$/)||[])[1]||'?';return {c, b:h.replace(/\nCODE=\d+$/,'')};};

// 1) Fediverse 正确端点探测
for(const p of ['https://fedidb.org/api/servers','https://fedidb.org/api/v1/servers.json','https://fedidb.org/api/servers.json','https://lemmyverse.net/data/communities.json','https://lemmyverse.net/communities.json']){
  const r=await g(p,true);
  const isJson = r.b.trim().startsWith('{')||r.b.trim().startsWith('[');
  console.log(p+' -> '+r.c+' json='+isJson+' len='+r.b.length);
  if(isJson && r.b.length>100) fs.writeFileSync('_fed_'+p.split('/').pop().replace(/[^a-z0-9.]/gi,'_')+'.json', r.b, 'utf8');
  await new Promise(x=>setTimeout(x,250));
}
console.log('');
// 2) HN 头部 + Lobsters
const hn=await g('https://hacker-news.firebaseio.com/v0/topstories.json',true);
console.log('HN topstories -> '+hn.c+' len='+hn.b.length);
const lob=await g('https://lobste.rs/hottest.json',true);
console.log('Lobsters hottest -> '+lob.c+' len='+lob.b.length);
if(lob.c==='200') fs.writeFileSync('_lobsters.json', lob.b, 'utf8');
console.log('DONE');