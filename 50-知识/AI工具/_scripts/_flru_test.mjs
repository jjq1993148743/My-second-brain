import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','--compressed',u]);
const urls=['https://www.fl.ru/projects/?page=2','https://www.fl.ru/projects/2/','https://www.fl.ru/projects/?kind=1&page=2'];
for(const u of urls){
  const h=await curl(u);
  const m=h.match(/(\d+)\s*проект/i);
  const items=(h.match(/project-item|projects-list__item/g)||[]).length;
  console.log(u+' -> '+h.length+'b items='+items);
  await new Promise(r=>setTimeout(r,1500));
}