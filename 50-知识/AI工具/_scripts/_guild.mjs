import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:16*1024*1024,windowsHide:true,timeout:30000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const tg=[
 ['guild-hobby','https://guildregister.com/subtopic/Hobby'],
 ['guild-art','https://guildregister.com/subtopic/Art'],
];
for(const [n,u] of tg){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','25','-w','\nCODE=%{http_code}',u]);
  const code=(h.match(/CODE=(\d+)$/)||[])[1]||'?';
  const body=h.replace(/\nCODE=\d+$/,'');
  const txt=body.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&');
  const lines=[...new Set(txt.split('\n').map(s=>s.trim()).filter(s=>s.length>1))];
  console.log('=== '+n+' code='+code+' lines='+lines.length);
  console.log(lines.slice(0,70).join(' | ').slice(0,1600));
  console.log('');
}
console.log('DONE');