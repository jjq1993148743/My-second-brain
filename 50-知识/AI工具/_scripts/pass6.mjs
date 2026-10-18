
import { get, gbk, strip, sleep } from './proxy-fetch.mjs';
import { externals, pickCharset, titleOf } from './links.mjs';
import fs from 'node:fs';
const L = [
  'https://www.xx8.uk/','https://jyblog.com/','https://kf.sglynp.com/','https://sgly.taobao.com/',
  'https://www.jgbk.net/','https://www.dlyybbs.com/','https://www.52pojie.cn/','https://bbs.52pcgame.net/',
  'https://www.gamersky.com/','https://www.fhyx.com/','https://shop.ali213.com/','https://www.yxdown.com/',
  'https://bbs.a9vg.com/','https://www.dmread.cn/','https://www.guazixs.cn/','https://www.anyew.cn/',
  'https://www.9yread.com/','https://www.sweetread.cn/','https://www.ledu.com/','https://www.gaoshouyou.com/',
  'https://rpg.07073.com/','https://2550505.com/','https://hanser.fun/','https://2heng.xin/','https://www.haoh520.cn/',
];
const out = [];
for (const u of L) {
  const rec = { url: u, status: 0, len: 0, title: '', hosts: [], snip: '' };
  try {
    const r = await get(u, 'text/html,*/*');
    rec.status = r.status; rec.len = r.body.length;
    const cs = pickCharset(r.body); const txt = cs==='gbk'?gbk(r.body):r.body.toString('utf8');
    rec.title = titleOf(txt);
    const ext = externals(txt, u);
    rec.hosts = ext.map(e=>e.host);
    rec.snip = strip(txt).slice(0, 200);
  } catch (e) { rec.status = -1; rec.title='ERR '+e.message.slice(0,60); }
  out.push(rec);
  console.log('── ' + u + ' [' + rec.status + '] ' + rec.len + 'B | ' + rec.title);
  console.log('   H: ' + rec.hosts.slice(0,35).join(', '));
  await sleep(900);
}
fs.writeFileSync('D:\\GitHub\\My-second-brain\\50-知识\\AI工具\\_scripts\\_pass6.json', JSON.stringify(out, null, 1), 'utf8');
console.log('DONE');
