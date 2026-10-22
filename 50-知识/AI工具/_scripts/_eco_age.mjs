import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:16*1024*1024,windowsHide:true,timeout:28000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
// 用 GitHub HTML 找 "Created" / 首个 commit 时间
const repos=['deepseek-ai/deepseek-harness','shanliuling/dsh-image-gen','LivXue/dsh-plugin-shop','dsh-market/dsh-market'];
for(const r of repos){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','https://github.com/'+r]);
  if(h.length<5000){ console.log(r+' -> 无此仓库('+h.length+'b)'); await new Promise(x=>setTimeout(x,900)); continue; }
  const created=(h.match(/"createdAt":"([0-9-]{10})/)||[])[1]||(h.match(/Created\s*<[^>]*>\s*([A-Z][a-z]{2} \d+, \d{4})/)||[])[1]||'?';
  const pushed=(h.match(/"pushedAt":"([0-9-]{10})/)||[])[1]||'?';
  const stars=(h.match(/"stargazerCount":\s*([0-9]+)/)||[])[1]||'?';
  const commits=(h.match(/"totalCount":\s*([0-9]+)/)||[])[1]||'?';
  console.log(r.padEnd(34)+'★'+String(stars).padEnd(8)+'创建='+String(created).padEnd(12)+'最后push='+String(pushed).padEnd(12)+'commits~'+commits);
  await new Promise(x=>setTimeout(x,1200));
}
console.log('DONE');