import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/json','--max-time','22','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

// Himalayas 尝试分页和筛选
const variants=[
  ['base','https://himalayas.app/jobs/api'],
  ['limit','https://himalayas.app/jobs/api?limit=100'],
  ['offset','https://himalayas.app/jobs/api?limit=100&offset=100'],
  ['page2','https://himalayas.app/jobs/api?page=2'],
  ['cat','https://himalayas.app/jobs/api?category=engineering'],
  ['salary','https://himalayas.app/jobs/api?minSalary=100000']
];
const all=[]; const seen=new Set();
for(const [tag,u] of variants){
  const h=await curl(u);
  let j=null; try{j=JSON.parse(h);}catch(e){}
  if(!j||!j.jobs){console.log(tag+' FAIL '+Math.round(h.length/1000)+'k'); await sleep(1500); continue;}
  let add=0;
  for(const x of j.jobs){
    const key=(x.companyName||'')+'|'+(x.title||'');
    if(seen.has(key)) continue; seen.add(key);
    all.push(x); add++;
  }
  console.log(tag.padEnd(10)+'items='+j.jobs.length+' new='+add+' total='+all.length);
  await sleep(1600);
}
fs.writeFileSync('_himalayas_jobs.json',JSON.stringify(all,null,1),'utf8');
console.log('TOTAL='+all.length);
if(all[0]) console.log('KEYS: '+JSON.stringify(Object.keys(all[0])));