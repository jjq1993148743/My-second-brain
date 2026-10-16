/**
 * Reddit 副业社区存档抓取（赶在 2026-11-13 RSS 关闭前）
 *
 * 用法：node reddit-archive.mjs [输出目录]
 * 特点：
 *  - 每个 sub 间隔 100 秒（规避 429）
 *  - 遇 429 自动退避重试
 *  - 增量写入，中断不丢已抓内容
 *  - 输出 Markdown，按 sub 分节
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PROXY = { host: '127.0.0.1', port: 7897 };
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36';
const OUT_DIR = process.argv[2] || 'C:/Users/jjq21/Desktop/github/My-second-brain/40-产出/情报/reddit存档';
const OUT_FILE = path.join(OUT_DIR, 'reddit副业存档.md');

// 抓取目标：副业 / 独立开发 / 变现相关
const SUBS = [
  'sidehustle', 'beermoney', 'microsaas', 'juststart', 'indiehackers',
  'EntrepreneurRideAlong', 'Entrepreneur', 'SaaS', 'passive_income',
  'selfhosted', 'n8n', 'AI_Agents',
];

function get(url, accept) {
  return new Promise((resolve, reject) => {
    const pu = new URL(url);
    http.get({
      host: PROXY.host, port: PROXY.port, path: url,
      headers: { Host: pu.host, 'User-Agent': UA, Accept: accept || 'application/rss+xml' },
    }, (res) => {
      const c = [];
      res.on('data', d => c.push(d));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(c).toString('utf8') }));
    }).on('error', reject);
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

function clean(s) {
  return String(s || '')
    .replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&#39;/g, String.fromCharCode(39)).replace(/&quot;/g, String.fromCharCode(34)).replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function getWithRetry(url, maxTries = 4) {
  let wait = 60000;
  for (let t = 1; t <= maxTries; t++) {
    const r = await get(url);
    if (r.status === 200 && r.body.length > 1000) return r;
    console.log('    尝试 ' + t + '/' + maxTries + ' 失败 (status ' + r.status + ')，等待 ' + Math.round(wait / 1000) + 's');
    await sleep(wait);
    wait *= 2;
  }
  return null;
}

function parseEntries(xml) {
  const out = [];
  for (const e of xml.split('<entry>').slice(1)) {
    const t = /<title>([\s\S]*?)<\/title>/.exec(e);
    const ct = /<content type="html">([\s\S]*?)<\/content>/.exec(e);
    const l = /<link href="([^"]+)"/.exec(e);
    const u = /<updated>([^<]+)</.exec(e);
    const a = /<name>([\s\S]*?)<\/name>/.exec(e);
    out.push({
      title: clean(t ? t[1] : '?'),
      body: clean(ct ? ct[1] : ''),
      url: l ? l[1] : '',
      date: u ? u[1].slice(0, 10) : '',
      author: clean(a ? a[1] : ''),
    });
  }
  return out;
}

// ── 主流程 ──────────────────────────────────────────────
fs.mkdirSync(OUT_DIR, { recursive: true });

const header = [
  '# Reddit 副业社区存档',
  '',
  '> 抓取时间：' + new Date().toISOString().slice(0, 19).replace('T', ' ') + '（UTC）',
  '> 来源：Reddit RSS /r/<sub>/top/.rss?t=year',
  '> **⚠️ Reddit RSS 将于 2026-11-13 关闭，这是关闭前的存档。**',
  '> 每个 sub 取 top/year 25 条，含标题、日期、作者、正文全文。',
  '',
  '---',
  '',
].join('\n');

let archive = header;
fs.writeFileSync(OUT_FILE, archive, 'utf8');

let total = 0;
for (let i = 0; i < SUBS.length; i++) {
  const sub = SUBS[i];
  console.log('[' + (i + 1) + '/' + SUBS.length + '] r/' + sub);
  if (i > 0) await sleep(100000);

  const r = await getWithRetry('https://www.reddit.com/r/' + sub + '/top/.rss?t=year');
  if (!r) {
    archive += '\n## r/' + sub + '\n\n（抓取失败，已跳过）\n';
    fs.writeFileSync(OUT_FILE, archive, 'utf8');
    continue;
  }

  const entries = parseEntries(r.body);
  archive += '\n## r/' + sub + '（' + entries.length + ' 条）\n\n';
  for (const e of entries) {
    archive += '### ' + e.title + '\n\n';
    archive += '- 日期：' + e.date + '\n';
    if (e.author) archive += '- 作者：u/' + e.author + '\n';
    if (e.url) archive += '- 链接：' + e.url + '\n';
    archive += '\n' + e.body + '\n\n';
    total++;
  }
  archive += '\n---\n';
  fs.writeFileSync(OUT_FILE, archive, 'utf8');
  console.log('    已存 ' + entries.length + ' 条，累计 ' + total);
}

archive += '\n**存档完成，共 ' + total + ' 条。**\n';
fs.writeFileSync(OUT_FILE, archive, 'utf8');
console.log('DONE 共 ' + total + ' 条 -> ' + OUT_FILE);