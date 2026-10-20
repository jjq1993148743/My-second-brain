import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','--compressed',u]);
const urls=[
  ['p2','https://bulldogjob.pl/companies/jobs?page=2'],
  ['p3','https://bulldogjob.pl/companies/jobs/2'],
  ['cat','https://bulldogjob.pl/companies/jobs/s/backend'],
  ['remote','https://bulldogjob.pl/companies/jobs/s/remote'],
  ['it','https://bulldogjob.pl/it-jobs'],
  ['praca','https://bulldogjob.pl/praca']
];
for(const [t,u] of urls){
  const h=await curl(u);
  const text=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<[^>]+>/g,'\n');
  const uniq=[...new Set(text.split('\n').map(s=>s.trim()).filter(s=>s.length>10))];
  const jobs=uniq.filter(l=>/(developer|engineer|architect|devops|analyst)/i.test(l)).length;
  console.log(t.padEnd(8)+Math.round(h.length/1000)+'k jobs='+jobs);
  await new Promise(r=>setTimeout(r,1600));
}