import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
fs.mkdirSync('_raw_web3',{recursive:true});
const urls=[];
for(let p=1;p<=8;p++){ urls.push(['p'+p, p===1?'https://web3.career/':'https://web3.career/?page='+p]); }
let n=0;
for(const [tag,u] of urls){
  const h=await curl(u);
  const sal=(h.match(/\$[0-9]{2,3}k/g)||[]).length;
  if(h.length>100000){ fs.writeFileSync('_raw_web3/'+tag+'.html',h,'utf8'); n++; }
  console.log(tag+' '+Math.round(h.length/1000)+'k sal='+sal);
  await sleep(1400);
}
console.log('SAVED='+n);