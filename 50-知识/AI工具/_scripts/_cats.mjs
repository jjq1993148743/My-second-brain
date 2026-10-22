import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
// 从 sitemap 提取所有分类页
const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','25','https://awesome-dsh-plugin.com/sitemap.xml']);
const locs=[...h.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
// 分类页是根路径下的单段路径（非 /p/ 非 /zh/）
const cats=locs.filter(l=>{
  const path=l.replace('https://awesome-dsh-plugin.com','');
  return /^\/[a-z0-9-]+\/$/.test(path) && path!=='/zh/';
}).map(l=>l.replace('https://awesome-dsh-plugin.com/','').replace('/',''));
console.log('=== awesome 分类页（'+cats.length+'个）===');
console.log(JSON.stringify(cats));
// 也看中文分类
const zhCats=locs.filter(l=>/\/zh\/[a-z0-9-]+\/$/.test(l)).map(l=>l.replace('https://awesome-dsh-plugin.com/zh/','').replace('/',''));
console.log('\n=== 中文分类页（'+zhCats.length+'个）===');
console.log(JSON.stringify(zhCats.slice(0,30)));
console.log('DONE');