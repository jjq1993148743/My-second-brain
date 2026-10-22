import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:28000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const targets=[
 ['dshopen-docs','https://dshopen.org/docs'],
 ['dshstream-guide','https://deepseek.stream/'],
 ['dshpluginhub-tutorial','https://dsh-plugin.org/tutorials'],
 ['dshplugin-tutorials','https://www.dshplugin.store/tutorials'],
];
for(const [n,u] of targets){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22',u]);
  fs.writeFileSync('_dev_'+n+'.html',h,'utf8');
  const clean=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
  // 找开发相关信号
  const dev=(clean.match(/npm|pnpm|typescript|manifest|dsh-plugin|skill|MCP|脚手架|SDK|API|package\.json/gi)||[]).length;
  const steps=(clean.match(/第一步|步骤|教程|tutorial|guide|如何|怎样/gi)||[]).length;
  console.log('=== '+n+' bytes='+h.length+' 开发词='+dev+' 教程词='+steps);
  console.log('  '+clean.slice(0,300));
  await new Promise(r=>setTimeout(r,900));
}
console.log('DONE');