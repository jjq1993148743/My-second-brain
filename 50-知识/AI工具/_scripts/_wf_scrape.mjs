import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
fs.mkdirSync('_raw_wf',{recursive:true});
const urls=[
  ['remote1','https://wellfound.com/remote'],
  ['remote2','https://wellfound.com/remote?page=2'],
  ['remote3','https://wellfound.com/remote?page=3'],
  ['remote4','https://wellfound.com/remote?page=4'],
  ['eng1','https://wellfound.com/role/r/software-engineer'],
  ['eng2','https://wellfound.com/role/r/software-engineer?page=2'],
  ['jobs1','https://wellfound.com/jobs'],
  ['jobs2','https://wellfound.com/jobs?page=2'],
  ['jobs3','https://wellfound.com/jobs?page=3']
];
let n=0;
for(const [tag,u] of urls){
  const h=await curl(u);
  if(h.length>100000){ fs.writeFileSync('_raw_wf/'+tag+'.html',h,'utf8'); n++; }
  const sal=(h.match(/\$[0-9]{2,3}k/g)||[]).length;
  console.log(tag.padEnd(10)+Math.round(h.length/1000)+'k sal='+sal);
  await sleep(1500);
}
console.log('SAVED='+n);