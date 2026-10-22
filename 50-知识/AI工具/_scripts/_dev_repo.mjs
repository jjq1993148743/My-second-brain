import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:28000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
// 看头部插件的仓库规模和结构
const repos=['shanliuling/dsh-image-gen','PerryLink/dsh-image-gen','NevoDavid/dsh-postiz'];
for(const r of repos){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','https://github.com/'+r]);
  if(h.length<5000){ console.log(r+' -> 404/empty ('+h.length+'b)'); await new Promise(x=>setTimeout(x,800)); continue; }
  // 找语言和文件数
  const lang=(h.match(/"programmingLanguage":"([^"]+)"/)||[])[1]||'?';
  const files=(h.match(/([0-9,]+)\s*Files?/i)||[])[1]||'?';
  const commits=(h.match(/([0-9,]+)\s*Commits?/i)||[])[1]||'?';
  const stars=(h.match(/"stargazerCount":\s*([0-9]+)/)||[])[1]||'?';
  const desc=(h.match(/<meta name="description" content="([^"]{0,100})"/)||[])[1]||'';
  console.log(r.padEnd(35)+'★'+String(stars).padEnd(6)+'语言='+String(lang).padEnd(12)+'描述: '+desc.slice(0,50));
  await new Promise(x=>setTimeout(x,1200));
}
console.log('DONE');