import fs from 'node:fs';
import path from 'node:path';
const dir='_raw_web3';
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.html')).sort();
const all=[]; const seen=new Set();
for(const f of files){
  const html=fs.readFileSync(path.join(dir,f),'utf8');
  // 按 data-jobid 分组提取
  const idRe=/data-jobid=(\d+)/g;
  const ids=[...new Set([...html.matchAll(/<tr[^>]*data-jobid=(\d+)/g)].map(m=>m[1]))];
  if(ids.length===0){
    // 退化：按 h3 公司名切
    const hr=[...html.matchAll(/data-jobid=(\d+)[\s\S]{0,3000}?<\/tr>/g)];
  }
  // 用 tr 块切分
  const blocks=html.split(/<tr[^>]*data-jobid=/);
  for(let k=1;k<blocks.length;k++){
    const c=blocks[k].slice(0,5000);
    const idm=c.match(/^(\d+)/);
    const id=idm?idm[1]:'';
    if(!id||seen.has(id)) continue; seen.add(id);
    // 公司名在 h3
    const tm=c.match(/<h3[^>]*>\s*([^<]{2,80})</);
    // 职位在链接里
    const jm=c.match(/href="\/([a-z0-9\-]{5,})/);
    const title=jm?jm[1].replace(/-/g,' '):(tm?tm[1]:'');
    // 发布时间
    const wm=c.match(/<time datetime="([^"]{10,30})"/);
    const when=wm?wm[1]:'';
    // 薪资
    const sm=c.match(/\$[0-9]{2,3}k\s*[-\u2013]\s*\$?[0-9]{2,3}k/i);
    all.push({id, company:(tm?tm[1]:'').trim().slice(0,60), title:title.slice(0,110), when, salary:sm?sm[0]:''});
  }
}
fs.writeFileSync('_web3_jobs.json',JSON.stringify(all,null,1),'utf8');
console.log('TOTAL='+all.length);
console.log('withSalary='+all.filter(a=>a.salary).length+' withTime='+all.filter(a=>a.when).length);
for(const a of all.slice(0,8)) console.log('  ['+a.salary+'] ['+a.when.slice(0,10)+'] '+a.company.slice(0,20)+' | '+a.title.slice(0,35));