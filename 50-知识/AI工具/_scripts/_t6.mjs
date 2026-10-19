import http from 'node:http';
import fs from 'node:fs';
const PROXY = { host: '127.0.0.1', port: 7897 };
const agent = new http.Agent({ keepAlive: true, maxSockets: 2 });
function get(url) {
  return new Promise((resolve) => {
    let done = false; let req = null;
    const fin = (v) => { if (done) return; done = true; try { if (req) req.destroy(); } catch (e) {} resolve(v); };
    const hard = setTimeout(() => fin({ status: -2, text: '' }), 25000);
    try {
      const pu = new URL(url);
      req = http.get({ agent, host: PROXY.host, port: PROXY.port, path: url, headers: { Host: pu.host, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) { res.resume(); clearTimeout(hard); const n = res.headers.location.startsWith('http') ? res.headers.location : 'https://' + pu.host + res.headers.location; done = true; return get(n).then(resolve); }
        const c = []; res.on('data', d => c.push(d));
        res.on('end', () => { clearTimeout(hard); fin({ status: res.statusCode, text: Buffer.concat(c).toString('utf8') }); });
        res.on('error', () => fin({ status: -1, text: '' }));
      });
      req.on('error', () => { clearTimeout(hard); fin({ status: -1, text: '' }); });
    } catch (e) { clearTimeout(hard); fin({ status: -3, text: '' }); }
  });
}
for (const u of ['https://discord.me/servers', 'https://discordservers.com/', 'https://discord.com/servers']) {
  const r = await get(u);
  fs.writeFileSync('_dbg_' + Buffer.from(u).toString('base64').slice(0,12).replace(/[^a-zA-Z0-9]/g,'') + '.html', r.text || '', 'utf8');
  const inv = (r.text.match(/discord\.gg\/[a-zA-Z0-9]+/g) || []).slice(0, 10);
  const inv2 = (r.text.match(/discord\.com\/invite\/[a-zA-Z0-9]+/g) || []).slice(0, 10);
  const names = (r.text.match(/"name"\s*:\s*"([^"]{3,60})"/g) || []).slice(0, 15);
  console.log('=== ' + u + ' ===');
  console.log('invites:', inv.length + inv2.length);
  console.log(JSON.stringify([...inv, ...inv2].slice(0, 8)));
  console.log('names sample:', JSON.stringify(names.slice(0, 6)));
}