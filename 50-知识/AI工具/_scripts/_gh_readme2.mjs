import http from 'node:http';
import fs from 'node:fs';

const PROXY = { host: '127.0.0.1', port: 7897 };
const agent = new http.Agent({ keepAlive: true, maxSockets: 3 });

function fetchProxy(url) {
  return new Promise((resolve) => {
    let done = false;
    let req = null;
    const fin = (v) => { if (done) return; done = true; try { if (req) req.destroy(); } catch (e) {} resolve(v); };
    const hard = setTimeout(() => fin({ status: -2, text: '' }), 30000);
    try {
      const pu = new URL(url);
      req = http.get({ agent, host: PROXY.host, port: PROXY.port, path: url,
        headers: { Host: pu.host, 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          clearTimeout(hard);
          const nxt = res.headers.location.startsWith('http') ? res.headers.location : 'https://' + pu.host + res.headers.location;
          done = true;
          return fetchProxy(nxt).then(resolve);
        }
        const c = [];
        res.on('data', d => c.push(d));
        res.on('end', () => { clearTimeout(hard); fin({ status: res.statusCode, text: Buffer.concat(c).toString('utf8') }); });
        res.on('error', () => fin({ status: -1, text: '' }));
      });
      req.on('error', () => { clearTimeout(hard); fin({ status: -1, text: '' }); });
    } catch (e) { clearTimeout(hard); fin({ status: -3, text: '' }); }
  });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const REPOS = [
  ['mezod/awesome-indie', 'awesome-indie-11k'],
  ['remoteintech/remote-jobs', 'remoteintech-40k'],
  ['engineerapart/TheRemoteFreelancer', 'remote-freelancer-7k'],
  ['cbovis/awesome-digital-nomads', 'digital-nomads-1k'],
  ['yourincomehome/awesome-passive-income', 'passive-income-424'],
  ['hql287/awesome-free-services', 'free-services-410'],
  ['nayafia/lemonade-stand', 'lemonade-stand-7k'],
  ['Micro-SaaS-Examples/Best-Micro-SaaS-Tools', 'micro-saas-279']
];

const DOCS = /^(docs|api|help|support|status|developer|developers|wiki|learn|guide|blog|cdn|static|assets|img|images|dl|download)\./i;
const BIGTECH = /(^|\.)(github\.com|githubusercontent\.com|githubassets\.com|google\.com|youtube\.com|youtu\.be|twitter\.com|x\.com|facebook\.com|linkedin\.com|wikipedia\.org|microsoft\.com|apple\.com|amazon\.com|cloudflare\.com|npmjs\.com|medium\.com|reddit\.com|stackoverflow\.com|mozilla\.org|w3\.org|schema\.org|creativecommons\.org|shields\.io|badgen\.net|travis-ci\.org|circleci\.com|opencollective\.com|patreon\.com|gumroad\.com|buymeacoffee\.com|ko-fi\.com)$/i;

const result = {};
let total = 0;
for (const [repo, tag] of REPOS) {
  let got = null;
  for (const b of ['master', 'main']) {
    const r = await fetchProxy('https://raw.githubusercontent.com/' + repo + '/' + b + '/README.md');
    if (r.status === 200 && r.text.length > 500) { got = r.text; break; }
    await sleep(1200);
  }
  if (!got) { result[tag] = { repo, status: 'fail', count: 0 }; continue; }

  const hosts = new Set();
  const matches = got.match(/https?:\/\/[^\s)\]"'>|]+/g) || [];
  for (const u of matches) {
    try {
      const h = new URL(u).hostname.replace(/^www\./, '').toLowerCase();
      if (!DOCS.test(h) && !BIGTECH.test(h) && h.includes('.') && !/^\d/.test(h)) hosts.add(h);
    } catch (e) {}
  }
  const list = [...hosts];
  result[tag] = { repo, readmeLen: got.length, count: list.length, sample: list.slice(0, 10) };
  total += list.length;
  fs.writeFileSync('_gh_readme_hosts_' + tag + '.json', JSON.stringify(list), 'utf8');
  await sleep(1000);
}
fs.writeFileSync('_gh_readme_summary.json', JSON.stringify(result, null, 1), 'utf8');
console.log('TOTAL=' + total);
console.log(JSON.stringify(result, null, 1));
