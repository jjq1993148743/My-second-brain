import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:26000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
for(const [n,u] of [['rss','https://awesome-dsh-plugin.com/rss'],['feed','https://awesome-dsh-plugin.com/feed'],['detail','https://awesome-dsh-plugin.com/p/dsh-market/dsh-market/'],['newest','https://awesome-dsh-plugin.com/?sort=newest']]){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','-w','\nCODE=%{http_code}',u]);
  const code=(h.match(/CODE=(\d+)$/)||[])[1]||'?';
  const body=h.replace(/\nCODE=\d+$/,'');
  const clean=body.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
  const isXml=/<rss|<feed|xml version/.test(body);
  console.log('=== '+n+' code='+code+' bytes='+body.length+' isXML='+isXml);
  console.log('  '+clean.slice(0,250));
  await new Promise(r=>setTimeout(r,800));
}
console.log('DONE');