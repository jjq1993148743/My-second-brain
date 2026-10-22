import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:16*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const pkgs=['dsh-sales-script','dsh-hr-toolkit','dsh-legal-toolkit','dsh-teacher-toolkit','dsh-finance-toolkit','dsh-ops-toolkit'];
console.log('=== npm 包名占用检查 ===');
for(const p of pkgs){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','15','-w','\nCODE=%{http_code}','https://registry.npmjs.org/'+p]);
  const code=(h.match(/CODE=(\d+)$/)||[])[1]||'?';
  const body=h.replace(/\nCODE=\d+$/,'');
  let j=null; try{j=JSON.parse(body);}catch(e){}
  if(code==='404'||(j&&j.error==='Not found')){
    console.log(p.padEnd(24)+'✅ 未被占用（可以发布）');
  } else if(j&&j.name){
    const latest=j['dist-tags']&&j['dist-tags'].latest;
    console.log(p.padEnd(24)+'❌ 已被占用 | 最新版='+latest+' | 作者='+JSON.stringify((j.maintainers||[]).map(m=>m.name))+' | 描述='+String(j.description||'').slice(0,40));
  } else {
    console.log(p.padEnd(24)+'? code='+code+' 需人工确认');
  }
  await new Promise(r=>setTimeout(r,600));
}
console.log('DONE');