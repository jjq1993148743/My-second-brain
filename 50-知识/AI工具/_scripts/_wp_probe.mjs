import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','--compressed',u]);
// WordPress jobs 用 WP Job Manager，可能有 feed 或 sitemap
const urls=[
  ['sitemap','https://jobs.wordpress.net/sitemap_index.xml'],
  ['feed','https://jobs.wordpress.net/feed/'],
  ['jobfeed','https://jobs.wordpress.net/job-feed/'],
  ['rss','https://jobs.wordpress.net/rss/'],
  ['wpjson','https://jobs.wordpress.net/wp-json/wp/v2/job_listing?per_page=100'],
  ['wpjson2','https://jobs.wordpress.net/wp-json/wp/v2/types'],
  ['ajax','https://jobs.wordpress.net/wp-json/wp/v2/posts?per_page=100']
];
for(const [t,u] of urls){
  const h=await curl(u);
  let j=null; try{j=JSON.parse(h);}catch(e){}
  const n = Array.isArray(j) ? j.length : 0;
  console.log(t.padEnd(10)+Math.round(h.length/1000)+'k '+(j?'JSON items='+n:'other')+' head='+h.slice(0,60).replace(/\s+/g,' '));
  await new Promise(r=>setTimeout(r,1200));
}