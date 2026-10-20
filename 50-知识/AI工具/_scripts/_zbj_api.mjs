import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','--compressed',u]);
for(const [t,u] of [
  ['supei','https://task.zbj.com/supei/list/'],
  ['supei-p2','https://task.zbj.com/supei/list/?page=2'],
  ['i-zbj-demands','https://i.zbj.com/demands?tab=0']
]){
  const h=await curl(u);
  const kb=Math.round(h.length/1000);
  const money=(h.match(/[\uffe5\u00a5]\s?[0-9]{2,}/g)||[]).length;
  const cn=(h.match(/[\u4e00-\u9fa5]{4,30}/g)||[]).length;
  console.log(t.padEnd(18)+kb+'k money='+money+' cnWords='+cn);
  if(h.length>20000) fs.writeFileSync('_zbj_'+t+'.html',h,'utf8');
  await new Promise(r=>setTimeout(r,1400));
}