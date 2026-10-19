import http from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);
const PROXY = { host: '127.0.0.1', port: 7897 };
const agent = new http.Agent({ keepAlive: true, maxSockets: 2 });
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

function hget(url, lang) {
  return new Promise((resolve) => {
    let done = false; let req = null;
    const fin = (v) => { if (done) return; done = true; try { if (req) req.destroy(); } catch (e) {} resolve(v); };
    const hard = setTimeout(() => fin({ status: -2, text: '', ms: 0 }), 25000);
    const t0 = Date.now();
    try {
      const pu = new URL(url);
      req = http.get({ agent, host: PROXY.host, port: PROXY.port, path: pu.pathname + pu.search, headers: { Host: pu.host, 'User-Agent': UA, 'Accept': 'text/html,*/*', 'Accept-Language': lang || 'en-US,en;q=0.9' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) { res.resume(); clearTimeout(hard); const n = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).href; done = true; return hget(n, lang).then(resolve); }
        const c = []; res.on('data', d => c.push(d));
        res.on('end', () => { clearTimeout(hard); fin({ status: res.statusCode, text: Buffer.concat(c).toString('utf8'), ms: Date.now() - t0 }); });
        res.on('error', () => fin({ status: -1, text: '', ms: Date.now() - t0 }));
      });
      req.on('error', () => { clearTimeout(hard); fin({ status: -1, text: '', ms: Date.now() - t0 }); });
    } catch (e) { clearTimeout(hard); fin({ status: -3, text: '', ms: 0 }); }
  });
}

async function cget(url, lang) {
  const t0 = Date.now();
  try {
    const args = ['-sL', '-x', 'http://127.0.0.1:7897', '-H', 'User-Agent: ' + UA, '-H', 'Accept: text/html,*/*', '-H', 'Accept-Language: ' + (lang || 'en-US,en;q=0.9'), '--max-time', '30', url];
    const { stdout } = await execFileAsync('curl', args, { maxBuffer: 64 * 1024 * 1024, windowsHide: true });
    return { status: stdout && stdout.length > 3000 ? 200 : -1, text: stdout || '', ms: Date.now() - t0 };
  } catch (e) { return { status: -1, text: '', ms: Date.now() - t0 }; }
}

function hosts(html) {
  const s = new Set();
  for (const m of (html||'').matchAll(/href="(https?:\/\/[^"]+)"/g)) { try { s.add(new URL(m[1]).hostname.replace(/^www\./, '')); } catch (e) {} }
  for (const m of (html||'').matchAll(/[?&]url=([^&"']+)/g)) { try { s.add(new URL(decodeURIComponent(m[1])).hostname.replace(/^www\./, '')); } catch (e) {} }
  return s;
}
const SELF = /(yahoo\.co\.jp|yahoo\.com|yimg|lycorp|brave\.com|brave\.app|seznam\.cz|naver\.com|sm\.cn|marginalia|wiby\.me|searchmysite|bing\.com|microsoft|google|yandex|baidu|sogou|so\.com|qwant|duckduckgo)/i;

const ENGINES = [
  ['Yahoo Japan', 'https://search.yahoo.co.jp/search?p=', 'ja', 'h'],
  ['Brave', 'https://search.brave.com/search?q=', 'en', 'c'],
  ['Bing 国际', 'https://www.bing.com/search?q=', 'en', 'h'],
  ['Naver', 'https://search.naver.com/search.naver?query=', 'ko', 'h'],
  ['Seznam', 'https://search.seznam.cz/?q=', 'cs', 'h'],
  ['SearchMySite', 'https://searchmysite.net/search/?q=', 'en', 'h'],
  ['Wiby', 'https://wiby.me/?q=', 'en', 'h'],
  ['Marginalia', 'https://old-search.marginalia.nu/search?query=', 'en', 'h'],
  ['神马', 'https://m.sm.cn/s?q=', 'zh-CN', 'h']
];

const Q = 'freelance marketplace platforms';
const EQ = encodeURIComponent(Q);
const results = [];
for (const [name, base, lang, mode] of ENGINES) {
  const url = base + EQ;
  const r = mode === 'c' ? await cget(url, lang) : await hget(url, lang);
  const all = [...hosts(r.text)];
  const clean = all.filter(h => !SELF.test(h) && h.includes('.') && !/^[0-9]/.test(h));
  results.push({ name, status: r.status, ms: r.ms, raw: all.length, clean: clean.length, sample: clean.slice(0, 5) });
  console.log((clean.length >= 5 ? 'GOOD ' : clean.length > 0 ? 'weak ' : 'FAIL ') + name + ' status=' + r.status + ' ' + r.ms + 'ms clean=' + clean.length);
}
console.log('');
console.log(JSON.stringify(results, null, 1));