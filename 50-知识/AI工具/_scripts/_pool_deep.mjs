import { execFile } from 'node:child_process';
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const run=(a)=>new Promise(res=>execFile('curl',a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const get=u=>run(['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','--compressed',u]);
// 候选 API 端点
const tests=[
 ['justjoin','https://api.justjoin.it/v2/user-panel/offers?page=1&perPage=100'],
 ['justjoin2','https://justjoin.it/api/offers'],
 ['djinni','https://djinni.co/jobs/?primary_keyword=Python'],
 ['nofluff','https://nofluffjobs.com/api/search/posting?page=1&size=50'],
 ['kalibrr','https://www.kalibrr.com/api/v1/jobs?limit=50'],
 ['jobberman','https://www.jobberman.com/jobs'],
 ['sribu','https://www.sribu.com/id/contests'],
 ['freework','https://www.free-work.com/fr/missions'],
 ['hoofd','https://www.hoofdkraan.nl/opdrachten'],
 ['fastwork','https://fastwork.id/projects'],
 ['turing-job','https://www.turing.com/jobs/remote'],
 ['internshala','https://internshala.com/internships'],
];
const res=[];
for(const [t,u] of tests){
  let h=''; try{h=await get(u);}catch(e){}
  let j=null; try{j=JSON.parse(h);}catch(e){}
  const items = j ? (Array.isArray(j)?j.length:(j.data?j.data.length:(j.jobs?j.jobs.length:(j.offers?j.offers.length:Object.keys(j).length)))) : 0;
  console.log(t.padEnd(12)+h.length+'b jsonItems='+items+' looks='+(/(offer|job|position|posting)/i.test(h?'yes':'no')));
  if(j&&items>5) fs.writeFileSync('_POOL_'+t+'.json',JSON.stringify(j),'utf8');
  await new Promise(r=>setTimeout(r,800));
}
console.log('DONE');