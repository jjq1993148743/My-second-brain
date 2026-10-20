import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','--compressed',u]);
const ids=["1160885","1160189","1160915"];
for(const id of ids){
  const h=await curl('https://www.epwk.com/task/'+id+'/');
  const text=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ');
  const lines=text.split('\n').map(s=>s.trim()).filter(s=>s.length>2);
  const u=[]; for(const l of lines) if(u[u.length-1]!==l) u.push(l);
  const dates=u.filter(l=>/\d{4}-\d{2}-\d{2}|\d{4}\u5e74\d{1,2}\u6708/.test(l)).slice(0,4);
  const times=u.filter(l=>/(\u5206\u949f|\u5c0f\u65f6|\u5929)\u524d/.test(l)).slice(0,4);
  console.log(id+' bytes='+Math.round(h.length/1000)+'k dates='+JSON.stringify(dates)+' rel='+JSON.stringify(times));
  await new Promise(r=>setTimeout(r,2000));
}