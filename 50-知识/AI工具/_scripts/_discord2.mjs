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
      req = http.get({ agent, host: PROXY.host, port: PROXY.port, path: url, headers: { Host: pu.host, 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) { res.resume(); clearTimeout(hard); const n = res.headers.location.startsWith('http') ? res.headers.location : 'https://' + pu.host + res.headers.location; done = true; return get(n).then(resolve); }
        const c = []; res.on('data', d => c.push(d));
        res.on('end', () => { clearTimeout(hard); fin({ status: res.statusCode, text: Buffer.concat(c).toString('utf8') }); });
        res.on('error', () => fin({ status: -1, text: '' }));
      });
      req.on('error', () => { clearTimeout(hard); fin({ status: -1, text: '' }); });
    } catch (e) { clearTimeout(hard); fin({ status: -3, text: '' }); }
  });
}
const r = await get('https://raw.githubusercontent.com/mhxion/awesome-discord-communities/main/README.md');
fs.writeFileSync('_discord_readme.md', r.text, 'utf8');
console.log('len=' + r.text.length);
// 提取所有 markdown 行，含邀请链接的
const lines = r.text.split('\n');
const rows = [];
let section = '';
for (const line of lines) {
  if (/^#{2,3}\s+/.test(line)) section = line.replace(/^#+\s*/, '').trim();
  const m = line.match(/discord\.(?:gg|com\/invite)\/[A-Za-z0-9\-_]+/);
  if (m) {
    const clean = line.replace(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 180);
    rows.push({ section, invite: m[0], text: clean });
  }
}
fs.writeFileSync('_discord_rows.json', JSON.stringify(rows, null, 1), 'utf8');
console.log('rows=' + rows.length);
const secs = {};
for (const x of rows) secs[x.section] = (secs[x.section] || 0) + 1;
console.log(JSON.stringify(Object.entries(secs).sort((a,b)=>b[1]-a[1]).slice(0, 25), null, 1));