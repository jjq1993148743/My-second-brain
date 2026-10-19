import http from 'node:http';
const PROXY = { host: '127.0.0.1', port: 7897 };
const agent = new http.Agent({ keepAlive: true, maxSockets: 3 });
function get(url) {
  return new Promise((resolve) => {
    let done = false; let req = null;
    const fin = (v) => { if (done) return; done = true; try { if (req) req.destroy(); } catch (e) {} resolve(v); };
    const hard = setTimeout(() => fin({ status: -2 }), 25000);
    try {
      const pu = new URL(url);
      req = http.get({ agent, host: PROXY.host, port: PROXY.port, path: url, headers: { Host: pu.host, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'Accept': 'text/html,application/json,*/*' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume(); clearTimeout(hard);
          const nxt = res.headers.location.startsWith('http') ? res.headers.location : 'https://' + pu.host + res.headers.location;
          done = true; return get(nxt).then(resolve);
        }
        const c = []; res.on('data', d => c.push(d));
        res.on('end', () => { clearTimeout(hard); fin({ status: res.statusCode, len: Buffer.concat(c).length, text: Buffer.concat(c).toString('utf8') }); });
        res.on('error', () => fin({ status: -1 }));
      });
      req.on('error', () => { clearTimeout(hard); fin({ status: -1 }); });
    } catch (e) { clearTimeout(hard); fin({ status: -3 }); }
  });
}
const urls = [
  'https://www.reddit.com/r/freelance/new.json?limit=20',
  'https://www.reddit.com/r/beermoney/new.json?limit=20',
  'https://t.me/s/freelancechat',
  'https://www.indiehackers.com/',
  'https://news.ycombinator.com/'
];
for (const u of urls) {
  const r = await get(u);
  console.log(u.slice(0, 60) + ' -> status=' + r.status + ' len=' + (r.len || 0));
}