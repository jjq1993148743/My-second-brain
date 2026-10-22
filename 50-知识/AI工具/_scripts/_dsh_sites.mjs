import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const sites=[["dsh.market","https://dsh.market/"],["deepseek1024","https://deepseek1024.com"],["dsh-hub","https://dsh-hub.cc"],["dsh-plugin.org","https://dsh-plugin.org"],["dshopen.org","https://dshopen.org/"],["dshopen-index","https://dshopen.org/index.json"],["dsh-plugin-market","https://dsh-plugin-market.vercel.app"],["dshplugin.store","https://www.dshplugin.store"],["deepseek.stream","https://deepseek.stream"],["dshmarket.com","https://dshmarket.com"],["dshmarketplace.dev","https://dshmarketplace.dev"]];
const clean=s=>s.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
for(const [n,u] of sites){
  let raw=''; try{ raw=await run(['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20','--compressed','-w','\n%{http_code}|%{size_download}|%{content_type}',u]); }catch(e){}
  const i=raw.lastIndexOf('\n'); const meta=i>=0?raw.slice(i+1):''; const body=i>=0?raw.slice(0,i):raw;
  const parts=meta.split('|');
  const code=parts[0]; const size=parts[1]; const ct=parts[2];
  const title=(body.match(/<title[^>]*>([\s\S]{0,100}?)<\/title>/i)||[])[1]||'';
  const text=clean(body);
  const pm=(text.match(/plugin|插件|bundle/gi)||[]).length;
  console.log(n.padEnd(20)+String(code||'0').padEnd(5)+String(Math.round((parseInt(size||'0',10)||body.length)/1000)+'k').padEnd(7)+String(ct||'').slice(0,22).padEnd(23)+'p='+String(pm).padEnd(4)+'| '+title.trim().slice(0,38));
  await new Promise(r=>setTimeout(r,700));
}
console.log('DONE');