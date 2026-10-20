import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','--compressed',u]);
for(const [tag,u] of [['remote4me','https://remote4me.com/'],['remotewoman','https://remotewoman.com/'],['powertofly','https://powertofly.com/jobs/']]){
  const h=await curl(u);
  fs.writeFileSync('_x64_'+tag+'.html',h,'utf8');
  const text=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'");
  const ux=[...new Set(text.split('\n').map(s=>s.trim()).filter(s=>s.length>3))];
  console.log('=== '+tag+' '+Math.round(h.length/1000)+'k uniq='+ux.length);
  const jobs=ux.filter(l=>l.length>10 && l.length<90 && /(engineer|developer|designer|manager|analyst)/i.test(l)).slice(0,6);
  console.log('  JOBS: '+JSON.stringify(jobs));
  const sal=ux.filter(l=>/[$\u20ac\u00a3]\s?[0-9]{2,}/.test(l)).slice(0,5);
  console.log('  SAL: '+JSON.stringify(sal));
  await new Promise(r=>setTimeout(r,1600));
}