import http from 'node:http';
import fs from 'node:fs';
const PROXY = { host: '127.0.0.1', port: 7897 };
const agent = new http.Agent({ keepAlive: true, maxSockets: 3 });
function get(url) {
  return new Promise((resolve) => {
    let done = false; let req = null;
    const fin = (v) => { if (done) return; done = true; try { if (req) req.destroy(); } catch (e) {} resolve(v); };
    const hard = setTimeout(() => fin({ status: -2, text: '' }), 20000);
    try {
      const pu = new URL(url);
      req = http.get({ agent, host: PROXY.host, port: PROXY.port, path: url, headers: { Host: pu.host, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'Accept': 'text/html,*/*', 'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) { res.resume(); clearTimeout(hard); const n = res.headers.location.startsWith('http') ? res.headers.location : 'https://' + pu.host + res.headers.location; done = true; return get(n).then(resolve); }
        const c = []; res.on('data', d => c.push(d));
        res.on('end', () => { clearTimeout(hard); fin({ status: res.statusCode, text: Buffer.concat(c).toString('utf8') }); });
        res.on('error', () => fin({ status: -1, text: '' }));
      });
      req.on('error', () => { clearTimeout(hard); fin({ status: -1, text: '' }); });
    } catch (e) { clearTimeout(hard); fin({ status: -3, text: '' }); }
  });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const Q = 'best freelance platforms 2026';
const EQ = encodeURIComponent(Q);
const engines = [
  ['bing', 'https://www.bing.com/search?q=' + EQ, /<h2><a href="(https?:[^"]+)"/g],
  ['marginalia', 'https://search.marginalia.nu/search?query=' + EQ, /<a[^>]+href="(https?:\/\/[^"]+)"[^>]*class="[^"]*title/g],
  ['qwant', 'https://www.qwant.com/?q=' + EQ + '&t=web', /"url":"(https?:\/\/[^"]+)"/g],
  ['baidu', 'https://www.baidu.com/s?wd=' + EQ, /href="(http:\/\/www\.baidu\.com\/link\?url=[^"]+)"/g],
  ['sogou', 'https://www.sogou.com/web?query=' + EQ, /href="(http[s]?:\/\/[^"]+)"/g],
  ['so360', 'https://www.so.com/s?q=' + EQ, /href="(https?:\/\/[^"]+)"/g],
  ['bingcn', 'https://cn.bing.com/search?q=' + EQ, /<h2><a href="(https?:[^"]+)"/g]
];
const out = {};
for (const [name, url, re] of engines) {
  const r = await get(url);
  const found = [];
  if (r.text) { let m; re.lastIndex = 0; while ((m = re.exec(r.text)) !== null && found.length < 200) found.push(m[1]); }
  const hosts = new Set();
  for (const u of found) { try { hosts.add(new URL(u).hostname.replace(/^www\./, '')); } catch (e) {} }
  out[name] = { status: r.status, rawLinks: found.length, uniqueHosts: hosts.size, sample: [...hosts].slice(0, 8) };
  console.log(name + ' status=' + r.status + ' links=' + found.length + ' hosts=' + hosts.size);
  await sleep(1500);
}
fs.writeFileSync('_engines_parse.json', JSON.stringify(out, null, 1), 'utf8');