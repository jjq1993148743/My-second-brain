
import { get, gbk, strip, sleep } from './proxy-fetch.mjs';
import { externals, pickCharset, titleOf } from './links.mjs';
import fs from 'node:fs';
const L = [
  'https://www.minecraftzw.com/','https://www.mczwlt.net/','https://www.bbstr.net/','https://mcsmanager.com/',
  'https://www.mcnav.net/','https://mcgif.cn/','https://afdian.com/','https://www.dkdun.cn/',
  'https://mineplugin.org/','https://link.mcmod.cn/','https://play.mcmod.cn/','https://bbs.mcmod.cn/',
  'https://www.cnxfans.com/','https://www.rhymc.com/','https://www.tyteam.net/','https://l.imc.re/',
  'https://www.mcbbs.co/','https://fds.rs/','https://pmine.rs/','https://archive.minebbs.com/',
  'https://www.zhihu.com/','https://afdian.net/','https://www.douban.com/','https://tieba.baidu.com/',
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
    rec.snip = strip(txt).slice(0, 220);
  } catch (e) { rec.status = -1; rec.title='ERR '+e.message.slice(0,60); }
  out.push(rec);
  console.log('── ' + u + ' [' + rec.status + '] ' + rec.len + 'B | ' + rec.title);
  console.log('   H: ' + rec.hosts.slice(0,40).join(', '));
  await sleep(900);
}
fs.writeFileSync('D:\\GitHub\\My-second-brain\\50-知识\\AI工具\\_scripts\\_pass3.json', JSON.stringify(out, null, 1), 'utf8');
console.log('DONE');
