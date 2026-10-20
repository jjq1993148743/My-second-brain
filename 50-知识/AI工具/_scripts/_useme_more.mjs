import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let tot=0;
for(let p=13;p<=30;p++){
  const u='https://useme.com/en/jobs/?page='+p;
  const h=await curl(u);
  const links=(h.match(/class="job__content/g)||[]).length;
  if(links>0){ fs.writeFileSync('_raw_useme/p'+String(p).padStart(2,'0')+'.html',h,'utf8'); tot+=links; }
  console.log('p'+p+' '+Math.round(h.length/1000)+'k jobs='+links);
  await sleep(1700);
}
console.log('NEW='+tot);