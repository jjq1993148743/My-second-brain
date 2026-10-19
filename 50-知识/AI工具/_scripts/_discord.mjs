import http from 'node:http';
import fs from 'node:fs';
const PROXY = { host: '127.0.0.1', port: 7897 };
const agent = new http.Agent({ keepAlive: true, maxSockets: 3 });
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
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const PAGES = [
  'https://raw.githubusercontent.com/mhxion/awesome-discord-communities/main/README.md',
  'https://raw.githubusercontent.com/mhxion/awesome-discord-communities/master/README.md',
  'https://raw.githubusercontent.com/Discord-Resources/awesome-discord/main/README.md',
  'https://raw.githubusercontent.com/josephmartin721/awesome-discord-servers/master/README.md'
];
const found = [];
for (const u of PAGES) {
  const r = await get(u);
  if (r.status === 200 && r.text.length > 500) {
    const inv = r.text.match(/discord\.(?:gg|com\/invite)\/[A-Za-z0-9\-_]+/g) || [];
    const uniq = [...new Set(inv)];
    console.log('OK ' + u.slice(-50) + ' len=' + r.text.length + ' invites=' + uniq.length);
    for (const i of uniq) found.push({ invite: i, src: u });
  } else { console.log('-- ' + u.slice(-50) + ' status=' + r.status); }
  await sleep(1000);
}
fs.writeFileSync('_discord_invites.json', JSON.stringify(found, null, 1), 'utf8');
console.log('TOTAL_INVITES=' + found.length);