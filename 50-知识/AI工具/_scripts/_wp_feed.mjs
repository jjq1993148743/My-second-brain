import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','--compressed',u]);
const h=await curl('https://jobs.wordpress.net/feed/');
fs.writeFileSync('_wpjobs_feed.xml',h,'utf8');
const items=[...h.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m=>m[1]);
console.log('ITEMS='+items.length);
const out=[];
for(const it of items){
  const t=(it.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)||it.match(/<title>([^<]*)<\/title>/)||[])[1]||'';
  const l=(it.match(/<link>([^<]*)<\/link>/)||[])[1]||'';
  const d=(it.match(/<pubDate>([^<]*)<\/pubDate>/)||[])[1]||'';
  const desc=(it.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)||[])[1]||'';
  out.push({title:t.trim(), link:l.trim(), pubDate:d.trim(), desc:desc.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,300).trim()});
}
fs.writeFileSync('_wpjobs_feed.json',JSON.stringify(out,null,1),'utf8');
console.log('PARSED='+out.length);
for(const o of out.slice(0,8)) console.log('  ['+o.pubDate.slice(0,16)+'] '+o.title.slice(0,55));
// 检查是否有分页参数
const pm=[...new Set([...h.matchAll(/[?&](paged|page)=\d+/g)].map(m=>m[0]))];
console.log('PAGER: '+JSON.stringify(pm));