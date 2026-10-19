import http from 'node:http';
import fs from 'node:fs';
const PROXY = { host: '127.0.0.1', port: 7897 };
const agent = new http.Agent({ keepAlive: true, maxSockets: 2 });
function get(url) {
  return new Promise((resolve) => {
    let done = false; let req = null;
    const fin = (v) => { if (done) return; done = true; try { if (req) req.destroy(); } catch (e) {} resolve(v); };
    const hard = setTimeout(() => fin({ status: -2, text: '' }), 25000);
    try {
      const pu = new URL(url);
      req = http.get({ agent, host: PROXY.host, port: PROXY.port, path: url, headers: { Host: pu.host, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'Accept': 'text/html,application/xml,*/*' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) { res.resume(); clearTimeout(hard); const n = res.headers.location.startsWith('http') ? res.headers.location : 'https://' + pu.host + res.headers.location; done = true; return get(n).then(resolve); }
        const c = []; res.on('data', d => c.push(d));
        res.on('end', () => { clearTimeout(hard); fin({ status: res.statusCode, text: Buffer.concat(c).toString('utf8') }); });
        res.on('error', () => fin({ status: -1, text: '' }));
      });
      req.on('error', () => { clearTimeout(hard); fin({ status: -1, text: '' }); });
    } catch (e) { clearTimeout(hard); fin({ status: -3, text: '' }); }
  });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// 1) HackerNews: 抓 Ask HN / Show HN 里关于赚钱的讨论
const HN = await get('https://hn.algolia.com/api/v1/search?query=freelance%20platform&tags=story&hitsPerPage=50');
let hnHits = [];
if (HN.status === 200) {
  try {
    const j = JSON.parse(HN.text);
    hnHits = (j.hits || []).map(h => ({ title: h.title, url: h.url, points: h.points, comments: h.num_comments, created: h.created_at }));
    fs.writeFileSync('_hn_freelance.json', JSON.stringify(hnHits, null, 1), 'utf8');
    console.log('HN freelance hits=' + hnHits.length);
  } catch (e) { console.log('HN parse fail'); }
} else { console.log('HN status=' + HN.status); }
await sleep(1200);

// 2) HN: side hustle / passive income 讨论
const HN2 = await get('https://hn.algolia.com/api/v1/search?query=side%20hustle&tags=story&hitsPerPage=50');
let hn2 = [];
if (HN2.status === 200) {
  try { const j = JSON.parse(HN2.text); hn2 = (j.hits || []).map(h => ({ title: h.title, url: h.url, points: h.points, comments: h.num_comments })); fs.writeFileSync('_hn_sidehustle.json', JSON.stringify(hn2, null, 1), 'utf8'); console.log('HN sidehustle hits=' + hn2.length); } catch (e) {}
}
await sleep(1200);

// 3) IndieHackers: 首页帖子 + 产品
const IH = await get('https://www.indiehackers.com/');
if (IH.status === 200) {
  const links = IH.text.match(/href="(\/[a-zA-Z0-9_\-]+\/[a-zA-Z0-9_\-]{5,})"/g) || [];
  const uniq = [...new Set(links)].slice(0, 60);
  fs.writeFileSync('_ih_links.json', JSON.stringify(uniq), 'utf8');
  console.log('IH links=' + uniq.length);
} else { console.log('IH status=' + IH.status); }
