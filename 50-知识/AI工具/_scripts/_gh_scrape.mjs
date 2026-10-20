import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:128*1024*1024,windowsHide:true,timeout:30000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curlJ=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/json','--max-time','25','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

// Greenhouse: 多个公司
const ghCompanies=['stripe','airbnb','doordash','instacart','robinhood','coinbase','discord','figma','notion','databricks','snowflake','gitlab'];
const ghAll=[];
for(const c of ghCompanies){
  const h=await curlJ('https://boards-api.greenhouse.io/v1/boards/'+c+'/jobs');
  let j=null; try{j=JSON.parse(h);}catch(e){}
  if(!j||!j.jobs){ console.log('gh '+c+' FAIL'); await sleep(1200); continue; }
  for(const job of j.jobs){
    ghAll.push({src:'greenhouse', company:c, id:job.id, title:job.title, loc:job.location?job.location.name:'', updated:job.updated_at||''});
  }
  console.log('gh '+c.padEnd(14)+'jobs='+j.jobs.length+' total='+ghAll.length);
  await sleep(1200);
}
fs.writeFileSync('_greenhouse_jobs.json',JSON.stringify(ghAll,null,1),'utf8');
console.log('GREENHOUSE_TOTAL='+ghAll.length);