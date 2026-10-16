#!/usr/bin/env node
/**
 * 多源赚钱情报抓取器
 *
 * 用法：
 *   node intel.mjs              # 全部源，输出最近的关键条目
 *   node intel.mjs reddit       # 只跑 Reddit
 *   node intel.mjs bounty       # 只跑 GitHub 赏金
 *   node intel.mjs v2ex         # 只跑 V2EX 副业节点
 *
 * 设计要点：
 * - Reddit 限流严格（429），每个 sub 间隔必须 >=100 秒
 * - 本机需代理 127.0.0.1:7897（换环境改 PROXY）
 * - 输出到 stdout，可重定向到文件
 */
import http from 'node:http';
import fs from 'node:fs';

const PROXY = { host: '127.0.0.1', port: 7897 };
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36';

// ── 抓取原语 ─────────────────────────────────────────────
function get(url, accept = 'application/json') {
  return new Promise((resolve, reject) => {
    const pu = new URL(url);
    http.get({
      host: PROXY.host, port: PROXY.port, path: url,
      headers: { Host: pu.host, 'User-Agent': UA, Accept: accept },
    }, (res) => {
      const c = [];
      res.on('data', d => c.push(d));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(c).toString('utf8') }));
    }).on('error', reject);
  });
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function clean(s) {
  return String(s || '')
    .replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '')  // hnrss 的 title 在 CDATA 里
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// 金额与周期提取
const MONEY = /(\$|¥|€|£)?\s?(\d+(?:\.\d+)?)\s*(k|K|万|千|w|W|元|块|刀|美金|美元|MRR|ARR)?/g;
const TIME = /(\d+(?:\.\d+)?)\s*(小时|天|周|个月|月|年|hours?|days?|weeks?|months?|years?)/gi;
const HUSTLE = /(\$\d|MRR|ARR|revenue|profit|earn|income|made \$|side hustle|side project|monthly|automate|hours per week|manual|boring|scrape|bounty)/i;

function extract(body) {
  const money = [...new Set([...body.matchAll(MONEY)].filter(m => m[1] || m[3]).map(m => (m[1] || '') + m[2] + (m[3] || '')))];
  const time = [...new Set([...body.matchAll(TIME)].map(m => m[1] + m[2]))];
  return { money: money.slice(0, 8), time: time.slice(0, 5) };
}

// ── 源 1：V2EX 副业节点（JSON Feed，一次 50 条带正文）──────
async function v2ex() {
  const out = ['\n══════ V2EX 副业节点 ══════'];
  const r = await get('https://www.v2ex.com/feed/sidehustle.json');
  if (r.status !== 200) { out.push('  失败: ' + r.status); return out; }
  const j = JSON.parse(r.body);
  const items = j.items || [];
  out.push('  条目: ' + items.length);
  for (const it of items.slice(0, 20)) {
    const id = (it.url || '').split('/t/')[1] || '?';
    const date = (it.date_published || '').slice(0, 10);
    const body = clean(it.content_html || it.content_text || '');
    const { money, time } = extract(body);
    out.push('  [' + date + '] ' + (it.title || ''));
    if (money.length) out.push('      金额: ' + money.join(' / '));
    if (time.length) out.push('      周期: ' + time.join(' / '));
    out.push('      https://www.v2ex.com/t/' + id);
  }
  return out;
}

// ── 源 2：Reddit（RSS，需 100 秒间隔）────────────────────
const SUBS = ['sidehustle', 'beermoney', 'microsaas', 'juststart', 'indiehackers', 'EntrepreneurRideAlong'];

async function reddit(only) {
  const out = [];
  // ⚠️ Reddit 将于 2026-11-13 关闭 RSS，之后此源失效
  if (new Date() >= new Date('2026-11-13')) {
    out.push('\n⚠️ Reddit RSS 已于 2026-11-13 关闭，此源已失效。改用 v2ex / ph / hn 源。');
    return out;
  }
  const daysLeft = Math.ceil((new Date('2026-11-13') - new Date()) / 86400000);
  out.push('\n⚠️ Reddit RSS 还有 ' + daysLeft + ' 天关闭（2026-11-13），届时此源失效');
  const subs = only ? [only] : SUBS;
  for (let i = 0; i < subs.length; i++) {
    const s = subs[i];
    if (i > 0) { out.push('  (等待 100 秒规避限流...)'); await sleep(100000); }
    try {
      const r = await get('https://www.reddit.com/r/' + s + '/top/.rss?t=year', 'application/rss+xml');
      out.push('\n══════ r/' + s + ' (' + r.status + ') ══════');
      if (r.status !== 200) continue;
      const entries = r.body.split('<entry>').slice(1);
      for (const e of entries) {
        const t = /<title>([\s\S]*?)<\/title>/.exec(e);
        const ct = /<content type="html">([\s\S]*?)<\/content>/.exec(e);
        const title = t ? clean(t[1]) : '?';
        const body = ct ? clean(ct[1]) : '';
        if (!HUSTLE.test(title + ' ' + body)) continue;
        const { money } = extract(body);
        out.push('  • ' + title);
        if (money.length) out.push('      金额: ' + money.join(' / '));
        out.push('      ' + body.slice(0, 200));
      }
    } catch (err) {
      out.push('r/' + s + ' 错误: ' + err.message);
    }
  }
  return out;
}

