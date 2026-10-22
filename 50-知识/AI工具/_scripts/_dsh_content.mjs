import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const sites=[["dsh.market","https://dsh.market/"],["deepseek1024","https://deepseek1024.com"],["dsh-hub","https://dsh-hub.cc"],["dsh-plugin.org","https://dsh-plugin.org"],["dshopen","https://dshopen.org/"],["dshopen-index","https://dshopen.org/index.json"],["dsh-plugin-market","https://dsh-plugin-market.vercel.app"],["dshplugin.store","https://www.dshplugin.store"],["deepseek.stream","https://deepseek.stream"],["dshmarket.com","https://dshmarket.com"],["dshmarketplace.dev","https://dshmarketplace.dev"]];
const clean=s=>s.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
const out=[];
for(const [n,u] of sites){
  let body='';
  try{ body=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22',u]); }catch(e){}
  const title=(body.match(/<title[^>]*>([\s\S]{0,120}?)<\/title>/i)||[])[1]||'';
  const text=clean(body);
  const pm=(text.match(/plugin|插件|bundle/gi)||[]).length;
  out.push({n,u,bytes:body.length,title:title.trim().slice(0,60),pm,head:text.slice(0,300)});
  console.log('=== '+n+' bytes='+body.length+' plugin词='+pm);
  console.log('  title: '+title.trim().slice(0,60));
  console.log('  text: '+text.slice(0,220));
  await new Promise(r=>setTimeout(r,700));
}
fs.writeFileSync('_dsh_content.json',JSON.stringify(out,null,1),'utf8');
console.log('DONE');