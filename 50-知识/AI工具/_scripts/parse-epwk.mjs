import fs from 'node:fs';
import path from 'node:path';
const dirs = process.argv.slice(2);
const all = []; const seen = new Set();

for (const dir of dirs) {
  let files = [];
  try { files = fs.readdirSync(dir).filter(f=>f.endsWith('.html')); } catch (e) { continue; }
  for (const f of files) {
    const html = fs.readFileSync(path.join(dir, f), 'utf8');
    // 按 itemblock 切
    const blocks = html.split('<div class="itemblock"');
    for (let k = 1; k < blocks.length; k++) {
      const b = blocks[k].slice(0, 8000);
      const idm = b.match(/task\.epwk\.com\/(\d+)\//);
      if (!idm) continue;
      const id = idm[1];
      if (seen.has(id)) continue;

      // 标题：<a ... title="TITLE" ...>
      const tm = b.match(/<a[^>]*title="([^"]{3,200})"[^>]*>/);
      const title = tm ? tm[1].replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim() : '';

      // 预算：找 ¥ 数字
      const bm = b.match(/[\u00a5\uffe5]\s?([0-9][0-9,.]*)/);
      const budget = bm ? '¥' + bm[1] : '';

      // 浏览/投标：找 x人 模式
      const ppl = [...b.matchAll(/([0-9]+)\s*\u4eba/g)].map(m=>+m[1]);
      const views = ppl[0] || null;
      const bids = ppl[1] || null;

      // 状态
      const stm = b.match(/(\u6295\u6807\u4e2d|\u5df2\u5b8c\u7ed3|\u5df2\u9009\u6807|\u62db\u52df\u4e2d|\u5df2\u6258\u7ba1)/);
      const status = stm ? stm[1] : '';

      // 类型标签
      const tm2 = title.match(/^\u3010([^\u3011]+)\u3011/);
      const cat = tm2 ? tm2[1] : '';

      seen.add(id);
      all.push({ id, title: title.slice(0,150), cat, budget, views, bids, status, src: f });
    }
  }
}

fs.writeFileSync('_epwk_projects.json', JSON.stringify(all, null, 1), 'utf8');
console.log('TOTAL=' + all.length);
console.log('withTitle=' + all.filter(a=>a.title).length + ' withBudget=' + all.filter(a=>a.budget).length + ' withBids=' + all.filter(a=>a.bids!==null).length);
for (const a of all.slice(0, 12)) console.log('  ' + a.id + ' [' + a.budget + '] b=' + a.bids + ' | ' + a.title.slice(0, 50));