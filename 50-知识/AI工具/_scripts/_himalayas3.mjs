import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/json','--max-time','22','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

const all=[]; const seen=new Set();
for(let off=0;off<=300;off+=20){
  const u=off===0?'https://himalayas.app/jobs/api':'https://himalayas.app/jobs/api?offset='+off;
  const h=await curl(u);
  let j=null; try{j=JSON.parse(h);}catch(e){}
  if(!j||!j.jobs){console.log('off'+off+' FAIL'); await sleep(1500); continue;}
  let add=0;
  for(const x of j.jobs){
    const key=(x.companyName||'')+'|'+(x.title||'');
    if(seen.has(key)) continue; seen.add(key);
    all.push(x); add++;
  }
  console.log('off='+String(off).padStart(3)+' items='+j.jobs.length+' new='+add+' total='+all.length);
  if(add===0 && off>60){ console.log('no new, stop'); break; }
  await sleep(1400);
}
fs.writeFileSync('_himalayas_jobs.json',JSON.stringify(all,null,1),'utf8');
console.log('FINAL='+all.length);
const withSal=all.filter(x=>x.minSalary||x.maxSalary).length;
console.log('withSalary='+withSal+' ('+Math.round(withSal/all.length*100)+'%)');