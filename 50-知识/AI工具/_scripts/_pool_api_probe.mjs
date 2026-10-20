import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:256*1024*1024,windowsHide:true,timeout:28000},(e,so,se)=>res({so,se})));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','25','--compressed',u]);
const r1=await curl('https://remoteok.com/api');
let rk=[]; try{const j=JSON.parse(r1.so); rk=Array.isArray(j)?j.filter(x=>x&&x.slug):[];}catch(e){}
console.log('remoteok bytes='+r1.so.length+' parsed='+rk.length);
await new Promise(r=>setTimeout(r,1300));
const r2=await curl('https://remotive.com/api/remote-jobs?limit=50');
let rm=[]; try{const j=JSON.parse(r2.so); rm=j&&j.jobs?j.jobs:[];}catch(e){}
console.log('remotive bytes='+r2.so.length+' parsed='+rm.length);
const fs=await import('node:fs/promises');
if(rk.length>30) await fs.writeFile('_remoteok_api_full.json',JSON.stringify(rk),'utf8');
if(rm.length>30) await fs.writeFile('_remotive_api_full.json',JSON.stringify(rm),'utf8');
console.log('DONE');