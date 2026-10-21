// _c_sg_sweep.mjs —— 搜狗微信批量检索（串行，长间隔，结果落盘）
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
const execFileAsync = promisify(execFile);
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const PROXY='http://127.0.0.1:7897';
async function curl(url){ try{ const {stdout}=await execFileAsync('curl',['-sL','-x',PROXY,'-H','User-Agent: '+UA,'-H','Accept-Language: zh-CN,zh;q=0.9','-H','Referer: https://weixin.sogou.com/','--max-time','30','--compressed',url],{maxBuffer:64*1024*1024,windowsHide:true}); return stdout||''; }catch(e){ return ''; } }
function strip(h){ return String(h||'').replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&ldquo;|&rdquo;/g,'"').replace(/&hellip;/g,'...').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim(); }
const QUERIES = JSON.parse(process.argv[2]);
const OUT = process.argv[3] || '_c_sg_sweep.json';
const results = [];
for(const q of QUERIES){
  const url='https://weixin.sogou.com/weixin?type=2&query='+encodeURIComponent(q)+'&page=1';
  const h = await curl(url);
  const items=[];
  if(h.length<3000){ console.log('BLOCK/EMPTY: '+q+' len='+h.length); results.push({q,blocked:true,items:[]}); }
  else{
    const blocks = h.split('<div class="txt-box">').slice(1);
    for(const b of blocks){
      const tm = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]{4,400}?)<\/a>/.exec(b);
      if(!tm) continue;
      const title = strip(tm[2]);
      const sm = /<p class="txt-info"[^>]*>([\s\S]*?)<\/p>/.exec(b);
      const snippet = sm? strip(sm[1]) : '';
      const am = /<span class="all-time-y2">([\s\S]{1,40}?)<\/span>/.exec(b);
      const account = am? strip(am[1]) : '';
      const dm = /timeConvert\('(\d+)'\)/.exec(b);
      const date = dm? new Date(parseInt(dm[1],10)*1000).toISOString().slice(0,10) : '';
      if(title.length>3) items.push({title,account,date,snippet:snippet.slice(0,300)});
    }
    results.push({q,items});
    console.log('OK '+q+' -> '+items.length);
  }
  await new Promise(r=>setTimeout(r, 8000+Math.random()*4000));
}
fs.writeFileSync(OUT, JSON.stringify(results,null,1),'utf8');
console.log('WROTE '+OUT+' queries='+results.length+' items='+results.reduce((s,r)=>s+r.items.length,0));
