import http from 'node:http';
import fs from 'node:fs';
const S = 'D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/';
const PROXY = { host: '127.0.0.1', port: 7897 };
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36';
let TOKEN = "CNNMcETHpy5SUoxmpUvLxX0Z7XkIc4lNuq3ghJIs";
const cookieJar = [];
function getReq(url, accept) {
  return new Promise((resolve, reject) => {
    const pu = new URL(url);
    const headers = { Host: pu.host, 'User-Agent': UA, Accept: accept, Connection: 'keep-alive' };
    
    const req = http.get({ host: PROXY.host, port: PROXY.port, path: url, headers },
      (res) => { const sc = res.headers['set-cookie']; if (sc) cookieJar.push(...sc.map(s => s.split(';')[0]));
        const c = []; res.on('data', d => c.push(d)); res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(c) })); });
    req.on('error', reject); req.setTimeout(30000, () => req.destroy(new Error('timeout')));
  });
}
function postReq(url, form) {
  return new Promise((resolve, reject) => {
    const pu = new URL(url);
    const body = new URLSearchParams(form).toString();
    const headers = { Host: pu.host, 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body), 'Accept': 'application/json',
      'X-XSRF-TOKEN': decodeURIComponent(cookieJar.filter(c => c.startsWith('XSRF-TOKEN='))[0].substring(11)), 'X-CSRF-TOKEN': TOKEN, 'X-Requested-With': 'XMLHttpRequest',
      'Referer': 'https://www.foreverblog.cn/blogs.html' };
    headers['Cookie'] = cookieJar.join('; ');
    const req = http.request({ host: PROXY.host, port: PROXY.port, path: url, method: 'POST', headers },
      (res) => { const sc = res.headers['set-cookie']; if (sc) cookieJar.push(...sc.map(s => s.split(';')[0]));
        const c = []; res.on('data', d => c.push(d)); res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(c) })); });
    req.on('error', reject); req.setTimeout(30000, () => req.destroy(new Error('timeout')));
    req.end(body);
  });
}
await getReq('https://www.foreverblog.cn/blogs.html', 'text/html');
console.log('cookies', cookieJar);
const m = await getReq('https://www.foreverblog.cn/blogs.html', 'text/html');
const tok = m.body.toString('utf8').match(/name="csrf-token" content="([^"]+)"/);
console.log('fresh token', tok && tok[1]);
if (tok) TOKEN = tok[1];
let all = [];
for (let p = 1; p <= 122; p++) {
  const r = await postReq('https://www.foreverblog.cn/blogs', { page: String(p) });
  if (r.status !== 200) { console.log('page', p, 'status', r.status, r.body.toString('utf8').slice(0,200)); break; }
  let j; try { j = JSON.parse(r.body.toString('utf8')); } catch (e) { console.log('page', p, 'bad json'); break; }
  const data = j.data || [];
  all.push(...data);
  if (p % 10 === 0) console.log('page', p, 'cards', all.length, 'last_page', j.last_page);
  if (p >= (j.last_page || 122)) { console.log('reached last_page', j.last_page); break; }
  await new Promise(r2 => setTimeout(r2, 700));
}
fs.writeFileSync(S + (process.argv[2]||'_blogs_all.json'), JSON.stringify(all));
console.log('TOTAL', all.length);
console.log(JSON.stringify(all[0], null, 1));