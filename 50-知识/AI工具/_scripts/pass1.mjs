
import { get, gbk, strip, sleep } from './proxy-fetch.mjs';
import { externals, pickCharset, titleOf } from './links.mjs';

const START = [
  'https://bgm.tv/',
  'https://www.bangumi.tv/',
  'https://bbs.nga.cn/',
  'https://keylol.com/',
  'https://www.gmgard.com/',
  'https://www.manhuaren.com/',
  'https://klpbbs.com/',
  'https://www.mihuashi.com/',
  'https://www.modian.com/',
  'https://izhongchou.taobao.com/',
  'https://www.foreverblog.cn/',
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
    rec.sample = ext.slice(0, 40);
  } catch (e) { rec.status = -1; rec.len = 0; rec.title = 'ERR ' + e.message.slice(0,60); }
  out.push(rec);
  console.log('─── ' + u + ' [' + rec.status + '] ' + rec.len + 'B');
  console.log('    T: ' + rec.title);
  console.log('    H: ' + rec.hosts.slice(0, 45).join(', '));
  await sleep(900);
}
await fs.writeFile('D:\\GitHub\\My-second-brain\\50-知识\\AI工具\\_scripts\\_pass1.json', JSON.stringify(out, null, 1), 'utf8');
console.log('DONE pass1: ' + out.length);
