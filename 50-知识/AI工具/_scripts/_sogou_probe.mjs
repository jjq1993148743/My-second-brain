import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:40000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept-Language: zh-CN,zh;q=0.9','--max-time','25','--compressed',u]);
const h=await curl('https://weixin.sogou.com/weixin?type=2&query='+encodeURIComponent('简历优化 真实收入'));
fs.writeFileSync('_sogou_raw.html',h,'utf8');
console.log('bytes='+h.length);
// 看标题在哪
const m1=[...h.matchAll(/<a[^>]*uigs="article_title"[^>]*>([\s\S]{0,200}?)<\/a>/gi)].map(m=>m[1].replace(/<[^>]+>/g,'').trim()).filter(Boolean);
const m2=[...h.matchAll(/<title>([\s\S]{0,200}?)<\/title>/gi)].map(m=>m[1].trim());
const m3=[...h.matchAll(/class="txt-box"[\s\S]{0,500}?<h3>([\s\S]{0,200}?)<\/h3>/gi)].map(m=>m[1].replace(/<[^>]+>/g,'').trim());
// 是否要求验证码
const captcha=/antispider|验证码|seccodeImage|请输入/i.test(h);
console.log('article_title='+m1.length+' titles='+JSON.stringify(m2)+' h3='+m3.length+' captcha='+captcha);
console.log('sample text: '+h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,400));
