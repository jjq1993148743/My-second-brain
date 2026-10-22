import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:40000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
// 抓 RSS（含全部新插件）和主页面
const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','35','https://awesome-dsh-plugin.com']);
fs.writeFileSync('_aw_main.html',h,'utf8');
console.log('main bytes='+h.length);
// 抓 feed（可能有更多条目）
const f=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','35','https://awesome-dsh-plugin.com/feed']);
fs.writeFileSync('_aw_feed.xml',f,'utf8');
console.log('feed bytes='+f.length+' items='+(f.match(/<item>/g)||[]).length);
// 找 JSON 数据端点
for(const p of ['/plugins.json','/data.json','/api/plugins','/index.json']){
  const r=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','-w','\nCODE=%{http_code}','https://awesome-dsh-plugin.com'+p]);
  const code=(r.match(/CODE=(\d+)$/)||[])[1]||'?';
  console.log(p+' code='+code+' bytes='+r.length);
  if(code==='200'&&r.length>10000){ fs.writeFileSync('_aw_'+p.replace(/[^a-z]/g,'')+'.json',r,'utf8'); }
  await new Promise(x=>setTimeout(x,600));
}
console.log('DONE');