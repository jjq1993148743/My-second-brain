import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
fs.mkdirSync('_raw_mb',{recursive:true});
for(const [tag,u] of [['all','https://www.mediabistro.com/jobs/'],['edit','https://www.mediabistro.com/jobs/editorial/'],['market','https://www.mediabistro.com/jobs/marketing/']]){
  const h=await curl(u);
  if(h.length>50000) fs.writeFileSync('_raw_mb/'+tag+'.html',h,'utf8');
  console.log(tag+' '+Math.round(h.length/1000)+'k');
  await sleep(1400);
}
console.log('DONE');