import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
fs.mkdirSync('_raw_euro',{recursive:true});
const cats=['developer','front_end_developer','python_developer','linux_and_unix','hardware_and_telecoms','java','devops','data_science'];
const countries=['germany','netherlands','france','spain','poland','sweden'];
let tot=0;
for(const c of cats){
  const h=await curl('https://www.eurotechjobs.com/jobs/'+c);
  if(h.length>20000){ fs.writeFileSync('_raw_euro/cat_'+c+'.html',h,'utf8'); tot++; }
  console.log('cat '+c.padEnd(22)+Math.round(h.length/1000)+'k');
  await sleep(1500);
}
for(const c of countries){
  const h=await curl('https://www.eurotechjobs.com/jobs/'+c);
  if(h.length>20000){ fs.writeFileSync('_raw_euro/cty_'+c+'.html',h,'utf8'); tot++; }
  console.log('cty '+c.padEnd(22)+Math.round(h.length/1000)+'k');
  await sleep(1500);
}
console.log('SAVED='+tot);