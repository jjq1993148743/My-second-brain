import fs from 'node:fs';
import path from 'node:path';
const dirs = process.argv.slice(2);
const all = []; const seen = new Set();

for (const dir of dirs) {
  let files = [];
  try { files = fs.readdirSync(dir).filter(f=>f.endsWith('.html')); } catch (e) { continue; }
  for (const f of files) {
    const html = fs.readFileSync(path.join(dir, f), 'utf8');
    // 按 b-post__grid 切块（每个项目一个）
    const blocks = html.split('<div class="b-post__grid">');
    for (let k = 1; k < blocks.length; k++) {
      const b = blocks[k].slice(0, 9000);
      const idm = b.match(/href="\/projects\/(\d+)\/([^"]+)"/);
      if (!idm) continue;
      const id = idm[1];
      if (seen.has(id)) continue;

      // 标题：<h2 ...><a ...>TITLE</a>
      const tm = b.match(/<h2[^>]*>[\s\S]{0,400}?<a[^>]*>([^<]{3,250})<\/a>/);
      const title = tm ? tm[1].replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim() : '';

      // 预算：b-post__price 里的数字
      let budget = '';
      const pi = b.indexOf('b-post__price');
      if (pi >= 0) {
        const seg = b.slice(pi, pi + 700);
        const numM = seg.match(/>\s*([0-9][0-9\s\u00a0]{2,15})\s*(?:&nbsp;)?\s*<span class="fl-rub"/);
        if (numM) budget = numM[1].replace(/[\s\u00a0]+/g, '') + ' RUB';
        else if (/по договоренности/i.test(seg)) budget = 'negotiable';
        else if (/по результатам собеседования/i.test(seg)) budget = 'interview-based';
      }

      // 时间
      const wm = b.match(/>([^<]*?(?:назад|Только что|сегодня|вчера)[^<]{0,30})</i);
      const when = wm ? wm[1].trim().slice(0,40) : '';

      // 类型（Вакансия / Проект）
      const km = b.match(/b-post__bold[^>]*>\s*([А-Яа-яё\s]{3,20})/);
      const kind = km ? km[1].trim() : '';

      // 出价数
      const om = b.match(/(\d+)\s*(?:отклик|ставк|предложен)/i);
      const offers = om ? +om[1] : null;

      seen.add(id);
      all.push({ id, title, budget, when, kind, offers, page: f });
    }
  }
}

fs.writeFileSync('_flru_final.json', JSON.stringify(all, null, 1), 'utf8');
const wb = all.filter(a=>a.budget).length, wt = all.filter(a=>a.when).length, wti = all.filter(a=>a.title).length;
console.log('TOTAL='+all.length+' withBudget='+wb+' withTime='+wt+' withTitle='+wti);
console.log('---');
for (const a of all.slice(0,10)) console.log('  '+a.id+' | '+a.budget+' | '+a.when+' | '+a.kind+' | '+a.title.slice(0,50));