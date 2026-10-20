import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/json','--max-time','22','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

const cats=['software-dev','design','product','data','devops','qa','finance-legal','customer-support','marketing','sales','business','human-resources','all-others'];
const all=[]; const seen=new Set();
for(const c of cats){
  const h=await curl('https://remotive.com/api/remote-jobs?category='+c+'&limit=100');
  let j=null; try{j=JSON.parse(h);}catch(e){}
  if(!j||!j.jobs){console.log(c+' -> FAIL'); await sleep(2500); continue;}
  let add=0;
  for(const job of j.jobs){ if(seen.has(job.id)) continue; seen.add(job.id); all.push(job); add++; }
  console.log(c.padEnd(18)+'jobs='+j.jobs.length+' new='+add+' total='+all.length);
  fs.writeFileSync('_remotive_jobs.json',JSON.stringify(all,null,1),'utf8');
  await sleep(2500);
}
console.log('DONE total='+all.length);