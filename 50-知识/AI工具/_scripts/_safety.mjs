import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:26000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
// 1. npm 包详情
const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22','https://registry.npmjs.org/cc-safety-net']);
let j=null; try{j=JSON.parse(h);}catch(e){}
if(j&&j.name){
  const latest=j['dist-tags'].latest;
  const v=j.versions[latest];
  console.log('=== npm cc-safety-net');
  console.log('  version='+latest+' 发布时间='+j.time[latest]);
  console.log('  首次发布='+j.time.created);
  console.log('  description: '+(j.description||'').slice(0,200));
  console.log('  keywords: '+JSON.stringify(j.keywords||[]));
  console.log('  repository: '+JSON.stringify(v.repository||{}));
  console.log('  homepage: '+(v.homepage||''));
  console.log('  deps: '+JSON.stringify(Object.keys(v.dependencies||{})));
  console.log('  dsh字段: '+JSON.stringify(v.dsh||null).slice(0,200));
  console.log('  版本数='+Object.keys(j.versions).length);
  // 全部版本时间线
  const times=Object.entries(j.time).filter(([k])=>k!=='created'&&k!=='modified').slice(-8);
  console.log('  最近版本: '+JSON.stringify(times));
} else console.log('npm 未找到');
await new Promise(x=>setTimeout(x,900));
// 2. GitHub 仓库
const g=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22','https://github.com/kenryu42/cc-safety-net']);
const stars=(g.match(/"stargazerCount":\s*([0-9]+)/)||[])[1]||'?';
const desc=(g.match(/<meta name="description" content="([^"]{0,150})"/)||[])[1]||'';
const created=(g.match(/"createdAt":"([0-9-]{10})/)||[])[1]||'?';
console.log('=== GitHub kenryu42/cc-safety-net');
console.log('  bytes='+g.length+' ★'+stars+' created='+created);
console.log('  desc: '+desc.replace(/&quot;/g,'"').slice(0,150));
console.log('DONE');