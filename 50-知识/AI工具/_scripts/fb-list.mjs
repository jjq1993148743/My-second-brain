
// fb-list.mjs — POST the roster API to collect all member ids
import http from 'node:http';
import fs from 'node:fs';
const PROXY = { host: '127.0.0.1', port: 7897 };
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36';
const ENDPOINT = 'https://www.foreverblog.cn/blogs';
const CSRF = process.argv[2];
const agent = new http.Agent({ keepAlive: true, maxSockets: 2 });

function post(page) {
  return new Promise((resolve, reject) => {
    const body = 'page=' + page;
    const req = http.request({ agent, host: PROXY.host, port: PROXY.port, path: ENDPOINT + '?page=' + page,
      method: 'POST',
      headers: { Host: 'www.foreverblog.cn', 'User-Agent': UA, 'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-CSRF-TOKEN': CSRF, 'X-Requested-With': 'XMLHttpRequest', 'Content-Length': Buffer.byteLength(body),
        'Origin': 'https://www.foreverblog.cn', 'Referer': 'https://www.foreverblog.cn/blogs.html' } },
      (res) => { const c = []; res.on('data', d => c.push(d));
        res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(c).toString('utf8') })); });
    req.on('error', reject);
    req.setTimeout(30000, () => req.destroy(new Error('timeout')));
    req.end(body);
  });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const all = [];
let last = 1;
for (let p = 1; p <= 3; p++) {
  const r = await post(p);
  console.log('page', p, 'status', r.status, 'len', r.body.length, r.body.slice(0, 260).replace(/\s+/g,' '));
  try {
    const j = JSON.parse(r.body);
    console.log('  current_page', j.current_page, 'last_page', j.last_page, 'n', (j.data||[]).length);
    if (j.data) for (const c of j.data) all.push({id: c.id, name: c.name, url: c.url, status_key: c.status_key, category: c.category_label, cats: c.category_labels, year: c.year_label, updated: c.updated_label});
    last = j.last_page || last;
    if (p >= j.last_page) break;
  } catch (e) { console.log('  parse err', e.message); break; }
  await sleep(900);
}
console.log('collected', all.length, 'lastPage', last);
fs.writeFileSync('_fb_test.json', JSON.stringify(all, null, 1), 'utf8');
