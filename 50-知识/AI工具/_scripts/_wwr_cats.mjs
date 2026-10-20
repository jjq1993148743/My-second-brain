import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const cats=['remote-programming-jobs','remote-full-stack-programming-jobs','remote-back-end-programming-jobs','remote-front-end-programming-jobs','remote-devops-sysadmin-jobs','remote-design-jobs','remote-product-jobs','remote-marketing-jobs','remote-customer-support-jobs','remote-sales-and-marketing-jobs','remote-management-and-finance-jobs','remote-all-other-remote-jobs'];
const all=new Set(); const pages={};
for(const c of cats){
  const h=await curl('https://weworkremotely.com/categories/'+c);
  const links=[...new Set([...h.matchAll(/href="(https:\/\/weworkremotely\.com\/remote-jobs\/[a-z0-9\-]+)"/gi)].map(m=>m[1]))];
  pages[c]=links.length;
  links.forEach(l=>all.add(l));
  console.log(c.padEnd(40)+Math.round(h.length/1000)+'k links='+links.length+' total='+all.size);
  await sleep(1800);
}
fs.writeFileSync('_wwr_links.json',JSON.stringify([...all],null,1),'utf8');
console.log('UNIQUE_TOTAL='+all.size);