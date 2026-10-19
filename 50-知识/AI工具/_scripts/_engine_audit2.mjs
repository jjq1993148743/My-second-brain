import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

async function cget(url, lang) {
  const t0 = Date.now();
  try {
    const args = ['-sL', '-x', 'http://127.0.0.1:7897', '-H', 'User-Agent: ' + UA, '-H', 'Accept: text/html,application/xhtml+xml,*/*', '-H', 'Accept-Language: ' + (lang || 'en-US,en;q=0.9'), '--max-time', '35', url];
    const { stdout } = await execFileAsync('curl', args, { maxBuffer: 64 * 1024 * 1024, windowsHide: true });
    return { status: stdout && stdout.length > 2000 ? 200 : -1, text: stdout || '', ms: Date.now() - t0 };
  } catch (e) { return { status: -1, text: '', ms: Date.now() - t0 }; }
}

function hosts(html) {
  const s = new Set();
  for (const m of (html||'').matchAll(/href="(https?:\/\/[^"]+)"/g)) { try { s.add(new URL(m[1]).hostname.replace(/^www\./, '')); } catch (e) {} }
  for (const m of (html||'').matchAll(/[?&]url=([^&"']+)/g)) { try { s.add(new URL(decodeURIComponent(m[1])).hostname.replace(/^www\./, '')); } catch (e) {} }
  return s;
}
const SELF = /(yahoo\.co\.jp|yahoo\.com|yimg|lycorp|brave\.com|brave\.app|seznam\.cz|naver\.com|naver\.net|sm\.cn|marginalia|wiby\.me|searchmysite|bing\.com|microsoft|msn\.com|google|gstatic|yandex|baidu|sogou|so\.com|qwant|duckduckgo|w3\.org|schema\.org|creativecommons)/i;

const ENGINES = [
  ['Yahoo Japan', 'https://search.yahoo.co.jp/search?p=', 'ja'],
  ['Brave', 'https://search.brave.com/search?q=', 'en'],
  ['Bing 国际', 'https://www.bing.com/search?q=%s&setlang=en&cc=us', 'en'],
  ['Naver', 'https://search.naver.com/search.naver?query=', 'ko'],
  ['Seznam', 'https://search.seznam.cz/?q=', 'cs'],
  ['SearchMySite', 'https://searchmysite.net/search/?q=', 'en'],
  ['Wiby', 'https://wiby.me/?q=', 'en'],
  ['Marginalia', 'https://old-search.marginalia.nu/search?query=', 'en'],
  ['神马', 'https://m.sm.cn/s?q=', 'zh-CN'],
  ['DuckDuckGo lite', 'https://lite.duckduckgo.com/lite/?q=', 'en'],
  ['Mojeek', 'https://www.mojeek.com/search?q=', 'en'],
  ['Startpage', 'https://www.startpage.com/sp/search?query=', 'en']
];

const Q = 'freelance marketplace platform';
const EQ = encodeURIComponent(Q);
const results = [];
for (const [name, tpl, lang] of ENGINES) {
  const url = tpl.includes('%s') ? tpl.replace('%s', EQ) : tpl + EQ;
  const r = await cget(url, lang);
  const all = [...hosts(r.text)];
  const clean = all.filter(h => !SELF.test(h) && h.includes('.') && !/^[0-9]/.test(h));
  results.push({ name, url, status: r.status, ms: r.ms, clean: clean.length, sample: clean.slice(0, 6) });
  console.log((clean.length >= 5 ? 'GOOD ' : clean.length > 0 ? 'weak ' : 'FAIL ') + name + ' ' + r.ms + 'ms clean=' + clean.length);
  await new Promise(res => setTimeout(res, 2500));
}
console.log('');
console.log(JSON.stringify(results.map(r => ({ n: r.name, s: r.status, ms: r.ms, c: r.clean, ex: r.sample })), null, 1));