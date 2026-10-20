import fs from 'node:fs';
import path from 'node:path';
const dir = process.argv[2] || '_raw_workana';
const out = process.argv[3] || '_workana_projects.json';
let files = [];
try { files = fs.readdirSync(dir).filter(f=>f.endsWith('.html')); } catch(e){ files=[]; }
files.push('_workana2.html');
const all = []; const seen = new Set();

for (const f of files) {
  const full = f.includes('/')||f.startsWith('_') ? f : path.join(dir,f);
  let html='';
  try { html = fs.readFileSync(f.includes('\\')||f.startsWith('_')?f:path.join(dir,f),'utf8'); } catch(e){ continue; }
  const parts = html.split('project-item js-project');
  for (let k = 1; k < parts.length; k++) {
    const chunk = parts[k].slice(0, 6000);
    const um = chunk.match(/<a href="(\/job\/[a-z0-9\-]+)"/);
    if (!um) continue;
    const url = um[1];
    if (seen.has(url)) continue; seen.add(url);

    const tm = chunk.match(/<span title="([^"]{5,200})"/);
    const title = tm ? tm[1] : (um[1].split('/').pop().replace(/-/g,' '));

    const dm = chunk.match(/Hace (\d+) (minutos?|horas?|d[ií]as?)/i);
    const when = dm ? ('Hace ' + dm[1] + ' ' + dm[2]) : '';

    const pm = chunk.match(/\$\s?([0-9][0-9,.]*)|([0-9][0-9,.]*)\s*(?:USD|ARS|MXN)/);
    const budget = pm ? pm[0] : '';

    const om = chunk.match(/(\d+)\s*(?:propuestas?|ofertas?|pujas)/i);
    const offers = om ? +om[1] : null;

    all.push({ url, title: title.slice(0,150), when, budget, offers });
  }
}
fs.writeFileSync(out, JSON.stringify(all,null,1),'utf8');
console.log('TOTAL=' + all.length);
console.log('withTime=' + all.filter(a=>a.when).length + ' withBudget=' + all.filter(a=>a.budget).length + ' withOffers=' + all.filter(a=>a.offers!==null).length);
for (const a of all.slice(0,8)) console.log('  ' + a.when + ' | ' + a.title.slice(0,55));