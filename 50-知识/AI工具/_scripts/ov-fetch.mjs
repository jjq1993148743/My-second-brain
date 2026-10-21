// ov-fetch.mjs — 国外学生论坛串行抓取（curl 走代理，间隔随机 4-8s）
// 用法: node ov-fetch.mjs <urls.txt> [outdir]
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36';
const PROXY = 'http://127.0.0.1:7897';
const listFile = process.argv[2];
if (!listFile) { console.error('用法: node ov-fetch.mjs <urls.txt> [outdir]'); process.exit(1); }
const OUT = process.argv[3] || '_ov2_raw';
fs.mkdirSync(OUT, { recursive: true });

const lines = fs.readFileSync(listFile, 'utf8').split(/\r?\n/).map(s => s.trim()).filter(s => s && !s.startsWith('#'));
const sleep = ms => new Promise(r => setTimeout(r, ms));

function slug(u) {
  return u.replace(/^https?:\/\//, '').replace(/[^a-zA-Z0-9]+/g, '_').slice(0, 110);
}

for (let i = 0; i < lines.length; i++) {
  const url = lines[i];
  const out = path.join(OUT, slug(url) + '.html');
  if (fs.existsSync(out) && fs.statSync(out).size > 2000) { console.log('SKIP(cached) ' + url); continue; }
  await new Promise((resolve) => {
    execFile('curl.exe', ['-sL', '-x', PROXY, '-H', 'User-Agent: ' + UA, '-H', 'Accept-Language: en-US,en;q=0.9', '--max-time', '35', '--compressed', '-o', out, '-w', '%{http_code} %{size_download}', url],
      { maxBuffer: 1024 * 1024 * 8, windowsHide: true }, (err, stdout, stderr) => {
        console.log('[' + (i + 1) + '/' + lines.length + '] ' + (stdout || err && err.message) + '  ' + url);
        resolve();
      });
  });
  const sz = fs.existsSync(out) ? fs.statSync(out).size : 0;
  if (sz < 500) console.log('   !!! 太小 (' + sz + 'B)，可疑：' + url);
  await sleep(4000 + Math.floor(Math.random() * 4500));
}
console.log('DONE');
