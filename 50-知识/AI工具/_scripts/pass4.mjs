
import { get, gbk, strip, sleep } from './proxy-fetch.mjs';
import { externals, pickCharset, titleOf } from './links.mjs';
import fs from 'node:fs';
const L = [
  'https://www.bandbbs.cn/','https://www.bilicraft.com/','https://goto.pixelmap.cc/','https://www.gululu.world/',
  'https://www.bakaxl.com/','https://miaomiao.games/','https://theredpixelteam.com/','https://www.locyan.cn/',
  'https://bbs.mountblade.com.cn/','https://www.planetminecraft.com/','https://www.mcshuo.com/',
  'https://makily.com/','https://www.realmgame.cn/','https://www.vrshidian.com/','https://www.gtyx.net/',
  'https://www.robloxplot.com/','https://mc.qukanr.com/','https://img1.minecraftzw.com/','https://servers.minecraftplot.com/',
  'https://www.ir-wsei.icu/','https://sf.fds.moe/','https://hcr.rs/','https://forum.mczwlt.net/',
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
fs.writeFileSync('D:\\GitHub\\My-second-brain\\50-知识\\AI工具\\_scripts\\_pass4.json', JSON.stringify(out, null, 1), 'utf8');
console.log('DONE');
