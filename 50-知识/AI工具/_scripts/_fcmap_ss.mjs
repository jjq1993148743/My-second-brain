import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:128*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22','--compressed',u]);
// 提取项目卡片里的公司+职位组合作为唯一键
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
const de=await curl('https://www.freelancermap.de/projektboerse.html');
const at=await curl('https://www.freelancermap.at/projektboerse.html');
const ch=await curl('https://www.freelancermap.ch/projektboerse.html');
const DE=extract(de), AT=extract(at), CH=extract(ch);
console.log('sizes: de='+DE.size+' at='+AT.size+' ch='+CH.size);
const ov=(A,B)=>{ const arr=[...A]; const n=arr.filter(x=>B.has(x)).length; return Math.round(n/Math.max(A.size,1)*100); };
console.log('de vs at: '+ov(DE,AT)+'%');
console.log('de vs ch: '+ov(DE,CH)+'%');
console.log('at vs ch: '+ov(AT,CH)+'%');
// 极值对比
const maxBudget=h=>{
  const m=[...h.matchAll(/([0-9]{2,3}\.[0-9]{3})\s*\u20ac/g)].map(x=>parseInt(x[1].replace('.','')));
  return m.length?Math.max(...m):null;
};
console.log('maxBudget de='+maxBudget(de)+' at='+maxBudget(at)+' ch='+maxBudget(ch));