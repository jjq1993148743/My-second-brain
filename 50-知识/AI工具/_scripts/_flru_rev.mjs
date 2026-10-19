import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept-Language: ru,en;q=0.8','--max-time','20','--compressed',u]);
function text(h){return (h||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').split('\n').map(l=>l.trim()).filter(l=>l.length>30);}
const urls=[
  'https://vc.ru/id1356510/3085124-gde-frilanseru-iskat-klientov',
  'https://habr.com/ru/articles/983762/',
  'https://rskrf.ru/goods/fl-ru-frilans-i-rabota-na-domu/'
];
for(const u of urls){
  const h=await curl(u); const ls=text(h);
  const key=ls.filter(l=>/(fl\.ru|FL\.ru|комисси|процент|отзыв|минус|плюс|плохо|хорошо|мошен|обман|заказчик|безопасн|арбитраж|платн)/i.test(l)).slice(0,15);
  console.log('=== '+u.slice(0,60)+' bytes='+h.length);
  for(const k of key.slice(0,10)) console.log('  · '+k.slice(0,230));
  await new Promise(r=>setTimeout(r,2500));
}