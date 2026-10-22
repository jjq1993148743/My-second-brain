import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:28000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','28','https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/docs/capability-seams.zh.md']);
console.log('bytes='+h.length);
fs.writeFileSync('_seams_zh.md',h,'utf8');
// 找 tools 相关章节
const idx=h.indexOf('defineTool');
if(idx>0) console.log('\n=== defineTool 上下文 ===\n'+h.slice(Math.max(0,idx-600), idx+1200));
const idx2=h.indexOf('ctx.tools');
if(idx2>0) console.log('\n=== ctx.tools 上下文 ===\n'+h.slice(Math.max(0,idx2-400), idx2+800));
console.log('DONE');