import { execFile } from 'node:child_process';
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const run=(a)=>new Promise(res=>execFile('curl',a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const get=u=>run(['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept-Language: en-US,en;q=0.9','--max-time','16','--compressed','-w','\n%{http_code}',u]);
const hot=JSON.parse(fs.readFileSync('_HOT59.json','utf8'));
// 常见列表页/API后缀
const suffixes=['/jobs','/projects','/freelance-jobs','/jobs/search','/project/search','/api/jobs','/jobs.json','/en/jobs'];
const out=[];
for(const o of hot){
  let best={host:o.host, region:o.region, verdict:o.verdict, bestUrl:'', bestCode:'', bestBytes:0, bestJobs:0, bestMoney:0, bestTitle:'', tries:0};
  const urls=[o.base, ...suffixes.map(s=>o.base.replace(/\/$/,'')+s)];
  for(const u of urls.slice(0,5)){
    let h=''; try{h=await get(u);}catch(e){continue;}
    const idx=h.lastIndexOf('\n'); const code=(h.slice(idx+1)||'').trim(); const html=h.slice(0,idx);
    best.tries++;
    if(code!=='200'||html.length<3000) { await new Promise(r=>setTimeout(r,400)); continue; }
    const text=html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
    const jobs=(text.match(/\b(job|project|freelance|position|task|gig|mission|offer)s?\b/gi)||[]).length;
    const money=(text.match(/[$\u20ac\u00a3\u00a5]\s?[0-9]{2,}|\b(budget|salary|rate)s?\b/gi)||[]).length;
    const title=(html.match(/<title[^>]*>([\s\S]{0,80}?)<\/title>/i)||[])[1]||'';
    if(jobs*(1+Math.min(money,5)) > best.bestJobs*(1+Math.min(best.bestMoney,5))){
      best.bestUrl=u; best.bestCode=code; best.bestBytes=html.length; best.bestJobs=jobs; best.bestMoney=money; best.bestTitle=title.trim().slice(0,60);
    } else if(best.bestBytes===0 && html.length>3000){ best.bestUrl=u; best.bestCode=code; best.bestBytes=html.length; best.bestJobs=jobs; best.bestMoney=money; best.bestTitle=title.trim().slice(0,60); }
    await new Promise(r=>setTimeout(r,450));
  }
  let state='营销/无列表';
  if(best.bestCode==='200' && best.bestJobs>=12 && best.bestMoney>=1) state='✅职位+金额';
  else if(best.bestCode==='200' && best.bestJobs>=12) state='✅职位列表';
  else if(best.bestCode==='200' && best.bestJobs>=5) state='🟡弱列表';
  else if(best.bestCode!=='200') state='❌不可用('+best.bestCode+')';
  best.state=state;
  out.push(best);
  console.log(o.host.padEnd(20)+state.padEnd(14)+'jobs='+best.bestJobs+' $='+best.bestMoney+' '+best.bestUrl.slice(0,50));
  await new Promise(r=>setTimeout(r,400));
}
fs.writeFileSync('_HOT59_RESULT.json',JSON.stringify(out,null,1),'utf8');
const d={}; for(const o of out) d[o.state]=(d[o.state]||0)+1;
console.log('DONE '+JSON.stringify(d));