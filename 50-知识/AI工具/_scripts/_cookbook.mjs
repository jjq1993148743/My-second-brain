import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const files=[
 ['adding-a-tool','https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/docs/cookbook/adding-a-tool.zh.md'],
 ['first-plugin','https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/docs/cordis-tutorial/01-first-plugin.zh.md'],
 ['into-harness','https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/docs/cordis-tutorial/07-into-the-harness.zh.md'],
];
for(const [n,u] of files){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','25',u]);
  console.log('=== '+n+' bytes='+h.length);
  fs.writeFileSync('_cb_'+n+'.md',h,'utf8');
  await new Promise(r=>setTimeout(r,800));
}
console.log('DONE');