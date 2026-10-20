import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/json','--max-time','18','--compressed',u]);
const apis=['https://remotive.com/api/remote-jobs?limit=50','https://remotive.com/api/remote-jobs?category=software-dev&limit=50'];
for(const u of apis){
  const h=await curl(u);
  let j=null; try{j=JSON.parse(h);}catch(e){}
  const cnt = j && j.jobs ? j.jobs.length : 0;
  console.log(u.slice(-50)+' -> '+Math.round(h.length/1000)+'k json='+(j?'yes':'no')+' jobs='+cnt);
  if(cnt>0 && j.jobs[0]) console.log('  sample: '+JSON.stringify(Object.keys(j.jobs[0])));
  await new Promise(r=>setTimeout(r,1500));
}