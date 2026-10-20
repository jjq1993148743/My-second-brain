import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
fs.mkdirSync('_raw_fcmap4',{recursive:true});
// Freelancermap 更多分类
const cats=['react','angular','nodejs','kotlin','swift','rust','golang','machine-learning','kubernetes','terraform','aws','azure','sql','oracle','sap-abap','sap-fi','salesforce','servicenow','blockchain','iot'];
let tot=0;
for(const c of cats){
  const h=await curl('https://www.freelancermap.de/projekte/'+c);
  const cards=(h.match(/class="project-card/g)||[]).length;
  if(cards>0){ fs.writeFileSync('_raw_fcmap4/'+c+'.html',h,'utf8'); tot+=cards; }
  console.log(c.padEnd(18)+Math.round(h.length/1000)+'k cards='+cards);
  await sleep(1500);
}
console.log('TOTAL='+tot);