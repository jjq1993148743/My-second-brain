import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
fs.mkdirSync('_raw_useme_pl',{recursive:true});
let tot=0;
for(let p=1;p<=30;p++){
  const h=await curl('https://useme.com/pl/jobs/?page='+p);
  const n=(h.match(/class="job__content/g)||[]).length;
  if(n>0){ fs.writeFileSync('_raw_useme_pl/p'+String(p).padStart(2,'0')+'.html',h,'utf8'); tot+=n; }
  if(p%5===0) console.log('p'+p+' jobs='+n+' total='+tot);
  await sleep(1500);
}
console.log('TOTAL='+tot);