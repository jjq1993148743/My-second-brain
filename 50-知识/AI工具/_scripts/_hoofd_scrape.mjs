import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
fs.mkdirSync('_raw_hoofd',{recursive:true});
let tot=0;
for(let p=1;p<=15;p++){
  const u='https://www.hoofdkraan.nl/opdrachten?page='+p;
  const h=await curl(u);
  const items=(h.match(/projectListTitle/g)||[]).length;
  if(items>0){ fs.writeFileSync('_raw_hoofd/p'+String(p).padStart(2,'0')+'.html',h,'utf8'); tot+=items; }
  console.log('p'+p+' '+Math.round(h.length/1000)+'k items='+items);
  await sleep(1600);
}
console.log('TOTAL='+tot);