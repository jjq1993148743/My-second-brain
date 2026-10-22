import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
// 1. 官方 base bundle 的 patch
const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22','https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/packages/bundle/base/cordis.patch.yml']);
console.log('=== packages/bundle/base/cordis.patch.yml bytes='+h.length);
console.log(h.slice(0,1500));
fs.writeFileSync('_base_patch.yml',h,'utf8');
await new Promise(r=>setTimeout(r,800));
// 2. 官方 base 的 package.json（看 dsh.bundle 声明）
const h2=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/packages/bundle/base/package.json']);
console.log('\n=== packages/bundle/base/package.json ===');
try{const j=JSON.parse(h2);console.log(JSON.stringify({name:j.name,main:j.main,exports:j.exports,dsh:j.dsh},null,2));}catch(e){console.log(h2.slice(0,500));}
console.log('DONE');