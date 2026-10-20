import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
fs.mkdirSync('_raw_stack',{recursive:true});
const sites=[
  ['vue','https://vuejobs.com/'],
  ['react','https://reactjobs.io/'],
  ['dotnet','https://dotnetjobs.com/'],
  ['android','https://androidjobs.io/'],
  ['golang','https://golangprojects.com/'],
  ['python','https://www.pythonjobs.com/']
];
const summary={};
for(const [tag,u] of sites){
  const h=await curl(u);
  fs.writeFileSync('_raw_stack/'+tag+'.html',h,'utf8');
  // 提取所有薪资格式
  const sals=[...new Set([...h.matchAll(/[$\u00a3\u20ac]\s?[0-9]{2,3}[,.]?[0-9]{3}(?:\s*[-\u2013]\s*[$\u00a3\u20ac]?\s?[0-9]{2,3}[,.]?[0-9]{3})?/g)].map(m=>m[0]))];
  summary[tag]={bytes:h.length, salaries:sals.slice(0,6), count:sals.length};
  console.log(tag.padEnd(10)+Math.round(h.length/1000)+'k salaries='+sals.length);
  await sleep(1600);
}
fs.writeFileSync('_stack_summary.json',JSON.stringify(summary,null,1),'utf8');
console.log('DONE');