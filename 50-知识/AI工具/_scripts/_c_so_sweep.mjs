// _c_so_sweep.mjs —— 360搜索批量（串行，长间隔），结果落盘
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
const execFileAsync = promisify(execFile);
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const PROXY='http://127.0.0.1:7897';
async function curl(url){ try{ const {stdout}=await execFileAsync('curl',['-sL','-x',PROXY,'-H','User-Agent: '+UA,'-H','Accept-Language: zh-CN,zh;q=0.9','--max-time','30','--compressed',url],{maxBuffer:64*1024*1024,windowsHide:true}); return stdout||''; }catch(e){ return ''; } }
function strip(h){ return String(h||'').replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&ldquo;|&rdquo;/g,'"').replace(/&hellip;/g,'...').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim(); }
const QUERIES = JSON.parse(process.argv[2]);
const OUT = process.argv[3] || '_c_so_sweep.json';
const out=[];
for(const q of QUERIES){
  const html = await curl('https://www.so.com/s?q='+encodeURIComponent(q));
  const items=[];
  const ds=[...html.matchAll(/<p[^>]*class="res-desc"[^>]*>([\s\S]*?)<\/p>/g)].map(m=>strip(m[1]));
  let i=0;
  for(const m of html.matchAll(/<h3[^>]*class="res-title[^"]*"[^>]*>([\s\S]*?)<\/h3>/g)){
    const a=/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/.exec(m[1]);
    if(!a) continue;
    items.push({title:strip(a[2]),url:a[1].replace(/&amp;/g,'&'),snip:(ds[i]||'').slice(0,260)});
    i++;
  }
  out.push({q, len:html.length, items});
  console.log('OK '+q+' -> '+items.length);
  await new Promise(r=>setTimeout(r, 7000+Math.random()*4000));
}
fs.writeFileSync(OUT, JSON.stringify(out,null,1),'utf8');
console.log('WROTE '+OUT+' total='+out.reduce((s,r)=>s+r.items.length,0));
