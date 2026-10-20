import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','--compressed',u]);
const urls=['https://weworkremotely.com/categories/remote-programming-jobs?page=2','https://weworkremotely.com/remote-jobs?page=2','https://weworkremotely.com/categories/remote-full-stack-programming-jobs','https://weworkremotely.com/categories/remote-devops-sysadmin-jobs'];
for(const u of urls){
  const h=await curl(u);
  const jobs=(h.match(/\/remote-jobs\/[a-z0-9\-]+\/[a-z0-9\-]+/g)||[]).length;
  console.log(u.slice(-50)+' -> '+Math.round(h.length/1000)+'k jobLinks='+jobs);
  await new Promise(r=>setTimeout(r,1500));
}