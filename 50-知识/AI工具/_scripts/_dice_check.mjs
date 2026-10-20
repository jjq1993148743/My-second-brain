import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','--compressed',u]);
const h=await curl('https://www.dice.com/jobs');
fs.writeFileSync('_dice.html',h,'utf8');
const text=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&');
const ux=[...new Set(text.split('\n').map(s=>s.trim()).filter(s=>s.length>3))];
console.log('bytes='+h.length+' uniq='+ux.length);
const money=ux.filter(l=>/[$\u20ac\u00a3]\s?[0-9]{2,}/.test(l)).slice(0,10);
console.log('MONEY: '+JSON.stringify(money));
const jobs=ux.filter(l=>l.length>10 && l.length<90 && /(engineer|developer|analyst|architect|manager)/i.test(l)).slice(0,10);
console.log('JOBS: '+JSON.stringify(jobs));
// 检查是否有 JSON-LD
const ld=[...h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]{20,3000}?)<\/script>/g)].slice(0,2);
console.log('JSONLD count='+ld.length);
if(ld[0]) console.log('  sample: '+ld[0][1].slice(0,300));