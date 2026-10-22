import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:26000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
// 实测导流站：看它们放了什么（有没有广告/收费/公众号）
const sites=[
 ['misakanet','https://misakanet.org'],
 ['cc-safetynet','https://ccsafetynet.com'],
 ['agent-vision','https://agent-vision.anionex.me'],
 ['dshmarket','https://dshmarket.com'],
 ['dshsuite','https://dshsuite.dev'],
 ['prts','https://prts.chat'],
 ['brewreel','https://brewreel.com'],
 ['tnnevol-doc','https://fndsh-doc.tnnevol.cn/plugins/dsh-fnos'],
];
for(const [n,u] of sites){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20',u]);
  const clean=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
  // 找商业化信号
  const pay=/[\u00a5$]\s?[0-9]|价格|定价|付费|订阅|购买|pricing|subscribe|premium|会员/i.test(clean);
  const ads=/广告|sponsor|广告位|advertise/i.test(clean);
  const wx=/公众号|微信|二维码|扫码|加群/i.test(clean);
  const gh=/github\.com|GitHub/i.test(clean);
  const money=[...new Set((clean.match(/[\u00a5$]\s?[0-9][0-9,.]*|\d+\s*元/g)||[]))].slice(0,6);
  console.log('=== '+n+' bytes='+h.length);
  console.log('  付费='+pay+' 广告='+ads+' 微信='+wx+' GitHub='+gh+' 价='+JSON.stringify(money));
  console.log('  摘要: '+clean.slice(0,180));
  await new Promise(r=>setTimeout(r,800));
}
console.log('DONE');