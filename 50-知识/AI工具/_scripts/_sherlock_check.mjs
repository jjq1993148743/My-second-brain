import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curlJ=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/json','--max-time','20','--compressed',u]);

// Sherlock 审计竞赛
const s=await curlJ('https://audits.sherlock.xyz/api/contests');
let sj=null; try{sj=JSON.parse(s);}catch(e){}
if(sj){
  const arr=Array.isArray(sj)?sj:(sj.contests||sj.data||[]);
  console.log('SHERLOCK items='+arr.length);
  if(arr[0]) console.log('  keys: '+JSON.stringify(Object.keys(arr[0]).slice(0,15)));
  arr.slice(0,5).forEach(c=>console.log('  '+(c.title||c.name||'-')+' | prize='+(c.totalPrize||c.prize||'-')+' | status='+(c.status||'-')));
  fs.writeFileSync('_sherlock.json',JSON.stringify(arr,null,1),'utf8');
}

// Immunefi
const i=await curlJ('https://immunefi.com/api/bounties');
console.log('IMMUNEFI '+Math.round(i.length/1000)+'k');
let ij=null; try{ij=JSON.parse(i);}catch(e){}
if(ij){ const arr=Array.isArray(ij)?ij:(ij.bounties||ij.data||[]); console.log('  items='+arr.length); if(arr[0]) console.log('  keys: '+JSON.stringify(Object.keys(arr[0]).slice(0,15))); }