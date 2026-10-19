// search-multi.mjs —— 多引擎轮换搜索（2026-10-19 实测可用，共 6 个稳定引擎）
// 用法：
//   node search-multi.mjs "查询词"                 默认轮换全部引擎
//   node search-multi.mjs "查询词" --engine=naver   指定单个引擎
//   node search-multi.mjs "查询词" --json           只输出 JSON
// 关键：必须用 curl 走代理 127.0.0.1:7897，Node 的 http/fetch 会被指纹识别拦掉。
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const PROXY = 'http://127.0.0.1:7897';

// 每个引擎：名称、URL 模板、语言、自身域名正则（用于排除）
export const ENGINES = {
  naver:        { url: 'https://search.naver.com/search.naver?query=', lang: 'ko',    self: /(naver|pstatic|nid\.naver)/i,        note: '韩国，返回最多' },
  bing:         { url: 'https://www.bing.com/search?q=%s&setlang=en&cc=us', lang: 'en', self: /(bing\.com|microsoft|msn\.com)/i,   note: '国际版，中文IP会退化成中文结果' },
  searchmysite: { url: 'https://searchmysite.net/search/?q=', lang: 'en',          self: /(searchmysite)/i,                    note: '独立站/个人博客索引' },
  shenma:       { url: 'https://m.sm.cn/s?q=', lang: 'zh-CN',                       self: /(sm\.cn|uc\.cn|ucweb)/i,             note: '神马（国内移动）' },
  seznam:       { url: 'https://search.seznam.cz/?q=', lang: 'cs',                  self: /(seznam|szn\.cz)/i,                  note: '捷克，欧洲视角' },
  wiby:         { url: 'https://wiby.me/?q=', lang: 'en',                           self: /(wiby\.me)/i,                        note: '独立小站，无算法' },
  // 以下三个不稳定，默认不参与轮换，可用 --engine= 指定
  yahoojp:      { url: 'https://search.yahoo.co.jp/search?p=', lang: 'ja',          self: /(yahoo|yimg|lycorp|lycbiz)/i,         note: '会快速软限流，需慢速', unstable: true },
  mojeek:       { url: 'https://www.mojeek.com/search?q=', lang: 'en',              self: /(mojeek)/i,                           note: '结果少但真实', unstable: true },
  brave:        { url: 'https://search.brave.com/search?q=', lang: 'en',            self: /(brave\.com|brave\.app)/i,            note: '容易被限流', unstable: true }
};

const COMMON_JUNK = /(google|gstatic|w3\.org|schema\.org|creativecommons|facebook\.com|twitter\.com|x\.com|instagram|linkedin\.com|youtube\.com|youtu\.be|wikipedia\.org|imgur|gravatar)$/i;

async function curlGet(url, lang) {
  const args = ['-sL', '-x', PROXY, '-H', 'User-Agent: ' + UA, '-H', 'Accept: text/html,application/xhtml+xml,*/*', '-H', 'Accept-Language: ' + (lang || 'en-US,en;q=0.9'), '--max-time', '35', url];
  try {
    const { stdout } = await execFileAsync('curl', args, { maxBuffer: 64 * 1024 * 1024, windowsHide: true });
    return stdout || '';
  } catch (e) { return ''; }
}

function extractHosts(html, selfRe) {
  const s = new Set();
  for (const m of (html || '').matchAll(/href="(https?:\/\/[^"]+)"/g)) {
    try { const h = new URL(m[1]).hostname.replace(/^www\./, '').toLowerCase(); if (h.includes('.')) s.add(h); } catch (e) {}
  }
  // yahoo 等用 ?url= 包裹真实链接
  for (const m of (html || '').matchAll(/[?&]url=([^&"']+)/g)) {
    try { const h = new URL(decodeURIComponent(m[1])).hostname.replace(/^www\./, '').toLowerCase(); if (h.includes('.')) s.add(h); } catch (e) {}
  }
  return [...s].filter(h => !selfRe.test(h) && !COMMON_JUNK.test(h) && !/^[0-9]/.test(h));
}

export async function searchOne(engineName, query) {
  const e = ENGINES[engineName];
  if (!e) throw new Error('unknown engine: ' + engineName);
  const eq = encodeURIComponent(query);
  const url = e.url.includes('%s') ? e.url.replace('%s', eq) : e.url + eq;
  const html = await curlGet(url, e.lang);
  const hosts = extractHosts(html, e.self);
  return { engine: engineName, query, url, bytes: html.length, hosts, count: hosts.length };
}

export async function searchAll(query, opts) {
  opts = opts || {};
  const names = opts.only ? [opts.only] : Object.keys(ENGINES).filter(k => !ENGINES[k].unstable);
  const gap = opts.gap || 4000;
  const out = [];
  for (let i = 0; i < names.length; i++) {
    const r = await searchOne(names[i], query);
    out.push(r);
    if (i < names.length - 1) await new Promise(res => setTimeout(res, gap));
  }
  const merged = new Set();
  for (const r of out) r.hosts.forEach(h => merged.add(h));
  return { query, results: out, mergedHosts: [...merged], total: merged.size };
}

// CLI
const isMain = process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('search-multi.mjs');
if (isMain) {
  const args = process.argv.slice(2);
  const query = args.find(a => !a.startsWith('--'));
  if (!query) { console.log('用法: node search-multi.mjs "查询词" [--engine=naver] [--json] [--gap=4000]'); process.exit(1); }
  const engineArg = (args.find(a => a.startsWith('--engine=')) || '').split('=')[1];
  const gapArg = (args.find(a => a.startsWith('--gap=')) || '').split('=')[1];
  const jsonOnly = args.includes('--json');
  const r = await searchAll(query, { only: engineArg, gap: gapArg ? parseInt(gapArg) : 4000 });
  if (jsonOnly) { console.log(JSON.stringify(r, null, 1)); }
  else {
    for (const x of r.results) console.log('[' + x.engine + '] ' + x.count + ' hosts');
    console.log('');
    console.log('合并去重: ' + r.total);
    for (const h of r.mergedHosts) console.log('  ' + h);
  }
}