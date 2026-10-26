import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:30000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const g=async(u)=>{const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/json','--max-time','20',u]);return h;};

// 1) Lobsters 热帖（直接看内容）
const lob = await g('https://lobste.rs/hottest.json');
try{
  const arr=JSON.parse(lob);
  console.log('=== Lobsters 热帖 Top12 ===');
  arr.slice(0,12).forEach((p,i)=>{
    console.log('['+(i+1)+'] '+p.title);
    console.log('     分数'+p.score+' 评论'+p.comment_count+' 标签'+(p.tags||[]).join(',')+' | '+p.url);
  });
}catch(e){ console.log('lobsters parse fail: '+lob.slice(0,100)); }
console.log('');

// 2) HN 前 8 条详情
const ids = await g('https://hacker-news.firebaseio.com/v0/topstories.json');
try{
  const list=JSON.parse(ids).slice(0,8);
  console.log('=== HN Top8 ===');
  for(const id of list){
    const it=await g('https://hacker-news.firebaseio.com/v0/item/'+id+'.json');
    const o=JSON.parse(it);
    console.log('· '+(o.title||'').slice(0,90)+'  [分'+o.score+' 评'+o.descendants+']');
  }
}catch(e){ console.log('hn fail'); }
console.log('DONE');