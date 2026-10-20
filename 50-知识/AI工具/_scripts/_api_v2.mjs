import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:128*1024*1024,windowsHide:true,timeout:30000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/json','--max-time','25','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const all=[]; const seen=new Set();

// Arbeitnow 多页
for(let p=1;p<=8;p++){
  const h=await curl('https://www.arbeitnow.com/api/job-board-api?page='+p);
  let j=null; try{j=JSON.parse(h);}catch(e){}
  if(!j||!j.data){console.log('arbeitnow p'+p+' FAIL'); continue;}
  let add=0;
  for(const x of j.data){
    const key=(x.company_name||'')+'|'+(x.title||'');
    if(seen.has(key)) continue; seen.add(key);
    all.push({src:'arbeitnow', company:x.company_name, title:x.title, loc:x.location, date:x.created_at?new Date(x.created_at*1000).toISOString():'', tags:(x.tags||[]).join(','), url:x.url||''});
    add++;
  }
  console.log('arbeitnow p'+p+' items='+j.data.length+' new='+add+' total='+all.length);
  await sleep(1500);
}

// Jobicy 多个 tag
for(const tag of ['engineering','data-science','design','marketing','sales','customer-support','devops']){
  const h=await curl('https://jobicy.com/api/v2/remote-jobs?tag='+tag);
  let j=null; try{j=JSON.parse(h);}catch(e){}
  if(!j||!j.jobs){console.log('jobicy '+tag+' FAIL'); continue;}
  let add=0;
  for(const x of j.jobs){
    const key=(x.companyName||'')+'|'+(x.jobTitle||'');
    if(seen.has(key)) continue; seen.add(key);
    all.push({src:'jobicy', company:x.companyName, title:x.jobTitle, loc:x.jobGeo, date:x.pubDate||'', tags:(x.jobIndustry||[]).join(','), salary:x.annualSalaryMin?('$'+x.annualSalaryMin+'-'+x.annualSalaryMax):'', url:x.url||''});
    add++;
  }
  console.log('jobicy '+tag.padEnd(16)+'items='+j.jobs.length+' new='+add+' total='+all.length);
  await sleep(1500);
}

fs.writeFileSync('_api_jobs_v2.json',JSON.stringify(all,null,1),'utf8');
console.log('FINAL='+all.length);