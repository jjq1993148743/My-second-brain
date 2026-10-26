import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:16*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','25','https://guildregister.com/subtopic/Photography']);
// 打印表格区域原始 HTML
const i=h.indexOf('<table');
const j=h.indexOf('</table>');
console.log('table found:', i>0);
if(i>0 && j>i) console.log(h.slice(i, Math.min(i+3000, j)).replace(/\s+/g,' ').slice(0,2500));
console.log('DONE');