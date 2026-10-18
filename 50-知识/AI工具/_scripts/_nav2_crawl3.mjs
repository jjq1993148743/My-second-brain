
import { get, gbk, sleep } from './proxy-fetch.mjs';
import { links, externals, pickCharset } from './links.mjs';
import fs from 'node:fs';
const OUT='_nav2_sites.json';
const acc=new Map();
try { for (const r of JSON.parse(fs.readFileSync(OUT,'utf8'))) acc.set(r.host, {...r, from: [].concat(r.from)}); } catch(e){ console.log('no prev'); }
function add(host,name,from){ host=String(host||'').toLowerCase().replace(/^\.www./,'').replace(/^www\./,''); if(!host||!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host))return; if(!acc.has(host))acc.set(host,{host,name:name||'',from:[from],count:0}); const x=acc.get(host); x.count++; if(name&&name.length>x.name.length)x.name=name.slice(0,60); if(!x.from.includes(from))x.from.push(from); }
// 本地 html 文件解析
for (const [file, base, from] of [['_nav2_uisdc_font.html','https://hao.uisdc.com/font/','uisdc_font']]) {
  const t = fs.readFileSync(file,'utf8');
  for (const l of links(t, base)) { try { const u=new URL(l.href); if(!/\.uisdc\.com$/.test(u.hostname)) add(u.hostname, l.anchor, from); } catch{} }
  console.log('[local '+file+'] links='+links(t,base).length+' total='+acc.size);
}
// tophub 每个分类页的热门条目里的真实外链（文章链接指向原站）
const CATS=['news','tech','ent','community','shopping','finance','developer','ai','design'];
for (const c of CATS) {
  try {
    const r = await get('https://tophub.today/c/'+c,'text/html,*/*',30000);
    const t = pickCharset(r.body)==='gbk'?gbk(r.body):r.body.toString('utf8');
    for (const l of links(t,'https://tophub.today/c/'+c)) {
      try { const u=new URL(l.href); if(u.hostname==='tophub.today')continue; if(/file\.ipadown\.com|zstatic\.net/.test(u.hostname))continue; add(u.hostname, l.anchor, 'tophub_item_'+c); } catch{}
    }
    console.log('[tophub c/'+c+' items] total='+acc.size);
  } catch(e){ console.log('FAIL c/'+c); }
  fs.writeFileSync(OUT, JSON.stringify([...acc.values()]));
  await sleep(800+Math.random()*300);
}
fs.writeFileSync(OUT, JSON.stringify([...acc.values()]));
console.log('DONE hosts='+acc.size);
