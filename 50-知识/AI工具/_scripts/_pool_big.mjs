import { execFile } from 'node:child_process';
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const run=(a)=>new Promise(res=>execFile('curl',a,{maxBuffer:128*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const get=(u)=>run(['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept-Language: en-US,en;q=0.9','--max-time','20','--compressed','-w','\n%{http_code}',u]);
const grab=(h)=>{const idx=h.lastIndexOf('\n');return {code:(h.slice(idx+1)||'').trim(), html:h.slice(0,idx)};};
// justjoin 职位详情页（JSON-LD JobPosting）
const jjUrls=['https://justjoin.it/job-offers/all-locations/javascript','https://justjoin.it/job-offers/all-locations/python','https://justjoin.it/job-offers/all-locations/ai'];
for(const u of jjUrls){
  const {code,html}=grab(await get(u));
  const lds=[...html.matchAll(/application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
  let jobPostings=0, itemLists=0;
  for(const ld of lds){ try{const j=JSON.parse(ld); if(j['@type']==='JobPosting')jobPostings++; if(j['@type']==='ItemList')itemLists++; }catch(e){} }
  console.log('JJ '+u.slice(29,60)+' code='+code+' bytes='+Math.round(html.length/1000)+'k ld='+lds.length+' jobposting='+jobPostings+' itemlist='+itemLists);
  await new Promise(r=>setTimeout(r,1400));
}
// freelance.nl opdrachten
const {code:c2,html:h2}=grab(await get('https://www.freelance.nl/opdrachten'));
fs.writeFileSync('_R_freelancenl.html',h2,'utf8');
console.log('freelance.nl code='+c2+' bytes='+Math.round(h2.length/1000)+'k');
// jobberman
const {code:c3,html:h3}=grab(await get('https://www.jobberman.com/jobs'));
fs.writeFileSync('_R_jobberman.html',h3,'utf8');
console.log('jobberman code='+c3+' bytes='+Math.round(h3.length/1000)+'k');
console.log('DONE');