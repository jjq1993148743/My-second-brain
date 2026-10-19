import https from 'node:https';
import fs from 'node:fs';

function gh(path) {
  return new Promise((resolve, reject) => {
    const req = https.get({ host: 'api.github.com', path, headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } }, (res) => {
      const c = [];
      res.on('data', d => c.push(d));
      res.on('end', () => {
        let body = null;
        try { body = JSON.parse(Buffer.concat(c).toString('utf8')); } catch (e) {}
        resolve({ status: res.statusCode, body });
      });
    });
    req.on('error', reject);
    req.setTimeout(25000, () => req.destroy(new Error('timeout')));
  });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const QUERIES = [
  'awesome side hustle',
  'awesome remote jobs',
  'awesome freelance',
  'awesome creator economy',
  'awesome indie hacker',
  'awesome digital products',
  'awesome passive income',
  'awesome bug bounty',
  'awesome affiliate marketing',
  'awesome print on demand'
];

const out = {};
for (const q of QUERIES) {
  const qq = encodeURIComponent(q + ' in:name,description,readme');
  const r = await gh('/search/repositories?q=' + qq + '&sort=stars&order=desc&per_page=8');
  if (r.status === 200 && r.body && r.body.items) {
    out[q] = r.body.items.map(x => ({
      full_name: x.full_name,
      stars: x.stargazers_count,
      desc: (x.description || '').slice(0, 90)
    }));
  } else {
    out[q] = 'status=' + r.status + ' ' + (r.body && r.body.message ? r.body.message : '');
  }
  await sleep(6500);
}
fs.writeFileSync('_gh_search_round1.json', JSON.stringify(out, null, 1), 'utf8');
console.log(JSON.stringify(out, null, 1));
