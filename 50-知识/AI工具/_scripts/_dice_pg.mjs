import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','--compressed',u]);
const urls=[
  ['p2','https://www.dice.com/jobs?page=2'],
  ['p3','https://www.dice.com/jobs?page=3'],
  ['remote','https://www.dice.com/jobs/remote'],
  ['tech','https://www.dice.com/jobs/q-software-engineer-jobs'],
  ['api','https://www.dice.com/api/jobs/search'],
];
for(const [t,u] of urls){
  const h=await curl(u);
  const kb=Math.round(h.length/1000);
  const uniq=(()=>{const txt=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<[^>]+>/g,'\n'); return [...new Set(txt.split('\n').map(s=>s.trim()).filter(s=>s.length>3))].length;})();
  console.log(t.padEnd(10)+kb+'k uniq='+uniq);
  await new Promise(r=>setTimeout(r,1400));
}