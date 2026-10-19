import http from 'node:http';
import fs from 'node:fs';
const PROXY = { host: '127.0.0.1', port: 7897 };
const agent = new http.Agent({ keepAlive: true, maxSockets: 4 });

function get(url, opts) {
  opts = opts || {};
  return new Promise((resolve) => {
    let done = false; let req = null;
    const fin = (v) => { if (done) return; done = true; try { if (req) req.destroy(); } catch (e) {} resolve(v); };
    const hard = setTimeout(() => fin({ status: -2, len: 0, text: '', err: 'hard-timeout' }), opts.timeout || 20000);
    try {
      const pu = new URL(url);
      const h = { Host: pu.host, 'User-Agent': opts.ua || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'Accept': opts.accept || 'text/html,application/xhtml+xml,application/json,*/*', 'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8' };
      if (opts.headers) for (const k in opts.headers) h[k] = opts.headers[k];
      req = http.get({ agent, host: PROXY.host, port: PROXY.port, path: url, headers: h }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume(); clearTimeout(hard);
          if (opts.noRedirect) return fin({ status: res.statusCode, len: 0, text: '', location: res.headers.location });
          const n = res.headers.location.startsWith('http') ? res.headers.location : 'https://' + pu.host + res.headers.location;
          done = true; return get(n, opts).then(resolve);
        }
        const c = []; res.on('data', d => c.push(d));
        res.on('end', () => { clearTimeout(hard); const t = Buffer.concat(c).toString('utf8'); fin({ status: res.statusCode, len: t.length, text: t }); });
        res.on('error', () => fin({ status: -1, len: 0, text: '', err: 'res-error' }));
      });
      req.on('error', (e) => { clearTimeout(hard); fin({ status: -1, len: 0, text: '', err: e.code || 'req-error' }); });
    } catch (e) { clearTimeout(hard); fin({ status: -3, len: 0, text: '', err: 'parse' }); }
  });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const Q = process.argv[2] || 'freelance platform';
const EQ = encodeURIComponent(Q);

