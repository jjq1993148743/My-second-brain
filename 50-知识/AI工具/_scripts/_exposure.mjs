import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:28000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const sites=[
 ['dshmarket','https://dshmarket.com'],
 ['dshmarketplace','https://dshmarketplace.dev'],
 ['awesome-dsh-plugin','https://awesome-dsh-plugin.com'],
 ['dshopen','https://dshopen.org/'],
];
for(const [n,u] of sites){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22',u]);
  const clean=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
  // 找排序/榜单/安装量相关
  const sortWords=[...new Set((clean.match(/热门|最新|推荐|排行|榜|trending|popular|newest|top|installs?|安装量|下载量|downloads?|featured|精选/gi)||[]))].slice(0,15);
  const hasInstalls=/安装量|下载量|installs|downloads/i.test(clean);
  console.log('=== '+n);
  console.log('  排序/榜单词: '+JSON.stringify(sortWords)+' 有安装量显示='+hasInstalls);
  // 找首屏插件名（看排序结果）
  const first=[...new Set((h.match(/\/p\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/g)||[]))].slice(0,6);
  if(first.length) console.log('  详情页样本: '+JSON.stringify(first));
  await new Promise(r=>setTimeout(r,900));
}
console.log('DONE');