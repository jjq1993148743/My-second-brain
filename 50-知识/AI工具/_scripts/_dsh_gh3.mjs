import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:28000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const repos=['imsai-sh/awesome-deepseek-harness-plugins','beancookie/awesome-dsh-plugin','dshworks/awesome-dsh-plugins','dsh-market/dsh-market','DshMarketPlace/dshmarketplace','QT7-C23/DSH-Marketplace','LivXue/dsh-plugin-shop'];
for(const r of repos){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','https://github.com/'+r]);
  // 多种模式提取星数
  let st=(h.match(/"stargazerCount":\s*([0-9]+)/)||[])[1];
  if(!st) st=(h.match(/id="repo-stars-counter-star"[^>]*title="([0-9,]+)"/)||[])[1];
  if(!st) st=(h.match(/([0-9,]{3,})\s*<\/span>\s*<\/a>\s*<a[^>]*forks/i)||[])[1];
  let fk=(h.match(/"forkCount":\s*([0-9]+)/)||[])[1]||(h.match(/id="repo-network-counter"[^>]*title="([0-9,]+)"/)||[])[1];
  const desc=(h.match(/<meta name="description" content="([^"]{0,120})"/)||[])[1]||'';
  console.log(r.padEnd(45)+'★'+String(st||'?').padEnd(8)+'fork '+String(fk||'?').padEnd(6)+'| '+desc.replace(/&quot;/g,'"').slice(0,55));
  await new Promise(x=>setTimeout(x,1500));
}
console.log('DONE');