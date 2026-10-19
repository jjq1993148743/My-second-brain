import http from 'node:http';
import fs from 'node:fs';
const PROXY = { host: '127.0.0.1', port: 7897 };
const agent = new http.Agent({ keepAlive: true, maxSockets: 2 });
function get(url) {
  return new Promise((resolve) => {
    let done = false; let req = null;
    const fin = (v) => { if (done) return; done = true; try { if (req) req.destroy(); } catch (e) {} resolve(v); };
    const hard = setTimeout(() => fin({ status: -2, text: '' }), 20000);
    try {
      const pu = new URL(url);
      req = http.get({ agent, host: PROXY.host, port: PROXY.port, path: url, headers: { Host: pu.host, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'Accept': 'text/html,*/*', 'Accept-Language': 'en-US,en;q=0.9' } }, (res) => {
        const c = []; res.on('data', d => c.push(d));
        res.on('end', () => { clearTimeout(hard); fin({ status: res.statusCode, text: Buffer.concat(c).toString('utf8') }); });
        res.on('error', () => fin({ status: -1, text: '' }));
      });
      req.on('error', () => { clearTimeout(hard); fin({ status: -1, text: '' }); });
    } catch (e) { clearTimeout(hard); fin({ status: -3, text: '' }); }
  });
}
const EQ = encodeURIComponent('best freelance platforms');
const r = await get('https://www.bing.com/search?q=' + EQ);
fs.writeFileSync('_dbg_bing.html', r.text, 'utf8');
// 打印所有 a href 的前 30 个
const hrefs = [...r.text.matchAll(/<a[^>]+href="([^"]+)"/g)].map(m => m[1]).filter(h => h.startsWith('http') && !/bing\.com|microsoft|msn\.com|live\.com/.test(h));
console.log('BING non-bing hrefs:', hrefs.length);
console.log(JSON.stringify(hrefs.slice(0, 20), null, 1));
// 看看 h2 结构
const h2s = [...r.text.matchAll(/<h2[^>]*>(.{0,200}?)<\/h2>/g)].map(m => m[1].replace(/<[^>]+>/g, '').slice(0, 80));
console.log('H2 count:', h2s.length);
console.log(JSON.stringify(h2s.slice(0, 8), null, 1));