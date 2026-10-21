// _c_pinggu_search.mjs —— 人大经济论坛搜索（Discuz，需先取 formhash）
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const PROXY='http://127.0.0.1:7897';
async function curl(url, extra){ try{ const {stdout}=await execFileAsync('curl',['-sL','-x',PROXY,'-H','User-Agent: '+UA,'-H','Accept-Language: zh-CN,zh;q=0.9','-H','Accept: text/html,*/*','--max-time','30','--compressed'].concat(extra||[]).concat([url]),{maxBuffer:64*1024*1024,windowsHide:true}); return stdout||''; }catch(e){ return ''; } }
function strip(h){ return String(h||'').replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&ldquo;|&rdquo;/g,'"').replace(/\s+/g,' ').trim(); }

const q = process.argv[2];
const home = await curl('http://bbs.pinggu.org/');
console.log('HOME len='+home.length);
console.log('TITLE: ' + (/<title>([\s\S]*?)<\/title>/.exec(home)||['',''])[1]);
const fh = /formhash=([a-f0-9]{8})/.exec(home);
console.log('FORMHASH: ' + (fh? fh[1]:'none'));
// Discuz search需要登录，试试搜索页
const s1 = await curl('http://bbs.pinggu.org/search.php?mod=forum&srchtxt='+encodeURIComponent(q)+'&searchsubmit=yes');
console.log('SEARCH1 len='+s1.length+' title='+(/<title>([\s\S]*?)<\/title>/.exec(s1)||['',''])[1]);
const body = strip(s1);
console.log(body.slice(0,1500));
