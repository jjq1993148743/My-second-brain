// _c_websearch.mjs —— 中文网页搜索（sogou web / 360），解析标题+URL+摘要
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const PROXY='http://127.0.0.1:7897';
async function curl(url, extra){ try{ const {stdout}=await execFileAsync('curl',['-sL','-x',PROXY,'-H','User-Agent: '+UA,'-H','Accept-Language: zh-CN,zh;q=0.9','--max-time','30','--compressed'].concat(extra||[]).concat([url]),{maxBuffer:64*1024*1024,windowsHide:true}); return stdout||''; }catch(e){ return ''; } }
function strip(h){ return String(h||'').replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&ldquo;|&rdquo;/g,'"').replace(/&hellip;/g,'...').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim(); }
const engine = process.argv[2]; const q = process.argv[3];
const EQ = encodeURIComponent(q);
let html='';
if(engine==='sogou') html = await curl('https://www.sogou.com/web?query='+EQ, ['-H','Referer: https://www.sogou.com/']);
else if(engine==='so360') html = await curl('https://www.so.com/s?q='+EQ);
else if(engine==='so360news') html = await curl('https://news.so.com/ns?q='+EQ);
else if(engine==='sogouwx') html = await curl('https://weixin.sogou.com/weixin?type=2&query='+EQ, ['-H','Referer: https://weixin.sogou.com/']);
console.log('ENGINE='+engine+' LEN='+html.length+' Q='+q);
const items=[];
if(engine==='so360'||engine==='so360news'){
  for(const m of html.matchAll(/<h3[^>]*class="res-title[^"]*"[^>]*>([\s\S]*?)<\/h3>/g)){
    const inner=m[1];
    const a=/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/.exec(inner);
    if(!a) continue;
    items.push({title:strip(a[2]),url:a[1].replace(/&amp;/g,'&'),snip:''});
  }
  // 摘要
  const ds=[...html.matchAll(/<p[^>]*class="res-desc"[^>]*>([\s\S]*?)<\/p>/g)].map(m=>strip(m[1]));
  items.forEach((it,i)=>{ if(ds[i]) it.snip = ds[i].slice(0,220); });
}
if(engine==='sogou'){
  for(const m of html.matchAll(/<h3[^>]*>\s*<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)){
    items.push({title:strip(m[2]),url:m[1].replace(/&amp;/g,'&'),snip:''});
  }
}
if(items.length===0){
  // 兜底：输出 h3 附近内容
  const h3s=[...html.matchAll(/<h3[^>]*>([\s\S]{0,600}?)<\/h3>/g)].slice(0,15);
  h3s.forEach(m=>console.log('H3: '+strip(m[1]).slice(0,200)));
}
console.log('COUNT='+items.length);
items.slice(0,20).forEach((it,i)=>console.log('\n['+(i+1)+'] '+it.title+'\n    '+it.url+'\n    '+it.snip));
