import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curlJ=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/json','--max-time','22','--compressed',u]);
const tests=[
  ['wp-jobs','https://workforgood.org/wp-json/wp/v2/jobs?per_page=100'],
  ['wp-job','https://workforgood.org/wp-json/wp/v2/job?per_page=100'],
  ['wp-types','https://workforgood.org/wp-json/wp/v2/types'],
  ['wp-posts','https://workforgood.org/wp-json/wp/v2/posts?per_page=100']
];
for(const [t,u] of tests){
  const h=await curlJ(u);
  let j=null; try{j=JSON.parse(h);}catch(e){}
  const n=Array.isArray(j)?j.length:0;
  console.log(t.padEnd(12)+Math.round(h.length/1000)+'k items='+n);
  if(t==='wp-types' && j){ console.log('  types: '+Object.keys(j).join(', ')); }
  await new Promise(r=>setTimeout(r,1400));
}