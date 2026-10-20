import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22','--compressed',u]);
for(const [tag,u] of [['infojobs','https://www.infojobs.net/ofertas-trabajo'],['vagas','https://www.vagas.com.br/'],['eleman','https://www.eleman.net/']]){
  const h=await curl(u);
  fs.writeFileSync('_last_'+tag+'.html',h,'utf8');
  const text=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&');
  const ux=[...new Set(text.split('\n').map(s=>s.trim()).filter(s=>s.length>3))];
  const jobs=ux.filter(l=>l.length>10 && l.length<80 && /(desenvolvedor|engenheiro|analista|programador|developer|engineer)/i.test(l)).slice(0,5);
  console.log('=== '+tag+' '+Math.round(h.length/1000)+'k uniq='+ux.length);
  console.log('  JOBS: '+JSON.stringify(jobs));
  await new Promise(r=>setTimeout(r,1600));
}