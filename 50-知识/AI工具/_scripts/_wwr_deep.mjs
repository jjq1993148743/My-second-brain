import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','--compressed',u]);
const h=await curl('https://weworkremotely.com/remote-jobs?page=2');
const text=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<[^>]+>/g,'\n');
const u=[...new Set(text.split('\n').map(s=>s.trim()).filter(s=>s.length>5))];
const money=u.filter(l=>/\$[0-9]{2,}/.test(l)).length;
const jobLinks=[...new Set([...h.matchAll(/href="(\/remote-jobs\/[a-z0-9\-]+\/[a-z0-9\-%]+)"/gi)].map(m=>m[1]))].slice(0,8);
console.log('bytes='+h.length+' money='+money);
console.log('LINKS: '+JSON.stringify(jobLinks));
// 找 job 卡片结构
const i=h.indexOf('/remote-jobs/');
if(i>0) console.log('CTX: '+h.slice(Math.max(0,i-600),i+600).replace(/\s+/g,' ').slice(0,800));