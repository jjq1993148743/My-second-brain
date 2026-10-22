import { execFile } from 'node:child_process';
const fs=await import('node:fs');
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:26000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22','https://brewreel.com']);
fs.writeFileSync('_brew.html',h,'utf8');
const clean=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
// 提取价格上下文
const priceCtx=[];
const re=/([\u00a5$]\s?[0-9]+\s*元?)/g; let m;
while((m=re.exec(clean))!==null){ priceCtx.push(clean.slice(Math.max(0,m.index-100), m.index+120)); }
console.log('=== brewreel 价格上下文 ===');
priceCtx.slice(0,6).forEach(c=>console.log('  ...'+c.replace(/\s+/g,' ').slice(0,200)));
// 找广告位/赞助
const adCtx=[];
for(const kw of ['广告','赞助','sponsor','推广','合作']){
  let i=clean.indexOf(kw);
  if(i>0) adCtx.push(kw+': '+clean.slice(Math.max(0,i-80),i+120));
}
console.log('=== 广告/赞助 ===');
adCtx.slice(0,5).forEach(c=>console.log('  '+c.slice(0,180)));
// 找微信/公众号
for(const kw of ['公众号','微信','二维码','加群']){
  let i=clean.indexOf(kw);
  if(i>0) console.log('  '+kw+': '+clean.slice(Math.max(0,i-60),i+100));
}
console.log('DONE');