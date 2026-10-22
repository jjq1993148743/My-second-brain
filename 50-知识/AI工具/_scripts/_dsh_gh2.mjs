import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:16*1024*1024,windowsHide:true,timeout:28000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
// 1. GitHub 仓库页（HTML，绕开 API 限流）
const repos=['imsai-sh/awesome-deepseek-harness-plugins','beancookie/awesome-dsh-plugin','dshworks/awesome-dsh-plugins','dsh-market/dsh-market','DshMarketPlace/dshmarketplace','QT7-C23/DSH-Marketplace','LivXue/dsh-plugin-shop'];
for(const r of repos){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','https://github.com/'+r]);
  const stars=(h.match(/([0-9,.]+k?)\s*stars/i)||[])[1]||(h.match(/id="repo-stars-counter-star"[^>]*title="([^"]+)"/)||[])[1]||'?';
  const forks=(h.match(/id="repo-network-counter"[^>]*title="([^"]+)"/)||[])[1]||'?';
  const desc=(h.match(/<meta name="description" content="([^"]{0,150})"/)||[])[1]||'';
  const ok = h.length>10000 && !/Page not found/i.test(h);
  console.log(r.padEnd(45)+'bytes='+String(h.length).padEnd(8)+'★'+String(stars).padEnd(8)+'fork='+String(forks).padEnd(7)+(ok?'OK':'404?')+' | '+desc.slice(0,60));
  await new Promise(x=>setTimeout(x,1500));
}
console.log('DONE');