import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const base='https://deepseek-harness.github.io/deepseek-harness/';
const paths=['guide/','guide/plugin.html','guide/plugins.html','plugins.html','development/plugin.html','cordis-primer.html','architecture.html','guide/getting-started.html','sitemap.xml'];
for(const p of paths){
  const u=base+p;
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','-w','\nCODE=%{http_code}',u]);
  const code=(h.match(/CODE=(\d+)$/)||[])[1]||'?';
  const body=h.replace(/\nCODE=\d+$/,'');
  // 判断是否是真实页面（含内容）还是404页
  const is404 = /404|PAGE NOT FOUND|not found/i.test(body.slice(0,3000)) && body.length < 60000;
  console.log(p.padEnd(30)+' code='+code+' bytes='+String(body.length).padEnd(7)+(is404?' 404页':' ✅'));
  if(code==='200' && !is404 && body.length > 5000){
    fs.writeFileSync('_doc_'+p.replace(/[^a-z0-9]/gi,'_')+'.html',body,'utf8');
  }
  await new Promise(r=>setTimeout(r,500));
}
console.log('DONE');