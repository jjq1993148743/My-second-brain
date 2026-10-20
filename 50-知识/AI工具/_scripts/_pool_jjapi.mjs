import { execFile } from 'node:child_process';
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const run=(a)=>new Promise(res=>execFile('curl',a,{maxBuffer:128*1024*1024,windowsHide:true,timeout:28000},(e,so)=>res(so||'')));
const get=(u,hdr=[])=>run(['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,...hdr,'--max-time','24','--compressed',u]);
const apis=[
 ['v2-offers','https://api.justjoin.it/v2/user-panel/offers?page=1&perPage=100'],
 ['v2-offers2','https://api.justjoin.it/v2/user-panel/offers'],
 ['v1','https://api.justjoin.it/v1/offers'],
 ['pub','https://justjoin.it/api/job-offers?page=1'],
 ['graphql','https://api.justjoin.it/graphql'],
];
for(const [t,u] of apis){
  const h=await get(u,['-H','Accept: application/json','-H','Referer: https://justjoin.it/','-H','Origin: https://justjoin.it']);
  let j=null; try{j=JSON.parse(h);}catch(e){}
  const n=j?(Array.isArray(j)?j.length:(j.data?(Array.isArray(j.data)?j.data.length:Object.keys(j.data).length):(j.offers?j.offers.length:Object.keys(j).length))):0;
  console.log(t.padEnd(10)+h.length+'b json='+(j?'yes':'no')+' n='+n+' head='+h.slice(0,90).replace(/\s+/g,' '));
  if(j&&n>3) fs.writeFileSync('_POOL_jj_'+t+'.json',JSON.stringify(j),'utf8');
  await new Promise(r=>setTimeout(r,1200));
}
console.log('DONE');