import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const cats=['engineering','design','product','marketing','sales','customer-support','data','devops','finance','hr'];
fs.mkdirSync('_raw_nodesk',{recursive:true});
let n=0;
for(const c of cats){
  const h=await curl('https://nodesk.co/remote-jobs/'+c+'/');
  const sal=(h.match(/[\u20ac$\u00a3]\s?[0-9]{2,3}K/g)||[]).length;
  if(h.length>50000){ fs.writeFileSync('_raw_nodesk/'+c+'.html',h,'utf8'); n++; }
  console.log(c.padEnd(18)+Math.round(h.length/1000)+'k salarySignals='+sal);
  await sleep(1300);
}
console.log('SAVED='+n);