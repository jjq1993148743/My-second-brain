// _c_v2ex_topic.mjs —— 抓 V2EX 主题原文 + 回复（串行，间隔随机）
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const PROXY='http://127.0.0.1:7897';
async function curl(url){ try{ const {stdout}=await execFileAsync('curl',['-sL','-x',PROXY,'-H','User-Agent: '+UA,'-H','Accept-Language: zh-CN,zh;q=0.9','--max-time','30','--compressed',url],{maxBuffer:64*1024*1024,windowsHide:true}); return stdout||''; }catch(e){ return ''; } }
function strip(h){ return String(h||'').replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<br\s*\/?>/gi,'\n').replace(/<\/p>/gi,'\n').replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&ldquo;|&rdquo;/g,'"').replace(/&hellip;/g,'...').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'").replace(/\n{3,}/g,'\n\n').trim(); }
const ids = process.argv.slice(2);
for(const id of ids){
  const url='https://www.v2ex.com/t/'+id;
  const h = await curl(url);
  const tm = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(h);
  const title = tm? strip(tm[1]) : '';
  const cm = /<div class="topic_content">([\s\S]*?)<\/div>\s*<div class="topic_buttons">/.exec(h) || /<div class="topic_content">([\s\S]*?)<\/div>/.exec(h);
  const body = cm? strip(cm[1]) : '';
  const rm = [...h.matchAll(/<div class="reply_content">([\s\S]*?)<\/div>/g)].map(m=>strip(m[1]));
  const meta = /<small class="gray">([\s\S]*?)<\/small>/.exec(h);
  console.log('\n\n########## V2EX t/'+id+' ##########');
  console.log('TITLE: '+title);
  console.log('META: '+strip(meta?meta[1]:'').slice(0,120));
  console.log('URL: '+url);
  console.log('BODY:\n'+body.slice(0,3000));
  console.log('-- 回复(' + rm.length + ') --');
  rm.slice(0,25).forEach((r,i)=>console.log('['+(i+1)+'] '+r.slice(0,400)));
  await new Promise(r=>setTimeout(r, 4000+Math.random()*3000));
}
