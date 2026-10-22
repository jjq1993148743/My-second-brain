import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:28000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const pages=[
 ['dsh-plugin-submit','https://dsh-plugin.org/submit'],
 ['dshmarketplace-submit','https://dshmarketplace.dev/submit'],
 ['awesome-submit','https://awesome-dsh-plugin.com/submit'],
 ['dshopen-submit','https://dshopen.org/submit'],
];
for(const [n,u] of pages){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22','-w','\nCODE=%{http_code}',u]);
  const code=(h.match(/CODE=(\d+)$/)||[])[1]||'?';
  const body=h.replace(/\nCODE=\d+$/,'');
  fs.writeFileSync('_form_'+n+'.html',body,'utf8');
  const clean=body.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
  // 找表单字段
  const inputs=[...body.matchAll(/<(?:input|textarea|select)[^>]*(?:name|placeholder|id)="([^"]{2,60})"[^>]*>/gi)].map(m=>m[1]);
  const labels=[...new Set((clean.match(/插件|名称|仓库|地址|描述|分类|邮箱|GitHub|npm|提交|Submit|Plugin|Name|Repo|Description|Email/gi)||[]))].slice(0,12);
  console.log('=== '+n+' code='+code+' bytes='+body.length);
  console.log('  字段: '+JSON.stringify([...new Set(inputs)].slice(0,15)));
  console.log('  关键词: '+JSON.stringify(labels));
  console.log('  摘要: '+clean.slice(0,200));
  await new Promise(r=>setTimeout(r,800));
}
console.log('DONE');