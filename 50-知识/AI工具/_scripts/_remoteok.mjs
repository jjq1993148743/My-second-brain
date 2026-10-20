import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/json','--max-time','22','--compressed',u]);

const h=await curl('https://remoteok.com/api');
let j=null; try{j=JSON.parse(h);}catch(e){}
if(!j||!Array.isArray(j)){ console.log('FAIL'); process.exit(1); }
const jobs=j.filter(x=>x && x.id && x.position);
fs.writeFileSync('_remoteok_jobs.json',JSON.stringify(jobs,null,1),'utf8');
console.log('TOTAL='+jobs.length);
const withSalary=jobs.filter(x=>x.salary_min||x.salary_max).length;
console.log('withSalary='+withSalary);
console.log('SAMPLE:');
for(const x of jobs.slice(0,5)) console.log('  '+x.company+' | '+x.position.slice(0,45)+' | $'+x.salary_min+'-'+x.salary_max+' | '+x.date);