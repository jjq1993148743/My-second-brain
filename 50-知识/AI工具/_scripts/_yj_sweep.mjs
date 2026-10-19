import http from 'node:http';
import fs from 'node:fs';
const PROXY = { host: '127.0.0.1', port: 7897 };
const agent = new http.Agent({ keepAlive: true, maxSockets: 2 });
function get(url, lang) {
  return new Promise((resolve) => {
    let done = false; let req = null;
    const fin = (v) => { if (done) return; done = true; try { if (req) req.destroy(); } catch (e) {} resolve(v); };
    const hard = setTimeout(() => fin({ status: -2, text: '' }), 25000);
    try {
      const pu = new URL(url);
      req = http.get({ agent, host: PROXY.host, port: PROXY.port, path: url, headers: { Host: pu.host, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'Accept': 'text/html,*/*', 'Accept-Language': lang || 'en-US,en;q=0.9' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) { res.resume(); clearTimeout(hard); const n = res.headers.location.startsWith('http') ? res.headers.location : 'https://' + pu.host + res.headers.location; done = true; return get(n, lang).then(resolve); }
        const c = []; res.on('data', d => c.push(d));
        res.on('end', () => { clearTimeout(hard); fin({ status: res.statusCode, text: Buffer.concat(c).toString('utf8') }); });
        res.on('error', () => fin({ status: -1, text: '' }));
      });
      req.on('error', () => { clearTimeout(hard); fin({ status: -1, text: '' }); });
    } catch (e) { clearTimeout(hard); fin({ status: -3, text: '' }); }
  });
}
function extractHosts(html) {
  const hosts = new Set();
  for (const m of (html||'').matchAll(/href="(https?:\/\/[^"]+)"/g)) { try { hosts.add(new URL(m[1]).hostname.replace(/^www\./, '')); } catch (e) {} }
  for (const m of (html||'').matchAll(/[?&]url=([^&"']+)/g)) { try { hosts.add(new URL(decodeURIComponent(m[1])).hostname.replace(/^www\./, '')); } catch (e) {} }
  return hosts;
}
const JUNK = /(yahoo\.co\.jp|yahoo\.com|yimg\.jp|yimg\.com|lycorp|lycbiz|google|gstatic|w3\.org|schema\.org|facebook|twitter|x\.com|instagram|linkedin|youtube|bing\.com|microsoft|msn\.com|baidu\.com|zhihu|iciba|douban|miit\.gov|wikipedia|amazonaws|cloudfront|akamai)/i;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const QUERIES = [
  ['日本-接单', 'フリーランス 案件 サイト おすすめ', 'ja'],
  ['日本-クラウドソーシング', 'クラウドソーシング 比較 ランキング', 'ja'],
  ['韩国-재능', '프리랜서 재능마켓 사이트 추천', 'ko'],
  ['台湾-接案', '接案平台 推薦 比較', 'zh-TW'],
  ['香港-自由工作', '自由工作平台 搵freelance', 'zh-HK'],
  ['德国-Freelance', 'Freelance Plattform Vergleich Deutschland', 'de'],
  ['法国-Freelance', 'plateforme freelance comparatif France', 'fr'],
  ['西班牙-Freelance', 'plataformas freelance comparativa España', 'es'],
  ['意大利-Freelance', 'piattaforme freelance confronto Italia', 'it'],
  ['荷兰-Freelance', 'freelance platform vergelijken Nederland', 'nl'],
  ['北欧-Freelance', 'frilansplattform jämförelse Sverige', 'sv'],
  ['波兰-Freelance', 'platformy freelancerskie porównanie Polska', 'pl'],
  ['俄罗斯-Фриланс', 'фриланс биржи список лучших', 'ru'],
  ['印度-Freelance', 'freelance platforms India list', 'en'],
  ['东南亚-Freelance', 'platform freelance Indonesia Malaysia', 'id'],
  ['中东-Freelance', 'منصات العمل الحر العربية', 'ar'],
  ['拉美-Freelance', 'plataformas freelance Brasil México', 'pt'],
  ['全球-接单', 'best freelance marketplaces worldwide list', 'en'],
  ['赏金-Bounty', 'bug bounty platforms list comparison', 'en'],
  ['数字商品-Digital', 'digital product marketplaces sell online', 'en']
];

const all = {};
for (const [label, q, lang] of QUERIES) {
  const r = await get('https://search.yahoo.co.jp/search?p=' + encodeURIComponent(q), lang);
  const hosts = [...extractHosts(r.text)].filter(h => !JUNK.test(h));
  all[label] = hosts;
  console.log('[' + label + '] status=' + r.status + ' hosts=' + hosts.length + ' :: ' + hosts.slice(0, 6).join(', '));
  fs.writeFileSync('_yj_results.json', JSON.stringify(all, null, 1), 'utf8');
  await sleep(2200);
}

const union = new Set();
for (const v of Object.values(all)) v.forEach(h => union.add(h));
console.log('UNION=' + union.size);
fs.writeFileSync('_yj_union.json', JSON.stringify([...union]), 'utf8');