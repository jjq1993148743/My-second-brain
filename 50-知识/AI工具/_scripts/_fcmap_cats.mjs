import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const cats=['java','python','sap-s-4hana','spring-boot','typescript','devops','cloud','data-science','softwareentwicklung','projektmanagement','beratung','sicherheit'];
fs.mkdirSync('_raw_fcmap2',{recursive:true});
let total=0;
for(const c of cats){
  const h=await curl('https://www.freelancermap.de/projekte/'+c);
  const cards=(h.match(/class="project-card/g)||[]).length;
  if(cards>0){ fs.writeFileSync('_raw_fcmap2/'+c+'.html',h,'utf8'); total+=cards; }
  console.log(c.padEnd(20)+Math.round(h.length/1000)+'k cards='+cards);
  await sleep(1800);
}
console.log('TOTAL_CARDS='+total);