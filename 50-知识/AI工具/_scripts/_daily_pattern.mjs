import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:48*1024*1024,windowsHide:true,timeout:40000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept-Language: zh-CN,zh;q=0.9','--max-time','25','--compressed',u]);
const clean=s=>s.replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&mdash;/g,'-').replace(/&middot;/g,'.').replace(/&ldquo;/g,'"').replace(/&rdquo;/g,'"').replace(/\s+/g,' ').trim();
const qs=['DSH插件日报','DSH 插件 推荐 必装','DSH插件 精选'];
for(const q of qs){
  const h=await curl('https://weixin.sogou.com/weixin?type=2&query='+encodeURIComponent(q));
  const body=clean(h.replace(/<script[\s\S]*?<\/script>/gi,' '));
  const i=body.indexOf('以下内容来自微信公众平台');
  const c=i>0?body.slice(i+12,i+1200):body.slice(0,600);
  console.log('=== '+q);
  console.log(c.slice(0,900));
  console.log('');
  await new Promise(r=>setTimeout(r,5000));
}
console.log('DONE');