// 每个引擎：名字、URL、判定正则（从 HTML/JSON 里找结果链接）、可选选项
const ENGINES = [
  ['google', 'https://www.google.com/search?q=' + EQ + '&num=20', /\/url\?q=(https?:[^&"]+)/g],
  ['google-ncr', 'https://www.google.com/search?q=' + EQ + '&num=20&gbv=1', /\/url\?q=(https?:[^&"]+)/g],
  ['bing-intl', 'https://www.bing.com/search?q=' + EQ + '&setlang=en&cc=US', /<h2><a[^>]+href="(https?:[^"]+)"/g],
  ['bing-cn', 'https://cn.bing.com/search?q=' + EQ, /<h2><a[^>]+href="(https?:[^"]+)"/g],
  ['bing-api-style', 'https://www.bing.com/search?q=' + EQ + '&format=rss', /<link>(https?:[^<]+)<\/link>/g],
  ['ddg-lite', 'https://lite.duckduckgo.com/lite/?q=' + EQ, /<a[^>]+href="(https?:[^"]+)"[^>]*class="result-link"/g],
  ['ddg-html', 'https://html.duckduckgo.com/html/?q=' + EQ, /<a[^>]+href="(https?:[^"]+)"[^>]*class="result__a"/g],
  ['ddg-api', 'https://api.duckduckgo.com/?q=' + EQ + '&format=json', /"FirstURL":"(https?:[^"]+)"/g],
  ['brave', 'https://search.brave.com/search?q=' + EQ, /<a[^>]+href="(https?:\/\/[^"]+)"[^>]*class="[^"]*result/g],
  ['startpage', 'https://www.startpage.com/sp/search?query=' + EQ, /href="(https?:\/\/[^"]+)"[^>]*class="[^"]*result/g],
  ['mojeek', 'https://www.mojeek.com/search?q=' + EQ, /<a[^>]+href="(https?:[^"]+)"[^>]*class="ob"/g],
  ['marginalia', 'https://search.marginalia.nu/search?query=' + EQ, /<a[^>]+href="(https?:[^"]+)"/g],
  ['marginalia-old', 'https://old-search.marginalia.nu/search?query=' + EQ, /<a[^>]+href="(https?:[^"]+)"/g],
  ['yandex', 'https://yandex.com/search/?text=' + EQ, /href="(https?:\/\/[^"]+)"[^>]*class="[^"]*Organic/g],
  ['ecosia', 'https://www.ecosia.org/search?q=' + EQ, /href="(https?:\/\/[^"]+)"/g],
  ['qwant-api', 'https://api.qwant.com/v3/search/web?q=' + EQ + '&count=10&locale=en_US&offset=0&device=desktop', /"url":"(https?:\/\/[^"]+)"/g],
  ['searx-be', 'https://searx.be/search?q=' + EQ + '&format=json', /"url":"(https?:[^"]+)"/g],
  ['searx-tiekoetter', 'https://searx.tiekoetter.com/search?q=' + EQ + '&format=json', /"url":"(https?:[^"]+)"/g],
  ['searx-bus-hit', 'https://search.bus-hit.me/search?q=' + EQ, /<a[^>]+href="(https?:[^"]+)"[^>]*class="url_header"/g],
  ['searxng-site', 'https://searxng.site/search?q=' + EQ, /<a[^>]+href="(https?:[^"]+)"[^>]*class="url_header"/g],
  ['searx-ng', 'https://searxng.world/search?q=' + EQ, /<a[^>]+href="(https?:[^"]+)"[^>]*class="url_header"/g],
  ['yep', 'https://api.yep.com/fs/2/search?client=web&gl=US&no_correct=false&q=' + EQ + '&safeSearch=off&type=web', /"url":"(https?:[^"]+)"/g],
  ['presearch', 'https://presearch.com/search?q=' + EQ, /href="(https?:\/\/[^"]+)"/g],
  ['gigablast', 'https://gigablast.org/search?q=' + EQ, /href="(https?:\/\/[^"]+)"/g],
  ['rightdao', 'https://rightdao.com/search?query=' + EQ, /href="(https?:\/\/[^"]+)"/g],
  ['alexandria', 'https://alexandria.org/?query=' + EQ, /href="(https?:\/\/[^"]+)"/g],
  ['baidu', 'https://www.baidu.com/s?wd=' + EQ + '&rn=20', /href="(http:\/\/www\.baidu\.com\/link\?url=[^"]+)"/g],
  ['sogou', 'https://www.sogou.com/web?query=' + EQ, /href="(\/link\?url=[^"]+)"/g],
  ['so360', 'https://www.so.com/s?q=' + EQ, /href="(https?:\/\/[^"]+)"[^>]*data-mdurl/g],
  ['toutiao', 'https://so.toutiao.com/search?keyword=' + EQ, /href="(https?:\/\/[^"]+)"/g],
  ['quark', 'https://quark.sm.cn/s?q=' + EQ, /href="(https?:\/\/[^"]+)"/g],
  ['shenma', 'https://m.sm.cn/s?q=' + EQ, /href="(https?:\/\/[^"]+)"/g],
  ['wiby', 'https://wiby.me/?q=' + EQ, /href="(https?:\/\/[^"]+)"/g],
  ['stract', 'https://stract.com/search?q=' + EQ, /href="(https?:\/\/[^"]+)"/g],
  ['searchmysite', 'https://searchmysite.net/search/?q=' + EQ, /href="(https?:\/\/[^"]+)"/g],
  ['teclis', 'https://teclis.com/search?q=' + EQ, /href="(https?:\/\/[^"]+)"/g],
  ['lukol', 'https://www.lukol.com/s.php?q=' + EQ, /href="(https?:\/\/[^"]+)"/g],
  ['exalead', 'https://www.exalead.com/search/web/results/?q=' + EQ, /href="(https?:\/\/[^"]+)"/g],
  ['seznam', 'https://search.seznam.cz/?q=' + EQ, /href="(https?:\/\/[^"]+)"/g],
  ['naver', 'https://search.naver.com/search.naver?query=' + EQ, /href="(https?:\/\/[^"]+)"/g],
  ['yahoo', 'https://search.yahoo.com/search?p=' + EQ, /href="(https?:\/\/[^"]+)"/g],
  ['aol', 'https://search.aol.com/aol/search?q=' + EQ, /href="(https?:\/\/[^"]+)"/g],
  ['ask', 'https://www.ask.com/web?q=' + EQ, /href="(https?:\/\/[^"]+)"/g],
  ['dogpile', 'https://www.dogpile.com/serp?q=' + EQ, /href="(https?:\/\/[^"]+)"/g],
  ['metager', 'https://metager.org/meta/meta.ger3?eingabe=' + EQ, /href="(https?:\/\/[^"]+)"/g],
  ['swisscows', 'https://swisscows.com/en/web?query=' + EQ, /href="(https?:\/\/[^"]+)"/g],
  ['lukol2', 'https://www.lukol.com/s.php?q=' + EQ + '&v=2', /href="(https?:\/\/[^"]+)"/g],
  ['grep-app', 'https://grep.app/api/search?q=' + EQ, /"url":"(https?:[^"]+)"/g],
  ['commoncrawl-index', 'https://index.commoncrawl.org/CC-MAIN-2024-38-index?url=*.com&output=json&limit=5', /"url":"(https?:[^"]+)"/g]
];

