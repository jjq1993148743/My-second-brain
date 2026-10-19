import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

async function cget(url, lang) {
  try {
    const args = ['-sL', '-x', 'http://127.0.0.1:7897', '-H', 'User-Agent: ' + UA, '-H', 'Accept: text/html,*/*', '-H', 'Accept-Language: ' + (lang || 'en-US,en;q=0.9'), '--max-time', '35', url];
    const { stdout } = await execFileAsync('curl', args, { maxBuffer: 64 * 1024 * 1024, windowsHide: true });
    return stdout || '';
  } catch (e) { return ''; }
}

function extract(html) {
  const s = new Set();
  for (const m of (html||'').matchAll(/href="(https?:\/\/[^"]+)"/g)) { try { s.add(new URL(m[1]).hostname.replace(/^www\./, '').toLowerCase()); } catch (e) {} }
  for (const m of (html||'').matchAll(/[?&]url=([^&"']+)/g)) { try { s.add(new URL(decodeURIComponent(m[1])).hostname.replace(/^www\./, '').toLowerCase()); } catch (e) {} }
  return s;
}

// 每个引擎把自身域名全部排除
const SELF = {
  'Yahoo Japan': /(yahoo|yimg|lycorp|lycbiz|lycos)/i,
  'Brave': /(brave\.com|brave\.app|bravesoftware)/i,
  'Bing': /(bing\.com|microsoft|msn\.com|windows)/i,
  'Naver': /(naver|pstatic|nid\.naver)/i,
  'Seznam': /(seznam|szn\.cz)/i,
  'SearchMySite': /(searchmysite)/i,
  'Wiby': /(wiby\.me)/i,
  '神马': /(sm\.cn|uc\.cn|ucweb|alibaba)/i,
  'Mojeek': /(mojeek)/i,
  'Marginalia': /(marginalia)/i
};
const COMMON = /(google|gstatic|w3\.org|schema\.org|creativecommons|facebook\.com|twitter\.com|x\.com|instagram|linkedin|youtube\.com|youtu\.be|wikipedia\.org)$/i;

const ENGINES = [
  ['Yahoo Japan', 'https://search.yahoo.co.jp/search?p=', 'ja'],
  ['Brave', 'https://search.brave.com/search?q=', 'en'],
  ['Bing', 'https://www.bing.com/search?q=%s&setlang=en&cc=us', 'en'],
  ['Naver', 'https://search.naver.com/search.naver?query=', 'ko'],
  ['Seznam', 'https://search.seznam.cz/?q=', 'cs'],
  ['SearchMySite', 'https://searchmysite.net/search/?q=', 'en'],
  ['Wiby', 'https://wiby.me/?q=', 'en'],
  ['神马', 'https://m.sm.cn/s?q=', 'zh-CN'],
  ['Mojeek', 'https://www.mojeek.com/search?q=', 'en'],
  ['Marginalia', 'https://old-search.marginalia.nu/search?query=', 'en']
];

const QS = ['freelance platform', 'bug bounty program'];
const table = [];
for (const [name, tpl, lang] of ENGINES) {
  const row = { name, counts: [], total: 0 };
  for (const q of QS) {
    const EQ = encodeURIComponent(q);
    const url = tpl.includes('%s') ? tpl.replace('%s', EQ) : tpl + EQ;
    const html = await cget(url, lang);
    const all = [...extract(html)];
    const clean = all.filter(h => !SELF[name].test(h) && !COMMON.test(h) && h.includes('.') && !/^[0-9]/.test(h));
    row.counts.push(clean.length);
    row.total += clean.length;
    if (clean.length > 0 && !row.ex) row.ex = clean.slice(0, 4);
    await new Promise(r => setTimeout(r, 4000));
  }
  table.push(row);
  console.log(name + ' -> [' + row.counts.join(', ') + '] total=' + row.total);
}
console.log('');
console.log(JSON.stringify(table, null, 1));