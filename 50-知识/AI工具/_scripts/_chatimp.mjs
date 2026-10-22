import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:30000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
// 1. npm 包元信息
const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22','https://registry.npmjs.org/dsh-chat-import']);
let j=null; try{j=JSON.parse(h);}catch(e){}
if(j&&j.name){
  const latest=j['dist-tags'].latest;
  const v=j.versions[latest];
  console.log('=== dsh-chat-import npm');
  console.log('  latest='+latest+' 首次发布='+j.time.created+' 最新='+j.time[latest]);
  console.log('  版本数='+Object.keys(j.versions).length);
  console.log('  desc: '+(j.description||'').slice(0,200));
  console.log('  keywords: '+JSON.stringify(j.keywords||[]));
  console.log('  repository: '+JSON.stringify(v.repository||{}));
  console.log('  deps: '+JSON.stringify(Object.keys(v.dependencies||{})));
  console.log('  dsh: '+JSON.stringify(v.dsh||null).slice(0,250));
  console.log('  dist.unpackedSize='+(v.dist&&v.dist.unpackedSize));
  console.log('  files='+JSON.stringify(v.files||[]));
} else console.log('npm 未找到 dsh-chat-import');
await new Promise(x=>setTimeout(x,900));
// 2. GitHub 仓库结构
const g=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22','https://github.com/search?q=dsh-chat-import&type=repositories']);
const repoMatch=[...g.matchAll(/href="\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]*chat-import[A-Za-z0-9_.-]*)"/gi)].map(m=>m[1]);
console.log('=== GitHub 搜索结果: '+JSON.stringify([...new Set(repoMatch)].slice(0,5)));
console.log('DONE');