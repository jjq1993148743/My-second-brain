import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:16*1024*1024,windowsHide:true,timeout:30000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const repos=['imsai-sh/awesome-deepseek-harness-plugins','beancookie/awesome-dsh-plugin','dshworks/awesome-dsh-plugins','dsh-market/dsh-market','DshMarketPlace/dshmarketplace','QT7-C23/DSH-Marketplace','LivXue/dsh-plugin-shop'];
for(const r of repos){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/vnd.github+json','--max-time','22','https://api.github.com/repos/'+r]);
  let j=null; try{j=JSON.parse(h);}catch(e){}
  if(j && j.full_name){
    console.log(r.padEnd(45)+'★'+String(j.stargazers_count).padEnd(6)+'fork '+String(j.forks_count).padEnd(5)+'| '+(j.description||'').slice(0,55));
  } else {
    console.log(r.padEnd(45)+'ERROR '+(j&&j.message?j.message:String(h).slice(0,50)));
  }
  await new Promise(x=>setTimeout(x,600));
}
// 再搜一下 dsh-plugin 主题的总量
const s=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/vnd.github+json','--max-time','22','https://api.github.com/search/repositories?q=topic:dsh-plugin&per_page=1']);
let sj=null; try{sj=JSON.parse(s);}catch(e){}
console.log('dsh-plugin 主题仓库总数: '+(sj&&sj.total_count!==undefined?sj.total_count:'?'));
console.log('DONE');