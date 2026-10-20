import fs from 'node:fs';
const html = fs.readFileSync('_raw_twine/p10.html','utf8');
const parts = html.split(/<article[^>]*data-job-id=/);
console.log('articles=' + (parts.length-1));

const all = [];
for (let k = 1; k < parts.length; k++) {
  const b = parts[k].slice(0, 8000);
  const idm = b.match(/^"(\d+)"/);
  const id = idm ? idm[1] : '';
  // 标题：从 URL slug
  const um = b.match(/href="\/projects\/([a-z0-9\-]{5,})"/);
  const slug = um ? um[1] : '';
  const title = slug.replace(/-in-[a-z\-]+-job$/, '').replace(/-job$/, '').replace(/-/g,' ');
  // 时间
  const dm = b.match(/Posted (today|yesterday|(\d+) days? ago)/i);
  const when = dm ? dm[1] : '';
  // 状态
  const sm = b.match(/>\s*(Open|Closed)\s*</);
  const status = sm ? sm[1] : '';
  // 预算
  const bm = b.match(/[\u00a3$\u20ac]\s?[0-9][0-9,.]*(?:\s*[-\u2013]\s*[\u00a3$\u20ac]?\s?[0-9][0-9,.]*)?/);
  const budget = bm ? bm[0] : '';
  if(id) all.push({ id, title: title.slice(0,140), when, status, budget });
}
const seen = new Set();
const uniq = all.filter(a => { if(seen.has(a.id)) return false; seen.add(a.id); return true; });
fs.writeFileSync('_twine_projects.json', JSON.stringify(uniq,null,1),'utf8');
console.log('TOTAL=' + uniq.length);
console.log('withTime=' + uniq.filter(a=>a.when).length + ' withBudget=' + uniq.filter(a=>a.budget).length);
for (const a of uniq.slice(0,10)) console.log('  ' + a.when + ' [' + a.status + '] ' + a.title.slice(0,50));