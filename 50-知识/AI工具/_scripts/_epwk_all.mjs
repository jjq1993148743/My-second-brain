import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ids=JSON.parse(fs.readFileSync('_epwk_ids.json','utf8'));
const done=new Set();
try{ JSON.parse(fs.readFileSync('_epwk_detail_all.json','utf8')).forEach(d=>done.add(d.id)); }catch(e){}
console.log('start ids='+ids.length+' already='+done.size);
const out=JSON.parse(fs.existsSync('_epwk_detail_all.json')?fs.readFileSync('_epwk_detail_all.json','utf8'):'[]');
let n=0;
for(const id of ids){
  if(done.has(id)) continue;
  const h=await curl('https://task.epwk.com/'+id+'/');
  if(h.length<20000){ await sleep(900); continue; }
  const text=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ');
  const ux=[...new Set(text.split('\n').map(s=>s.trim()).filter(s=>s.length>0))];
  const title=ux.filter(l=>/[\u4e00-\u9fa5]/.test(l) && l.length>8 && l.length<60)[0]||'';
  const bm=ux.find(l=>/^\uffe5\s?[0-9]/.test(l))||'';
  const dm=ux.find(l=>/\u622a\u7a3f\u65f6\u95f4\uff1a20\d{2}-/.test(l))||'';
  // 品类
  const cm=title.match(/-([\u4e00-\u9fa5]{2,10})-(?:\u4e00\u54c1\u5a01\u5ba2|$)/);
  const cat=cm?cm[1]:'';
  out.push({id, title:title.slice(0,70), budget:bm.slice(0,20), deadline:dm.replace(/\u622a\u7a3f\u65f6\u95f4\uff1a/,'').slice(0,12), cat});
  n++;
  if(n%20===0){ fs.writeFileSync('_epwk_detail_all.json',JSON.stringify(out,null,1),'utf8'); console.log('progress='+out.length); }
  await sleep(1300);
}
fs.writeFileSync('_epwk_detail_all.json',JSON.stringify(out,null,1),'utf8');
console.log('FINAL='+out.length);