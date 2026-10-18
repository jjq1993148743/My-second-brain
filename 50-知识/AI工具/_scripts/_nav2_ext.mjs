
// _nav2_ext.mjs — 从 chrome 抓到的 HTML 里提取真实外链域名
import fs from 'node:fs';
const ABS='D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/';
const OUT=ABS+'_nav2_sites.json';
function links(txt, baseUrl) {
  const out=[]; const re=/<a\b([^>]*href=["']?([^"'>\s]+)["']?)([^>]*)>([\s\S]{0,120}?)<\/a>/gi; let m;
  while((m=re.exec(txt))){ const href=m[2]; if(/^(#|javascript:|mailto:|tel:)/i.test(href))continue; let abs=href; try{abs=new URL(href,baseUrl).href;}catch{} out.push({href:abs, anchor:m[4].replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim().slice(0,40)});}
  return out;
}
const acc=new Map();
try { for (const r of JSON.parse(fs.readFileSync(OUT,'utf8'))) acc.set(r.host,{...r,from:[].concat(r.from)}); } catch {}
function add(host,name,from){ host=String(host||'').toLowerCase().replace(/^www\./,''); if(!host||!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host))return; if(!acc.has(host))acc.set(host,{host,name:name||'',from:[from],count:0}); const x=acc.get(host); x.count++; if(name&&name.length>x.name.length)x.name=name.slice(0,50); if(!x.from.includes(from))x.from.push(from); }
const jobs=[
  ['_nav2_ch_behance.html','https://www.behance.net/','behance'],
  ['_nav2_ch_ui.html','https://www.ui.cn/','uicn'],
  ['_nav2_ch_huxiu.html','https://www.huxiu.com/','huxiu'],
  ['_nav2_ch_adquan.html','https://www.adquan.com/','adquan'],
  ['_nav2_uisdc_font.html','https://hao.uisdc.com/font/','uisdc_font'],
  ['_nav2_pro.html','https://pro.uisdc.com/','uisdc_pro'],
  ['_nav2_hotsearch.html','https://hot.uisdc.com/hotsearch','uisdc_hotsearch'],
];
for (const [f,base,from] of jobs) {
  let t; try { t=fs.readFileSync(ABS+f,'utf8'); } catch { console.log('skip '+f); continue; }
  if (!t.length) { console.log('empty '+f); continue; }
  const ls=links(t,base); let n=0; const seen=new Set();
  for (const l of ls){ try{ const u=new URL(l.href); const h=u.hostname.toLowerCase(); if(seen.has(h))continue; seen.add(h);
    const baseH=new URL(base).hostname.replace(/^www\./,'');
    if (h===baseH||h==='www.'+baseH) continue;
    if (/\.uisdc\.com$|uisdc\.com$/.test(h)&&from.startsWith('uisdc')) continue;
    add(h,l.anchor,from+'_ext'); n++; }catch{} }
  console.log(f+' links='+ls.length+' newHosts='+n+' total='+acc.size);
}
fs.writeFileSync(OUT, JSON.stringify([...acc.values()],null,0));
console.log('EXT-DONE total='+acc.size+' size='+fs.statSync(OUT).size);
