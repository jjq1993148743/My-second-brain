import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','--compressed',u]);
const h = await curl('https://www.zbj.com/fw/');
fs.writeFileSync('_zbj_home.html', h, 'utf8');
console.log('bytes='+h.length);

const text=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ');
const lines=text.split('\n').map(s=>s.trim()).filter(s=>s.length>2);
const uniq=[]; for(const l of lines) if(uniq[uniq.length-1]!==l) uniq.push(l);

const money=uniq.filter(l=>/[¥￥]\s?\d/.test(l) || /\d+\s*元/.test(l)).slice(0,10);
const times=uniq.filter(l=>/(分钟|小时|天)前/.test(l)).slice(0,10);
const tasks=uniq.filter(l=>l.length>8 && l.length<80 && /[\u4e00-\u9fa5]/.test(l) && !/^(首页|登录|注册|更多)/.test(l)).slice(0,20);

console.log('MONEY: '+JSON.stringify(money));
console.log('TIMES: '+JSON.stringify(times));
console.log('SAMPLE LINES: '+JSON.stringify(tasks.slice(0,12)));

// 找链接模式
const linkSet = new Set();
const reA = /href="([^"]{5,120})"/g;
let mm;
while((mm=reA.exec(h))!==null && linkSet.size<60){ const u=mm[1]; if(/[a-z]+\/[a-z0-9]{3,}/i.test(u)) linkSet.add(u); }
console.log('LINKS: '+JSON.stringify([...linkSet].slice(0,15)));