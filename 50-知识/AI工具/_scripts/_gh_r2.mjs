import https from 'node:https';
import fs from 'node:fs';

function gh(path) {
  return new Promise((resolve) => {
    const req = https.get({ host: 'api.github.com', path, headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } }, (res) => {
      const c = [];
      res.on('data', d => c.push(d));
      res.on('end', () => {
        let body = null;
        try { body = JSON.parse(Buffer.concat(c).toString('utf8')); } catch (e) {}
        resolve({ status: res.statusCode, body });
      });
    });
    req.on('error', () => resolve({ status: -1, body: null }));
    req.setTimeout(25000, () => req.destroy(new Error('timeout')));
  });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const QUERIES = [
  'awesome-freelance',
  'awesome-remote',
  'awesome-jobs',
  'awesome-job-boards',
  'awesome-indie',
  'awesome-saas',
  'awesome-bootstrapping',
  'awesome-digital-products',
  'awesome-print-on-demand',
  'awesome-freelancing',
  'awesome-remote-work',
  'awesome-side-hustle',
  'awesome-indiehackers',
  'awesome-solopreneur',
  'awesome-one-person',
  'awesome-passive-income',
  'awesome-money',
  'awesome-creator',
  'awesome-bounty',
  'awesome-affiliate',
  'awesome-dropshipping',
  'awesome-ecommerce',
  'awesome-podcast',
  'awesome-youtube',
  'awesome-content-creation'
];

const found = {};
for (const q of QUERIES) {
  const r = await gh('/search/repositories?q=' + encodeURIComponent(q + ' in:name') + '&sort=stars&order=desc&per_page=12');
  if (r.status === 200 && r.body && r.body.items) {
    for (const it of r.body.items) {
      found[it.full_name] = { name: it.full_name, stars: it.stargazers_count, desc: (it.description || '').slice(0, 110), q };
    }
  }
  await sleep(7000);
}

fs.writeFileSync('_gh_repos_round2.json', JSON.stringify(Object.values(found), null, 1), 'utf8');
console.log('REPOS=' + Object.keys(found).length);
const top = Object.values(found).sort((a,b) => b.stars - a.stars).slice(0, 40);
for (const t of top) console.log(t.stars + '  ' + t.name + '  |  ' + t.desc.slice(0, 70));