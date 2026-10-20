import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// cryptojobslist 试更多路径
const tests=[
  ['remote','https://cryptojobslist.com/remote-jobs'],
  ['eng','https://cryptojobslist.com/engineering-jobs'],
  ['all','https://cryptojobslist.com/all-jobs'],
  ['sitemap','https://cryptojobslist.com/sitemap.xml'],
  ['sitemap2','https://cryptojobslist.com/sitemap-jobs.xml'],
  ['feed','https://cryptojobslist.com/feed'],
  ['api','https://cryptojobslist.com/api/jobs'],
  ['page3','https://cryptojobslist.com/?page=3']
];
for(const [t,u] of tests){
  const h=await curl(u);
  const jl=[...new Set([...h.matchAll(/\/jobs\/[a-z0-9\-]{5,}/g)].map(m=>m[0]))].length;
  console.log(t.padEnd(10)+Math.round(h.length/1000)+'k jobLinks='+jl);
  await sleep(1300);
}