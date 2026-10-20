import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curlJ=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/json','--max-time','18','--compressed',u]);
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','--compressed',u]);
// Glints API
const g=await curlJ('https://glints.com/api/v1/jobs?limit=50');
let gj=null; try{gj=JSON.parse(g);}catch(e){}
console.log('glints api: '+Math.round(g.length/1000)+'k json='+(gj?'yes':'no'));
if(gj) console.log('  keys: '+JSON.stringify(Object.keys(gj).slice(0,8)));
// VietnamWorks API
const v=await curlJ('https://www.vietnamworks.com/api/job/search?limit=50');
let vj=null; try{vj=JSON.parse(v);}catch(e){}
console.log('vnworks api: '+Math.round(v.length/1000)+'k json='+(vj?'yes':'no'));
// VietnamWorks 分类
const v2=await curl('https://www.vietnamworks.com/it-software-jobs');
console.log('vnworks it: '+Math.round(v2.length/1000)+'k');
const jl=(v2.match(/\/[a-z0-9\-]+-jv/gi)||[]).length;
console.log('  jvLinks='+jl);