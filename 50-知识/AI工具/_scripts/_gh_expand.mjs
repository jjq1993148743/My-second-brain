import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:128*1024*1024,windowsHide:true,timeout:30000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curlJ=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/json','--max-time','25','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// 扩充 Greenhouse 公司列表
const companies=['reddit','twitch','pinterest','dropbox','lyft','pinterest','affirm','cloudflare','datadog','mongodb','elastic','hashicorp','confluent','samsara','benchling','gusto','brex','plaid','chime','sofi'];
const all=[]; const seen=new Set();
try{ JSON.parse(fs.readFileSync('_greenhouse_jobs.json','utf8')).forEach(j=>{ all.push(j); seen.add(j.company+'|'+j.id); }); }catch(e){}
const before=all.length;
for(const c of companies){
  const h=await curlJ('https://boards-api.greenhouse.io/v1/boards/'+c+'/jobs');
  let j=null; try{j=JSON.parse(h);}catch(e){}
  if(!j||!j.jobs){ console.log(c.padEnd(14)+'FAIL'); await sleep(1100); continue; }
  let add=0;
  for(const job of j.jobs){
    const k=c+'|'+job.id;
    if(seen.has(k)) continue; seen.add(k);
    all.push({src:'greenhouse', company:c, id:job.id, title:job.title, loc:job.location?job.location.name:'', updated:job.updated_at||''});
    add++;
  }
  console.log(c.padEnd(14)+'jobs='+j.jobs.length+' new='+add+' total='+all.length);
  fs.writeFileSync('_greenhouse_jobs.json',JSON.stringify(all,null,1),'utf8');
  await sleep(1100);
}
console.log('FINAL='+all.length+' (was '+before+')');