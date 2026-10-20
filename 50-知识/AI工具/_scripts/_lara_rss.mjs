import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','--compressed',u]);
const tests=[
  ['rss','https://larajobs.com/rss'],
  ['feed2','https://larajobs.com/jobs.rss'],
  ['cat1','https://larajobs.com/categories/remote'],
  ['cat2','https://larajobs.com/categories/full-time'],
  ['tag','https://larajobs.com/tags/laravel'],
  ['api','https://larajobs.com/api/jobs'],
  ['json','https://larajobs.com/jobs.json']
];
for(const [t,u] of tests){
  const h=await curl(u);
  const items=(h.match(/<item>/g)||[]).length;
  const cards=(h.match(/class="job-link/g)||[]).length;
  let j=null; try{j=JSON.parse(h);}catch(e){}
  console.log(t.padEnd(8)+Math.round(h.length/1000)+'k items='+items+' cards='+cards+' json='+(j?'yes':'no'));
  await new Promise(r=>setTimeout(r,1200));
}