import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

// 从列表页收集详情页 ID
const list=await curl('https://www.epwk.com/task/');
const ids=[...new Set([...list.matchAll(/task\.epwk\.com\/(\d+)\//g)].map(m=>m[1]))];
console.log('IDS_FROM_LIST='+ids.length);

// 再翻几页列表收集更多 ID
const all=new Set(ids);
for(let p=2;p<=9;p++){
  const h=await curl('https://www.epwk.com/task/?page='+p);
  const more=[...new Set([...h.matchAll(/task\.epwk\.com\/(\d+)\//g)].map(m=>m[1]))];
  more.forEach(x=>all.add(x));
  console.log('page'+p+' ids='+more.length+' total='+all.size);
  await sleep(1500);
}
fs.writeFileSync('_epwk_ids.json',JSON.stringify([...all]),'utf8');
console.log('TOTAL_IDS='+all.size);