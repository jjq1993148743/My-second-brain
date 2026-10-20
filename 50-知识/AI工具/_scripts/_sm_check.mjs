import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','--compressed',u]);
for(const [tag,u] of [['twine','https://www.twine.net/sitemap.xml'],['collective','https://www.collective.work/sitemap.xml']]){
  const h=await curl(u);
  const locs=[...h.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
  console.log('=== '+tag+' locs='+locs.length);
  const sub=locs.filter(l=>/sitemap/i.test(l));
  console.log('  sub-sitemaps='+sub.length);
  if(sub.length) sub.slice(0,8).forEach(s=>console.log('    '+s));
  const jobs=locs.filter(l=>/job|project|mission/i.test(l));
  console.log('  job-like='+jobs.length);
  jobs.slice(0,5).forEach(s=>console.log('    '+s));
}