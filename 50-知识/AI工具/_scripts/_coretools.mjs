import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/vnd.github+json','--max-time','20','https://api.github.com/repos/deepseek-ai/deepseek-harness/contents/packages/core/tools']);
let j=null; try{j=JSON.parse(h);}catch(e){}
if(Array.isArray(j)){
  console.log('=== packages/core/tools ===');
  for(const f of j) console.log('  '+f.type+' '+f.name+' ('+f.size+'B)');
  // 找 src 目录
  const srcDir=j.find(f=>f.name==='src');
  if(srcDir){
    const h2=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/vnd.github+json','--max-time','18','https://api.github.com/repos/deepseek-ai/deepseek-harness/contents/packages/core/tools/src']);
    let j2=null; try{j2=JSON.parse(h2);}catch(e){}
    if(Array.isArray(j2)){
      console.log('\n=== src ===');
      for(const f of j2) console.log('  '+f.type+' '+f.name+' ('+f.size+'B)');
    }
  }
} else console.log('失败: '+(j&&j.message?j.message:''));
console.log('DONE');