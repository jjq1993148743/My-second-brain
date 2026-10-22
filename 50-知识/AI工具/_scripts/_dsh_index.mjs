import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:40000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const body=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','30','https://dshopen.org/index.json']);
fs.writeFileSync('_dsh_index.json',body,'utf8');
console.log('bytes='+body.length);
let j=null; try{j=JSON.parse(body);}catch(e){ console.log('parse fail: '+String(e).slice(0,80)); }
if(j){
  console.log('keys: '+Object.keys(j).join(', '));
  const plugins=j.plugins||j.items||[];
  console.log('plugins count='+(Array.isArray(plugins)?plugins.length:'n/a'));
  if(Array.isArray(plugins)&&plugins.length){
    console.log('sample keys: '+Object.keys(plugins[0]).join(', '));
    console.log('sample: '+JSON.stringify(plugins[0]).slice(0,400));
    // 分类统计
    const cats={};
    for(const p of plugins){ const c=(p.category||p.cat||(p.categories||[])[0]||'?'); cats[c]=(cats[c]||0)+1; }
    console.log('categories: '+JSON.stringify(Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,15)));
  }
  if(j.metadata) console.log('metadata: '+JSON.stringify(j.metadata).slice(0,500));
}
console.log('DONE');