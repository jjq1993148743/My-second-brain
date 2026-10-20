import { execFile } from 'node:child_process';
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const run=(a)=>new Promise(res=>execFile('curl',a,{maxBuffer:128*1024*1024,windowsHide:true,timeout:28000},(e,so)=>res(so||'')));
const get=u=>run(['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','25','--compressed',u]);
// justjoin.it 列表页 JSON-LD
for(const [tag,u] of [['justjoin-list','https://justjoin.it/job-offers/all-locations'],['justjoin-p1','https://justjoin.it/job-offers/all-locations?page=1'],['justjoin-p2','https://justjoin.it/job-offers/all-locations?page=2']]){
  const h=await get(u);
  const lds=[...h.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
  let jobs=0, parsed=null;
  for(const ld of lds){ try{ const j=JSON.parse(ld); if(j['@type']==='ItemList'&&j.itemListElement){ jobs=j.itemListElement.length; parsed=j; } if(j['@type']==='JobPosting') jobs++; }catch(e){} }
  console.log(tag+' '+Math.round(h.length/1000)+'k lds='+lds.length+' jobs='+jobs);
  if(parsed) { fs.writeFileSync('_POOL_justjoin_'+tag+'.json',JSON.stringify(parsed),'utf8'); console.log('  saved itemList '+parsed.itemListElement.length); }
  await new Promise(r=>setTimeout(r,1500));
}
// justjoin API 试更多端点
const apiTests=['https://api.justjoin.it/v2/user-panel/offers?page=1&perPage=100&sortBy=publishedAt&orderBy=DESC','https://justjoin.it/api/offers/all-locations'];
for(const u of apiTests){
  const h=await get(u);
  console.log('API '+u.slice(20,70)+' '+h.length+'b head='+h.slice(0,80).replace(/\s+/g,' '));
  await new Promise(r=>setTimeout(r,1200));
}
console.log('DONE');