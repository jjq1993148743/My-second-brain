import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:30000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const topics=['Hobby','Art','Music','Photography','Animals','Food','Fitness','Technology','Gaming','Books','Crafts','Outdoors','Science','Writing','Fashion','Anime','Film','Education','Health','Nature','Travel','Sports','Cars','Pets'];
const out=[];
for(const t of topics){
  const u='https://guildregister.com/subtopic/'+t;
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20',u]);
  if(!h || h.length<500){ out.push({topic:t,error:'empty'}); continue; }
  const tb=h.slice(h.indexOf('<table'), h.indexOf('</table>'));
  // 每行：<a href="/guild/ID">NAME</a> ... <td class="num">MEM</td><td class="num">ONL</td><td class="num">RATE%</td>
  const rows=[...tb.matchAll(/<a href="\/guild\/(\d+)">([^<]+)<\/a>[\s\S]*?<td class="num">([\d,]+)<\/td><td class="num">([\d,]+)<\/td><td class="num">([\d.]+)%<\/td>/g)];
  const list=rows.slice(0,10).map(m=>({
    id:m[1], name:m[2].trim(),
    members:parseInt(m[3].replace(/,/g,''),10),
    online:parseInt(m[4].replace(/,/g,''),10),
    rate:parseFloat(m[5])
  })).filter(x=>x.members>=500);
  out.push({topic:t, count:list.length, list});
  await new Promise(r=>setTimeout(r,300));
}
fs.writeFileSync('_guild2.json', JSON.stringify(out,null,2),'utf8');
const ok=out.filter(o=>o.list&&o.list.length);
console.log('成功品类='+ok.length+'/'+out.length);
for(const o of ok){
  console.log('\n【'+o.topic+'】');
  o.list.slice(0,4).forEach(x=>console.log('  '+x.name+'  会员'+x.members+'  在线'+x.online+'  活跃'+x.rate+'%'));
}
console.log('DONE');