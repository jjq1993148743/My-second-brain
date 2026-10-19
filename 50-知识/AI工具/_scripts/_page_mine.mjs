import http from 'node:http';
import fs from 'node:fs';
const PROXY = { host: '127.0.0.1', port: 7897 };
const agent = new http.Agent({ keepAlive: true, maxSockets: 3 });
function fetchProxy(url) {
  return new Promise((resolve) => {
    let done = false; let req = null;
    const fin = (v) => { if (done) return; done = true; try { if (req) req.destroy(); } catch (e) {} resolve(v); };
    const hard = setTimeout(() => fin({ status: -2, text: '' }), 30000);
    try {
      const pu = new URL(url);
      req = http.get({ agent, host: PROXY.host, port: PROXY.port, path: url, headers: { Host: pu.host, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'Accept': 'text/html,*/*', 'Accept-Language': 'en-US,en;q=0.9' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume(); clearTimeout(hard);
          const nxt = res.headers.location.startsWith('http') ? res.headers.location : 'https://' + pu.host + res.headers.location;
          done = true; return fetchProxy(nxt).then(resolve);
        }
        const c = []; res.on('data', d => c.push(d));
        res.on('end', () => { clearTimeout(hard); fin({ status: res.statusCode, text: Buffer.concat(c).toString('utf8') }); });
        res.on('error', () => fin({ status: -1, text: '' }));
      });
      req.on('error', () => { clearTimeout(hard); fin({ status: -1, text: '' }); });
    } catch (e) { clearTimeout(hard); fin({ status: -3, text: '' }); }
  });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const DOCS = /^(docs|api|help|support|status|developer|developers|wiki|learn|guide|blog|cdn|static|assets|img|images|dl|download)\.[a-z0-9-]+\./i;
const BIGTECH = /(^|\.)(github\.com|githubusercontent\.com|google\.com|googleapis\.com|gstatic\.com|youtube\.com|youtu\.be|twitter\.com|x\.com|facebook\.com|fb\.com|linkedin\.com|wikipedia\.org|microsoft\.com|apple\.com|amazon\.com|cloudflare\.com|npmjs\.com|medium\.com|reddit\.com|redd\.it|stackoverflow\.com|mozilla\.org|w3\.org|schema\.org|shields\.io|imgur\.com|gravatar\.com|archive\.org|wordpress\.org|gmpg\.org|schema\.org|jquery\.com|bootstrapcdn\.com|fontawesome\.com|cloudfront\.net|akamaihd\.net|doubleclick\.net|googletagmanager\.com|google-analytics\.com|addthis\.com|sharethis\.com|disqus\.com|hubspot\.com|mailchimp\.com|gravatar\.com|wp\.com|wixpress\.com|squarespace\.com|typekit\.net|adobe\.com)$/i;

const PAGES = process.argv.slice(2);
if (!PAGES.length) { console.log('no urls'); process.exit(1); }
const out = {};
let total = 0;
for (const url of PAGES) {
  const r = await fetchProxy(url);
  if (r.status !== 200 || r.text.length < 1000) { out[url] = { status: r.status, count: 0 }; await sleep(1200); continue; }
  const hosts = new Set();
  const ms = r.text.match(/https?:\/\/[^\s)\]"'>|]+/g) || [];
  for (const u of ms) {
    try {
      const h = new URL(u).hostname.replace(/^www\./, '').toLowerCase();
      if (!DOCS.test(h) && !BIGTECH.test(h) && h.includes('.') && !/^[0-9]/.test(h)) hosts.add(h);
    } catch (e) {}
  }
  const list = [...hosts];
  out[url] = { status: r.status, len: r.text.length, count: list.length };
  total += list.length;
  fs.writeFileSync('_page_hosts_' + Buffer.from(url).toString('base64').slice(0, 20).replace(/[^a-zA-Z0-9]/g, '') + '.json', JSON.stringify({ url, hosts: list }), 'utf8');
  console.log(url + ' -> ' + list.length);
  await sleep(1500);
}
fs.writeFileSync('_pages_summary.json', JSON.stringify(out, null, 1), 'utf8');
console.log('TOTAL=' + total);