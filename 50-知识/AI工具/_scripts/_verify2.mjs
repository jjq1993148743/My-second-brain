import http from 'node:http';
const PROXY = { host: '127.0.0.1', port: 7897 };
const agent = new http.Agent({ keepAlive: true, maxSockets: 2 });
function get(url, lang) {
  return new Promise((resolve) => {
    let done = false; let req = null;
    const fin = (v) => { if (done) return; done = true; try { if (req) req.destroy(); } catch (e) {} resolve(v); };
    const hard = setTimeout(() => fin({ status: -2, text: '' }), 25000);
    try {
      const pu = new URL(url);
      req = http.get({ agent, host: PROXY.host, port: PROXY.port, path: url, headers: { Host: pu.host, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'Accept': 'text/html,*/*', 'Accept-Language': lang || 'en-US,en;q=0.9' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) { res.resume(); clearTimeout(hard); const n = res.headers.location.startsWith('http') ? res.headers.location : 'https://' + pu.host + res.headers.location; done = true; return get(n, lang).then(resolve); }
        const c = []; res.on('data', d => c.push(d));
        res.on('end', () => { clearTimeout(hard); fin({ status: res.statusCode, text: Buffer.concat(c).toString('utf8') }); });
        res.on('error', () => fin({ status: -1, text: '' }));
      });
      req.on('error', () => { clearTimeout(hard); fin({ status: -1, text: '' }); });
    } catch (e) { clearTimeout(hard); fin({ status: -3, text: '' }); }
  });
}
function extractHosts(html) {
  const hosts = new Set();
  // 1) 直接 href
  for (const m of (html||'').matchAll(/href="(https?:\/\/[^"]+)"/g)) {
    try { const h = new URL(m[1]).hostname.replace(/^www\./, ''); hosts.add(h); } catch (e) {}
  }
  // 2) yahoo 跳转参数 url= / u=
  for (const m of (html||'').matchAll(/[?&]url=([^&"']+)/g)) {
    try { const h = new URL(decodeURIComponent(m[1])).hostname.replace(/^www\./, ''); hosts.add(h); } catch (e) {}
  }
  return hosts;
}
const JUNK = /(yahoo\.co\.jp|yahoo\.com|yimg\.jp|yimg\.com|lycorp|lycbiz|google|gstatic|w3\.org|schema\.org|facebook|twitter|x\.com|instagram|linkedin|youtube|bing\.com|microsoft|msn\.com)/i;

console.log('=== Yahoo Japan (JP query) ===');
const yj = await get('https://search.yahoo.co.jp/search?p=' + encodeURIComponent('フリーランス 案件 サイト'), 'ja');
const yjh = [...extractHosts(yj.text)].filter(h => !JUNK.test(h));
console.log('status=' + yj.status + ' len=' + (yj.text||'').length + ' cleanHosts=' + yjh.length);
console.log(JSON.stringify(yjh.slice(0, 15), null, 1));

console.log('=== Bing intl ===');
const bi = await get('https://www.bing.com/search?q=' + encodeURIComponent('freelance platform list') + '&setlang=en&cc=us');
const bih = [...extractHosts(bi.text)].filter(h => !JUNK.test(h));
console.log('status=' + bi.status + ' cleanHosts=' + bih.length);
console.log(JSON.stringify(bih.slice(0, 15), null, 1));