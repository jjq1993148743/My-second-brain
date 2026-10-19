import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
const PROXY = { host: '127.0.0.1', port: 7897 };
const agent = new http.Agent({ keepAlive: true, maxSockets: 3 });

function ghApi(path) {
  return new Promise((resolve) => {
    const req = https.get({ host: 'api.github.com', path, headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/vnd.github+json' } }, (res) => {
      const c = []; res.on('data', d => c.push(d));
      res.on('end', () => { let b = null; try { b = JSON.parse(Buffer.concat(c).toString('utf8')); } catch (e) {} resolve({ status: res.statusCode, body: b }); });
    });
    req.on('error', () => resolve({ status: -1, body: null }));
    req.setTimeout(25000, () => req.destroy(new Error('t')));
  });
}
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
        const c = []; res.on('data', d => c.push(d));
        res.on('end', () => { clearTimeout(hard); fin({ status: res.statusCode, text: Buffer.concat(c).toString('utf8') }); });
        res.on('error', () => fin({ status: -1, text: '' }));
      });
      req.on('error', () => { clearTimeout(hard); fin({ status: -1, text: '' }); });
    } catch (e) { clearTimeout(hard); fin({ status: -3, text: '' }); }
  });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const SEARCHES = [
  'awesome-japan freelance', 'awesome-korea freelance', 'awesome-china freelance',
  'awesome-india freelance', 'awesome-brazil freelance', 'awesome-germany freelance',
  'awesome-france freelance', 'awesome-spain freelance', 'awesome-japan remote',
  'awesome-korea remote', 'awesome-asia remote', 'awesome-latina remote',
  'awesome-europe remote', 'awesome-africa jobs', 'awesome-middle-east jobs',
  'awesome-dropshipping', 'awesome-shopify', 'awesome-etsy', 'awesome-amazon-fba',
  'awesome-stock-photos', 'awesome-music-production', 'awesome-ebook',
  'awesome-course-creation', 'awesome-coaching', 'awesome-consulting',
  'awesome-translation jobs', 'awesome-voice-over', 'awesome-copywriting',
  'awesome-design freelance', 'awesome-photography jobs', 'awesome-video-editing'
];

const repos = {};
for (const q of SEARCHES) {
  const r = await ghApi('/search/repositories?q=' + encodeURIComponent(q) + '&sort=stars&order=desc&per_page=6');
  if (r.status === 200 && r.body && r.body.items) {
    for (const it of r.body.items) {
      if (it.stargazers_count >= 100) repos[it.full_name] = { name: it.full_name, stars: it.stargazers_count, desc: (it.description || '').slice(0, 90) };
    }
  }
  await sleep(7000);
}

fs.writeFileSync('_gh_r3_repos.json', JSON.stringify(Object.values(repos), null, 1), 'utf8');
console.log('REPOS=' + Object.keys(repos).length);
for (const r of Object.values(repos).sort((a,b) => b.stars - a.stars).slice(0, 30)) console.log(r.stars + ' ' + r.name + ' | ' + r.desc.slice(0, 60));