import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:30000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
// 用 Wikimedia Commons 的自由版权猫照片（不需要登录，链接稳定）
const candidates=[
 ['cat1','https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Cat_November_2010-1a.jpg/800px-Cat_November_2010-1a.jpg'],
 ['cat2','https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/800px-Cat03.jpg'],
 ['cat3','https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Orange_tabby_cat_sitting_on_fence.jpg/800px-Orange_tabby_cat_sitting_on_fence.jpg'],
];
for(const [n,u] of candidates){
  try{
    const r=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','25','-o','_netcat_'+n+'.jpg','-w','%{http_code} %{size_download}',u]);
    console.log(n+': '+r);
  }catch(e){ console.log(n+': FAIL '+String(e).slice(0,50)); }
}
console.log('DONE');