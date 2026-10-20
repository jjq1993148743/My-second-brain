import { execFile } from 'node:child_process';
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const run=(a)=>new Promise(res=>execFile('curl',a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const get=u=>run(['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22','--compressed',u]);
for(const [tag,u] of [['justjoin','https://justjoin.it/'],['djinni','https://djinni.co/jobs/'],['nofluff','https://nofluffjobs.com/'],['jobberman','https://www.jobberman.com/jobs']]){
  const h=await get(u);
  // 找 JSON-LD 或 __NEXT_DATA__
  const ld=(h.match(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)||[]).length;
  const nextData=(h.match(/__NEXT_DATA__/g)||[]).length;
  const apollo=(h.match(/__APOLLO_STATE__|window\.__/g)||[]).length;
  const text=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
  // 薪资信号（波兰兹罗提/欧元/美元）
  const pln=(h.match(/[0-9]{3,5}\s?(PLN|z\u0142)/gi)||[]).length;
  const eur=(h.match(/\u20ac\s?[0-9]{2,}|[0-9]{2,}\s?EUR/gi)||[]).length;
  const usd=(h.match(/\$\s?[0-9]{2,}/g)||[]).length;
  console.log('=== '+tag+' '+Math.round(h.length/1000)+'k ld='+ld+' next='+nextData+' apollo='+apollo+' pln='+pln+' eur='+eur+' usd='+usd);
  console.log('  textHead: '+text.slice(0,300));
  await new Promise(r=>setTimeout(r,1200));
}
console.log('DONE');