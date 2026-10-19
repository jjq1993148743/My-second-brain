import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','18','--compressed',u]);
function text(h){return (h||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&euro;/g,'\u20ac').split('\n').map(l=>l.trim()).filter(l=>l.length>20);}
const urls=[
  'https://www.codeur.com/pages/tarifs-codeur-com',
  'https://aide.codeur.com/freelance/articles/pourquoi-payer-la-commission-de-realisation',
  'https://justincappelle.ch/en/blog/retour-experience-codeur'
];
for(const u of urls){
  const h=await curl(u); const ls=text(h);
  const key=ls.filter(l=>/(commission|%|\u20ac|gratuit|payant|avis|arnaque|recommande|\u00e9viter|perte|temps|frais)/i.test(l)).slice(0,14);
  console.log('=== '+u.slice(0,65)+' bytes='+h.length);
  for(const k of key.slice(0,9)) console.log('  \u00b7 '+k.slice(0,210));
  await new Promise(r=>setTimeout(r,2200));
}