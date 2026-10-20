import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:128*1024*1024,windowsHide:true,timeout:30000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curlJ=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/json','--max-time','25','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const companies=['airtable','asana','box','calendly','canva','checkr','coda','coursera','duolingo','eventbrite','faire','flexport','freenome','gem','glossier','grammarly','gusto','instabase','intercom','lattice'];
const all=JSON.parse(fs.readFileSync('_greenhouse_jobs.json','utf8'));
const seen=new Set(all.map(j=>j.company+'|'+j.id));
const before=all.length;
let ok=0, fail=0;
for(const c of companies){
  const h=await curlJ('https://boards-api.greenhouse.io/v1/boards/'+c+'/jobs');
  let j=null; try{j=JSON.parse(h);}catch(e){}
  if(!j||!j.jobs){ fail++; await sleep(1000); continue; }
  ok++;
  let add=0;
  for(const job of j.jobs){
    const k=c+'|'+job.id;
    if(seen.has(k)) continue; seen.add(k);
    all.push({src:'greenhouse', company:c, id:job.id, title:job.title, loc:job.location?job.location.name:'', updated:job.updated_at||''});
    add++;
  }
  console.log(c.padEnd(14)+'jobs='+j.jobs.length+' new='+add+' total='+all.length);
  await sleep(1000);
}
fs.writeFileSync('_greenhouse_jobs.json',JSON.stringify(all,null,1),'utf8');
console.log('RESULT ok='+ok+' fail='+fail+' total='+all.length+' (was '+before+')');