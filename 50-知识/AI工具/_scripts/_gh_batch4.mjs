import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:128*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curlJ=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/json','--max-time','22','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const companies=['miro','amplitude','segment','lookout','quora','reddit','strava','thumbtack','udemy','upwork','wayfair','wish','zillow','zoox','23andme','affirm','algolia','benchling','betterment','carta','chainalysis','clari','clearcover','cloudinary','cockroachlabs'];
const all=JSON.parse(fs.readFileSync('_greenhouse_jobs.json','utf8'));
const seen=new Set(all.map(j=>j.company+'|'+j.id));
const before=all.length;
let ok=0, fail=0; const okList=[];
for(const c of companies){
  const h=await curlJ('https://boards-api.greenhouse.io/v1/boards/'+c+'/jobs');
  let j=null; try{j=JSON.parse(h);}catch(e){}
  if(!j||!j.jobs){ fail++; await sleep(900); continue; }
  ok++; okList.push(c+'('+j.jobs.length+')');
  for(const job of j.jobs){
    const k=c+'|'+job.id;
    if(seen.has(k)) continue; seen.add(k);
    all.push({src:'greenhouse', company:c, id:job.id, title:job.title, loc:job.location?job.location.name:'', updated:job.updated_at||''});
  }
  await sleep(900);
}
fs.writeFileSync('_greenhouse_jobs.json',JSON.stringify(all,null,1),'utf8');
console.log('OK='+ok+' FAIL='+fail);
console.log('OK_LIST='+okList.join(', '));
console.log('TOTAL='+all.length+' (was '+before+')');