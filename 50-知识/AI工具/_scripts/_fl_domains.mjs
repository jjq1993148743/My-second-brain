import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','--compressed',u]);
const getUrls=h=>new Set([...h.matchAll(/href="(\/projects\/[^"]+)"/g)].map(m=>m[1]));
const base=await curl('https://www.freelancer.com/jobs/1/');
const B=getUrls(base);
console.log('baseline .com urls='+B.size);
const tests=['br','ar','cl','co','pe','fr','it','pt','ru','jp','kr','cn','tw','hk','sg','my','id','th','vn','ph','tr','pl','cz','hu','ro','gr','il','ae','sa','eg','za','ng','ke'];
const results=[];
for(const t of tests){
  const h=await curl('https://www.freelancer.'+t+'/jobs/1/');
  const U=getUrls(h);
  if(U.size===0){ results.push({t, status:'empty', size:0, overlap:null}); }
  else{
    const arr=[...U];
    const ov=arr.filter(u=>B.has(u)).length;
    results.push({t, status:'ok', size:U.size, overlap:Math.round(ov/U.size*100)});
  }
  await new Promise(r=>setTimeout(r,1100));
}
const ok=results.filter(r=>r.status==='ok');
console.log('WORKING='+ok.length);
ok.sort((a,b)=>a.overlap-b.overlap).forEach(r=>console.log('  .'+r.t+' urls='+r.size+' overlap='+r.overlap+'%'));
fs.writeFileSync('_fl_domains.json',JSON.stringify(results,null,1),'utf8');