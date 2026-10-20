import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22','--compressed',u]);
// 测一个全新 ID
const h=await curl('https://task.epwk.com/1160902/');
console.log('fresh id 1160902 -> '+Math.round(h.length/1000)+'k');
if(h.length<20000){
  console.log('SMALL - checking why');
  console.log('  head: '+h.slice(0,200).replace(/\s+/g,' '));
}
// 再测之前的
const h2=await curl('https://task.epwk.com/1160885/');
console.log('known id 1160885 -> '+Math.round(h2.length/1000)+'k');