import fs from 'node:fs';
import path from 'node:path';
const dir = process.argv[2] || '_raw_fles';
const out = process.argv[3] || '_fles_projects.json';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html')).sort();
const all = []; const seen = new Set();
for (const f of files) {
  const html = fs.readFileSync(path.join(dir, f), 'utf8');
  const parts = html.split(/(?=href="\/projects\/)/);
  for (let k = 1; k < parts.length; k++) {
    const chunk = parts[k].slice(0, 7000);
    const um = chunk.match(/href="(\/projects\/[^"]+)"/);
    if (!um) continue;
    const url = um[1];
    if (seen.has(url)) continue;
    const text = chunk.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ')
      .replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&aacute;/g,'a').replace(/&eacute;/g,'e').replace(/&iacute;/g,'i').replace(/&oacute;/g,'o').replace(/&uacute;/g,'u').replace(/&ntilde;/g,'n');
    const lines = text.split('\n').map(s=>s.trim()).filter(s=>s.length>0);
    const u = []; for (const l of lines) if (u[u.length-1] !== l) u.push(l);
    let budget = '';
    for (const l of u) { const bm = l.match(/^\u20ac\s?[0-9]/); if (bm) { budget = l.slice(0,30); break; } }
    const om = chunk.match(/(\d+)\s*ofertas/i);
    const bids = om ? +om[1] : null;
    const wm = chunk.match(/(hace \d+ (?:minutos?|horas?|d[ií]as?|semanas?))/i);
    const when = wm ? wm[1] : '';
    let title = '';
    for (const l of u) { if (l.length > 20 && l.length < 200 && !/^\u20ac/.test(l) && !/ofertas/i.test(l)) { title = l; break; } }
    seen.add(url);
    all.push({ url, title: title.slice(0,180), budget, bids, when, src: f });
  }
}
fs.writeFileSync(out, JSON.stringify(all, null, 1), 'utf8');
console.log('TOTAL='+all.length+' budget='+all.filter(a=>a.budget).length+' bids='+all.filter(a=>a.bids!==null).length+' time='+all.filter(a=>a.when).length);
for (const a of all.slice(0,5)) console.log('  ['+a.budget+'] o='+a.bids+' | '+a.title.slice(0,50));