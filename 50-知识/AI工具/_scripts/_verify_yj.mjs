import http from 'node:http';
const PROXY = { host: '127.0.0.1', port: 7897 };
const agent = new http.Agent({ keepAlive: true, maxSockets: 2 });
function get(url) {
  return new Promise((resolve) => {
    let done = false; let req = null;
    const fin = (v) => { if (done) return; done = true; try { if (req) req.destroy(); } catch (e) {} resolve(v); };
    const hard = setTimeout(() => fin({ status: -2, text: '' }), 25000);
    try {
      const pu = new URL(url);
      req = http.get({ agent, host: PROXY.host, port: PROXY.port, path: url, headers: { Host: pu.host, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'Accept': 'text/html,*/*', 'Accept-Language': 'ja,en;q=0.8' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) { res.resume(); clearTimeout(hard); const n = res.headers.location.startsWith('http') ? res.headers.location : 'https://' + pu.host + res.headers.location; done = true; return get(n).then(resolve); }
        const c = []; res.on('data', d => c.push(d));
        res.on('end', () => { clearTimeout(hard); fin({ status: res.statusCode, text: Buffer.concat(c).toString('utf8') }); });
        res.on('error', () => fin({ status: -1, text: '' }));
      });
      req.on('error', () => { clearTimeout(hard); fin({ status: -1, text: '' }); });
    } catch (e) { clearTimeout(hard); fin({ status: -3, text: '' }); }
  });
}
const EQ = encodeURIComponent('フリーランス プラットフォーム 比較');
const r = await get('https://search.yahoo.co.jp/search?p=' + EQ);
const hosts = new Set();
for (const m of (r.text||'').matchAll(/href="(https?:\/\/[^"]+)"/g)) {
  try { const h = new URL(m[1]).hostname.replace(/^www\./, ''); if (!/yahoo\.co\.jp|yahoo\.com|yimg\.com|w3\.org/.test(h)) hosts.add(h); } catch (e) {}
}
console.log('YahooJapan status=' + r.status + ' len=' + (r.text||'').length + ' hosts=' + hosts.size);
console.log(JSON.stringify([...hosts].slice(0, 25), null, 1));