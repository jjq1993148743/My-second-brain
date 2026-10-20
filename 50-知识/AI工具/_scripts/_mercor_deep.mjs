import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const tests=[['jobs','https://mercor.com/jobs'],['work','https://mercor.com/work'],['expert','https://mercor.com/expert'],['signup','https://mercor.com/signup'],['api','https://mercor.com/api/jobs']];
for(const [t,u] of tests){
  const h=await curl(u);
  const rates=(h.match(/\$[0-9]{1,3}(?:,[0-9]{3})?(?:-[0-9]{1,3})?\s*(?:\/|per)\s*(?:hour|hr)/gi)||[]).length;
  console.log(t.padEnd(10)+Math.round(h.length/1000)+'k rates='+rates);
  if(h.length>50000) fs.writeFileSync('_mercor_'+t+'.html',h,'utf8');
  await sleep(1400);
}