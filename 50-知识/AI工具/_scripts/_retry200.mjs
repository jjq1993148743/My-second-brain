import { execFile } from 'node:child_process';
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const run=(a)=>new Promise(res=>execFile('curl',a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const targets=[['guru','https://www.guru.com/'],['freelancehunt','https://freelancehunt.com/'],['malt-de','https://www.malt.de/'],['malt-fr','https://www.malt.fr/'],['malt-es','https://www.malt.es/'],['upwork-in','https://www.upwork.in/'],['creativemarket','https://creativemarket.com/']];
for(const [t,u] of targets){
  let ok=0, size=0, title='';
  for(let attempt=1;attempt<=3 && ok===0;attempt++){
    const h=await run(['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept-Language: en-US,en;q=0.9','--max-time','14','--compressed','-w','\n%{http_code}',u]);
    const idx=h.lastIndexOf('\n'); const code=h.slice(idx+1).trim(); const html=h.slice(0,idx);
    if(code==='200' && html.length>3000){ ok=1; size=html.length; title=(html.match(/<title[^>]*>([\s\S]{0,80}?)<\/title>/i)||[])[1]||''; fs.writeFileSync('_R_'+t+'.html',html,'utf8'); }
    await new Promise(r=>setTimeout(r,900));
  }
  console.log(t.padEnd(16)+'ok='+ok+' size='+Math.round(size/1000)+'k | '+title.trim().slice(0,50));
}
console.log('DONE');