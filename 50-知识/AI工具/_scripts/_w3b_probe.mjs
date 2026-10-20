import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','--compressed',u]);
const h1=await curl('https://cryptojobslist.com/');
fs.writeFileSync('_cjl.html',h1,'utf8');
const h2=await curl('https://remote3.co/');
fs.writeFileSync('_r3.html',h2,'utf8');
console.log('cjl='+Math.round(h1.length/1000)+'k r3='+Math.round(h2.length/1000)+'k');
// 找 job 链接
const cjlLinks=[...new Set([...h1.matchAll(/href="(\/jobs?\/[a-z0-9\-]{5,})"/g)].map(m=>m[1]))].slice(0,8);
console.log('CJL LINKS: '+JSON.stringify(cjlLinks));
const r3Links=[...new Set([...h2.matchAll(/href="(\/[a-z0-9\-\/]{5,})"/g)].map(m=>m[1])).filter(x=>/job/i.test(x))].slice(0,8);
console.log('R3 LINKS: '+JSON.stringify(r3Links));