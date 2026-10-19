import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run = (cmd, args) => new Promise(res => {
  const p = execFile(cmd, args, { maxBuffer: 64*1024*1024, windowsHide: true, timeout: 15000, killSignal: 'SIGKILL' }, (e, so) => res(so || ''));
});
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl = u => run('curl', ['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: ' + UA,'-H','Accept-Language: en-US,en;q=0.9','--max-time','20','--compressed',u]);
const sleep = ms => new Promise(r => setTimeout(r, ms));

const T = JSON.parse(fs.readFileSync('_targets50_paths.json', 'utf8'));
const OUT = '_feasibility.json';
let done = [];
try { done = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch {}
const seen = new Set(done.map(d => d.host));

for (const t of T) {
  if (seen.has(t.host)) continue;
  let html = '';
  try { html = await curl(t.url); } catch (e) { html = ''; }
  const blocked = /Just a moment|Checking your browser|Access Denied|cf-browser-verification/i.test(html.slice(0, 8000));
  let sig = 0;
  const hasMoney = /[$£€¥]\s?\d/.test(html);
  const hasTime = /\b\d+\s*(?:days?|hours?|minutes?)\s*ago\b/i.test(html);
  const hasWords = /(budget|proposal|bids?|posted|price|project)/i.test(html);
  const hasList = /(open|active|available|latest)\s+(projects?|jobs?|tasks?|bounties|gigs?)/i.test(html);
  if (hasMoney) sig++; if (hasTime) sig++; if (hasWords) sig++; if (hasList) sig++;
  const rec = { host: t.host, url: t.url, ok: !blocked && html.length > 15000 && sig >= 2, bytes: html.length, blocked, signals: sig,
              hasMoney, hasTime, hasWords, hasList };
  done.push(rec);
  console.log((rec.ok?'OK   ':'no   ') + t.host.padEnd(24) + ' sig=' + sig + ' ' + html.length + 'b' + (blocked?' BLOCKED':''));
  fs.writeFileSync(OUT, JSON.stringify(done, null, 1), 'utf8');
  await sleep(1200);
}
const ok = done.filter(d => d.ok);
console.log('FEASIBLE=' + ok.length + '/' + done.length);