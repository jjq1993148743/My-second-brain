import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:128*1024*1024,windowsHide:true,timeout:30000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','25','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const extract=h=>{
  const keys=new Set();
  const parts=h.split('class="project-card');
  for(let k=1;k<parts.length;k++){
    const c=parts[k].slice(0,6000);
    const text=c.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<[^>]+>/g,'\n');
    const u=[...new Set(text.split('\n').map(s=>s.trim()).filter(s=>s.length>0))];
    const company=u[1]||'', title=u[2]||'';
    if(title && title.length>8) keys.add(company+'|'+title);
  }
  return keys;
};
const cats=['java','python','sap-s-4hana','devops','cloud'];
const sites=[['de','https://www.freelancermap.de'],['at','https://www.freelancermap.at'],['ch','https://www.freelancermap.ch']];
const sets={de:new Set(),at:new Set(),ch:new Set()};
for(const [tag,base] of sites){
  for(const c of cats){
    const h=await curl(base+'/projekte/'+c);
    const K=extract(h);
    K.forEach(x=>sets[tag].add(x));
    await sleep(1300);
  }
  console.log(tag+' total='+sets[tag].size);
}
const ov=(A,B)=>{ const arr=[...A]; const n=arr.filter(x=>B.has(x)).length; return Math.round(n/Math.max(A.size,1)*100); };
console.log('---');
console.log('de vs at: '+ov(sets.de,sets.at)+'%');
console.log('de vs ch: '+ov(sets.de,sets.ch)+'%');
console.log('at vs ch: '+ov(sets.at,sets.ch)+'%');