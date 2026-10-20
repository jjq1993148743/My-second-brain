import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22','--compressed',u]);
// 用 Bing 搜索 site:boards.greenhouse.io
const q=encodeURIComponent('site:boards.greenhouse.io jobs');
const h=await curl('https://www.bing.com/search?q='+q+'&count=50');
console.log('bing bytes='+h.length);
const comps=[...new Set([...h.matchAll(/boards\.greenhouse\.io\/([a-z0-9\-]+)/gi)].map(m=>m[1].toLowerCase()))];
console.log('found='+comps.length);
console.log(JSON.stringify(comps));