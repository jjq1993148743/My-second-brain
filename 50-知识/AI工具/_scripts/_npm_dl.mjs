import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:28000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
// 头部插件的 npm 包名（从仓库名推断）
const pkgs=['dsh-image-gen','dsh-mnemon','dsh-genui','modsearch','dsh-free-search','dsh-mobile','dsh-postiz','dsh-working-activity','dsh-vision-toolkit','dsh-univer-office'];
console.log('=== npm 下载量（近一月）===');
for(const p of pkgs){
  // npm registry 的 downloads API
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','https://api.npmjs.org/downloads/point/last-month/'+p]);
  let j=null; try{j=JSON.parse(h);}catch(e){}
  if(j && j.downloads!==undefined) console.log(p.padEnd(26)+'月下载='+j.downloads);
  else console.log(p.padEnd(26)+'| '+(j&&j.error?String(j.error).slice(0,40):'未找到/npm无此包'));
  await new Promise(r=>setTimeout(r,700));
}
// 试 scoped 包
console.log('=== scoped 包 ===');
for(const p of ['@nagi-ovo/dsh-ads','@anionex/dsh-vision-toolkit','@liustack/modsearch','@changfenhuang/dsh-genui']){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','https://api.npmjs.org/downloads/point/last-month/'+p]);
  let j=null; try{j=JSON.parse(h);}catch(e){}
  console.log(p.padEnd(34)+(j&&j.downloads!==undefined?('月下载='+j.downloads):'未找到'));
  await new Promise(r=>setTimeout(r,700));
}
console.log('DONE');