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

const TOPICS = [
  'side-hustle', 'make-money', 'freelance', 'remote-jobs', 'indie-hacker',
  'passive-income', 'digital-nomad', 'money', 'earn-money', 'side-income',
  'freelancing', 'remote-work', 'bootstrapping', 'solopreneur', 'creator-economy'
];

const out = {};
for (const t of TOPICS) {
  const r = await gh('/search/repositories?q=' + encodeURIComponent('topic:' + t) + '&sort=stars&order=desc&per_page=10');
  if (r.status === 200 && r.body && r.body.items) {
    out[t] = r.body.items.map(x => ({
      name: x.full_name,
      stars: x.stargazers_count,
      desc: (x.description || '').slice(0, 100)
    }));
  } else {
    out[t] = 'ERR ' + r.status;
  }
  await sleep(6800);
}
fs.writeFileSync('_gh_topics.json', JSON.stringify(out, null, 1), 'utf8');
console.log('done, topics=' + Object.keys(out).length);
