import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const run = (cmd, args, t) => new Promise(res => {
  execFile(cmd, args, { maxBuffer: 128*1024*1024, windowsHide: true, timeout: t || 25000 }, (e, so) => res(so || ''));
});
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const curl = u => run('curl', ['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: ' + UA,'-H','Accept-Language: en-US,en;q=0.9','--max-time','20','--compressed',u]);
const chrome = u => run(CHROME, ['--headless=new','--disable-gpu','--no-sandbox','--dump-dom','--virtual-time-budget=13000','--user-agent=' + UA, u], 40000);
const sleep = ms => new Promise(r => setTimeout(r, ms));

const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const { host, base, pages, method } = cfg;
const dir = '_raw_' + host.replace(/[^a-z0-9]/gi, '_');
fs.mkdirSync(dir, { recursive: true });
const fetchOne = method === 'chrome' ? chrome : curl;
let okCount = 0;
for (let i = 0; i < pages.length; i++) {
  const p = pages[i];
  const url = p.startsWith('http') ? p : base + p;
  const html = await fetchOne(url);
  const fn = path.join(dir, 'p' + String(i+1).padStart(2,'0') + '.html');
  fs.writeFileSync(fn, html, 'utf8');
  const blocked = /Just a moment|Checking your browser|Access Denied/i.test(html.slice(0, 8000));
  if (html.length > 5000 && !blocked) okCount++;
  console.log('[' + (i+1) + '/' + pages.length + '] ' + url.slice(0, 80) + ' -> ' + html.length + 'b' + (blocked ? ' BLOCKED' : ''));
  await sleep(2500 + Math.random() * 2000);
}
console.log('DONE ok=' + okCount + '/' + pages.length + ' dir=' + dir);