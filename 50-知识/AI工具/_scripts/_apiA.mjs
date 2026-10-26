import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:30000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const probes=[
 ['fedidb-servers','https://fedidb.org/api/v1/servers?limit=20'],
 ['fedidb-software','https://fedidb.org/api/v1/software'],
 ['thefed','https://the-federation.info/api/v1/nodes?limit=20'],
 ['lemmyverse','https://lemmyverse.net/communities.json'],
 ['arena','https://api.are.na/v2/channels?per=10&sort=connections'],
 ['substack','https://substack.com/api/v1/leaderboard?type=publications&limit=10'],
];
for(const [n,u] of probes){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/json','--max-time','25','-w','\nCODE=%{http_code}',u]);
  const code=(h.match(/CODE=(\d+)$/)||[])[1]||'?';
  const body=h.replace(/\nCODE=\d+$/,'');
  console.log('=== '+n+' code='+code+' bytes='+body.length);
  if(code==='200' && body.length<3000) console.log(body.slice(0,700));
  else if(code==='200') console.log(body.slice(0,400));
  console.log('');
  await new Promise(r=>setTimeout(r,300));
}
// Discourse 目录：抓所有社区链接
const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','30','https://discover.discourse.org/']);
const links=[...new Set([...h.matchAll(/href="(https?:\/\/[^"]+)"/g)].map(m=>m[1]))].filter(x=>!/discourse\.org|discourse-cdn|github|google|fonts|cloudflare/i.test(x));
fs.writeFileSync('_discourse_links.json', JSON.stringify(links,null,2),'utf8');
console.log('Discourse 外链数='+links.length);
console.log(links.slice(0,25).join('\n'));
console.log('DONE');