import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:28000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const targets=[
 ['dshmarket','https://dshmarket.com'],
 ['dshmarketplace','https://dshmarketplace.dev'],
 ['dsh1024','https://deepseek1024.com'],
 ['dshpluginhub','https://dsh-plugin.org'],
];
for(const [n,u] of targets){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22',u]);
  fs.writeFileSync('_ds2_'+n+'.html',h,'utf8');
  const clean=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
  // 找数量声称
  const counts=[...new Set((clean.match(/[0-9,]+\s*(?:个)?\s*(?:插件|plugins|plugin)/gi)||[]))].slice(0,6);
  // 找变现线索
  const monet=[...new Set((clean.match(/赞助|广告|付费|定价|pricing|sponsor|advertise|submit|提交|API/gi)||[]))].slice(0,8);
  // 提交入口
  const submit=/Submit|提交插件|发布/i.test(clean);
  console.log('=== '+n+' bytes='+h.length);
  console.log('  数量: '+JSON.stringify(counts));
  console.log('  变现词: '+JSON.stringify(monet)+' 有提交入口='+submit);
  console.log('  摘要: '+clean.slice(0,220));
  await new Promise(r=>setTimeout(r,900));
}
console.log('DONE');