import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ids=JSON.parse(fs.readFileSync('_epwk_ids.json','utf8')).slice(0,30);
fs.mkdirSync('_raw_epwk_detail',{recursive:true});
const out=[];
for(const id of ids){
  const h=await curl('https://task.epwk.com/'+id+'/');
  if(h.length<20000){ console.log(id+' too-small'); await sleep(1200); continue; }
  fs.writeFileSync('_raw_epwk_detail/'+id+'.html',h,'utf8');
  const text=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ');
  const ux=[...new Set(text.split('\n').map(s=>s.trim()).filter(s=>s.length>0))];
  // 标题：通常是最长的中文行
  const title=ux.filter(l=>/[\u4e00-\u9fa5]/.test(l) && l.length>8 && l.length<60)[0]||'';
  // 预算
  const budget=(ux.find(l=>/\uffe5\s?[0-9]/.test(l))||'').slice(0,20);
  // 截稿时间
  const deadline=(ux.find(l=>/20\d{2}[-\/\u5e74]/.test(l))||'').slice(0,25);
  // 投标/参与
  const bids=(ux.find(l=>/^\d+\s*(?:\u4eba|\u6b21|\u4f4d)/.test(l))||'').slice(0,15);
  out.push({id, title:title.slice(0,60), budget, deadline, bids});
  console.log(id+' ok '+title.slice(0,32));
  await sleep(1400);
}
fs.writeFileSync('_epwk_detail.json',JSON.stringify(out,null,1),'utf8');
console.log('COLLECTED='+out.length);