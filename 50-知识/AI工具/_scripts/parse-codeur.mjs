import fs from 'node:fs';
import path from 'node:path';
const dirs = process.argv.slice(2);
const all = []; const seen = new Set();

for (const dir of dirs) {
  let files = [];
  try { files = fs.readdirSync(dir).filter(f=>f.endsWith('.html')); } catch (e) { continue; }
  for (const f of files) {
    const html = fs.readFileSync(path.join(dir, f), 'utf8');
    const parts = html.split(/(?=href="\/projects\/\d+)/);
    for (let k = 1; k < parts.length; k++) {
      const chunk = parts[k].slice(0, 6000);
      const idm = chunk.match(/href="\/projects\/(\d+)-([^"]+)"/);
      if (!idm) continue;
      const id = idm[1];
      if (seen.has(id)) continue;

      // 预算：title="Budget" 后的文本
      let budget = '';
      const bm = chunk.match(/title="Budget"[^>]*>[\s\S]{0,300}?<\/span>\s*([^<]{2,40})/);
      if (bm) budget = bm[1].trim();
      if (!budget) {
        const bm2 = chunk.match(/(Moins de [0-9\s]+\u20ac|[0-9][0-9\s]*\u20ac\s*-\s*[0-9][0-9\s]*\u20ac|Plus de [0-9\s]+\u20ac)/);
        if (bm2) budget = bm2[1];
      }

      // 时间
      let when = '';
      const wm = chunk.match(/(Il y a \d+ (?:minutes?|heures?|jours?|semaines?))/i);
      if (wm) when = wm[1];

      // 出价数
      let offers = null;
      const om = chunk.match(/(\d+)\s*Offres/i);
      if (om) offers = +om[1];

      // 浏览数
      let views = null;
      const vm = chunk.match(/(\d+)\s*Vues/i);
      if (vm) views = +vm[1];

      // 状态
      const stm = chunk.match(/>(\s*(?:Ouvert|Ferm\u00e9|En cours)\s*)</i);
      const status = stm ? stm[1].trim() : '';

      const slug = idm[2].replace(/-/g,' ');
      seen.add(id);
      all.push({ id, title: slug.slice(0,150), budget, when, offers, views, status, src: f });
    }
  }
}

fs.writeFileSync('_codeur_projects.json', JSON.stringify(all, null, 1), 'utf8');
console.log('TOTAL='+all.length);
console.log('withBudget='+all.filter(a=>a.budget).length+' withTime='+all.filter(a=>a.when).length+' withOffers='+all.filter(a=>a.offers!==null).length+' withViews='+all.filter(a=>a.views!==null).length);
console.log('---');
for (const a of all.slice(0,10)) console.log('  ['+a.budget+'] off='+a.offers+' | '+a.when+' | '+a.title.slice(0,45));