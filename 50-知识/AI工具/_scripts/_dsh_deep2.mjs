import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:16*1024*1024,windowsHide:true,timeout:30000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
// 1. GitHub 仓库（走 api，串行带间隔）
const repos=['imsai-sh/awesome-deepseek-harness-plugins','beancookie/awesome-dsh-plugin','dshworks/awesome-dsh-plugins','dsh-market/dsh-market','DshMarketPlace/dshmarketplace','QT7-C23/DSH-Marketplace','LivXue/dsh-plugin-shop'];
for(const r of repos){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/vnd.github+json','--max-time','20','https://api.github.com/repos/'+r]);
  let j=null; try{j=JSON.parse(h);}catch(e){}
  if(j&&j.full_name) console.log(r.padEnd(45)+'★'+String(j.stargazers_count).padEnd(6)+'| '+(j.description||'').slice(0,50));
  else console.log(r.padEnd(45)+'| '+(j&&j.message?String(j.message).slice(0,40):'err'));
  await new Promise(x=>setTimeout(x,2500));
}
// 2. deepseek.stream 需求广场
for(const [n,u] of [['需求广场','https://deepseek.stream/'],['dshplugin-store','https://www.dshplugin.store'],['dshmarketplace-api','https://dshmarketplace.dev']]){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22',u]);
  const clean=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  // 找需求/悬赏/价格相关
  const need=(clean.match(/需求|悬赏|求开发|招聘|接单|定价|付费|赏金/gi)||[]).length;
  const money=[...new Set((clean.match(/[\u00a5\uffe5]\s?[0-9][0-9,.]*|\d+\s*元|\$\s?[0-9.]+/g)||[]))].slice(0,8);
  console.log('=== '+n+' bytes='+h.length+' 需求词='+need+' 价='+JSON.stringify(money));
  fs.writeFileSync('_dsh_'+n.replace(/[^a-z0-9]/gi,'')+'.html',h,'utf8');
  await new Promise(x=>setTimeout(x,800));
}
console.log('DONE');