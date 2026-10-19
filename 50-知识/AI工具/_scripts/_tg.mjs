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
      req = http.get({ agent, host: PROXY.host, port: PROXY.port, path: url, headers: { Host: pu.host, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0 Safari/537.36' } }, (res) => {
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
const CHANNELS = ['freelancechat','freelancing','upwork','fiverr','sidehustle','beermoney','indiehackers','saas','nocode','remotejobs','digitalnomad','passiveincome','cryptofreelance','webdevjobs','designjobs','marketingjobs','copywriting','contentcreator','youtubemoney','affiliatemarketing','dropshipping','ecommerce','amazonfba','etsysellers','gumroad','podcast','bugbounty','hackerone','bounties','osint'];
const out = [];
for (const ch of CHANNELS) {
  const r = await get('https://t.me/s/' + ch);
  if (r.status === 200 && r.text.length > 3000) {
    const tm = /<meta property="og:title" content="([^"]{2,120})"/.exec(r.text);
    const dm = /<meta property="og:description" content="([^"]{2,300})"/.exec(r.text);
    const posts = (r.text.match(/tgme_widget_message_text/g) || []).length;
    const members = /([0-9][0-9 ,.]*)\s*(subscribers|members|followers)/i.exec(r.text);
    out.push({ channel: ch, url: 'https://t.me/' + ch, title: tm ? tm[1] : '', desc: dm ? dm[1].slice(0, 150) : '', posts, members: members ? members[1] : '' });
    console.log('OK ' + ch + ' posts=' + posts);
  } else { console.log('-- ' + ch + ' status=' + r.status); }
  await sleep(900);
}
fs.writeFileSync('_tg_channels.json', JSON.stringify(out, null, 1), 'utf8');
console.log('TOTAL=' + out.length);