// ── 源 5：Hacker News Show（hnrss，>=100 分）─────────────
async function hackernews() {
  const out = ['\n══════ Hacker News Show (>=100pts) ══════'];
  const r = await get('https://hnrss.org/show?points=100', 'application/rss+xml');
  if (r.status !== 200) { out.push('  失败: ' + r.status); return out; }
  // 注意：hnrss 的 title 在 CDATA 里，必须先剥掉
  const items = r.body.split('<item>').slice(1);
  out.push('  条目: ' + items.length);
  for (const it of items) {
    const t = /<title>([\s\S]*?)<\/title>/.exec(it);
    const l = /<link>([\s\S]*?)<\/link>/.exec(it);
    const d = /<pubDate>([^<]+)</.exec(it);
    const title = clean(t ? t[1] : '?');
    out.push('  • ' + title);
    if (d) out.push('      ' + d[1].slice(0, 16));
    if (l) out.push('      ' + clean(l[1]));
  }
  return out;
}

// ── 源 4：Product Hunt（Atom feed，50 条当日产品）────────
async function producthunt() {
  const out = ['\n══════ Product Hunt 当日 (Atom) ══════'];
  const r = await get('https://www.producthunt.com/feed', 'application/atom+xml');
  if (r.status !== 200) { out.push('  失败: ' + r.status); return out; }
  const entries = r.body.split('<entry>').slice(1);
  out.push('  条目: ' + entries.length);
  // 统计赛道拥挤度
  const cats = {
    'AI coding / 开发工具': /coding agent|code review|developer|IDE|pull request|NestJS|observability|sandbox/i,
    'Agent 基础设施': /agent memory|agent|approval layer|mcp|runtime/i,
    'AI 视频/语音': /video|voice|audio|lip sync|speech/i,
    '垂直行业工具': /legal|contract|compliance|home|family|document|translate|health/i,
  };
  const counts = {};
  const hits = [];
  for (const e of entries) {
    const t = /<title[^>]*>([\s\S]*?)<\/title>/.exec(e);
    const ct = /<content[^>]*>([\s\S]*?)<\/content>/.exec(e);
    const l = /<link[^>]*href="([^"]+)"/.exec(e);
    const title = clean(t ? t[1] : '?');
    const body = clean(ct ? ct[1] : '');
    for (const [k, re] of Object.entries(cats)) {
      if (re.test(title + ' ' + body)) counts[k] = (counts[k] || 0) + 1;
    }
    if (l) hits.push({ title, url: l[1], body });
  }
  out.push('  赛道拥挤度（命中数）:');
  for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
    out.push('      ' + k + ': ' + v);
  }
  out.push('  当日产品:');
  for (const h of hits.slice(0, 25)) {
    out.push('      • ' + h.title + ' — ' + h.body.slice(0, 80));
  }
  return out;
}

// ── 源 3：GitHub 赏金（Algora 标签）──────────────────────
async function bounty() {
  const out = ['\n══════ GitHub 赏金 (💎 Bounty) ══════'];
  const q = 'https://api.github.com/search/issues?q=' + encodeURIComponent('is:open label:"💎 Bounty"') + '&sort=created&order=desc&per_page=50';
  const r = await get(q, 'application/vnd.github+json');
  if (r.status !== 200) { out.push('  失败: ' + r.status); return out; }
  const j = JSON.parse(r.body);
  out.push('  open 总数: ' + j.total_count);
  const byRepo = {};
  for (const it of j.items) {
    const repo = it.repository_url.split('/repos/')[1];
    (byRepo[repo] = byRepo[repo] || []).push(it);
  }
  const sorted = Object.entries(byRepo).sort((a, b) => b[1].length - a[1].length);
  for (const [repo, items] of sorted) {
    out.push('  [' + items.length + ' 个] ' + repo);
    for (const it of items.slice(0, 3)) {
      out.push('      #' + it.number + ' (' + it.comments + '评) ' + it.title.slice(0, 95));
    }
  }
  return out;
}

// ── 主流程 ──────────────────────────────────────────────
const arg = process.argv[2];
const out = [];
const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
out.push('# 赚钱情报 · ' + now);

try {
  if (!arg || arg === 'v2ex') out.push(...(await v2ex()));
  if (!arg || arg === 'bounty') out.push(...(await bounty()));
  if (!arg || arg === 'ph') out.push(...(await producthunt()));
  if (!arg || arg === 'hn') out.push(...(await hackernews()));
  if (!arg || arg === 'reddit') out.push(...(await reddit()));
  else if (SUBS.includes(arg)) out.push(...(await reddit(arg)));
} catch (err) {
  out.push('致命错误: ' + err.message);
}

const text = out.join('\n');
console.log(text);
// 同时存档
const dir = 'C:/Users/jjq21/Desktop/github/My-second-brain/40-产出/情报';
try {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dir + '/' + new Date().toISOString().slice(0, 10) + '.md', text);
  console.log('\n[已存档到 40-产出/情报/]');
} catch { /* 目录不可写则忽略 */ }
