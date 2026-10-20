import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curlJ=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/json','--max-time','22','--compressed',u]);
// 用 GitHub API 搜索包含 greenhouse 公司列表的仓库
const q=encodeURIComponent('greenhouse job board companies');
const h=await curlJ('https://api.github.com/search/code?q='+q+'&per_page=5');
let j=null; try{j=JSON.parse(h);}catch(e){}
console.log('github code search: '+(j?'json':'no')+' items='+(j&&j.items?j.items.length:0));
if(j&&j.message) console.log('  msg: '+j.message);
// 改用 repo 搜索
const h2=await curlJ('https://api.github.com/search/repositories?q=greenhouse+jobs&sort=stars&per_page=5');
let j2=null; try{j2=JSON.parse(h2);}catch(e){}
console.log('github repo search: items='+(j2&&j2.items?j2.items.length:0));
if(j2&&j2.items) j2.items.forEach(r=>console.log('  '+r.full_name+' stars='+r.stargazers_count+' | '+(r.description||'').slice(0,60)));