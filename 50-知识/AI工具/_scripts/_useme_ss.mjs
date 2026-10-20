import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','--compressed',u]);
const extract=h=>{
  const keys=new Set();
  const parts=h.split('class="job__content');
  for(let k=1;k<parts.length;k++){
    const c=parts[k].slice(0,4000);
    const um=c.match(/href="(\/en\/jobs\/([a-z0-9\-]+)[^"]*)"/) || c.match(/href="(\/pl\/jobs\/([a-z0-9\-]+)[^"]*)"/);
    if(um) keys.add(um[2]);
  }
  return keys;
};
const en1=extract(await curl('https://useme.com/en/jobs/'));
const pl1=extract(await curl('https://useme.com/pl/jobs/'));
console.log('en='+en1.size+' pl='+pl1.size);
const ov=(A,B)=>{ const arr=[...A]; return Math.round(arr.filter(x=>B.has(x)).length/Math.max(A.size,1)*100); };
console.log('en vs pl: '+ov(en1,pl1)+'%');
console.log('pl vs en: '+ov(pl1,en1)+'%');