import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:128*1024*1024,windowsHide:true,timeout:55000},(e,so)=>res(so||'')));
const CHROME='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const chrome=u=>new Promise(res=>{execFile(CHROME,['--headless=new','--disable-gpu','--no-sandbox','--dump-dom','--virtual-time-budget=25000','--user-agent='+UA,u],{maxBuffer:128*1024*1024,windowsHide:true,timeout:60000},(e,so)=>res(so||''));});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// 试各种 Workana 分类和语言版本
const urls=[
  ['es-all','https://www.workana.com/jobs'],
  ['es-dev','https://www.workana.com/jobs/desarrollo-de-software'],
  ['es-web','https://www.workana.com/jobs/desarrollo-web'],
  ['en-all','https://www.workana.com/en/jobs'],
  ['pt-all','https://www.workana.com/pt/jobs'],
  ['it-all','https://www.workana.com/it/jobs'],
  ['mx','https://www.workana.com/mx/jobs'],
  ['ar','https://www.workana.com/ar/jobs']
];
for(const [t,u] of urls){
  const h=await chrome(u);
  const proj=(h.match(/project-item js-project/g)||[]).length;
  const jl=(h.match(/\/job\/[a-z0-9\-]{5,}/g)||[]).length;
  console.log(t.padEnd(10)+Math.round(h.length/1000)+'k projects='+proj+' jobLinks='+jl);
  if(proj>0) fs.writeFileSync('_wk_'+t+'.html',h,'utf8');
  await sleep(3000);
}