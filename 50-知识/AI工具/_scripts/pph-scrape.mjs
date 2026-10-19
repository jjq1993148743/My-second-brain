// pph-scrape.mjs —— PPH 全量串行抓取（33页 × 20条）
import { execFile } from 'node:child_process';
import fs from 'node:fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const OUT = '_pph_projects.json';
const LOG = '_pph_scrape.log';
function log(s) { console.log(s); try { fs.appendFileSync(LOG, s + '\n', 'utf8'); } catch (e) {} }
const sleep = ms => new Promise(r => setTimeout(r, ms));

function chromeFetch(url, waitMs) {
  return new Promise((resolve) => {
    const args = ['--headless=new','--disable-gpu','--no-sandbox','--disable-dev-shm-usage',
      '--dump-dom','--virtual-time-budget=' + waitMs, '--user-agent=' + UA, '--lang=en-US,en;q=0.9', url];
    execFile(CHROME, args, { maxBuffer: 128*1024*1024, windowsHide: true }, (err, stdout) => resolve(stdout || ''));
  });
}

function extractState(html) {
  const marker = 'window.PPHReact.initialState=';
  const i = html.indexOf(marker);
  if (i < 0) return null;
  const start = i + marker.length;
  let depth = 0, end = -1;
  for (let j = start; j < html.length; j++) {
    const c = html[j];
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { end = j + 1; break; } }
    else if (c === '"') { j++; while (j < html.length && html[j] !== '"') { if (html[j] === '\\\\') j++; j++; } }
  }
  if (end < 0) return null;
  try { return JSON.parse(html.slice(start, end)); } catch (e) { return null; }
}

let all = [];
try { all = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch {}
const seen = new Set(all.map(x => x.proj_id));
log('START with ' + all.length);

const MAXPAGE = 33;
let fail = 0;
for (let page = 1; page <= MAXPAGE; page++) {
  const url = 'https://www.peopleperhour.com/freelance-jobs?page=' + page;
  log('[' + page + '/' + MAXPAGE + '] page ' + page);
  const html = await chromeFetch(url, 14000);
  const st = extractState(html);
  if (!st || !st.entities || !st.entities.projects) {
    log('    FAIL bytes=' + html.length);
    fail++;
    if (fail >= 3) { log('    3 fails, stop'); break; }
    await sleep(70000);
    continue;
  }
  fail = 0;
  const projs = Object.values(st.entities.projects);
  let added = 0;
  for (const p of projs) {
    const a = p.attributes;
    if (!a || !a.proj_id || seen.has(a.proj_id)) continue;
    seen.add(a.proj_id);
    all.push(a);
    added++;
  }
  log('    got=' + projs.length + ' new=' + added + ' total=' + all.length);
  fs.writeFileSync(OUT, JSON.stringify(all, null, 1), 'utf8');
  await sleep(35000 + Math.random() * 15000);
}
log('DONE total=' + all.length);