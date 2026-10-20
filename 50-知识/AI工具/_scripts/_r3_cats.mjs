import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const cats=['frontend-jobs','backend-jobs','full-stack-jobs','blockchain-jobs','solidity-jobs','devops-jobs','product-manager-jobs','design-jobs'];
let tot=0;
fs.mkdirSync('_raw_r3',{recursive:true});
for(const c of cats){
  const h=await curl('https://remote3.co/remote/'+c);
  const sal=(h.match(/\$[0-9]{2,3}[,k]/g)||[]).length;
  const jl=(h.match(/\/[a-z0-9\-]+-at-[a-z0-9\-]+/g)||[]).length;
  if(h.length>50000) fs.writeFileSync('_raw_r3/'+c+'.html',h,'utf8');
  tot+=sal;
  console.log(c.padEnd(20)+Math.round(h.length/1000)+'k sal='+sal+' jobPatterns='+jl);
  await sleep(1300);
}
console.log('TOTAL_SAL_SIGNALS='+tot);