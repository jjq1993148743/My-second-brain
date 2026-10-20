import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','--compressed',u]);
const tests=[
  ['feed-paged','https://jobs.wordpress.net/feed/?paged=2'],
  ['feed-page','https://jobs.wordpress.net/feed/?page=2'],
  ['cat-feed','https://jobs.wordpress.net/job-category/plugin-development/feed/'],
  ['job-list','https://jobs.wordpress.net/job-listings/'],
  ['all-jobs','https://jobs.wordpress.net/?s=&post_type=job_listing'],
  ['archive','https://jobs.wordpress.net/2026/10/']
];
for(const [t,u] of tests){
  const h=await curl(u);
  const items=(h.match(/<item>/g)||[]).length;
  const jl=(h.match(/jobs\.wordpress\.net\/job\//g)||[]).length;
  console.log(t.padEnd(14)+Math.round(h.length/1000)+'k rssItems='+items+' jobLinks='+jl);
  await new Promise(r=>setTimeout(r,1300));
}