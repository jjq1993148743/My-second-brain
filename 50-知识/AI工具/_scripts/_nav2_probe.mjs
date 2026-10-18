
import { get, gbk, sleep } from './proxy-fetch.mjs';
import { links, pickCharset } from './links.mjs';
async function ft(url) {
  const r = await get(url, 'text/html,*/*', 30000);
  const enc = pickCharset(r.body);
  return enc==='gbk'?gbk(r.body):r.body.toString('utf8');
}
const samples = [
  ['https://tophub.today/c/developer','tophub'],
  ['https://hao.uisdc.com/','uisdc_hao'],
  ['https://hot.uisdc.com/','uisdc_hot'],
  ['https://pro.uisdc.com/','uisdc_pro'],
  ['https://huxiu.com/','huxiu'],
];
for (const [u,tag] of samples) {
  try {
    const t = await ft(u);
    const ls = links(t, u);
    console.log('==== ' + u + ' links=' + ls.length);
    console.log(ls.slice(0, 25).map(l=>l.href).join('\n'));
  } catch(e) { console.log('FAIL ' + u + ' ' + e.message); }
  await sleep(900);
}
