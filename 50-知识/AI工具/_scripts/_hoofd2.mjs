import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','--compressed',u]);
const h=await curl('https://www.hoofdkraan.nl/opdrachten');
const title=(h.match(/<title[^>]*>([^<]{0,100})/i)||[])[1]||'';
console.log('bytes='+h.length+' title='+title);
const items=(h.match(/projectListTitle/g)||[]).length;
console.log('items='+items);
// 找真实的项目链接
const links=[...new Set([...h.matchAll(/href="([^"]*opdracht[^"]*)"/g)].map(m=>m[1]))].slice(0,10);
console.log('LINKS: '+JSON.stringify(links));
// 分页
const pg=[...new Set([...h.matchAll(/href="([^"]*(?:page|pagina)[^"]*)"/g)].map(m=>m[1]))].slice(0,8);
console.log('PAGER: '+JSON.stringify(pg));