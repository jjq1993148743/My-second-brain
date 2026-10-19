import http from 'node:http';
const PROXY = { host: '127.0.0.1', port: 7897 };
const agent = new http.Agent({ keepAlive: true, maxSockets: 4 });
function get(url) {
  return new Promise((resolve) => {
    let done = false; let req = null;
    const fin = (v) => { if (done) return; done = true; try { if (req) req.destroy(); } catch (e) {} resolve(v); };
    const hard = setTimeout(() => fin({ status: -2, len: 0, text: '' }), 20000);
    try {
      const pu = new URL(url);
      req = http.get({ agent, host: PROXY.host, port: PROXY.port, path: url, headers: { Host: pu.host, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'Accept': 'text/html,application/xhtml+xml,application/json,*/*', 'Accept-Language': 'en-US,en;q=0.9' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) { res.resume(); clearTimeout(hard); const n = res.headers.location.startsWith('http') ? res.headers.location : 'https://' + pu.host + res.headers.location; done = true; return get(n).then(resolve); }
        const c = []; res.on('data', d => c.push(d));
        res.on('end', () => { clearTimeout(hard); const t = Buffer.concat(c).toString('utf8'); fin({ status: res.statusCode, len: t.length, text: t }); });
        res.on('error', () => fin({ status: -1, len: 0, text: '' }));
      });
      req.on('error', () => { clearTimeout(hard); fin({ status: -1, len: 0, text: '' }); });
    } catch (e) { clearTimeout(hard); fin({ status: -3, len: 0, text: '' }); }
  });
}
const Q = 'freelance+platform';
const engines = [
  ['Bing', 'https://www.bing.com/search?q=' + Q],
  ['Google', 'https://www.google.com/search?q=' + Q],
  ['DuckDuckGo-lite', 'https://lite.duckduckgo.com/lite/?q=' + Q],
  ['DuckDuckGo-html', 'https://html.duckduckgo.com/html/?q=' + Q],
  ['Brave', 'https://search.brave.com/search?q=' + Q],
  ['Startpage', 'https://www.startpage.com/sp/search?query=' + Q],
  ['Mojeek', 'https://www.mojeek.com/search?q=' + Q],
  ['Marginalia', 'https://search.marginalia.nu/search?query=' + Q],
  ['Yandex', 'https://yandex.com/search/?text=' + Q],
  ['Ecosia', 'https://www.ecosia.org/search?q=' + Q],
  ['Qwant', 'https://www.qwant.com/?q=' + Q],
  ['Searx-be', 'https://searx.be/search?q=' + Q + '&format=json'],
  ['Searx-priv', 'https://priv.au/search?q=' + Q],
  ['Yep', 'https://yep.com/web?q=' + Q],
  ['Stract', 'https://stract.com/search?q=' + Q],
  ['Wiby', 'https://wiby.me/?q=' + Q],
  ['Baidu', 'https://www.baidu.com/s?wd=' + Q],
  ['Sogou', 'https://www.sogou.com/web?query=' + Q],
  ['360', 'https://www.so.com/s?q=' + Q],
  ['Bing-CN', 'https://cn.bing.com/search?q=' + Q]
];
const out = [];
for (const [name, url] of engines) {
  const r = await get(url);
  const blocked = /captcha|are you a robot|unusual traffic|verify you are human|cf-browser-verification|Just a moment|enable JavaScript|Access Denied|403 Forbidden/i.test(r.text || '');
  const hasResults = /<h2|<div class="result|result__a|class="result|serp-item|b_algo/i.test(r.text || '');
  out.push({ name, status: r.status, len: r.len, blocked, hasResults, usable: r.status === 200 && !blocked && hasResults && r.len > 3000 });
  console.log((out[out.length-1].usable ? 'USABLE ' : 'no     ') + name + ' status=' + r.status + ' len=' + r.len + (blocked ? ' BLOCKED' : '') + (hasResults ? ' results' : ''));
}
fs.writeFileSync('_engines_test.json', JSON.stringify(out, null, 1), 'utf8');
console.log('USABLE=' + out.filter(x => x.usable).length + '/' + out.length);