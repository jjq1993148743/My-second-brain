import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// 试各种路径和分类
const tests=[
  ['jobs','https://www.mediabistro.com/jobs/'],
  ['jobs-p2','https://www.mediabistro.com/jobs/?page=2'],
  ['tech','https://www.mediabistro.com/jobs/technology/'],
  ['edit','https://www.mediabistro.com/jobs/editorial/'],
  ['design','https://www.mediabistro.com/jobs/design/'],
  ['market','https://www.mediabistro.com/jobs/marketing/'],
  ['all','https://www.mediabistro.com/jobs/all/'],
  ['sitemap','https://www.mediabistro.com/sitemap.xml']
];
for(const [t,u] of tests){
  const h=await curl(u);
  const sal=(h.match(/\$[0-9]{2,3},[0-9]{3}/g)||[]).length;
  console.log(t.padEnd(10)+Math.round(h.length/1000)+'k sal='+sal);
  await sleep(1300);
}