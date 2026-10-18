
import fs from 'node:fs';
import { links } from './links.mjs';
const OUT='_nav2_sites.json';
const acc=new Map();
try { for (const r of JSON.parse(fs.readFileSync(OUT,'utf8'))) acc.set(r.host,{...r,from:[].concat(r.from)}); } catch {}
function add(host,name,from){ host=String(host||'').toLowerCase().replace(/^www\./,''); if(!host||!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host))return; if(!acc.has(host))acc.set(host,{host,name:name||'',from:[from],count:0}); const x=acc.get(host); x.count++; if(name&&name.length>x.name.length)x.name=name.slice(0,60); if(!x.from.includes(from))x.from.push(from); }
const locals=[['_nav2_uisdc_font.html','https://hao.uisdc.com/font/','uisdc_font'],['_nav2_pro.html','https://pro.uisdc.com/','uisdc_pro'],['_nav2_hotsearch.html','https://hot.uisdc.com/hotsearch','uisdc_hotsearch']];
for (const [f,base,from] of locals) {
  let t; try { t=fs.readFileSync(f,'utf8'); } catch { console.log('skip '+f); continue; }
  if (!t.length) { console.log('empty '+f); continue; }
  const ls=links(t,base); let n=0;
  for (const l of ls){ try{ const u=new URL(l.href); if(/\.uisdc\.com$/.test(u.hostname))continue; if(/libs\.baidu\.com/.test(u.hostname))continue; add(u.hostname,l.anchor,from); n++; }catch{} }
  console.log('[local '+f+'] links='+ls.length+' added='+n+' total='+acc.size);
}
fs.writeFileSync(OUT, JSON.stringify([...acc.values()]));
const base=['tophub.today','huxiu.com','hao.importnew.com','www.importnew.com','importnew.com'];
for (const b of base) add(b,'','self_site');
fs.writeFileSync(OUT, JSON.stringify([...acc.values()]));
console.log('DONE total='+acc.size);
