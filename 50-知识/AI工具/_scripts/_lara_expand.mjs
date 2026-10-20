import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','--compressed',u]);
// Larajobs 试更多页和分类
const tests=[['p1','https://larajobs.com/?page=1'],['p2','https://larajobs.com/?page=2'],['p3','https://larajobs.com/?page=3'],['p4','https://larajobs.com/?page=4'],['p5','https://larajobs.com/?page=5'],['p6','https://larajobs.com/?page=6'],['p7','https://larajobs.com/?page=7'],['p8','https://larajobs.com/?page=8'],['remote','https://larajobs.com/remote'],['feed','https://larajobs.com/feed'],['sitemap','https://larajobs.com/sitemap.xml']];
let tot=0;
for(const [t,u] of tests){
  const h=await curl(u);
  const cards=(h.match(/class="job-link/g)||[]).length;
  const locs=(h.match(/<loc>/g)||[]).length;
  console.log(t.padEnd(8)+Math.round(h.length/1000)+'k cards='+cards+' locs='+locs);
  tot+=cards;
  await new Promise(r=>setTimeout(r,1200));
}
console.log('TOTAL_CARDS='+tot);