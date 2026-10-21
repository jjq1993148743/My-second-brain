// _c_sogou2.mjs —— 搜狗微信检索（增强版：账号/日期/真实链接/摘要全抓）
// 用法: node _c_sogou2.mjs "查询词" [页数]
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const PROXY = 'http://127.0.0.1:7897';

async function curl(url, extra) {
  const args = ['-sL','-x',PROXY,'-H','User-Agent: '+UA,'-H','Accept-Language: zh-CN,zh;q=0.9','-H','Accept: text/html,*/*','--max-time','30','--compressed'].concat(extra||[]).concat([url]);
  try { const { stdout } = await execFileAsync('curl', args, { maxBuffer: 64*1024*1024, windowsHide: true }); return stdout||''; }
  catch(e){ return ''; }
}
function strip(h){ return String(h||'').replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&ldquo;|&rdquo;/g,'"').replace(/&hellip;/g,'...').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim(); }

const q = process.argv[2];
const pages = parseInt(process.argv[3]||'1',10);
if(!q){ console.error('need query'); process.exit(1); }
const all=[];
for(let p=1;p<=pages;p++){
  const url='https://weixin.sogou.com/weixin?type=2&query='+encodeURIComponent(q)+'&page='+p;
  const h = await curl(url, ['-H','Referer: https://weixin.sogou.com/']);
  if(h.length<3000){ console.error('EMPTY/BLOCK p'+p+' len='+h.length); break; }
  const blocks = h.split('<div class="txt-box">').slice(1);
  for(const b of blocks){
    const tm = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]{4,400}?)<\/a>/.exec(b);
    if(!tm) continue;
    const title = strip(tm[2]);
    const link = tm[1].replace(/&amp;/g,'&');
    const sm = /<p class="txt-info"[^>]*>([\s\S]*?)<\/p>/.exec(b);
    const snippet = sm? strip(sm[1]) : '';
    const am = /<span class="all-time-y2">([\s\S]{1,40}?)<\/span>/.exec(b) || /class="account"[^>]*>([\s\S]{1,40}?)<\/a>/.exec(b);
    const account = am? strip(am[1]) : '';
    const dm = /timeConvert\('(\d+)'\)/.exec(b);
    const date = dm? new Date(parseInt(dm[1],10)*1000).toISOString().slice(0,10) : '';
    if(title.length>3) all.push({title,account,date,link,snippet:snippet.slice(0,260)});
  }
  await new Promise(r=>setTimeout(r, 4000+Math.random()*3000));
}
console.log(JSON.stringify({query:q,total:all.length,items:all},null,1));
