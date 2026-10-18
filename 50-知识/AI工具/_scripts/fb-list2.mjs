
// fb-list2.mjs — fresh session: GET blogs.html -> csrf+cookie, then POST all pages
import http from 'node:http';
import fs from 'node:fs';
const PROXY = { host: '127.0.0.1', port: 7897 };
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36';
const agent = new http.Agent({ keepAlive: true, maxSockets: 2 });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function req(path, method, bodyText, cookie) {
  return new Promise((resolve, reject) => {
    const h = { Host: 'www.foreverblog.cn', 'User-Agent': UA, Accept: '*/*', Connection: 'keep-alive' };
    if (cookie) h.Cookie = cookie;
    if (method === 'POST') {
      Object.assign(h, { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest', 'Content-Length': Buffer.byteLength(bodyText) });
    }
    const r = http.request({ agent, host: PROXY.host, port: PROXY.port, path, method, headers: h },
      (res) => { const c = []; res.on('data', d => c.push(d));
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(c).toString('utf8') })); });
    r.on('error', reject);
    r.setTimeout(45000, () => r.destroy(new Error('timeout')));
    if (bodyText) r.write(bodyText);
    r.end();
  });
}

// 1. fresh page
let page = await req('https://www.foreverblog.cn/blogs.html', 'GET');
let cookie = '';
if (page.headers['set-cookie']) {
  cookie = page.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
}
const m = page.body.match(/<meta name="csrf-token" content="([^"]+)"/);
console.log('fresh page status', page.status, 'cookie:', cookie.slice(0,40), 'csrf:', m && m[1] && m[1].slice(0,12));
const csrf = m[1];
// page1 cards already present
const p1 = [...page.body.matchAll(/data-roster-id="(\d+)"(?=[^>]*href="([^"]*)")?/g)].map(x=>({id:x[1],href:x[2]}));
console.log('page1 embedded cards', p1.length);

const all = [];
let lastPage = 122;
for (let p = 2; p <= 140; p++) {
  let r;
  const bodyStr = 'page=' + p + '&_token=' + encodeURIComponent(csrf);
  for (let attempt = 0; attempt < 3; attempt++) {
    r = await req('https://www.foreverblog.cn/blogs', 'POST', bodyStr, cookie);
    if (r.status === 200) break;
    console.log('  retry page', p, 'status', r.status, r.body.slice(0,120));
    await sleep(2000);
  }
  if (r.status !== 200) { console.log('FAIL page', p, r.status, r.body.slice(0,150)); break; }
  let j;
  try { j = JSON.parse(r.body); } catch (e) { console.log('parse fail page', p, r.body.slice(0,150)); break; }
  const data = j.data || [];
  for (const c of data) all.push({id:String(c.id), name:c.name, url:c.url, status_key:c.status_key, category:c.category_label, cats:(c.category_labels||[]).join('/'), year:c.year_label, updated:c.updated_label});
  lastPage = j.last_page || lastPage;
  if (p === 2 || p % 20 === 0 || p >= lastPage) console.log('page', p, '/', lastPage, 'n', data.length, 'total', all.length);
  if (p >= lastPage) break;
  await sleep(850);
}
fs.writeFileSync('_fb_pages2plus.json', JSON.stringify(all, null, 1), 'utf8');
console.log('TOTAL pages2+', all.length, 'lastPage', lastPage);
