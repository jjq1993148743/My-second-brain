// ov-reddit.mjs — ArcticShift 抓 Reddit 帖子（串行，默认带 after 日期过滤避免超时）
// 用法: node ov-reddit.mjs <targets.json> [outdir]
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36';
const PROXY = 'http://127.0.0.1:7897';
const BASE = 'https://arctic-shift.photon-reddit.com/api/posts/search';
const targetsFile = process.argv[2];
const OUT = process.argv[3] || '_ov2_reddit';
if (!targetsFile) { console.error('用法: node ov-reddit.mjs <targets.json> [outdir]'); process.exit(1); }
fs.mkdirSync(OUT, { recursive: true });
const targets = JSON.parse(fs.readFileSync(targetsFile, 'utf8'));
const sleep = ms => new Promise(r => setTimeout(r, ms));

function curl(url) {
  return new Promise((resolve) => {
    execFile('curl.exe', ['-sL', '-x', PROXY, '-H', 'User-Agent: ' + UA, '--max-time', '90', '--compressed', url],
      { maxBuffer: 1024 * 1024 * 64, windowsHide: true, encoding: 'buffer' }, (err, stdout) => {
        resolve({ err, txt: stdout ? stdout.toString('utf8') : '' });
      });
  });
}

function buildUrl(t) {
  const qs = new URLSearchParams();
  qs.set('subreddit', t.sub);
  if (t.q) qs.set('query', t.q);
  qs.set('limit', '25');
  qs.set('sort', 'desc');
  qs.set('after', t.after || '2025-01-01');
  return BASE + '?' + qs.toString();
}

let ok = 0, bad = 0;
for (let i = 0; i < targets.length; i++) {
  const t = targets[i];
  const outFile = path.join(OUT, (t.sub + '__' + (t.q || 'all')).replace(/[^a-zA-Z0-9]+/g, '_') + '.json');
  if (fs.existsSync(outFile) && fs.statSync(outFile).size > 200) { console.log('SKIP ' + outFile); ok++; continue; }
  let parsed = null, last = '';
  for (let attempt = 1; attempt <= 3; attempt++) {
    const { txt } = await curl(buildUrl(t));
    last = txt;
    try { parsed = JSON.parse(txt); } catch (e) { parsed = null; }
    if (parsed && Array.isArray(parsed.data)) break;
    console.log('   重试 ' + attempt + '/3  r/' + t.sub + ' q=' + (t.q || '-') + ' :: ' + txt.slice(0, 90));
    await sleep(30000 * attempt);
  }
  if (parsed && Array.isArray(parsed.data)) {
    fs.writeFileSync(outFile, JSON.stringify(parsed.data, null, 1), 'utf8');
    console.log('[' + (i + 1) + '/' + targets.length + '] OK ' + parsed.data.length + '  r/' + t.sub + ' q=' + (t.q || '-') + ' after=' + (t.after || '2025-01-01'));
    ok++; bad = 0;
  } else {
    console.log('[' + (i + 1) + '/' + targets.length + '] FAIL r/' + t.sub + ' q=' + (t.q || '-'));
    bad++;
    if (bad >= 3) { console.log('连续失败3次，停止'); break; }
  }
  await sleep(14000 + Math.floor(Math.random() * 5000));
}
console.log('DONE ok=' + ok + ' fail=' + bad);
