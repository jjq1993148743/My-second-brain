import http from 'node:http';
import fs from 'node:fs';
const PROXY = { host: '127.0.0.1', port: 7897 };
const agent = new http.Agent({ keepAlive: true, maxSockets: 2 });
function getFollow(url, depth) {
  depth = depth || 0;
  if (depth > 6) return Promise.resolve({ status: -9, text: '', finalUrl: url });
  return new Promise((resolve) => {
    let done = false; let req = null;
    const fin = (v) => { if (done) return; done = true; try { if (req) req.destroy(); } catch (e) {} resolve(v); };
    const hard = setTimeout(() => fin({ status: -2, text: '', finalUrl: url }), 20000);
    try {
      const pu = new URL(url);
      req = http.get({ agent, host: PROXY.host, port: PROXY.port, path: pu.pathname + pu.search, headers: { Host: pu.host, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'Accept': 'text/html,*/*' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume(); clearTimeout(hard);
          const n = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).href;
          done = true; return getFollow(n, depth + 1).then(resolve);
        }
        const c = []; res.on('data', d => c.push(d));
        res.on('end', () => { clearTimeout(hard); fin({ status: res.statusCode, text: Buffer.concat(c).toString('utf8'), finalUrl: url }); });
        res.on('error', () => fin({ status: -1, text: '', finalUrl: url }));
      });
      req.on('error', () => { clearTimeout(hard); fin({ status: -1, text: '', finalUrl: url }); });
    } catch (e) { clearTimeout(hard); fin({ status: -3, text: '', finalUrl: url }); }
  });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const HOSTS = ["awin.com","codersclan.net","codester.com","flexoffers.com","freelancer.cn","go.intigriti.com","moonlightwork.com","printful.com","scalablepath.com","seatguru.com","shareasale.com","storetasker.com","superside.com","synack.com","teespring.com","yunojuno.com","zazzle.com","cj.com","dreamlance.io","gigster.com"];
const out = [];
for (const h of HOSTS) {
  const r = await getFollow('https://' + h + '/');
  const tm = (r.text.match(/<title[^>]*>([^<]{2,90})/i) || [])[1] || '';
  const blocked = /captcha|Just a moment|cloudflare|Access Denied/i.test(r.text.slice(0, 3000));
  out.push({ host: h, finalStatus: r.status, finalUrl: r.finalUrl !== 'https://' + h + '/' ? r.finalUrl : '', title: tm.trim(), len: r.text.length, blocked });
  console.log(h + ' -> ' + r.status + ' len=' + r.text.length + (blocked ? ' BLOCKED' : '') + ' | ' + tm.trim().slice(0, 50));
  await sleep(600);
}
fs.writeFileSync('_redirect_check.json', JSON.stringify(out, null, 1), 'utf8');