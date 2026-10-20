import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:18000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','16','--compressed',u]);
// 先看 epwk 的品类 URL 结构
const h=await curl('https://www.epwk.com/task/');
const cats=[...new Set([...h.matchAll(/href="([^"]*(?:task|cate)[^"]*)"/g)].map(m=>m[1]))].slice(0,20);
console.log('CATS:');
cats.forEach(c=>console.log('  '+c));
// 找分类筛选参数
const params=[...new Set([...h.matchAll(/[?&](cid|category|cate|cat)=\d+/g)].map(m=>m[0]))].slice(0,10);
console.log('PARAMS: '+JSON.stringify(params));