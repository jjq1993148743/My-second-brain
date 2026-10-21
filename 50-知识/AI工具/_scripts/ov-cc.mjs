// ov-cc.mjs — College Confidential (Discourse) 搜索 + 取帖全文
// 用法: node ov-cc.mjs <queries.json> [outdir]
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36';
const PROXY = 'http://127.0.0.1:7897';
const HOST = 'https://talk.collegeconfidential.com';
const qfile = process.argv[2];
const OUT = process.argv[3] || '_ov2_cc';
if (!qfile) { console.error('用法: node ov-cc.mjs <queries.json> [outdir]'); process.exit(1); }
fs.mkdirSync(OUT, { recursive: true });
const queries = JSON.parse(fs.readFileSync(qfile, 'utf8'));
const sleep = ms => new Promise(r => setTimeout(r, ms));

function curl(url) {
  return new Promise((resolve) => {
    execFile('curl.exe', ['-sL', '-x', PROXY, '-H', 'User-Agent: ' + UA, '--max-time', '60', '--compressed', url],
      { maxBuffer: 1024 * 1024 * 64, windowsHide: true, encoding: 'buffer' }, (err, stdout) => {
        resolve(stdout ? stdout.toString('utf8') : '');
      });
  });
}

function clean(h) {
  return String(h || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ').trim();
}

const summary = [];
for (let i = 0; i < queries.length; i++) {
  const q = queries[i];
  const url = HOST + '/search.json?q=' + encodeURIComponent(q);
  const txt = await curl(url);
  let j = null;
  try { j = JSON.parse(txt); } catch (e) { }
  if (!j || !Array.isArray(j.posts)) { console.log('[' + (i + 1) + '/' + queries.length + '] FAIL q=' + q); await sleep(6000); continue; }
  const topics = {};
  for (const t of (j.topics || [])) topics[t.id] = t;
  const rows = j.posts.slice(0, 20).map(p => ({
    topicId: p.topic_id,
    title: topics[p.topic_id] ? clean(topics[p.topic_id].title) : '',
    created: (p.created_at || '').slice(0, 10),
    user: p.username,
    text: clean(p.blurb),
  }));
  fs.writeFileSync(path.join(OUT, 'search_' + String(i + 1).padStart(2, '0') + '.json'), JSON.stringify({ query: q, rows, topicTitles: topics }, null, 1), 'utf8');
  console.log('[' + (i + 1) + '/' + queries.length + '] OK ' + rows.length + ' q=' + q);
  summary.push({ q, n: rows.length });
  await sleep(6000 + Math.floor(Math.random() * 3000));
}
console.log('DONE ' + JSON.stringify(summary));
