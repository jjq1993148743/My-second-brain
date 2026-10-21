// _c_bing.mjs —— Bing 搜索，输出 标题+URL+摘要（走代理 curl）
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const PROXY='http://127.0.0.1:7897';
async function curl(url){ try{ const {stdout}=await execFileAsync('curl',['-sL','-x',PROXY,'-H','User-Agent: '+UA,'-H','Accept-Language: zh-CN,zh;q=0.9','--max-time','30','--compressed',url],{maxBuffer:64*1024*1024,windowsHide:true}); return stdout||''; }catch(e){ return ''; } }
function strip(h){ return String(h||'').replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&ldquo;|&rdquo;/g,'"').replace(/&hellip;/g,'...').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim(); }
const q = process.argv[2];
const html = await curl('https://www.bing.com/search?q='+encodeURIComponent(q)+'&setlang=zh-CN&cc=CN&count=20');
console.log('LEN='+html.length);
const items = [];
const blocks = html.split('<li class="b_algo"').slice(1);
for(const b of blocks){
  const am = /<h2[^>]*>\s*<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/.exec(b);
  if(!am) continue;
  const url = am[1]; const title = strip(am[2]);
  const pm = /<p[^>]*>([\s\S]*?)<\/p>/.exec(b);
  const snip = pm? strip(pm[1]) : '';
  items.push({title,url,snip:snip.slice(0,220)});
}
console.log('COUNT='+items.length);
for(const it of items){ console.log('\n- '+it.title+'\n  '+it.url+'\n  '+it.snip); }
