import fs from 'node:fs';
import path from 'node:path';
const dir = process.argv[2] || '_raw_useme';
const out = process.argv[3] || '_useme_projects.json';
const files = fs.readdirSync(dir).filter(f=>f.endsWith('.html')).sort();
const all = []; const seen = new Set();

for (const f of files) {
  const html = fs.readFileSync(path.join(dir,f),'utf8');
  const parts = html.split('class="job__content');
  for (let k = 1; k < parts.length; k++) {
    const chunk = parts[k].slice(0, 5000);
    const um = chunk.match(/<a href="(\/en\/jobs\/([a-z0-9\-]+)[^"]*)"/);
    if (!um) continue;
    const url = um[1];
    if (seen.has(url)) continue;
    seen.add(url);

    // 标题在 a 标签内
    const tm = chunk.match(/<a href="[^"]+"[^>]*>\s*([^<]{5,150})/);
    const title = tm ? tm[1].trim() : '';

    // 整个 job 块（往前找）
    const pre = html.slice(Math.max(0, html.lastIndexOf('job__header', html.indexOf(chunk)+100)), html.indexOf(chunk));
    const preText = pre.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');

    // 投标数
    const om = preText.match(/offers[\s\S]{0,200}?<\/span>\s*<span>([0-9]+)/);
    let offers = null;
    const om2 = chunk.match(/offers[\s\S]{0,300}?<span>([0-9]+)<\/span>/);
    if (om2) offers = +om2[1];

    // 剩余天数
    const dm = chunk.match(/(\d+) days? left/);
    const daysLeft = dm ? +dm[1] : null;

    // 预算
    const bm = chunk.match(/([\u20ac$\u00a3]\s?[0-9][0-9,.]*|z\u0142\s?[0-9][0-9,.]*|[0-9][0-9,.]*\s*(?:z\u0142|PLN|EUR|USD))/);
    const budget = bm ? bm[1] : '';

    all.push({ url, title: title.slice(0,140), budget, offers, daysLeft, src: f });
  }
}

fs.writeFileSync(out, JSON.stringify(all,null,1),'utf8');
console.log('TOTAL=' + all.length);
console.log('withTitle=' + all.filter(a=>a.title.length>3).length + ' withBudget=' + all.filter(a=>a.budget).length + ' withDaysLeft=' + all.filter(a=>a.daysLeft!==null).length + ' withOffers=' + all.filter(a=>a.offers!==null).length);
for (const a of all.slice(0,8)) console.log('  [' + a.budget + '] ' + a.offers + 'offers ' + a.daysLeft + 'd | ' + a.title.slice(0,50));