import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22','--compressed',u]);
const sm=await curl('https://cryptojobslist.com/sitemap-jobs.xml');
fs.writeFileSync('_cjl_sitemap.xml',sm,'utf8');
const urls=[...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
console.log('SITEMAP_URLS='+urls.length);
const feed=await curl('https://cryptojobslist.com/feed');
fs.writeFileSync('_cjl_feed.xml',feed,'utf8');
const items=[...feed.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m=>m[1]);
console.log('FEED_ITEMS='+items.length);
const out=[];
for(const it of items){
  const t=(it.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)||it.match(/<title>([^<]*)</)||[])[1]||'';
  const l=(it.match(/<link>([^<]*)</)||[])[1]||'';
  const d=(it.match(/<pubDate>([^<]*)</)||[])[1]||'';
  const desc=(it.match(/<description><!\[CDATA\[([\s\S]*?)\]\]></)||[])[1]||'';
  const sal=(desc.match(/\$[0-9]{2,3}[,k][0-9]{0,3}/)||[])[0]||'';
  out.push({title:t.trim().slice(0,120), link:l.trim(), pubDate:d.trim(), salary:sal});
}
fs.writeFileSync('_cjl_feed.json',JSON.stringify(out,null,1),'utf8');
console.log('PARSED='+out.length+' withSalary='+out.filter(x=>x.salary).length);
for(const o of out.slice(0,8)) console.log('  ['+o.salary+'] '+o.title.slice(0,55));