const NOISE = /(google\.|bing\.com|microsoft|msn\.com|duckduckgo|brave\.com|startpage|mojeek|marginalia|yandex|ecosia|qwant|searx|yep\.com|presearch|gigablast|rightdao|alexandria|baidu\.com|sogou\.com|so\.com|toutiao|sm\.cn|wiby|stract|searchmysite|teclis|lukol|exalead|seznam|naver|yahoo|aol|ask\.com|dogpile|metager|swisscows|grep\.app|commoncrawl|w3\.org|schema\.org|creativecommons|gstatic|googleapis|wikipedia\.org|facebook\.com|twitter\.com|x\.com|instagram\.com|linkedin\.com|youtube\.com|pinterest|tiktok\.com)/i;

const results = [];
for (const [name, url, re] of ENGINES) {
  const r = await get(url);
  const blocked = /captcha|are you a robot|unusual traffic|verify you are human|Just a moment|enable JavaScript|Access Denied|403 Forbidden|cf-chl/i.test(r.text || '');
  const found = [];
  if (r.text && r.status === 200) {
    let m; re.lastIndex = 0;
    while ((m = re.exec(r.text)) !== null && found.length < 300) {
      let u = m[1];
      if (u.startsWith('/link?url=')) u = 'https://www.sogou.com' + u;
      found.push(u.replace(/&amp;/g, '&'));
    }
  }
  const hosts = new Set();
  for (const u of found) { try { const h = new URL(u).hostname.replace(/^www\./, ''); if (!NOISE.test(h)) hosts.add(h); } catch (e) {} }
  const rec = { name, status: r.status, len: r.len || 0, blocked, rawLinks: found.length, cleanHosts: hosts.size, sample: [...hosts].slice(0, 10), err: r.err || '' };
  results.push(rec);
  const verdict = rec.cleanHosts >= 3 ? 'USABLE' : (rec.cleanHosts > 0 ? 'weak  ' : 'no    ');
  console.log(verdict + ' ' + name + ' status=' + rec.status + ' links=' + rec.rawLinks + ' hosts=' + rec.cleanHosts + (blocked ? ' BLOCKED' : '') + (rec.err ? ' ' + rec.err : ''));
  fs.writeFileSync('_engine_hunt.json', JSON.stringify(results, null, 1), 'utf8');
  await sleep(1200);
}

const usable = results.filter(x => x.cleanHosts >= 3);
console.log('');
console.log('=== USABLE COUNT: ' + usable.length + ' / ' + results.length + ' ===');
for (const u of usable) console.log(u.name + ' -> ' + JSON.stringify(u.sample.slice(0, 6)));