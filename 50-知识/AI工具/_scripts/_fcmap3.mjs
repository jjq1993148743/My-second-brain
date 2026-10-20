import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
fs.mkdirSync('_raw_fcmap3',{recursive:true});
const sites=[['at','https://www.freelancermap.at/projektboerse.html'],['ch','https://www.freelancermap.ch/projektboerse.html'],['hays','https://www.hays.de/projekte']];
const cats=['java','python','sap-s-4hana','devops','cloud','typescript'];
for(const [tag,base] of sites){
  // 主页
  const h0=await curl(base);
  fs.writeFileSync('_raw_fcmap3/'+tag+'_0.html',h0,'utf8');
  console.log(tag+' base '+Math.round(h0.length/1000)+'k cards='+(h0.match(/class="project-card/g)||[]).length);
  await sleep(1800);
  // 分类页
  const host=base.split('/')[2];
  for(const c of cats){
    const hu=await curl('https://'+host+'/projekte/'+c);
    const n=(hu.match(/class="project-card/g)||[]).length;
    if(n>0) fs.writeFileSync('_raw_fcmap3/'+tag+'_'+c+'.html',hu,'utf8');
    console.log('  '+c.padEnd(14)+Math.round(hu.length/1000)+'k cards='+n);
    await sleep(1600);
  }
}