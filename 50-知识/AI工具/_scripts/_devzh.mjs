import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','25','https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/docs/development.zh.md']);
console.log('bytes='+h.length);
fs.writeFileSync('_dev_zh.md',h,'utf8');
// 找插件相关章节
const lines=h.split('\n');
let inSection=false;
for(let i=0;i<lines.length;i++){
  const l=lines[i];
  if(/^#{1,3}\s/.test(l)) console.log('\n'+l);
  else if(/defineTool|ctx\.tools|export const|inject|Config|bundle|patch/i.test(l)) console.log('  '+l.slice(0,120));
}
console.log('DONE');