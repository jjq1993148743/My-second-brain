import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/json','--max-time','22','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

const variants=[
  ['page3','https://himalayas.app/jobs/api?page=3'],
  ['page4','https://himalayas.app/jobs/api?page=4'],
  ['page5','https://himalayas.app/jobs/api?page=5'],
  ['offset20','https://himalayas.app/jobs/api?offset=20'],
  ['offset40','https://himalayas.app/jobs/api?offset=40'],
  ['offset60','https://himalayas.app/jobs/api?offset=60'],
  ['cursor','https://himalayas.app/jobs/api?cursor=20'],
  ['limit50','https://himalayas.app/jobs/api?limit=50']
];
for(const [t,u] of variants){
  const h=await curl(u);
  let j=null; try{j=JSON.parse(h);}catch(e){}
  const first = j&&j.jobs&&j.jobs[0] ? j.jobs[0].title.slice(0,40) : '-';
  console.log(t.padEnd(10)+'items='+(j&&j.jobs?j.jobs.length:0)+' first='+first);
  await sleep(1500);
}