import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:28000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const sites=[
 ['dshopen','https://dshopen.org/'],
 ['dsh-plugin.org','https://dsh-plugin.org/'],
 ['dshmarketplace','https://dshmarketplace.dev'],
 ['dshplugin.store','https://www.dshplugin.store'],
 ['deepseek.stream','https://deepseek.stream/'],
 ['dshmarket','https://dshmarket.com'],
 ['dsh-1024','https://deepseek1024.com'],
 ['dsh-plugin-market','https://dsh-plugin-market.vercel.app'],
];
for(const [n,u] of sites){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22',u]);
  // 提取所有链接里含 submit/publish/contribute/github/awesome 的
  const links=[...new Set([...h.matchAll(/href="([^"]{4,140})"/gi)].map(m=>m[1]))]
    .filter(x=>/submit|publish|contribut|add-plugin|awesome|discussion|github\.com|docs|tutorial/i.test(x))
    .slice(0,12);
  console.log('=== '+n);
  links.forEach(l=>console.log('   '+l));
  await new Promise(r=>setTimeout(r,900));
}
console.log('DONE');