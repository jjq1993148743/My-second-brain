import { execFile } from 'node:child_process';
const run = (c,a,t) => new Promise(res => execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:t||25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl = u => run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept-Language: en-US,en;q=0.9','--max-time','20','--compressed',u]);
function text(h){return (h||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').split('\n').map(l=>l.trim()).filter(l=>l.length>25);}
const urls=[
  'https://nz.sitejabber.com/reviews/freelancer.com',
  'https://www.joinnextdev.com/blog/freelancercom-review-is-it-worth-it-in-2026',
  'https://terms.law/ToS-Watchdog/freelance-platforms/freelancer/'
];
for(const u of urls){
  const h=await curl(u); const ls=text(h);
  const score=(h.match(/([0-9]\.[0-9])\s*(?:out of|\/)\s*5/i)||[])[1]||'';
  const total=(h.match(/([0-9,]{3,})\s*(?:reviews|ratings)/i)||[])[1]||'';
  const key=ls.filter(l=>/(fee|commission|10%|scam|legit|recommend|avoid|complaint|chargeback|withdraw|support|fake|bot|bad|dispute)/i.test(l)).slice(0,12);
  console.log('=== '+u.slice(0,60)+' score='+score+' total='+total+' bytes='+h.length);
  for(const k of key) console.log('  · '+k.slice(0,220));
  await new Promise(r=>setTimeout(r,2500));
}