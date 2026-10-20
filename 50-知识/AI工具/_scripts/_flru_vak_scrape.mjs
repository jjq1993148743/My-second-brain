import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:128*1024*1024,windowsHide:true,timeout:55000},(e,so)=>res(so||'')));
const CHROME='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const chrome=u=>new Promise(res=>{execFile(CHROME,['--headless=new','--disable-gpu','--no-sandbox','--dump-dom','--virtual-time-budget=20000','--user-agent='+UA,u],{maxBuffer:128*1024*1024,windowsHide:true,timeout:58000},(e,so)=>res(so||''));});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
fs.mkdirSync('_raw_flru_vak',{recursive:true});
let tot=0;
for(let p=1;p<=8;p++){
  const u=p===1?'https://www.fl.ru/vakansii/':'https://www.fl.ru/vakansii/?page='+p;
  const h=await chrome(u);
  const blocks=(h.match(/class="b-post__grid"/g)||[]).length;
  if(blocks>0){ fs.writeFileSync('_raw_flru_vak/p'+String(p).padStart(2,'0')+'.html',h,'utf8'); tot+=blocks; }
  console.log('p'+p+' '+Math.round(h.length/1000)+'k blocks='+blocks);
  await sleep(4000);
}
console.log('TOTAL_BLOCKS='+tot);