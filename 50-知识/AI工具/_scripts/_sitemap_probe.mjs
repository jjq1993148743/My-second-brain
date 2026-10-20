import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','--compressed',u]);
const bases=['https://www.workana.com','https://jobs.wordpress.net','https://www.twine.net','https://www.collective.work','https://larajobs.com','https://www.peopleperhour.com','https://useme.com','https://www.freelancermap.de'];
const paths=['/sitemap.xml','/sitemap_index.xml','/feed','/rss'];
for(const b of bases){
  for(const p of paths){
    const h=await curl(b+p);
    const locs=(h.match(/<loc>/g)||[]).length;
    const items=(h.match(/<item>/g)||[]).length;
    if(locs>10||items>5) console.log(b.replace('https://','')+p+' -> locs='+locs+' items='+items+' size='+Math.round(h.length/1000)+'k');
    await new Promise(r=>setTimeout(r,800));
  }
}