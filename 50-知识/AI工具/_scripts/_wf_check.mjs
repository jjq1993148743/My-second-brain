import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','--compressed',u]);
const h=await curl('https://wellfound.com/jobs');
fs.writeFileSync('_wellfound.html',h,'utf8');
const text=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'");
const ux=[...new Set(text.split('\n').map(s=>s.trim()).filter(s=>s.length>3))];
console.log('bytes='+h.length+' uniq='+ux.length);
const money=ux.filter(l=>/[$\u20ac\u00a3]\s?[0-9]{2,}/.test(l)).slice(0,12);
console.log('MONEY:');
money.forEach(m=>console.log('  '+m));
const jobs=ux.filter(l=>l.length>8 && l.length<70 && /(engineer|developer|designer|manager)/i.test(l)).slice(0,10);
console.log('JOBS: '+JSON.stringify(jobs));
// 是否 SPA
const isSpa = h.includes('__NEXT_DATA__') || h.includes('window.__') || h.includes('application/ld+json');
console.log('SPA_indicators='+isSpa);