import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:28000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
// 1. dshplugin.store 的 sitemap 结构
const h1=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','25','https://www.dshplugin.store/sitemap.xml']);
fs.writeFileSync('_sm_store.xml',h1,'utf8');
console.log('=== dshplugin.store sitemap bytes='+h1.length);
// 看前几个 loc
const locs1=[...h1.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
console.log('条目数='+locs1.length);
console.log('前5条:'); locs1.slice(0,5).forEach(l=>console.log('  '+l));
console.log('是否含插件页:'+(locs1.filter(l=>/\/p\/|\/plugin\//.test(l)).length));
await new Promise(r=>setTimeout(r,800));
// 2. awesome 的 sitemap
const h2=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','25','https://awesome-dsh-plugin.com/sitemap.xml']);
fs.writeFileSync('_sm_awesome.xml',h2,'utf8');
console.log('\n=== awesome sitemap bytes='+h2.length);
const locs2=[...h2.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
console.log('条目数='+locs2.length);
console.log('前5条:'); locs2.slice(0,5).forEach(l=>console.log('  '+l));
console.log('是否含插件页:'+(locs2.filter(l=>/\/p\//.test(l)).length));
console.log('DONE');