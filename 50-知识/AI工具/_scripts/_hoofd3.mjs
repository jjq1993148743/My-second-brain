import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
fs.mkdirSync('_raw_hoofd',{recursive:true});
let tot=0;
for(const off of [0,10,20,30,40,50,60,70,80,90,100,110,120,130,140]){
  const u='https://www.hoofdkraan.nl/opdrachten?offset='+off;
  const h=await curl(u);
  const items=(h.match(/projectListTitle/g)||[]).length;
  const rows=(h.match(/class="clearFix"/g)||[]).length;
  if(h.length>10000){ fs.writeFileSync('_raw_hoofd/o'+String(off).padStart(3,'0')+'.html',h,'utf8'); }
  console.log('offset='+off+' '+Math.round(h.length/1000)+'k titles='+items+' rows='+rows);
  tot+=items;
  await sleep(1500);
}
console.log('TOTAL_TITLES='+tot);