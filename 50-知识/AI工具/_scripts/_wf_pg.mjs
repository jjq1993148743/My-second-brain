import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// 试分页和各种路径
const tests=[
  ['p2','https://wellfound.com/jobs?page=2'],
  ['remote','https://wellfound.com/remote'],
  ['eng','https://wellfound.com/role/r/software-engineer'],
  ['api','https://wellfound.com/api/v1/jobs'],
  ['sitemap','https://wellfound.com/sitemap.xml']
];
for(const [t,u] of tests){
  const h=await curl(u);
  const money=(h.match(/\$[0-9]{2,3}k/g)||[]).length;
  const kb=Math.round(h.length/1000);
  console.log(t.padEnd(10)+kb+'k salarySignals='+money);
  await sleep(1500);
}