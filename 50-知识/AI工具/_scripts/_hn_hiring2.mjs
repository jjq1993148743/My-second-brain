import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/json','--max-time','22','--compressed',u]);

// 抓最近 3 个月的招聘帖
const ids=[['Oct2026',49922569],['Sep2026',49522897],['Aug2026',49156683]];
const all=[];
for(const [tag,id] of ids){
  const c=await curl('https://hn.algolia.com/api/v1/items/'+id);
  let cj=null; try{cj=JSON.parse(c);}catch(e){}
  if(!cj||!cj.children){console.log(tag+' FAIL'); continue;}
  const top=cj.children.filter(x=>x.text);
  console.log(tag+' comments='+top.length);
  for(const x of top){
    const txt=(x.text||'').replace(/<[^>]+>/g,' ').replace(/&#x27;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/&#x2F;/g,'/').replace(/\s+/g,' ').trim();
    if(txt.length<30) continue;
    const parts=txt.split('|').map(s=>s.trim());
    all.push({month:tag, company:(parts[0]||'').slice(0,60), role:(parts[1]||'').slice(0,80), loc:(parts[2]||'').slice(0,50), text:txt.slice(0,400), date:x.created_at});
  }
  await new Promise(r=>setTimeout(r,1500));
}
fs.writeFileSync('_hn_hiring.json',JSON.stringify(all,null,1),'utf8');
console.log('TOTAL='+all.length);
const withCompany=all.filter(j=>j.company.length>2).length;
console.log('withCompany='+withCompany);
for(const j of all.slice(0,8)) console.log('  '+j.company.slice(0,28)+' | '+j.role.slice(0,50));