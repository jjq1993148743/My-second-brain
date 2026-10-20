import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:128*1024*1024,windowsHide:true,timeout:30000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curlJ=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/json','--max-time','25','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ashbyCompanies=['openai','linear','vercel','ramp','mercury','replit','anthropic','scale','cursor','perplexity'];
const all=[];
for(const c of ashbyCompanies){
  const h=await curlJ('https://api.ashbyhq.com/posting-api/job-board/'+c);
  let j=null; try{j=JSON.parse(h);}catch(e){}
  if(!j||!j.jobs){ console.log('ashby '+c+' FAIL'); await sleep(1200); continue; }
  for(const job of j.jobs){
    all.push({src:'ashby', company:c, title:job.title, loc:job.location||'', dept:job.department||'', team:job.team||'', empType:job.employmentType||'', published:job.publishedAt||'', isRemote:job.isRemote||false});
  }
  console.log('ashby '+c.padEnd(12)+'jobs='+j.jobs.length+' total='+all.length);
  await sleep(1200);
}
fs.writeFileSync('_ashby_jobs.json',JSON.stringify(all,null,1),'utf8');
console.log('ASHBY_TOTAL='+all.length);