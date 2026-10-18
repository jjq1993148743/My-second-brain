
// _nav2_crawl2.mjs — 解析导航/榜单站的真实外链域名
import { get, gbk, sleep } from './proxy-fetch.mjs';
import { links, pickCharset } from './links.mjs';
import fs from 'node:fs';

const OUT = '_nav2_sites.json';
const acc = new Map(); // host -> {host,name,from,count}
function add(host, name, from) {
  host = String(host||'').toLowerCase().replace(/^www\./,'');
  if (!host || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host)) return;
  if (!acc.has(host)) acc.set(host, { host, name: name||'', from: [from], count: 0 });
  const r = acc.get(host);
  r.count++;
  if (name && name.length > r.name.length) r.name = name.slice(0,60);
  if (!r.from.includes(from)) r.from.push(from);
}
async function ft(url, timeout=30000) {
  const r = await get(url, 'text/html,*/*', timeout);
  const enc = pickCharset(r.body);
  return { status: r.status, txt: enc==='gbk'?gbk(r.body):r.body.toString('utf8'), len: r.body.length };
}
// tophub 节点卡片解析: 取 media/<domain>.png 的域名 + 卡片名
function tophubCards(html) {
  const parts = html.split('<div class="cc-cd"');
  const out = [];
  for (const chunk of parts.slice(1)) {
    const img = /assets\/images\/media\/([a-z0-9][a-z0-9.-]*\.[a-z]{2,})\.png/i.exec(chunk);
    if (img) { out.push({ host: img[1], name: '' }); continue; }
    const m = /<a\s+href="(https?:\/\/[^"]+)"/i.exec(chunk.slice(0, 4000));
    if (m) { try { out.push({ host: new URL(m[1]).hostname, name: '' }); } catch {} }
  }
  return out;
}
function tophubNames(html) {
  // 卡片名: cc-cd-lb 内 span 文本，按顺序对齐 parts
  const parts = html.split('<div class="cc-cd"').slice(1);
  return parts.map(c => { const m = /cc-cd-lb[^>]*>[\s\S]{0,300}?<span>([\s\S]{1,40}?)<\/span>/.exec(c); return m ? m[1].replace(/\s+/g,' ').trim() : ''; });
}

const CATS = ['news','tech','ent','community','shopping','finance','developer','brief','ai','design','university','organization','blog','epaper'];
let done = 0;
for (const c of CATS) {
  try {
    const r = await ft('https://tophub.today/c/' + c);
    const cards = tophubCards(r.txt);
    const names = tophubNames(r.txt);
    cards.forEach((cd, i) => add(cd.host, names[i] || '', 'tophub_c_' + c));
    done++;
    console.log('[tophub c/' + c + '] ' + r.status + ' ' + r.len + ' cards=' + cards.length + ' total=' + acc.size);
  } catch (e) { console.log('FAIL c/' + c + ' ' + e.message.slice(0,60)); }
  fs.writeFileSync(OUT, JSON.stringify([...acc.values()]));
  await sleep(800 + Math.random()*300);
}
// uisdc 站内导航子页
for (const u of ['https://hao.uisdc.com/ai','https://hao.uisdc.com/font/','https://hao.uisdc.com/color','https://hao.uisdc.com/book','https://hao.uisdc.com/creator','https://hao.uisdc.com/shop','https://hao.uisdc.com/goods/','https://hao.uisdc.com/photo/']) {
  try {
    const r = await ft(u);
    for (const l of links(r.txt, u)) {
      try { const h = new URL(l.href).hostname; if (!/\.uisdc\.com$|\.uisdc\.com\//.test(h)) add(h, l.anchor, 'uisdc_hao'); } catch {}
    }
    console.log('[uisdc ' + u + '] ' + r.status + ' ' + r.len + ' total=' + acc.size);
  } catch (e) { console.log('FAIL ' + u + ' ' + e.message.slice(0,60)); }
  fs.writeFileSync(OUT, JSON.stringify([...acc.values()]));
  await sleep(800 + Math.random()*300);
}
// huxiu
for (const u of ['https://www.huxiu.com/','https://huxiu.com/']) {
  try {
    const r = await ft(u);
    for (const l of links(r.txt, u)) { try { const h = new URL(l.href).hostname; if (!/huxiu\.com$/.test(h)) add(h, l.anchor, 'huxiu'); } catch {} }
    console.log('[huxiu ' + u + '] ' + r.status + ' ' + r.len + ' total=' + acc.size);
  } catch (e) { console.log('FAIL ' + u + ' ' + e.message.slice(0,60)); }
  await sleep(800 + Math.random()*300);
}
fs.writeFileSync(OUT, JSON.stringify([...acc.values()]));
console.log('DONE hosts=' + acc.size);
console.log([...acc.values()].slice(0,60).map(x=>x.host+':'+x.name).join(' | '));
