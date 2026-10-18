
import { get, gbk, strip, sleep } from './proxy-fetch.mjs';
import { externals, pickCharset, titleOf } from './links.mjs';
import fs from 'node:fs';
const L = [
  'https://www.secretmine.net/','https://www.kindyear.cn/','https://roi.moe/','https://overhub.cn/',
  'https://redpixel.cn/','https://bbs.bilicraft.com/','https://create.gululu.world/','https://map.bilicraft.com/',
  'https://ifdian.net/','https://www.bn13.com/','https://www.1mod.org/','https://kaihei.co/','https://tlryjg.com/',
  'https://www.mbrepository.com/','https://www.shaoniandream.com/','https://hytabbs.com/','https://www.sanguocn.com/',
  'https://www.muyangsanguo.com/','https://www.xycq.org.cn/','https://www.sglynp.com/','https://game.ali213.net/',
  'https://www.sanguogame.com.cn/','https://xpk.persistentworld.cn/','https://www.zhsan2.top/',
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
fs.writeFileSync('D:\\GitHub\\My-second-brain\\50-知识\\AI工具\\_scripts\\_pass5.json', JSON.stringify(out, null, 1), 'utf8');
console.log('DONE');
