import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:50000},(e,so)=>res(so||'')));
const CHROME='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const chrome=u=>new Promise(res=>{execFile(CHROME,['--headless=new','--disable-gpu','--no-sandbox','--dump-dom','--virtual-time-budget=20000','--user-agent='+UA,u],{maxBuffer:128*1024*1024,windowsHide:true,timeout:60000},(e,so)=>res(so||''));});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
fs.mkdirSync('_raw_workana',{recursive:true});
const cats=['desarrollo-de-software','diseno-y-multimedia','programacion','desarrollo-web','apps-moviles','soporte-tecnico'];
let total=0;
for(const c of cats){
  for(const pg of [1,2]){
    const u='https://www.workana.com/jobs/'+c+'?page='+pg;
    const h=await chrome(u);
    const links=(h.match(/\/job\/[a-z0-9\-]+/g)||[]).length;
    const times=(h.match(/Hace \d+/g)||[]).length;
    if(links>0){ fs.writeFileSync('_raw_workana/'+c+'_p'+pg+'.html',h,'utf8'); total+=links; }
    console.log(c.padEnd(20)+'p'+pg+' '+Math.round(h.length/1000)+'k links='+links+' times='+times);
    await sleep(2500);
  }
}
console.log('TOTAL='+total);