import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','15','--compressed',u]);
const urls=[
  ['task1','https://task.zbj.com/tasklist/'],
  ['task2','https://task.zbj.com/'],
  ['task3','https://www.zbj.com/tasklist/'],
  ['task4','https://shop.zbj.com/'],
  ['q','https://www.zbj.com/search?kw=app'],
  ['xq','https://xq.zbj.com/']
];
for(const [t,u] of urls){
  const h=await curl(u);
  const yuan=(h.match(/[\uffe5\u00a5]\s?[0-9]|[0-9][0-9,]*\s*\u5143/g)||[]).length;
  const time=(h.match(/(\u5206\u949f|\u5c0f\u65f6|\u5929)\u524d/g)||[]).length;
  const bid=(h.match(/\u6295\u6807|\u62a5\u4ef7|\u4eba\u53c2\u4e0e/g)||[]).length;
  console.log(t.padEnd(8)+Math.round(h.length/1000)+'k yuan='+yuan+' time='+time+' bid='+bid+'  '+u);
  if(yuan>5||time>3){ fs.writeFileSync('_zbj_'+t+'.html',h,'utf8'); console.log('  SAVED'); }
  await new Promise(r=>setTimeout(r,1500));
}