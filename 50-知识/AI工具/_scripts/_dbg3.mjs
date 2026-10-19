import http from 'node:http';
const PROXY = { host: '127.0.0.1', port: 7897 };
const agent = new http.Agent({ keepAlive: true, maxSockets: 2 });
function get(url) {
  return new Promise((resolve) => {
    let done = false; let req = null;
    const fin = (v) => { if (done) return; done = true; try { if (req) req.destroy(); } catch (e) {} resolve(v); };
    const hard = setTimeout(() => fin({ status: -2, text: '' }), 20000);
    try {
      const pu = new URL(url);
      req = http.get({ agent, host: PROXY.host, port: PROXY.port, path: url, headers: { Host: pu.host, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'Accept': 'text/html,*/*' } }, (res) => {
        const c = []; res.on('data', d => c.push(d));
        res.on('end', () => { clearTimeout(hard); fin({ status: res.statusCode, text: Buffer.concat(c).toString('utf8') }); });
        res.on('error', () => fin({ status: -1, text: '' }));
      });
      req.on('error', () => { clearTimeout(hard); fin({ status: -1, text: '' }); });
    } catch (e) { clearTimeout(hard); fin({ status: -3, text: '' }); }
  });
}
const EQ = encodeURIComponent('freelance platform');
const r = await get('https://www.sogou.com/web?query=' + EQ);
// sogou 的结果链接通常是 /link?url=... 需要拼接
const links = [...(r.text||'').matchAll(/href="(\/link\?url=[^"]+)"/g)].map(m => 'https://www.sogou.com' + m[1].replace(/&amp;/g,'&'));
const titles = [...(r.text||'').matchAll(/<h3[^>]*>(.{0,300}?)<\/h3>/g)].map(m => m[1].replace(/<[^>]+>/g,'').trim()).filter(Boolean);
console.log('sogou status=' + r.status + ' resultLinks=' + links.length + ' titles=' + titles.length);
console.log(JSON.stringify(titles.slice(0, 8), null, 1));
console.log('sample links:', JSON.stringify(links.slice(0, 3), null, 1));