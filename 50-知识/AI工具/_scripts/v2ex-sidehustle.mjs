/**
 * V2EX 副业节点情报抓取
 * 用法：node v2ex-sidehustle.mjs [关键词]
 * 不带参数：输出最新 50 条标题 + 收入数字提取
 * 带关键词：只输出标题或正文命中关键词的
 */
import http from 'node:http';

const PROXY = { host: '127.0.0.1', port: 7897 };
const FEED = 'https://www.v2ex.com/feed/sidehustle.json';

// 收入数字提取：匹配 万/千/k/K/w/W/元/块/刀/美金/$/¥ 等
const MONEY = /(\d+(?:\.\d+)?)\s*(万|千|k|K|w|W|元|块|刀|美金|美元|\$|¥|欧元)/g;
// 时间投入：小时/天/月/年
const TIME = /(\d+(?:\.\d+)?)\s*(小时|天|个月|月|年|周)/g;

function fetchFeed() {
  return new Promise((resolve, reject) => {
    const u = new URL(FEED);
    http.get({
      host: PROXY.host, port: PROXY.port, path: FEED,
      headers: { Host: u.host, 'User-Agent': 'Mozilla/5.0 Chrome/155' }
    }, (res) => {
      const c = [];
      res.on('data', d => c.push(d));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(c).toString('utf8'))); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function strip(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/&ldquo;|&rdquo;/g, '"').replace(/&hellip;/g, '...')
    .replace(/\s+/g, ' ').trim();
}

function uniq(arr) { return [...new Set(arr)]; }

const kw = process.argv[2];
const feed = await fetchFeed();
const items = feed.items || [];

console.log('=== V2EX 副业节点 · ' + items.length + ' 条 · ' + new Date().toISOString().slice(0, 16) + ' ===\n');

let shown = 0;
for (const it of items) {
  const id = (it.url || '').split('/t/')[1] || '?';
  const date = (it.date_published || '').slice(0, 10);
  const title = it.title || '';
  const body = strip(it.content_html || it.content_text || '');

  if (kw) {
    const hay = (title + ' ' + body).toLowerCase();
    if (!hay.includes(kw.toLowerCase())) continue;
  }

  const money = uniq([...body.matchAll(MONEY)].map(m => m[1] + m[2]));
  const time = uniq([...body.matchAll(TIME)].map(m => m[1] + m[2]));

  console.log('[' + date + '] #' + id + '  ' + title);
  if (money.length) console.log('   金额: ' + money.slice(0, 8).join(' / '));
  if (time.length) console.log('   周期: ' + time.slice(0, 6).join(' / '));
  console.log('   https://www.v2ex.com/t/' + id);
  console.log('   ' + body.slice(0, 220));
  console.log('');
  shown++;
  if (!kw && shown >= 25) break;
}
console.log('--- 命中 ' + shown + ' 条 ---');
