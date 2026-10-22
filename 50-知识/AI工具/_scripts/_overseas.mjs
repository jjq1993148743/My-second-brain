import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:28000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept-Language: zh-CN,zh;q=0.9','--max-time','25','--compressed',u]);
const clean=s=>s.replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&mdash;/g,'-').replace(/&middot;/g,'.').replace(/&ldquo;/g,'"').replace(/&rdquo;/g,'"').replace(/\s+/g,' ').trim();
// 搜中文关于「VSCode插件赚钱」「Obsidian插件收费」的实战
const qs=['VSCode 插件 赚钱 付费','Obsidian 插件 收费 赚钱','浏览器插件 付费 订阅 赚钱','插件 付费模式 个人开发者'];
for(const q of qs){
  const h=await curl('https://weixin.sogou.com/weixin?type=2&query='+encodeURIComponent(q));
  const body=clean(h.replace(/<script[\s\S]*?<\/script>/gi,' '));
  const i=body.indexOf('以下内容来自微信公众平台');
  const c=i>0?body.slice(i+12,i+1000):body.slice(0,500);
  console.log('=== '+q);
  console.log(c.slice(0,700));
  console.log('');
  await new Promise(r=>setTimeout(r,5000));
}
console.log('DONE');