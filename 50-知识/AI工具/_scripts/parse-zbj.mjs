import fs from 'node:fs';
import path from 'node:path';
const dirs = process.argv.slice(2);
const all = []; const seen = new Set();

for (const dir of dirs) {
  let files = [];
  try { files = fs.readdirSync(dir).filter(f=>f.endsWith('.html')); } catch (e) { continue; }
  for (const f of files) {
    const html = fs.readFileSync(path.join(dir, f), 'utf8');
    // 按任务详情链接切块
    const parts = html.split(/(?=href="https:\/\/www\.zbj\.com\/xq\/[A-Za-z0-9]+\.html")/);
    for (let k = 1; k < parts.length; k++) {
      const chunk = parts[k].slice(0, 8000);
      const um = chunk.match(/href="(https:\/\/www\.zbj\.com\/xq\/([A-Za-z0-9]+)\.html)"/);
      if (!um) continue;
      const id = um[2];
      if (seen.has(id)) continue;

      const tm = chunk.match(/class="task-names"[^>]*>([^<]{1,120})</);
      const title = tm ? tm[1].trim() : '';

      const mm = chunk.match(/class="total-money"[^>]*>([^<]{1,30})</);
      const budget = mm ? mm[1].trim() : '';

      const cm = chunk.match(/class="depict-refer"[^>]*>([^<]{1,30})</);
      const cat = cm ? cm[1].trim() : '';

      const dm = chunk.match(/class="contents-text"[^>]*>([^<]{1,300})</);
      const desc = dm ? dm[1].trim().slice(0,200) : '';

      const sm = chunk.match(/class="status-box"[^>]*>([^<]{1,20})</);
      const status = sm ? sm[1].trim() : '';

      const wm = chunk.match(/(\d{4}-\d{2}-\d{2})发布/);
      const when = wm ? wm[1] : '';

      seen.add(id);
      all.push({ id, title, budget, cat, desc, status, when, src: f });
    }
  }
}

fs.writeFileSync('_zbj_projects.json', JSON.stringify(all, null, 1), 'utf8');
console.log('TOTAL=' + all.length);
console.log('withTitle=' + all.filter(a=>a.title).length + ' withBudget=' + all.filter(a=>a.budget).length + ' withCat=' + all.filter(a=>a.cat).length + ' withDate=' + all.filter(a=>a.when).length);
for (const a of all.slice(0,10)) console.log('  ' + a.id + ' [' + a.budget + '] ' + a.cat + ' | ' + a.title.slice(0,40));