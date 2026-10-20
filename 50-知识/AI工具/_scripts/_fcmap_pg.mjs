import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','--compressed',u]);
const urls=['https://www.freelancermap.de/projektboerse.html?page=2','https://www.freelancermap.de/projektboerse?page=2','https://www.freelancermap.de/projektboerse.html?p=2','https://www.freelancermap.de/projektboerse/seite-2'];
for(const u of urls){
  const h=await curl(u);
  const cards=(h.match(/class="project-card/g)||[]).length;
  console.log(u.slice(-45)+' -> '+Math.round(h.length/1000)+'k cards='+cards);
  await new Promise(r=>setTimeout(r,1800));
}