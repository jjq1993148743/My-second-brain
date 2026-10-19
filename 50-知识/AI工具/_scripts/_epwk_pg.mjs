import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','--compressed',u]);
const urls=[
  ['p1','https://www.epwk.com/task/page2.html'],
  ['p2','https://www.epwk.com/task/list-2.html'],
  ['p3','https://www.epwk.com/task/?page=2'],
  ['p4','https://www.epwk.com/task/index-2.html'],
  ['p5','https://www.epwk.com/task/p2.html']
];
for(const [tag,u] of urls){
  const h=await curl(u);
  const items=(h.match(/itemblock/g)||[]).length;
  const ids=(h.match(/task\.epwk\.com\/\d+/g)||[]).length;
  console.log(tag+' '+Math.round(h.length/1000)+'k items='+items+' ids='+ids+' '+u);
  await new Promise(r=>setTimeout(r,1500));
}