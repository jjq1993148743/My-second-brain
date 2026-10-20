import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/json','--max-time','18','--compressed',u]);
const apis=[
  'https://www.kalibrr.com/api/job_board/v1/jobs?limit=50',
  'https://www.kalibrr.com/kjs/job_board/v1/jobs?limit=50',
  'https://www.kalibrr.com/api/v1/jobs?limit=50'
];
for(const u of apis){
  const h=await curl(u);
  let j=null; try{j=JSON.parse(h);}catch(e){}
  const n = j && j.jobs ? j.jobs.length : (Array.isArray(j)?j.length:0);
  console.log(u.slice(-50)+' -> '+Math.round(h.length/1000)+'k json='+(j?'yes':'no')+' items='+n);
  if(n>0){ console.log('  keys: '+JSON.stringify(Object.keys(j.jobs?j.jobs[0]:j[0]))); }
  await new Promise(r=>setTimeout(r,1500));
}