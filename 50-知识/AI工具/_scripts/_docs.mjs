import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:30000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
// 试几个可能的文档路径
const urls=[
 ['architecture','https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/docs/architecture.md'],
 ['plugins','https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/docs/plugins.md'],
 ['plugin-dev','https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/docs/plugin-development.md'],
 ['readme','https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/README.md'],
];
for(const [n,u] of urls){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','-w','\nCODE=%{http_code}',u]);
  const code=(h.match(/CODE=(\d+)$/)||[])[1]||'?';
  const body=h.replace(/\nCODE=\d+$/,'');
  console.log('=== '+n+' code='+code+' bytes='+body.length);
  if(code==='200' && body.length>500){
    fs.writeFileSync('_doc_'+n+'.md',body,'utf8');
    // 找插件相关章节
    const idx=body.toLowerCase().indexOf('plugin');
    console.log(body.slice(Math.max(0,idx-100), idx+500));
  }
  await new Promise(r=>setTimeout(r,700));
}
console.log('DONE');