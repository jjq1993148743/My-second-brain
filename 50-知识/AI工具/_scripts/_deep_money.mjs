import { execFile } from 'node:child_process';
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const run=(a)=>new Promise(res=>execFile('curl',a,{maxBuffer:48*1024*1024,windowsHide:true,timeout:40000},(e,so)=>res(so||'')));
const curl=u=>run(['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept-Language: zh-CN,zh;q=0.9','--max-time','25','--compressed',u]);
const clean=s=>s.replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
// 1. 什么值得买 - 看羊毛线报有没有具体金额
const h1=await curl('https://www.smzdm.com/');
const t1=clean(h1.replace(/<script[\s\S]*?<\/script>/gi,' '));
console.log('=== 什么值得买');
const money1=[...new Set((t1.match(/[\u00a5\uffe5]\s?[0-9][0-9,.]*|\d+\s*元/g)||[]))].slice(0,25);
console.log('价格样本: '+JSON.stringify(money1));
await new Promise(r=>setTimeout(r,3000));
// 2. 站长之家 - 联盟
const h2=await curl('https://www.chinaz.com/');
const t2=clean(h2.replace(/<script[\s\S]*?<\/script>/gi,' '));
const money2=[...new Set((t2.match(/[\u00a5\uffe5]\s?[0-9][0-9,.]*|\d+\s*元/g)||[]))].slice(0,20);
console.log('=== 站长之家 价格样本: '+JSON.stringify(money2));
await new Promise(r=>setTimeout(r,3000));
// 3. 搜狗微信搜真实价目
const qs=['手机卡 开卡 返现 多少钱','信用卡 拉新 返佣 价格','地推 接单 价格表','CPA 联盟 单价'];
for(const q of qs){
  const h=await curl('https://weixin.sogou.com/weixin?type=2&query='+encodeURIComponent(q));
  const body=clean(h.replace(/<script[\s\S]*?<\/script>/gi,' '));
  const i=body.indexOf('以下内容来自微信公众平台');
  const c=i>0?body.slice(i,i+700):body.slice(0,500);
  console.log('=== 搜狗:'+q);
  console.log(c.slice(0,500));
  console.log('');
  await new Promise(r=>setTimeout(r,5000));
}
console.log('DONE');