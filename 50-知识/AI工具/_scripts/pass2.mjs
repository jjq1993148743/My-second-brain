
import { get, gbk, strip, sleep } from './proxy-fetch.mjs';
import { externals, pickCharset, titleOf } from './links.mjs';
import fs from 'node:fs';

const START = [
  'https://bgm.tv/group',
  'https://bgm.tv/group/discover',
  'https://www.mcmod.cn/',
  'https://www.minebbs.com/',
  'https://klpwiki.com/',
  'https://muhan.co/',
  'https://www.artform.cn/',
  'https://mcapks.net/',
  'https://mccag.cn/',
  'https://pmine.org/',
  'https://klpbbs.us/',
  'https://fds.moe/',
  'https://www.tgfmc.top/',
  'https://hytalecn.com/',
  'https://www.mihuashi.com/works',
  'https://www.foreverblog.cn/blogs',
  'https://www.manhuaren.com/rank',
  'https://bbs.nga.cn/thread.php?fid=436',
  'https://www.gmgard.com/',
];
const out = [];
for (const u of START) {
  const rec = { url: u, status: 0, len: 0, title: '', hosts: [], sample: [] };
  try {
    const r = await get(u, 'text/html,application/xhtml+xml,*/*');
    rec.status = r.status; rec.len = r.body.length;
    const cs = pickCharset(r.body);
    const txt = cs === 'gbk' ? gbk(r.body) : r.body.toString('utf8');
    rec.title = titleOf(txt);
    const ext = externals(txt, u);
    rec.hosts = ext.map(e => e.host);
    rec.sample = ext.slice(0, 60);
    rec.snippet = strip(txt).slice(0, 500);
  } catch (e) { rec.status = -1; rec.title = 'ERR ' + e.message.slice(0,60); }
  out.push(rec);
  console.log('─── ' + u + ' [' + rec.status + '] ' + rec.len + 'B');
  console.log('    T: ' + rec.title);
  console.log('    H: ' + rec.hosts.slice(0, 50).join(', '));
  await sleep(900);
}
fs.writeFileSync('D:\\GitHub\\My-second-brain\\50-知识\\AI工具\\_scripts\\_pass2.json', JSON.stringify(out, null, 1), 'utf8');
console.log('DONE pass2');
