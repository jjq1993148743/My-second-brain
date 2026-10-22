import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
// 用 GitHub API 列 docs 目录
const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/vnd.github+json','--max-time','20','https://api.github.com/repos/deepseek-ai/deepseek-harness/contents/docs']);
let j=null; try{j=JSON.parse(h);}catch(e){}
if(Array.isArray(j)){
  console.log('=== docs 目录 ===');
  for(const f of j) console.log('  '+f.type+' '+f.name+' ('+f.size+'B)');
} else {
  console.log('API 失败: '+(j&&j.message?j.message:h.slice(0,100)));
}
console.log('DONE');