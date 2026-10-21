// _c_pinggu2.mjs —— 人大经济论坛搜索（GBK 解码）
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
const execFileAsync = promisify(execFile);
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const PROXY='http://127.0.0.1:7897';
async function curlTo(url, out){
  try{ await execFileAsync('curl',['-sL','-x',PROXY,'-H','User-Agent: '+UA,'-H','Accept-Language: zh-CN,zh;q=0.9','--max-time','30','--compressed','-o',out,url],{maxBuffer:16*1024*1024,windowsHide:true}); return true; }catch(e){ return false; }
}
function decode(buf){
  let s = new TextDecoder('utf-8',{fatal:false}).decode(buf);
  // 若 utf8 解码出现大量替换符，改用 gbk
  const bad = (s.match(/\uFFFD/g)||[]).length;
  if(bad > 20){ try{ s = new TextDecoder('gbk').decode(buf); }catch(e){} }
  return s;
}
function strip(h){ return String(h||'').replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&ldquo;|&rdquo;/g,'"').replace(/\s+/g,' ').trim(); }
const q = process.argv[2];
const tmp='_pg_tmp.html';
for(const [name,url] of [
  ['search', 'http://bbs.pinggu.org/search.php?mod=forum&srchtxt='+encodeURIComponent(q)+'&searchsubmit=yes'],
  ['google', 'http://bbs.pinggu.org/search.php?mod=forum&srchtxt='+encodeURIComponent(q)],
]){
  const ok = await curlTo(url, tmp);
  if(!ok){ console.log(name+' FETCH_FAIL'); continue; }
  const html = decode(fs.readFileSync(tmp));
  console.log('\n### '+name+' len='+html.length+' title='+(/<title>([\s\S]*?)<\/title>/.exec(html)||['',''])[1]);
  const body = strip(html);
  console.log(body.slice(0,1200));
  await new Promise(r=>setTimeout(r, 5000));
}
