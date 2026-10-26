import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:16*1024*1024,windowsHide:true,timeout:30000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
// 目录站：抓真实社区列表
const targets=[
 ['imageboards','https://imageboards.net/'],
 ['allchans','https://allchans.org/2025/04/24/top-imageboards/'],
];
for(const [n,u] of targets){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','25','-w','\nCODE=%{http_code}',u]);
  const code=(h.match(/CODE=(\d+)$/)||[])[1]||'?';
  const body=h.replace(/\nCODE=\d+$/,'');
  const txt=body.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ');
  const lines=[...new Set(txt.split('\n').map(s=>s.trim()).filter(s=>s.length>2))];
  console.log('=== '+n+' code='+code+' lines='+lines.length);
  console.log(lines.slice(0,60).join(' | ').slice(0,1400));
  console.log('');
}
console.log('DONE');