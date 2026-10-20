import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:128*1024*1024,windowsHide:true,timeout:30000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/json','--max-time','25','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

const all=[];

// 1) Arbeitnow - 300
const a=await curl('https://www.arbeitnow.com/api/job-board-api');
let aj=null; try{aj=JSON.parse(a);}catch(e){}
if(aj&&aj.data){ for(const j of aj.data){ all.push({src:'arbeitnow', company:j.company_name, title:j.title, loc:j.location, date:j.created_at?new Date(j.created_at*1000).toISOString():'', tags:(j.tags||[]).join(','), salary:''}); } }
console.log('arbeitnow='+(aj&&aj.data?aj.data.length:0));
await sleep(1500);

// 2) Jobicy - 200
const b=await curl('https://jobicy.com/api/v2/remote-jobs');
let bj=null; try{bj=JSON.parse(b);}catch(e){}
if(bj&&bj.jobs){ for(const j of bj.jobs){ all.push({src:'jobicy', company:j.companyName, title:j.jobTitle, loc:j.jobGeo, date:j.pubDate, tags:(j.jobIndustry||[]).join(','), salary:j.annualSalaryMin?('$'+j.annualSalaryMin+'-'+j.annualSalaryMax):''}); } }
console.log('jobicy='+(bj&&bj.jobs?bj.jobs.length:0));
await sleep(1500);

// 3) WorkingNomads - 41
const c=await curl('https://www.workingnomads.com/api/exposed_jobs/');
let cj=null; try{cj=JSON.parse(c);}catch(e){}
if(Array.isArray(cj)){ for(const j of cj){ all.push({src:'workingnomads', company:j.company, title:j.title, loc:j.location, date:j.pub_date, tags:j.category_name||'', salary:''}); } }
console.log('workingnomads='+(Array.isArray(cj)?cj.length:0));
await sleep(1500);

// 4) Himalayas - 20
const d=await curl('https://himalayas.app/jobs/api');
let dj=null; try{dj=JSON.parse(d);}catch(e){}
if(dj&&dj.jobs){ for(const j of dj.jobs){ all.push({src:'himalayas', company:j.companyName, title:j.title, loc:j.locationRestrictions?j.locationRestrictions.join(','):'', date:j.pubDate, tags:'', salary:j.minSalary?('$'+j.minSalary+'-'+j.maxSalary):''}); } }
console.log('himalayas='+(dj&&dj.jobs?dj.jobs.length:0));

fs.writeFileSync('_multi_api_jobs.json',JSON.stringify(all,null,1),'utf8');
console.log('TOTAL='+all.length);
const bySrc={};
for(const j of all) bySrc[j.src]=(bySrc[j.src]||0)+1;
console.log('BY_SRC='+JSON.stringify(bySrc));