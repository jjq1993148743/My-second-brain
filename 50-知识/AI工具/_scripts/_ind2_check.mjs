import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','--compressed',u]);

for(const [tag,u] of [['freework','https://www.free-work.com/fr/tech-it/jobs'],['remotive','https://remotive.com/remote-jobs']]){
  const h=await curl(u);
  fs.writeFileSync('_ind2_'+tag+'.html',h,'utf8');
  const text=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"');
  const lines=text.split('\n').map(s=>s.trim()).filter(s=>s.length>2);
  const ux=[]; for(const l of lines) if(ux[ux.length-1]!==l) ux.push(l);
  const money=ux.filter(l=>/[$\u20ac\u00a3]\s?[0-9]{2,}/.test(l)).slice(0,8);
  const time=ux.filter(l=>/(ago|il y a|vor|hace)/i.test(l)).slice(0,6);
  console.log('=== '+tag+' bytes='+h.length+' uniq='+ux.length);
  console.log('  MONEY: '+JSON.stringify(money));
  console.log('  TIME: '+JSON.stringify(time));
  const pg=[...new Set([...h.matchAll(/href="([^"]{3,70}(?:page|\/page\/)[^"]{0,12})"/g)].map(m=>m[1]))].slice(0,5);
  console.log('  PAGER: '+JSON.stringify(pg));
  await new Promise(r=>setTimeout(r,2000));
}