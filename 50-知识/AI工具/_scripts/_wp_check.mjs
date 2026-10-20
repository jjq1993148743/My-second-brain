import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','--compressed',u]);
const h=await curl('https://jobs.wordpress.net/');
fs.writeFileSync('_wpjobs.html',h,'utf8');
const text=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#8217;/g,"'").replace(/&#8211;/g,'-');
const ux=[...new Set(text.split('\n').map(s=>s.trim()).filter(s=>s.length>2))];
console.log('bytes='+h.length+' uniq='+ux.length);
const jobs=ux.filter(l=>l.length>8 && l.length<90 && /[A-Za-z]/.test(l)).slice(0,25);
console.log('TEXT:');
jobs.forEach(j=>console.log('  '+j));
// 找 job 链接
const links=[...new Set([...h.matchAll(/href="(https:\/\/jobs\.wordpress\.net\/job\/[^"]+)"/g)].map(m=>m[1]))].slice(0,8);
console.log('LINKS: '+JSON.stringify(links));
// 分页
const pg=[...new Set([...h.matchAll(/href="([^"]*page[^"]*)"/g)].map(m=>m[1]))].slice(0,5);
console.log('PAGER: '+JSON.stringify(pg));