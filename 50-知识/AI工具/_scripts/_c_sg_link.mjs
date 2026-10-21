// _c_sg_link.mjs —— 解析搜狗微信 /link?url= 跳转到真实 mp.weixin.qq.com 链接
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const PROXY='http://127.0.0.1:7897';
async function curl(args){ try{ const {stdout}=await execFileAsync('curl',['-sL','-x',PROXY,'-H','User-Agent: '+UA,'-H','Accept-Language: zh-CN,zh;q=0.9','--max-time','30','--compressed'].concat(args),{maxBuffer:64*1024*1024,windowsHide:true}); return stdout||''; }catch(e){ return ''; } }
const link = process.argv[2];
if(!link){ console.error('need link'); process.exit(1); }
const url = link.startsWith('http') ? link : 'https://weixin.sogou.com'+link;
const html = await curl(['-H','Referer: https://weixin.sogou.com/', url]);
console.log('LEN='+html.length);
console.log('--- head ---');
console.log(html.slice(0,1200));
const m = /url \+= '([^']+)'/g; let mm; const parts=[];
while((mm=m.exec(html))) parts.push(mm[1]);
if(parts.length) console.log('\nRECONSTRUCTED: '+ parts.join('').replace(/@/g,''));
const d = /(https?:\/\/mp\.weixin\.qq\.com\/[^"'\s]+)/.exec(html);
if(d) console.log('\nDIRECT: '+d[1]);
