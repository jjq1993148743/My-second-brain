import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:30000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const urls=[
 ['freelancer','https://www.freelancer.com/rss.xml'],
 ['wwr','https://weworkremotely.com/categories/remote-programming-jobs.rss'],
];
for(const [n,u] of urls){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','25','-w','\nCODE=%{http_code}',u]);
  const code=(h.match(/CODE=(\d+)$/)||[])[1]||'?';
  const body=h.replace(/\nCODE=\d+$/,'');
  console.log('=== '+n+' code='+code+' bytes='+body.length);
  if(code==='200'){
    fs.writeFileSync('_rss_'+n+'.xml', body,'utf8');
    // 打印第一条 item 的原始结构
    const m=body.match(/<item>[\s\S]*?<\/item>/);
    console.log(m? m[0].slice(0,900) : body.slice(0,500));
  }
  console.log('');
  await new Promise(r=>setTimeout(r,500));
}
console.log('DONE');