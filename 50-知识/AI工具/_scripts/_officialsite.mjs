import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:30000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const urls=[
 ['index','https://deepseek-harness.github.io/deepseek-harness/'],
 ['plugins','https://deepseek-harness.github.io/deepseek-harness/plugins/'],
 ['dev','https://deepseek-harness.github.io/deepseek-harness/development/'],
 ['cordis','https://deepseek-harness.github.io/deepseek-harness/cordis-primer.html'],
];
for(const [n,u] of urls){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22','-w','\nCODE=%{http_code}',u]);
  const code=(h.match(/CODE=(\d+)$/)||[])[1]||'?';
  const body=h.replace(/\nCODE=\d+$/,'');
  console.log('=== '+n+' code='+code+' bytes='+body.length);
  if(code==='200'){
    fs.writeFileSync('_site_'+n+'.html',body,'utf8');
    // 提取所有链接
    const links=[...new Set([...body.matchAll(/href="([^"]{2,100})"/g)].map(m=>m[1]))].filter(x=>/plugin|develop|tool|cordis|guide/i.test(x)).slice(0,15);
    console.log('  相关链接: '+JSON.stringify(links));
  }
  await new Promise(r=>setTimeout(r,600));
}
console.log('DONE');