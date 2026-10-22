import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:16*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
// 看两个参考插件的仓库结构
for(const r of ['https://github.com/search?q=dsh-network-engineer','https://github.com/dsh-plugin-lab']){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20',r]);
  console.log(r+' bytes='+h.length);
  await new Promise(x=>setTimeout(x,800));
}
// 直接查 dsh-expert 和 network-engineer 的 npm 包信息
for(const pkg of ['dsh-expert','dsh-network-engineer']){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','https://registry.npmjs.org/'+pkg]);
  let j=null; try{j=JSON.parse(h);}catch(e){}
  if(j && j.name){
    const latest=j['dist-tags']&&j['dist-tags'].latest;
    console.log('=== '+pkg+' latest='+latest);
    console.log('  description: '+(j.description||'').slice(0,150));
    console.log('  keywords: '+JSON.stringify(j.keywords||[]));
    if(j.versions&&j.versions[latest]){
      const v=j.versions[latest];
      console.log('  main='+v.main+' deps='+JSON.stringify(Object.keys(v.dependencies||{})));
      console.log('  dsh字段='+JSON.stringify(v.dsh||null).slice(0,300));
    }
  } else console.log('=== '+pkg+' 未找到');
  await new Promise(x=>setTimeout(x,800));
}
console.log('DONE');