import http from 'node:http';
const PROXY = { host: '127.0.0.1', port: 7897 };
const agent = new http.Agent({ keepAlive: true, maxSockets: 3 });
function get(url) {
  return new Promise((resolve) => {
    let done = false; let req = null;
    const fin = (v) => { if (done) return; done = true; try { if (req) req.destroy(); } catch (e) {} resolve(v); };
    const hard = setTimeout(() => fin({ status: -2, len: 0, text: '' }), 25000);
    try {
      const pu = new URL(url);
      req = http.get({ agent, host: PROXY.host, port: PROXY.port, path: url, headers: { Host: pu.host, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'Accept': 'text/html,application/json,*/*' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) { res.resume(); clearTimeout(hard); const n = res.headers.location.startsWith('http') ? res.headers.location : 'https://' + pu.host + res.headers.location; done = true; return get(n).then(resolve); }
        const c = []; res.on('data', d => c.push(d));
        res.on('end', () => { clearTimeout(hard); const t = Buffer.concat(c).toString('utf8'); fin({ status: res.statusCode, len: t.length, text: t }); });
        res.on('error', () => fin({ status: -1, len: 0, text: '' }));
      });
      req.on('error', () => { clearTimeout(hard); fin({ status: -1, len: 0, text: '' }); });
    } catch (e) { clearTimeout(hard); fin({ status: -3, len: 0, text: '' }); }
  });
}
const urls = [
  'https://disboard.org/search?keyword=freelance',
  'https://disboard.org/search?keyword=side+hustle',
  'https://top.gg/servers',
  'https://discord.me/servers',
  'https://discordservers.com/',
  'https://discord.com/servers',
  'https://disboard.org/servers/tag/business',
  'https://disboard.org/servers/tag/money'
];
for (const u of urls) {
  const r = await get(u);
  console.log(r.status + ' len=' + r.len + '  ' + u);
}