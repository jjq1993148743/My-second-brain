// chrome-fetch.mjs — 用真实 Chrome headless 抓页面，绕开 Node TLS 指纹被 Cloudflare 拦的问题
// 用法: node chrome-fetch.mjs <url> [输出文件] [等待ms]
import { execFile } from 'node:child_process';
import fs from 'node:fs';
const url = process.argv[2];
const outFile = process.argv[3] || null;
const wait = process.argv[4] || '9000';
if (!url) { console.error('用法: node chrome-fetch.mjs <url> [outfile] [waitms]'); process.exit(1); }
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36';
const args = ['--headless=new','--disable-gpu','--no-sandbox','--disable-dev-shm-usage',
  '--dump-dom','--virtual-time-budget=' + wait, '--user-agent=' + UA,
  '--lang=zh-CN,zh;q=0.9', url];
execFile(CHROME, args, { maxBuffer: 1024*1024*64, windowsHide: true }, (err, stdout) => {
  if (err && !stdout) { console.error('CHROME_ERR ' + err.message.slice(0,120)); process.exit(2); }
  if (outFile) { fs.writeFileSync(outFile, stdout, 'utf8'); console.log('OK ' + stdout.length + ' -> ' + outFile); }
  else { console.log(stdout); }
});
