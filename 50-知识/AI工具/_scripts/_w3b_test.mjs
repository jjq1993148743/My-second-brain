import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// cryptojobslist 分页测试
const tests=[['c1','https://cryptojobslist.com/'],['c2','https://cryptojobslist.com/?page=2'],['c3','https://cryptojobslist.com/jobs'],['r1','https://remote3.co/'],['r2','https://remote3.co/?page=2'],['r3','https://remote3.co/jobs']];
for(const [t,u] of tests){
  const h=await curl(u);
  const sal=(h.match(/\$[0-9]{2,3}[,k]/g)||[]).length;
  const kb=Math.round(h.length/1000);
  console.log(t.padEnd(6)+kb+'k salarySignals='+sal);
  await sleep(1300);
}