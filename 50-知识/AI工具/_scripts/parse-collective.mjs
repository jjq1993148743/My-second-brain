import fs from 'node:fs';
import path from 'node:path';
const dir = process.argv[2] || '_raw_collective';
const out = process.argv[3] || '_collective_projects.json';
const files = fs.readdirSync(dir).filter(f=>f.endsWith('.html')).sort();
const all = [];
for (const f of files) {
  const html = fs.readFileSync(path.join(dir, f), 'utf8');
  // 全部 chakra-text（span 和 p），保留顺序
  const items = [];
  const re = /<(span|p)[^>]*class="chakra-text[^"]*"[^>]*>([^<]{1,200})<\/\1>/g;
  let m;
  while ((m = re.exec(html)) !== null) items.push({ tag: m[1], text: m[2].trim() });

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (!/(hours?|days?|minutes?|weeks?) ago/i.test(it.text)) continue;
    // 往前找最长的一条作为标题（排除地点、类型、公司）
    let best = '';
    for (let j = i-1; j >= Math.max(0, i-20); j--) {
      const c = items[j].text;
      if (c.length < 8 || c.length > 120) continue;
      if (/^(Remote|Freelance|Contract|Full-time|Part-time|Top Recruiter|\d+\s*(days?|weeks?))/i.test(c)) continue;
      if (/^[A-Z][a-z]+(,\s*[A-Z][a-z]+)*$/.test(c)) continue;  // 地点格式
      if (c.length > best.length) best = c;
    }
    if (best) all.push({ title: best.slice(0,150), when: it.text, src: f });
  }
}
const seen = new Set();
const uniq = all.filter(a => { const k = a.title+'|'+a.when; if (seen.has(k)) return false; seen.add(k); return true; });
fs.writeFileSync(out, JSON.stringify(uniq, null, 1), 'utf8');
console.log('TOTAL=' + uniq.length);
for (const a of uniq.slice(0,12)) console.log('  ' + a.when + ' | ' + a.title.slice(0,55));