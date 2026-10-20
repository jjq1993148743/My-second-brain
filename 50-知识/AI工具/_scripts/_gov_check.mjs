import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','--compressed',u]);
for(const [tag,u] of [['usajobs','https://www.usajobs.gov/Search/Results?k=software'],['workforgood','https://workforgood.org/']]){
  const h=await curl(u);
  fs.writeFileSync('_gov_'+tag+'.html',h,'utf8');
  const text=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&');
  const ux=[...new Set(text.split('\n').map(s=>s.trim()).filter(s=>s.length>3))];
  console.log('=== '+tag+' '+Math.round(h.length/1000)+'k uniq='+ux.length);
  const jobs=ux.filter(l=>l.length>10 && l.length<90 && /(engineer|developer|analyst|manager|specialist|IT )/i.test(l)).slice(0,8);
  console.log('  JOBS: '+JSON.stringify(jobs));
  const money=ux.filter(l=>/\$[0-9]{2,3},?[0-9]{0,3}/.test(l)).slice(0,6);
  console.log('  MONEY: '+JSON.stringify(money));
  await new Promise(r=>setTimeout(r,1600));
}