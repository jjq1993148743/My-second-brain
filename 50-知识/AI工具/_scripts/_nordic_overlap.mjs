import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:20000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','--compressed',u]);

// 对比 .no 和 .se 的项目 URL 是否相同
const no=await curl('https://www.freelancer.no/jobs/1/');
const se=await curl('https://www.freelancer.se/jobs/1/');
const noUrls=[...new Set([...no.matchAll(/href="(\/projects\/[^"]+)"/g)].map(m=>m[1]))].slice(0,50);
const seUrls=new Set([...se.matchAll(/href="(\/projects\/[^"]+)"/g)].map(m=>m[1]));
const overlap=noUrls.filter(u=>seUrls.has(u)).length;
console.log('noUrls='+noUrls.length+' overlap='+overlap+' ('+Math.round(overlap/Math.max(noUrls.length,1)*100)+'%)');

// 也对比 .no 与 freelancer.com
const com=await curl('https://www.freelancer.com/jobs/1/');
const comUrls=new Set([...com.matchAll(/href="(\/projects\/[^"]+)"/g)].map(m=>m[1]));
const overlapCom=noUrls.filter(u=>comUrls.has(u)).length;
console.log('vs .com overlap='+overlapCom+' ('+Math.round(overlapCom/Math.max(noUrls.length,1)*100)+'%)');