import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/vnd.github+json','--max-time','20','https://api.github.com/repos/deepseek-ai/deepseek-harness/contents/packages']);
let j=null; try{j=JSON.parse(h);}catch(e){}
if(Array.isArray(j)){
  const toolPkgs=j.filter(f=>/tool/i.test(f.name));
  console.log('=== packages 里含 tool 的目录 ===');
  for(const f of toolPkgs) console.log('  '+f.type+' '+f.name);
  console.log('\n=== 全部 packages（前30）===');
  for(const f of j.slice(0,30)) console.log('  '+f.type+' '+f.name);
} else console.log('失败: '+(j&&j.message?j.message:h.slice(0,80)));
console.log('DONE');