import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','--compressed',u]);
const h = await curl('https://www.codeur.com/projects');
fs.writeFileSync('_codeur_home.html', h, 'utf8');
console.log('bytes='+h.length);

const text=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&');
const lines=text.split('\n').map(s=>s.trim()).filter(s=>s.length>1);
const u=[]; for(const l of lines) if(u[u.length-1]!==l) u.push(l);
const money=u.filter(l=>/€\s?\d/.test(l)).slice(0,8);
const time=u.filter(l=>/(il y a|heure|jour|minute)/i.test(l)).slice(0,8);
console.log('MONEY: '+JSON.stringify(money));
console.log('TIME: '+JSON.stringify(time));

// 项目链接
const links=[...new Set([...h.matchAll(/href="(\/projects\/[^"]{5,80})"/g)].map(m=>m[1]))].slice(0,10);
console.log('LINKS: '+JSON.stringify(links));

// 分页
const pg=[...new Set([...h.matchAll(/href="([^"]{3,50}page[^"]{0,20})"/g)].map(m=>m[1]))].slice(0,6);
console.log('PAGER: '+JSON.stringify(pg));