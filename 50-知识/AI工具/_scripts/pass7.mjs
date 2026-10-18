
import { get, gbk, strip, sleep } from './proxy-fetch.mjs';
import { externals, pickCharset, titleOf } from './links.mjs';
import fs from 'node:fs';
const L = [
  'https://rpgmz.com/','https://www.jm9u.com/','https://gongjux.com/','https://tool.mkblog.cn/',
  'https://www.taoke-cn.cn/','https://www.boyouquan.com/','https://bf.zzxworld.com/','https://www.blogsclub.org/',
  'https://psnine.com/','https://bbs.ngacn.cc/','https://bbs.3dmgame.com/','https://www.tgbus.com/',
  'https://xyoss.g.com.cn/','https://www.178.com/','https://bigfoot.178.com/','https://www.douyutv.com/',
  'https://www.znds.com/','https://down.52pojie.cn/','https://www.duote.com/','https://www.jb51.net/',
  'https://www.962.net/','https://xiazai.zol.com.cn/',
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
fs.writeFileSync('D:\\GitHub\\My-second-brain\\50-知识\\AI工具\\_scripts\\_pass7.json', JSON.stringify(out, null, 1), 'utf8');
console.log('DONE');
