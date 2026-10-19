import fs from 'node:fs';
import path from 'node:path';

const dirs = process.argv.slice(2);
const all = []; const seen = new Set();

for (const dir of dirs) {
  let files = [];
  try { files = fs.readdirSync(dir).filter(f=>f.endsWith('.html')); } catch (e) { continue; }
  for (const f of files) {
    const html = fs.readFileSync(path.join(dir, f), 'utf8');
    // 按项目链接切块
    const parts = html.split(/(?=href="\/projects\/\d+)/);
    for (let k = 1; k < parts.length; k++) {
      const chunk = parts[k].slice(0, 6000);
      const idm = chunk.match(/href="\/projects\/(\d+)\/([^"]+)"/);
      if (!idm) continue;
      const id = idm[1];
      if (seen.has(id)) continue;
      const slug = idm[2].replace(/\.html$/, '');
      const text = chunk.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ')
        .replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&laquo;/g,'«').replace(/&raquo;/g,'»');
      const lines = text.split('\n').map(s=>s.trim()).filter(s=>s.length>1);
      const uniq = []; for (const l of lines) if (uniq[uniq.length-1] !== l) uniq.push(l);

      // 预算
      let budget = '';
      for (const l of uniq) {
        const bm = l.match(/((?:до\s+)?[0-9][0-9\s]*(?:\s*[-–]\s*[0-9][0-9\s]*)?\s*(?:₽|руб\.?))/i);
        if (bm) { budget = bm[1].replace(/\s+/g,' ').trim(); break; }
      }
      // 时间
      let when = '';
      for (const l of uniq) if (/(минут|час|день|дня|дней)\s*назад/i.test(l)) { when = l; break; }
      // 出价数
      let offers = null;
      for (const l of uniq) { const om = l.match(/^(\d+)\s*(?:отклик|ставк|предложен)/i); if (om) { offers = +om[1]; break; } }
      // 标题：从 slug 还原 + 找中文行
      let title = '';
      for (const l of uniq) if (l.length > 15 && l.length < 200 && /[а-яА-Я]/.test(l) && !/^(Откликнуться|Удал[её]нно)/.test(l)) { title = l; break; }

      seen.add(id);
      all.push({ id, slug, title: title.slice(0,180), budget, when, offers, src: dir + '/' + f });
    }
  }
}

fs.writeFileSync('_flru_final.json', JSON.stringify(all, null, 1), 'utf8');
const withBudget = all.filter(a=>a.budget).length;
const withTime = all.filter(a=>a.when).length;
const withTitle = all.filter(a=>a.title).length;
console.log('TOTAL='+all.length+' withBudget='+withBudget+' withTime='+withTime+' withTitle='+withTitle);
for (const a of all.slice(0,6)) console.log('  '+a.id+' ['+a.budget+'] '+a.when+' | '+a.title.slice(0,55));