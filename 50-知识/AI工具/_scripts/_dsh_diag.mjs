import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:8*1024*1024,windowsHide:true,timeout:25000},(e,so,se)=>res({so:so||'',se:(se||'').slice(0,200)})));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const t=['dsh.market','deepseek1024.com','dshopen.org'];
for(const h of t){
  const dns=await run('nslookup',[h]);
  console.log('--- '+h);
  console.log('  DNS: '+(dns.so+dns.se).replace(/\s+/g,' ').slice(0,180));
  const direct=await run('curl',['-sS','-m','12','-o','NUL','-w','code=%{http_code} t=%{time_total}','https://'+h]);
  console.log('  DIRECT: '+(direct.so+direct.se).slice(0,140));
  const prox=await run('curl',['-sS','-x','http://127.0.0.1:7897','-m','15','-o','NUL','-w','code=%{http_code} t=%{time_total}','-H','User-Agent: '+UA,'https://'+h]);
  console.log('  PROXY: '+(prox.so+prox.se).slice(0,140));
  await new Promise(r=>setTimeout(r,800));
}
console.log('DONE');