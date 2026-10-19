import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','--compressed',u]);
const h = await curl('https://www.codeur.com/pages/tarifs-codeur-com');
const text=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&euro;/g,'\u20ac').replace(/&agrave;/g,'a');
const lines=text.split('\n').map(s=>s.trim()).filter(s=>s.length>15);
const u=[]; for(const l of lines) if(u[u.length-1]!==l) u.push(l);
// 找所有含 % 或 € 的行
const fees=u.filter(l=>/[0-9]\s?%/.test(l) || /\u20ac/.test(l)).slice(0,20);
console.log('FEES:');
fees.forEach(f=>console.log('  \u00b7 '+f.slice(0,200)));
console.log('');
console.log('OPTIONS:');
const opts=u.filter(l=>/(option|abonnement|premium|boost|urgent|\u00e0 partir de)/i.test(l)).slice(0,12);
opts.forEach(o=>console.log('  \u00b7 '+o.slice(0,180)));