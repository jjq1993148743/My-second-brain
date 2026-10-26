import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:35000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const topics=['Hobby','Art','Music','Photography','Animals','Food','Fitness','Technology','Gaming','Books','Crafts','Outdoors','Science','Writing','Fashion','Anime','Film','Crypto','Education','Health'];
const rows=[];
for(const t of topics){
  const u='https://guildregister.com/subtopic/'+t;
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','20',u]);
  const txt=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,'|').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&');
  const flat=txt.replace(/\s+/g,' ');
  // 提取形如 Name | 12,345 | 2,345 | 21.1%
  const re=/([A-Za-z0-9\u00a0-\uffff\s\.\-_'&!]{3,40}?)\s*\|\s*([\d,]{2,9})\s*\|\s*([\d,]{1,9})\s*\|\s*([\d\.]{1,5})%/g;
  let m, cnt=0;
  const found=[];
  while((m=re.exec(flat))!==null && cnt<8){
    const name=m[1].trim().replace(/^\|+|\|+$/g,'').trim();
    const members=parseInt(m[2].replace(/,/g,''),10);
    const online=parseInt(m[3].replace(/,/g,''),10);
    const rate=parseFloat(m[4]);
    if(members>500 && name.length>2 && !/^(Server|Members|Online|Active|Browse|Topics|Categories)$/i.test(name)){
      found.push({name, members, online, rate});
      cnt++;
    }
  }
  rows.push({topic:t, count:found.length, top:found});
  await new Promise(r=>setTimeout(r,350));
}
fs.writeFileSync('_guild_all.json', JSON.stringify(rows,null,2),'utf8');
console.log('采集完成，品类数='+rows.length);
for(const r of rows){ if(r.top.length) console.log(r.topic+': '+r.top.slice(0,3).map(x=>x.name+'('+x.members+')').join(', ')); }
console.log('DONE');