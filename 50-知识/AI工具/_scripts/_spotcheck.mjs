import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run = (cmd, args) => new Promise(res => execFile(cmd, args, { maxBuffer: 64*1024*1024, windowsHide: true }, (e, so) => res(so || '')));
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const chrome = (url) => new Promise(res => {
  const args = ['--headless=new','--disable-gpu','--no-sandbox','--dump-dom','--virtual-time-budget=14000','--user-agent=' + UA,'--lang=en-US,en;q=0.9', url];
  execFile(CHROME, args, { maxBuffer: 64*1024*1024, windowsHide: true }, (e, so) => res(so || ''));
});
const targets = JSON.parse(fs.readFileSync('_spotcheck_targets.json', 'utf8'));
const out = [];
for (const t of targets) {
  const html = await chrome(t.url);
  const hasProj = /proj_id|posted_dt|proposalCount/.test(html);
  const closed = /(project (?:is )?closed|no longer accepting|awarded|completed|expired)/i.test(html);
  const stateMatch = html.match(/"item_state"\s*:\s*"([a-z]+)"/);
  const postedMatch = html.match(/"posted_dt"\s*:\s*"([\d\- :]+)"/);
  const propMatch = html.match(/"proposalCount"\s*:\s*(\d+)/);
  const titleMatch = html.match(/<title[^>]*>([^<]{0,120})/i);
  out.push({
    id: t.id, title: t.title,
    bytes: html.length,
    projectDataPresent: hasProj,
    itemState: stateMatch ? stateMatch[1] : null,
    postedOnPage: postedMatch ? postedMatch[1] : null,
    proposalsOnPage: propMatch ? +propMatch[1] : null,
    looksClosed: closed,
    pageTitle: titleMatch ? titleMatch[1].trim().slice(0, 80) : ''
  });
  console.log(t.id + ' bytes=' + html.length + ' state=' + (stateMatch?stateMatch[1]:'?') + ' closed=' + closed);
  await new Promise(r => setTimeout(r, 20000));
}
fs.writeFileSync('_spotcheck_results.json', JSON.stringify(out, null, 1), 'utf8');