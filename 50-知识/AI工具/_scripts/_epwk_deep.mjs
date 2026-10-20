import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','--compressed',u]);
for(const p of [8,9,10,11,12,15,20,30]){
  const h=await curl('https://www.epwk.com/task/?page='+p);
  const isLogin=/<title>\u767b\u5f55|<title>Login/i.test(h);
  const tasks=(h.match(/class="itemblock"/g)||[]).length;
  console.log('page'+p+' '+Math.round(h.length/1000)+'k tasks='+tasks+(isLogin?' LOGIN_PAGE':''));
  await new Promise(r=>setTimeout(r,1600));
}