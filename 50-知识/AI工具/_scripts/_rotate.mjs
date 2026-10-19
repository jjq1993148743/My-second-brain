import http from 'node:http';
import fs from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);

const PROXY = { host: '127.0.0.1', port: 7897 };
const agent = new http.Agent({ keepAlive: true, maxSockets: 2 });
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

function httpGet(url, lang) {
  return new Promise((resolve) => {
    let done = false; let req = null;
    const fin = (v) => { if (done) return; done = true; try { if (req) req.destroy(); } catch (e) {} resolve(v); };
    const hard = setTimeout(() => fin({ status: -2, text: '' }), 25000);
    try {
      const pu = new URL(url);
      req = http.get({ agent, host: PROXY.host, port: PROXY.port, path: url, headers: { Host: pu.host, 'User-Agent': UA, 'Accept': 'text/html,*/*', 'Accept-Language': lang || 'en-US,en;q=0.9' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) { res.resume(); clearTimeout(hard); const n = res.headers.location.startsWith('http') ? res.headers.location : 'https://' + pu.host + res.headers.location; done = true; return httpGet(n, lang).then(resolve); }
        const c = []; res.on('data', d => c.push(d));
        res.on('end', () => { clearTimeout(hard); fin({ status: res.statusCode, text: Buffer.concat(c).toString('utf8') }); });
        res.on('error', () => fin({ status: -1, text: '' }));
      });
      req.on('error', () => { clearTimeout(hard); fin({ status: -1, text: '' }); });
    } catch (e) { clearTimeout(hard); fin({ status: -3, text: '' }); }
  });
}

async function braveGet(url, lang) {
  try {
    const args = ['-s', '-x', 'http://127.0.0.1:7897', '-H', 'User-Agent: ' + UA, '-H', 'Accept: text/html,*/*', '-H', 'Accept-Language: ' + (lang || 'en-US,en;q=0.9'), '--max-time', '30', url];
    const { stdout } = await execFileAsync('curl', args, { maxBuffer: 64 * 1024 * 1024, windowsHide: true });
    return { status: stdout && stdout.length > 5000 ? 200 : -1, text: stdout || '' };
  } catch (e) { return { status: -1, text: '' }; }
}

function extractHosts(html) {
  const hosts = new Set();
  for (const m of (html||'').matchAll(/href="(https?:\/\/[^"]+)"/g)) { try { hosts.add(new URL(m[1]).hostname.replace(/^www\./, '')); } catch (e) {} }
  for (const m of (html||'').matchAll(/[?&]url=([^&"']+)/g)) { try { hosts.add(new URL(decodeURIComponent(m[1])).hostname.replace(/^www\./, '')); } catch (e) {} }
  return hosts;
}

const JUNK = /(brave\.com|yahoo\.co\.jp|yahoo\.com|yimg|lycorp|google|gstatic|w3\.org|schema\.org|facebook|twitter|x\.com|instagram|linkedin|youtube|bing\.com|microsoft|msn\.com|baidu\.com|zhihu|iciba|douban|miit\.gov|wikipedia|cloudfront|akamai|g2\.com|saasworthy|flowlu|capterra|getapp|trustradius|softwareadvice|reddit\.com|quora|medium\.com|forbes|businessinsider|investopedia|shopify\.com|amazon\.com)$/i;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// 轮换队列：每条查询交替分配给 brave / yahoo
const JOBS = [
  ['日本','brave','Japan freelance platform marketplace Coconala Lancers Crowdworks','ja'],
  ['韩国','yahoo','Korea freelance platform Wishket Kmong Soomgo','ko'],
  ['台湾','brave','Taiwan 接案平台 Tasker 518 外包','zh-TW'],
  ['香港','yahoo','Hong Kong freelance platform 自由工作','zh-HK'],
  ['德国','brave','Germany freelance platform Twago Freelancermap Gulp','de'],
  ['法国','yahoo','France freelance platform Malt Comet Codeur','fr'],
  ['西班牙','brave','Spain freelance platform Workana Yeeply','es'],
  ['意大利','yahoo','Italy freelance platform confronto','it'],
  ['荷兰','brave','Netherlands freelance platform vergelijken','nl'],
  ['北欧','yahoo','Sweden Norway Denmark freelance platform frilans','sv'],
  ['波兰','brave','Poland freelance platform Useme','pl'],
  ['俄罗斯','yahoo','Russia freelance platform FL Kwork','ru'],
  ['印度','brave','India freelance platform Truelancer WorkNHire','en'],
  ['东南亚','yahoo','Indonesia Malaysia Thailand freelance platform','id'],
  ['中东','brave','Middle East freelance platform Mostaql Khamsat','ar'],
  ['拉美','yahoo','Brazil Mexico freelance platform Workana','pt'],
  ['赏金','brave','bug bounty platform list HackerOne Bugcrowd','en'],
  ['数字商品','yahoo','digital product marketplace sell online Gumroad','en'],
  ['POD','brave','print on demand marketplace Redbubble Printful','en'],
  ['联盟','yahoo','affiliate network list ShareASale CJ Awin','en'],
  ['微任务','brave','microtask platform UserTesting Prolific','en'],
  ['AI标注','yahoo','AI data annotation platform DataAnnotation Outlier','en'],
  ['课程','brave','online course marketplace Udemy Skillshare Teachable','en'],
  ['素材','yahoo','stock photo marketplace Shutterstock Adobe Stock','en']
];

const results = {};
for (let i = 0; i < JOBS.length; i++) {
  const [label, engine, q, lang] = JOBS[i];
  let r;
  if (engine === 'brave') {
    r = await braveGet('https://search.brave.com/search?q=' + encodeURIComponent(q), lang);
  } else {
    r = await httpGet('https://search.yahoo.co.jp/search?p=' + encodeURIComponent(q), lang);
  }
  const hosts = [...extractHosts(r.text)].filter(h => !JUNK.test(h) && h.includes('.'));
  results[label] = { engine, hosts };
  console.log('[' + (i+1) + '/' + JOBS.length + '] ' + label + ' via ' + engine + ' -> ' + hosts.length + ' hosts');
  fs.writeFileSync('_rotate_results.json', JSON.stringify(results, null, 1), 'utf8');
  await sleep(engine === 'brave' ? 6000 : 9000);
}

const union = new Set();
for (const v of Object.values(results)) v.hosts.forEach(h => union.add(h));
console.log('UNION=' + union.size);
fs.writeFileSync('_rotate_union.json', JSON.stringify([...union]), 'utf8');