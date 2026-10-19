import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','--compressed',u]);
function text(h){return (h||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').split('\n').map(l=>l.trim()).filter(l=>l.length>15);}
const urls=[
  'https://tousu.sina.cn/complaint/view/17399292934',
  'http://zt.epwk.com/zhijieguyong/',
  'https://zinnhub.com/switch-from/epwk/'
];
for(const u of urls){
  const h=await curl(u); const ls=text(h);
  const key=ls.filter(l=>/(抽佣|佣金|手续费|提现|会员|虚假|投诉|骗|退款|评价|费率|%|服务费)/.test(l)).slice(0,12);
  console.log('=== '+u.slice(0,60)+' bytes='+h.length);
  for(const k of key.slice(0,8)) console.log('  · '+k.slice(0,200));
  await new Promise(r=>setTimeout(r,2000));
}