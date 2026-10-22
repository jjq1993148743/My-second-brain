import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:28000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
// 从 sitemap 里挑一个插件页，看它的 SEO 结构
// dshplugin.store 的插件页 URL 结构需要先看
const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','https://dshplugin.store/sitemap.xml']);
const locs=[...h.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const pluginPages=locs.filter(l=>/\/plugin\//.test(l) || /\/p\//.test(l));
console.log('=== dshplugin.store 插件页 URL 样本 ===');
console.log('插件页数:'+pluginPages.length);
pluginPages.slice(0,5).forEach(l=>console.log('  '+l));
// 也看非插件页
const otherPages=locs.filter(l=>!/\/plugin\//.test(l) && !/\/p\//.test(l));
console.log('\n其他页面:'); otherPages.slice(0,10).forEach(l=>console.log('  '+l));
console.log('DONE');