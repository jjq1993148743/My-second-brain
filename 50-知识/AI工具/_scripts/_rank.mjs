import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:28000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
for(const [n,u] of [['awesome-dsh-plugin','https://awesome-dsh-plugin.com'],['dshmarket','https://dshmarket.com'],['dshopen','https://dshopen.org/']]){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','24',u]);
  fs.writeFileSync('_rank_'+n+'.html',h,'utf8');
  const clean=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
  console.log('=== '+n+' ('+Math.round(h.length/1000)+'k)');
  // 找榜单名 + 安装量数字
  const boards=[...new Set((clean.match(/(Top|Newest|Featured|Trending|Popular|热门|最新|精选|飙升|必装)[^ ]{0,12}/g)||[]))].slice(0,12);
  const nums=[...new Set((clean.match(/[0-9,]+\s*(?:installs?|downloads?|安装|下载)/gi)||[]))].slice(0,10);
  console.log('  榜单词: '+JSON.stringify(boards));
  console.log('  安装量样本: '+JSON.stringify(nums));
  console.log('  摘要: '+clean.slice(0,250));
  await new Promise(r=>setTimeout(r,900));
}
console.log('DONE');