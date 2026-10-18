import { get, gbk, strip, sleep } from './proxy-fetch.mjs';
import { execFile } from 'node:child_process';
import fs from 'node:fs';

const CHROME = String.raw`C:Program FilesGoogleChromeApplicationchrome.exe`;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36';

function chrome(url, wait = 8000) {
  return new Promise((resolve) => {
    execFile(CHROME, ['--headless=new','--disable-gpu','--no-sandbox','--disable-dev-shm-usage',
      '--dump-dom','--virtual-time-budget=' + wait, '--user-agent=' + UA, '--lang=zh-CN', url],
      { maxBuffer: 64 * 1024 * 1024, windowsHide: true },
      (err, stdout) => resolve(stdout || ''));
  });
}

// 待测源：国内 + 海外，覆盖社区/论坛/接单/UGC/赏金
const SITES = {
  // 国内社区
  'V2EX副业节点': 'https://www.v2ex.com/feed/sidehustle.json',
  'V2EX分享发现': 'https://www.v2ex.com/?tab=creative',
  '52pojie悬赏区': 'https://www.52pojie.cn/forum-8-1.html',
  '看雪': 'https://bbs.kanxue.com/',
  'linux.sb': 'https://linux.sb/',
  '2libra': 'https://2libra.com/',
  '豆瓣小组搜索': 'https://www.douban.com/group/search?cat=1013&q=' + encodeURIComponent('副业'),
  'B站搜索': 'https://search.bilibili.com/all?keyword=' + encodeURIComponent('副业'),
  '闲鱼搜索': 'https://www.goofish.com/',
  '猪八戒': 'https://www.zbj.com/',
  '程序员客栈': 'https://www.proginn.com/',
  '电鸭': 'https://eleduck.com/',
  '牛客': 'https://www.nowcoder.com/',
  '青团社': 'https://www.qtshe.com/',
  '三茅HR': 'https://www.hrloo.com/',
  '优设': 'https://www.uisdc.com/',
  '米画师': 'https://www.mihuashi.com/',
  '苦力怕论坛': 'https://klpbbs.com/',
  '爱发电': 'https://afdian.com/',
  'sillytaverncn': 'https://sillytaverncn.com/',
  'jiuguanhub': 'https://jiuguanhub.com/',
  'bar-ai': 'https://www.bar-ai.cn/',
  'v2exfuye存档': 'https://v2exfuye.com/',
  '特赞': 'https://www.tezign.com/',
  '法天使': 'https://www.fatianshi.cn/',
  'coconala日': 'https://coconala.com/',
  'workana拉美': 'https://www.workana.com/',
  'Gumroad': 'https://gumroad.com/',
  'RobloxCreate': 'https://create.roblox.com/',
  '漏洞盒子': 'https://www.vulbox.com/',
  '补天': 'https://www.butian.net/',
  'IndieHackers': 'https://www.indiehackers.com/',
  'ArcticShift': 'https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=sidehustle&limit=2',
  'HN-Algolia': 'https://hn.algolia.com/api/v1/search?query=side+hustle&hitsPerPage=2',
  'DataAnnotation': 'https://www.dataannotation.tech/',
  'Mercor': 'https://mercor.com/',
  'UserInterviews': 'https://www.userinterviews.com/',
  'Userlytics': 'https://www.userlytics.com/',
  'Clickworker': 'https://www.clickworker.com/',
  'Contra': 'https://contra.com/',
  'PeoplePerHour': 'https://www.peopleperhour.com/',
  'Appen': 'https://www.appen.com/',
  // 需 Chrome 的
  'Etsy': 'https://www.etsy.com/',
  'Upwork': 'https://www.upwork.com/',
  'ProductHunt': 'https://www.producthunt.com/',
  'Envato': 'https://author.envato.com/',
  'CreativeMarket': 'https://creativemarket.com/sell',
  'Patreon': 'https://www.patreon.com/',
  'NexusMods': 'https://www.nexusmods.com/',
  'Fiverr': 'https://www.fiverr.com/',
  'Dcard': 'https://www.dcard.tw/',
  'LINUXDO': 'https://linux.do/',
  '知乎': 'https://www.zhihu.com/billboard',
  '贴吧': 'https://tieba.baidu.com/f?kw=' + encodeURIComponent('副业'),
  'NGA': 'https://bbs.nga.cn/',
  'BOOTH': 'https://booth.pm/',
  '小红书': 'https://www.xiaohongshu.com/explore',
  'itch.io': 'https://itch.io/',
  'Reddit': 'https://www.reddit.com/r/sidehustle/',
  'Prolific': 'https://www.prolific.com/',
  'GooglePlay': 'https://play.google.com/store',
  'DuckDuckGo': 'https://html.duckduckgo.com/html/?q=test',
  'Google搜索': 'https://www.google.com/search?q=side+hustle',
  'Bing搜索': 'https://www.bing.com/search?q=side+hustle',
  'Wayback': 'https://web.archive.org/web/2026/https://www.reddit.com/r/sidehustle/',
};

const rows = [];
const names = Object.keys(SITES);
for (let i = 0; i < names.length; i++) {
  const k = names[i], u = SITES[k];
  const rec = { name: k, url: u, via: '', status: 0, len: 0, blocked: false, title: '' };
  try {
    const r = await get(u);
    rec.via = 'proxy'; rec.status = r.status; rec.len = r.body.length;
    const txt = gbk(r.body);
    rec.title = (/<title[^>]*>([\s\S]{2,80}?)<\/title>/i.exec(txt) || [])[1] || '';
    rec.blocked = /Just a moment|Attention Required|Access denied|403 Forbidden|are a robot|Checking your browser/i.test(txt);
    if (rec.status === 403 || rec.blocked) {
      const dom = await chrome(u);
      if (dom.length > 3000) {
        rec.via = 'chrome'; rec.len = dom.length;
        rec.title = (/<title[^>]*>([\s\S]{2,80}?)<\/title>/i.exec(dom) || [])[1] || '';
        rec.blocked = /Just a moment|Attention Required|Access denied|403 Forbidden|are a robot|Checking your browser|enable JavaScript/i.test(dom);
        rec.status = rec.blocked ? 403 : 200;
      }
    }
  } catch (e) {
    rec.via = 'fail'; rec.title = 'ERR ' + e.message.slice(0, 40);
  }
  rows.push(rec);
  fs.writeFileSync('_probe_all.json', JSON.stringify(rows, null, 1), 'utf8');
  const line = '[' + String(i + 1).padStart(2) + '/' + names.length + '] ' + k.padEnd(18) + ' ' + (rec.via || '?').padEnd(7) + ' ' + String(rec.status).padEnd(4) + ' ' + String(rec.len).padEnd(9) + ' ' + (rec.blocked ? 'BLOCKED' : 'OK') + '  ' + rec.title.slice(0, 50);
  console.log(line);
  await sleep(400);
}
console.log('PROBE-COMPLETE');
