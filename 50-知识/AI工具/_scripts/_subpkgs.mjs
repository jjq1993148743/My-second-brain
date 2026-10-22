import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
// 试 packages/core 和 packages/extensions
for(const d of ['core','extensions','interaction','bundle']){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/vnd.github+json','--max-time','18','https://api.github.com/repos/deepseek-ai/deepseek-harness/contents/packages/'+d]);
  let j=null; try{j=JSON.parse(h);}catch(e){}
  if(Array.isArray(j)){
    console.log('=== packages/'+d+' ===');
    for(const f of j.slice(0,15)) console.log('  '+f.type+' '+f.name);
  } else console.log('packages/'+d+' 失败');
  await new Promise(r=>setTimeout(r,1200));
}
console.log('DONE');