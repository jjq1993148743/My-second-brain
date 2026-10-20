import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:128*1024*1024,windowsHide:true,timeout:30000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curlJ=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/json','--max-time','28','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

// Lever Palantir 309
const lever=await curlJ('https://api.lever.co/v0/postings/palantir?mode=json');
let lj=null; try{lj=JSON.parse(lever);}catch(e){}
const leverOut=[];
if(Array.isArray(lj)){ for(const j of lj){ leverOut.push({src:'lever', company:'palantir', title:j.text||'', cat:j.categories?j.categories.team:'', loc:j.categories?j.categories.location:'', created:j.createdAt?new Date(j.createdAt).toISOString():'' }); } }
fs.writeFileSync('_lever_jobs.json',JSON.stringify(leverOut,null,1),'utf8');
console.log('LEVER='+leverOut.length);
await sleep(1200);

// Ashby 多公司
const ashbyCompanies=['notion','linear','replit','cursor','perplexity','ramp'];
const ashbyOut=[];
try{ JSON.parse(fs.readFileSync('_ashby_jobs.json','utf8')).forEach(j=>ashbyOut.push(j)); }catch(e){}
const seenA=new Set(ashbyOut.map(j=>j.company+'|'+j.title));
const beforeA=ashbyOut.length;
for(const c of ashbyCompanies){
  const h=await curlJ('https://api.ashbyhq.com/posting-api/job-board/'+c);
  let j=null; try{j=JSON.parse(h);}catch(e){}
  if(!j||!j.jobs){ await sleep(1100); continue; }
  let add=0;
  for(const job of j.jobs){
    const k=c+'|'+job.title;
    if(seenA.has(k)) continue; seenA.add(k);
    ashbyOut.push({src:'ashby', company:c, title:job.title, loc:job.location||'', dept:job.department||'', empType:job.employmentType||'', published:job.publishedAt||'', isRemote:job.isRemote||false});
    add++;
  }
  console.log('ashby '+c.padEnd(12)+'jobs='+j.jobs.length+' new='+add);
  await sleep(1100);
}
fs.writeFileSync('_ashby_jobs.json',JSON.stringify(ashbyOut,null,1),'utf8');
console.log('ASHBY='+ashbyOut.length+' (was '+beforeA+')');

// Greenhouse Vercel 93
const gh=await curlJ('https://boards-api.greenhouse.io/v1/boards/vercel/jobs');
let gj=null; try{gj=JSON.parse(gh);}catch(e){}
if(gj&&gj.jobs){
  const ghOut=JSON.parse(fs.readFileSync('_greenhouse_jobs.json','utf8'));
  const seenG=new Set(ghOut.map(j=>j.company+'|'+j.id));
  let add=0;
  for(const job of gj.jobs){
    const k='vercel|'+job.id;
    if(seenG.has(k)) continue; seenG.add(k);
    ghOut.push({src:'greenhouse', company:'vercel', id:job.id, title:job.title, loc:job.location?job.location.name:'', updated:job.updated_at||''});
    add++;
  }
  fs.writeFileSync('_greenhouse_jobs.json',JSON.stringify(ghOut,null,1),'utf8');
  console.log('greenhouse vercel new='+add+' total='+ghOut.length);
}