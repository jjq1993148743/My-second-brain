import { execFile } from 'node:child_process';
import fs from 'node:fs';
const CHROME='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function chrome(url,wait){
  return new Promise(res=>{
    const a=['--headless=new','--disable-gpu','--no-sandbox','--dump-dom','--virtual-time-budget='+wait,'--user-agent='+UA,'--lang=ru-RU,ru;q=0.9,en;q=0.8',url];
    execFile(CHROME,a,{maxBuffer:128*1024*1024,windowsHide:true,timeout:60000},(e,so)=>res(so||''));
  });
}
const cfg=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const dir='_raw_'+cfg.host;
fs.mkdirSync(dir,{recursive:true});
let ok=0;
for(let i=0;i<cfg.pages.length;i++){
  const p=cfg.pages[i];
  const url=p.startsWith('http')?p:cfg.base+p;
  const html=await chrome(url,cfg.wait||22000);
  fs.writeFileSync(dir+'/p'+String(i+1).padStart(2,'0')+'.html',html,'utf8');
  const links=(html.match(/\/projects\/\d+/g)||[]).length;
  if(html.length>100000)ok++;
  console.log('['+(i+1)+'/'+cfg.pages.length+'] '+url.slice(-40)+' -> '+Math.round(html.length/1000)+'k links='+links);
  await sleep(4000+Math.random()*3000);
}
console.log('DONE ok='+ok+'/'+cfg.pages.length);