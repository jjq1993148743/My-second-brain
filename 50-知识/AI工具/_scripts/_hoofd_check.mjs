import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','--compressed',u]);
const h=await curl('https://www.hoofdkraan.nl/');
// 找项目和分页
const links=[...new Set([...h.matchAll(/href="(\/(?:opdracht|project|klus)[^"\/]{3,})"/g)].map(m=>m[1]))].slice(0,10);
const pg=[...new Set([...h.matchAll(/href="([^"]{3,60}(?:page|\/p\/|pagina)[^"]{0,12})"/g)].map(m=>m[1]))].slice(0,6);
console.log('LINKS: '+JSON.stringify(links));
console.log('PAGER: '+JSON.stringify(pg));
// 找卡片结构
const idx=h.indexOf('€ 350');
if(idx>0) console.log('CTX: '+h.slice(Math.max(0,idx-1200),idx+300).replace(/\s+/g,' ').slice(-900));