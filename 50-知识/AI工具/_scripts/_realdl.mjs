import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:40000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
// 目标文件的直链（用 Special:FilePath 重定向到原图）
const targets=[
 ['vomit1','File:Cat vomit.jpg'],
 ['vomit2','File:Vomiting cat riding on a tampon by Tough Kitty.jpg'],
 ['sick1','File:Sick cream-colored kitten.jpg'],
 ['sick2','File:Being Sick Stinks ! (4866348966).jpg'],
 ['hairball','File:Gastrointestinal Haiball cat dry food (Royal Canin).jpg'],
];
for(const [n,t] of targets){
  const u='https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(t.replace('File:',''))+'?width=1000';
  const r=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','35','-o','_real_'+n+'.jpg','-w','%{http_code} %{size_download}',u]);
  console.log(n+': '+r);
  await new Promise(r=>setTimeout(r,400));
}
console.log('DONE');