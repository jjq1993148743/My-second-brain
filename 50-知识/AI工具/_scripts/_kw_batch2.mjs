import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:48*1024*1024,windowsHide:true,timeout:40000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept-Language: zh-CN,zh;q=0.9','--max-time','25','--compressed',u]);
const clean=s=>s.replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&ldquo;/g,'"').replace(/&rdquo;/g,'"').replace(/&hellip;/g,'...').replace(/\s+/g,' ').trim();
const kws=JSON.parse(fs.readFileSync('_KW_BATCH2.json','utf8'));
const out=[];
for(const k of kws){
  let body='';
  try{
    const h=await curl('https://weixin.sogou.com/weixin?type=2&query='+encodeURIComponent(k.q));
    const t=clean(h.replace(/<script[\s\S]*?<\/script>/gi,' '));
    const i=t.indexOf('以下内容来自微信公众平台');
    body = i>0 ? t.slice(i+12, i+1400) : t.slice(0,900);
  }catch(e){ body='ERR'; }
  const money=[...new Set((body.match(/[\u00a5\uffe5]\s?[0-9][0-9,.]*|\d+\s*元|\d+\s*块|\$\s?[0-9.]+|\d+\s*美元|\d+\s*万/g)||[]))].slice(0,10);
  const names=[...new Set((body.match(/[\u4e00-\u9fa5A-Za-z]{2,10}(?:平台|联盟|网|社|赚|帮|客|盒|店|馆)/g)||[]))].slice(0,8);
  out.push({track:k.track,q:k.q,body:body.slice(0,900),money,names});
  console.log('['+k.track+'] '+k.q+' 价='+JSON.stringify(money.slice(0,5))+' 名='+JSON.stringify(names.slice(0,3)));
  await new Promise(r=>setTimeout(r,4500));
}
fs.writeFileSync('_KW_RESULT2.json',JSON.stringify(out,null,1),'utf8');
console.log('DONE total='+out.length);