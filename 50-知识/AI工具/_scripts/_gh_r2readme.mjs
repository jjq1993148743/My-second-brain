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
      req = http.get({ agent, host: PROXY.host, port: PROXY.port, path: url, headers: { Host: pu.host, 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume(); clearTimeout(hard);
          const nxt = res.headers.location.startsWith('http') ? res.headers.location : 'https://' + pu.host + res.headers.location;
          done = true; return fetchProxy(nxt).then(resolve);
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
  ['lukasz-madon/awesome-remote-job', 'remote-job-49k'],
  ['djadmin/awesome-bug-bounty', 'bug-bounty-5k'],
  ['etnbrd/awesome-freelance-fr', 'freelance-fr-688'],
  ['tramcar/awesome-job-boards', 'job-boards-1k8'],
  ['emredurukn/awesome-job-boards', 'job-boards-1k0'],
  ['josephzhang23/awesome-indie', 'indie-zh-1k4'],
  ['apachecn/awesome-indie-zh', 'indie-zh-888'],
  ['iAmCorey/awesome-indie-hacker-tools', 'indie-tools-1k4'],
  ['johackim/awesome-indiehackers', 'indiehackers-662'],
  ['zenika-open-source/awesome-remote-work', 'remote-work-489'],
  ['fireball787b/awesome-remote-companies', 'remote-co-478'],
  ['xcomptek/awesome-saas-boilerplates', 'saas-boiler-3k'],
  ['GetStream/awesome-saas-services', 'saas-svc-562'],
  ['hugo53/awesome-RemoteWork', 'remotework-1k6'],
  ['awesome-jobs/vietnam', 'vietnam-1k5'],
  ['Lamiiine/Awesome-daily-list-of-visa-sponsored-jobs', 'visa-jobs-725'],
  ['pogopaule/awesome-sustainability-jobs', 'sustain-jobs-512'],
  ['astrotars/awesome-ecommerce-stack', 'ecom-stack-443'],
  ['olivrg/Awesome-Open-Source-eCommerce-Platforms', 'ecom-os-546']
];

const DOCS = /^(docs|api|help|support|status|developer|developers|wiki|learn|guide|blog|cdn|static|assets|img|images|dl|download|forum|community)\.[a-z0-9-]+\./i;
const BIGTECH = /(^|\.)(github\.com|githubusercontent\.com|githubassets\.com|github\.io|google\.com|youtube\.com|youtu\.be|twitter\.com|x\.com|facebook\.com|linkedin\.com|wikipedia\.org|microsoft\.com|apple\.com|amazon\.com|cloudflare\.com|npmjs\.com|medium\.com|reddit\.com|stackoverflow\.com|mozilla\.org|w3\.org|schema\.org|creativecommons\.org|shields\.io|badgen\.net|travis-ci\.org|circleci\.com|opencollective\.com|patreon\.com|gumroad\.com|buymeacoffee\.com|ko-fi\.com|imgur\.com|gravatar\.com|archive\.org)$/i;

const summary = {};
let total = 0;
for (const [repo, tag] of REPOS) {
  let got = null;
  for (const b of ['master', 'main']) {
    const r = await fetchProxy('https://raw.githubusercontent.com/' + repo + '/' + b + '/README.md');
    if (r.status === 200 && r.text.length > 300) { got = r.text; break; }
    await sleep(900);
  }
  if (!got) { summary[tag] = { repo, status: 'fail', count: 0 }; continue; }
  const hosts = new Set();
  const matches = got.match(/https?:\/\/[^\s)\]"'>|]+/g) || [];
  for (const u of matches) {
    try {
      const h = new URL(u).hostname.replace(/^www\./, '').toLowerCase();
      if (!DOCS.test(h) && !BIGTECH.test(h) && h.includes('.') && !/^[0-9]/.test(h)) hosts.add(h);
    } catch (e) {}
  }
  const list = [...hosts];
  summary[tag] = { repo, count: list.length };
  total += list.length;
  fs.writeFileSync('_gh2_hosts_' + tag + '.json', JSON.stringify(list), 'utf8');
  console.log(tag + ' -> ' + list.length);
  await sleep(800);
}
fs.writeFileSync('_gh2_summary.json', JSON.stringify(summary, null, 1), 'utf8');
console.log('TOTAL=' + total);