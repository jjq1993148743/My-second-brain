
import { get, gbk, strip, sleep } from './proxy-fetch.mjs';
import fs from 'node:fs';
import { externals, links, titleOf, pickCharset } from './links.mjs';

const OUT = '_nav2_raw.json';
const SITES = [
  ['https://tophub.today/', 'tophub'],
  ['https://huxiu.com/', 'huxiu'],
  ['https://hao.importnew.com/', 'importnew'],
  ['https://hao.uisdc.com/', 'uisdc_hao'],
  ['https://hot.uisdc.com/', 'uisdc_hot'],
  ['https://pro.uisdc.com/', 'uisdc_pro'],
];
const pages = [...SITES];
{
  const r = await new Promise(res => import('./proxy-fetch.mjs').then(m => m.get('https://tophub.today/','text/html,*/*',30000).then(x => {
    const enc = pickCharset(x.body); res({ status: x.status, txt: enc==='gbk'?gbk(x.body):x.body.toString('utf8'), len: x.body.length });
  }).catch(e => res({status:-1,txt:'',len:0,err:e.message}))));
  console.log('tophub home', r.status, r.len);
  if (r.txt) {
    const cats = links(r.txt, 'https://tophub.today/').map(l=>l.href).filter(x=>/^https:\/\/tophub\.today\/(c|node|category)\//.test(x));
    const uniq = [...new Set(cats)].slice(0, 8);
    console.log('tophub cats: ' + uniq.join(' '));
    for (const u of uniq) pages.push([u, 'tophub']);
  }
}
async function fetchTxt(url) {
  try {
    const r = await get(url, 'text/html,application/xhtml+xml,*/*', 30000);
    const enc = pickCharset(r.body);
    return { status: r.status, txt: enc === 'gbk' ? gbk(r.body) : r.body.toString('utf8'), len: r.body.length };
  } catch (e) { return { status: -1, txt: '', len: 0, err: e.message }; }
}
const acc = new Map();
function add(host, rec) { if (!acc.has(host)) acc.set(host, { ...rec, count: 0 }); acc.get(host).count++; }
let i = 0;
for (const [url, from] of pages) {
  i++;
  const r = await fetchTxt(url);
  if (!r.txt) { console.log('FAIL', url, r.status, r.err||''); await sleep(700); continue; }
  for (const e of externals(r.txt, url)) add(e.host, { host: e.host, from, anchor: e.anchor, href: e.href });
  try { const b = new URL(url).hostname.replace(/^www\./,''); if (from !== 'tophub') add(b, { host: b, from: 'self_'+from, anchor: '', href: url }); } catch {}
  console.log('[' + i + '/' + pages.length + '] ' + url + ' ' + r.status + ' ' + r.len + ' ext -> totalHosts=' + acc.size);
  fs.writeFileSync(OUT, JSON.stringify([...acc.values()]));
  await sleep(900 + Math.random()*300);
}
fs.writeFileSync(OUT, JSON.stringify([...acc.values()].sort((a,b)=>b.count-a.count)));
const arr = [...acc.values()].sort((a,b)=>b.count-a.count);
console.log('CRAWL-DONE hosts=' + arr.length + ' pages=' + pages.length);
console.log(arr.slice(0,50).map(r=>r.host+'('+r.count+','+r.from+')').join(' '));
