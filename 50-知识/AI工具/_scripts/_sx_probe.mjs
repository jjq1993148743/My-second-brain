import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','--compressed',u]);

for(const p of ['/page/project','/page/project?page=2','/page/project/list']){
  const h=await curl('https://www.sxsoft.com'+p);
  const money=(h.match(/[\uffe5]\s?[0-9]{2,}/g)||[]).length;
  const rows=(h.match(/class="[^"]*(?:item|row|project|list)[^"]*"/gi)||[]).length;
  console.log(p.padEnd(24)+Math.round(h.length/1000)+'k money='+money+' rows='+rows);
  if(h.length>20000) fs.writeFileSync('_sx_'+p.replace(/[\/\?=]/g,'_')+'.html',h,'utf8');
  await new Promise(r=>setTimeout(r,1500));
}