import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const g=async(u)=>{const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/json','--max-time','20',u]);return h;};
const sites=[
 ['肥皂剧板','https://soaps.sheknows.com/message-boards'],
 ['微缩模型','https://community.robotime.com'],
 ['房屋检查员','https://forum.nachi.org'],
 ['飞行模拟','https://community.infiniteflight.com'],
 ['音乐制作','https://forums.steinberg.net'],
 ['3D艺术','https://blenderartists.org'],
];
const out=[];
for(const [n,base] of sites){
  const h=await g(base+'/latest.json?order=activity');
  let o=null; try{o=JSON.parse(h);}catch(e){}
  if(!o||!o.topic_list){ console.log('['+n+'] FAIL len='+h.length); out.push({name:n,error:'no-json'}); await new Promise(r=>setTimeout(r,300)); continue; }
  const topics=(o.topic_list.topics||[]).slice(0,8).map(t=>({
    title:t.title, replies:t.posts_count?t.posts_count-1:0, views:t.views, likes:t.like_count
  }));
  out.push({name:n, url:base, topics});
  console.log('=== '+n+' ('+base+')');
  topics.forEach((t,i)=>console.log('  ['+(i+1)+'] '+t.title.slice(0,72)+'   回'+t.replies+' 看'+t.views));
  console.log('');
  await new Promise(r=>setTimeout(r,400));
}
fs.writeFileSync('_B_vertical.json', JSON.stringify(out,null,2),'utf8');
console.log('DONE');