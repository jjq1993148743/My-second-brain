import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:16*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
for(const p of ['dsh-cost-advisor','dsh-save-money']){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','15','-w','\nCODE=%{http_code}','https://registry.npmjs.org/'+p]);
  const code=(h.match(/CODE=(\d+)$/)||[])[1]||'?';
  const body=h.replace(/\nCODE=\d+$/,'');
  let j=null; try{j=JSON.parse(body);}catch(e){}
  if(code==='404'||(j&&j.error==='Not found')) console.log(p+'  ✅ 可用');
  else if(j&&j.name) console.log(p+'  ❌ 已被占用（作者: '+JSON.stringify((j.maintainers||[]).map(m=>m.name))+'）');
  else console.log(p+'  ? code='+code);
  await new Promise(r=>setTimeout(r,600));
}
console.log('DONE');