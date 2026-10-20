import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','--compressed',u]);
for(const [tag,u] of [['vnworks','https://www.vietnamworks.com/'],['glints','https://glints.com/id/opportunities/jobs/explore']]){
  const h=await curl(u);
  fs.writeFileSync('_sea_'+tag+'.html',h,'utf8');
  const text=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&');
  const ux=[...new Set(text.split('\n').map(s=>s.trim()).filter(s=>s.length>3))];
  console.log('=== '+tag+' '+Math.round(h.length/1000)+'k uniq='+ux.length);
  const jobs=ux.filter(l=>l.length>8 && l.length<80 && /(engineer|developer|manager|analyst)/i.test(l)).slice(0,8);
  console.log('  JOBS: '+JSON.stringify(jobs));
  const sal=ux.filter(l=>/[$\u20ac\u00a3]\s?[0-9]{2,}/.test(l)).slice(0,5);
  console.log('  SAL: '+JSON.stringify(sal));
  const ids=[...new Set([...h.matchAll(/data-(?:job)?id="?([a-z0-9\-]{8,})"?/gi)].map(m=>m[1]))].slice(0,5);
  console.log('  IDS: '+JSON.stringify(ids));
  await new Promise(r=>setTimeout(r,1600));
}