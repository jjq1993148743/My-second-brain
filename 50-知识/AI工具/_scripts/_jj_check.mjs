import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const h=await curl('https://justjoin.it/');
fs.writeFileSync('_justjoin.html',h,'utf8');
// 找 API 或 Next data
const hasNext=h.includes('__NEXT_DATA__');
const hasNuxt=h.includes('__NUXT__');
const apis=[...new Set([...h.matchAll(/["'](\/api\/[a-zA-Z0-9_\-\/]+)["']/g)].map(m=>m[1]))].slice(0,8);
console.log('bytes='+h.length+' next='+hasNext+' nuxt='+hasNuxt);
console.log('APIS: '+JSON.stringify(apis));
// 找薪资模式
const sals=[...new Set([...h.matchAll(/[0-9]{2,3}[,.]?[0-9]{3}\s*(?:PLN|EUR)|[0-9]{2,3}\s*(?:PLN|EUR)\s*(?:\/\s*h|\/h|per hour|net)/gi)].map(m=>m[0]))].slice(0,10);
console.log('SALARIES: '+JSON.stringify(sals));
// 找职位标题
const titles=[...new Set([...h.matchAll(/"title":"([^"]{8,80})"/g)].map(m=>m[1]))].slice(0,10);
console.log('TITLES: '+JSON.stringify(titles));