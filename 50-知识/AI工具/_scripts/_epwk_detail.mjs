import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','--compressed',u]);

// 测一个详情页 + task_map
for(const u of ['https://task.epwk.com/1160885/','https://www.epwk.com/task_map/']){
  const h=await curl(u);
  console.log(u+' -> '+Math.round(h.length/1000)+'k');
  if(h.length>20000){
    const text=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<[^>]+>/g,'\n');
    const ux=[...new Set(text.split('\n').map(s=>s.trim()).filter(s=>s.length>1))];
    const bids=ux.filter(l=>/[0-9]+\s*(?:\u4eba|\u6b21|\u6761)/.test(l) && l.length<30).slice(0,8);
    const money=ux.filter(l=>/[\uffe5]\s?[0-9]/.test(l)).slice(0,6);
    const cat=ux.filter(l=>/[\u4e00-\u9fa5]/.test(l) && l.length>2 && l.length<20).slice(0,10);
    console.log('  BIDS: '+JSON.stringify(bids));
    console.log('  MONEY: '+JSON.stringify(money));
    console.log('  TEXT: '+JSON.stringify(cat));
  }
  await new Promise(r=>setTimeout(r,1500));
}