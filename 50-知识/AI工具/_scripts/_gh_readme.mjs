import https from 'node:https';
import fs from 'node:fs';

function fetchRaw(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return resolve(fetchRaw(res.headers.location));
      }
      const c = [];
      res.on('data', d => c.push(d));
      res.on('end', () => resolve({ status: res.statusCode, text: Buffer.concat(c).toString('utf8') }));
    });
    req.on('error', () => resolve({ status: -1, text: '' }));
    req.setTimeout(25000, () => req.destroy(new Error('timeout')));
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

const DOCS = /^(docs|api|help|support|status|developer|developers|wiki|learn|guide|blog|cdn|static|assets|img|images)\./i;
const BIGTECH = /(^|\.)(github\.com|githubusercontent\.com|google\.com|youtube\.com|twitter\.com|x\.com|facebook\.com|linkedin\.com|wikipedia\.org|microsoft\.com|apple\.com|amazon\.com|cloudflare\.com|npmjs\.com|medium\.com|reddit\.com|stackoverflow\.com|mozilla\.org|w3\.org|schema\.org|creativecommons\.org)$/i;

const result = {};
let total = 0;
for (const [repo, tag] of REPOS) {
  const branches = ['main', 'master'];
  let got = null;
  for (const b of branches) {
    const r = await fetchRaw('https://raw.githubusercontent.com/' + repo + '/' + b + '/README.md');
    if (r.status === 200 && r.text.length > 500) { got = r.text; break; }
    await sleep(400);
  }
  if (!got) { result[tag] = { repo, status: 'README fail', count: 0 }; continue; }

  const hosts = new Set();
  const matches = got.match(/https?:\/\/[^\s)\]"'>]+/g) || [];
  for (const u of matches) {
    try {
      const h = new URL(u).hostname.replace(/^www\./, '');
      if (!DOCS.test(h) && !BIGTECH.test(h) && h.includes('.')) hosts.add(h);
    } catch (e) {}
  }
  const list = [...hosts];
  result[tag] = { repo, readmeLen: got.length, count: list.length, sample: list.slice(0, 8) };
  total += list.length;
  fs.writeFileSync('_gh_readme_hosts_' + tag + '.json', JSON.stringify(list), 'utf8');
  await sleep(500);
}
fs.writeFileSync('_gh_readme_summary.json', JSON.stringify(result, null, 1), 'utf8');
console.log('TOTAL=' + total);
console.log(JSON.stringify(result, null, 1));
