import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/json','--max-time','22','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

const cats=['software-dev','customer-support','design','marketing','sales','product','data','devops','finance-legal','human-resources','qa','writing','all-others'];
const all=[]; const seen=new Set();
for(const c of cats){
  const h=await curl('https://remotive.com/api/remote-jobs?category='+c+'&limit=100');
  let j=null; try{j=JSON.parse(h);}catch(e){}
  if(!j||!j.jobs){console.log(c+' FAIL'); await sleep(1500); continue;}
  let add=0;
  for(const x of j.jobs){
    if(seen.has(x.id)) continue; seen.add(x.id);
    all.push(x); add++;
  }
  console.log(c.padEnd(18)+'items='+j.jobs.length+' new='+add+' total='+all.length);
  await sleep(1600);
}
fs.writeFileSync('_remotive_all.json',JSON.stringify(all,null,1),'utf8');
console.log('TOTAL='+all.length);
const withSal=all.filter(x=>x.salary && x.salary.trim()).length;
console.log('withSalary='+withSal+' ('+Math.round(withSal/all.length*100)+'%)');