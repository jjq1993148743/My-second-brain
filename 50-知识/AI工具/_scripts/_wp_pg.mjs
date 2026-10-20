import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// 试分页和分类
const urls=[
  ['base','https://jobs.wordpress.net/'],
  ['p2','https://jobs.wordpress.net/page/2/'],
  ['cat','https://jobs.wordpress.net/job-category/plugin-development/'],
  ['remote','https://jobs.wordpress.net/remote-friendly/'],
  ['dev','https://jobs.wordpress.net/job-category/development/']
];
for(const [t,u] of urls){
  const h=await curl(u);
  const n=(h.match(/jobs\.wordpress\.net\/job\//g)||[]).length;
  console.log(t.padEnd(8)+Math.round(h.length/1000)+'k joblinks='+n);
  await sleep(1300);
}