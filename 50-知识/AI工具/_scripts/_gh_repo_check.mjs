import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curlJ=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/json','--max-time','22','--compressed',u]);
// 看 jobseek 的 README 是否有 greenhouse 公司列表
const r1=await curlJ('https://api.github.com/repos/colophon-group/jobseek/readme');
let j1=null; try{j1=JSON.parse(r1);}catch(e){}
if(j1&&j1.content){
  const content=Buffer.from(j1.content,'base64').toString('utf8');
  console.log('jobseek README len='+content.length);
  const comps=[...new Set([...content.matchAll(/greenhouse[^a-z0-9]{1,3}([a-z0-9\-]{3,30})/gi)].map(m=>m[1].toLowerCase()))];
  console.log('  greenhouse mentions: '+JSON.stringify(comps.slice(0,15)));
}
// 看 job-board-aggregator
const r2=await curlJ('https://api.github.com/repos/Riley-Dorrington/job-board-aggregator/readme');
let j2=null; try{j2=JSON.parse(r2);}catch(e){}
if(j2&&j2.content){
  const c2=Buffer.from(j2.content,'base64').toString('utf8');
  console.log('aggregator README len='+c2.length);
  const c3=[...new Set([...c2.matchAll(/\b([a-z][a-z0-9\-]{2,25})\b(?=[^\n]{0,80}greenhouse)/gi)].map(m=>m[1].toLowerCase()))];
  console.log('  candidates: '+JSON.stringify(c3.slice(0,20)));
}