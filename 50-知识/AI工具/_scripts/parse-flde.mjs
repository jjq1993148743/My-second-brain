import fs from 'node:fs';
import path from 'node:path';
const dir = process.argv[2] || '_raw_flde';
const out = process.argv[3] || '_flde_projects.json';
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
      .replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&Auml;/g,'Ae').replace(/&Ouml;/g,'Oe').replace(/&Uuml;/g,'Ue').replace(/&szlig;/g,'ss').replace(/&auml;/g,'ae').replace(/&ouml;/g,'oe').replace(/&uuml;/g,'ue');
    const lines = text.split('\n').map(s=>s.trim()).filter(s=>s.length>0);
    const u = []; for (const l of lines) if (u[u.length-1] !== l) u.push(l);
    // 预算
    let budget = '';
    for (const l of u) { const bm = l.match(/^\u20ac\s?[0-9]/); if (bm) { budget = l.slice(0,30); break; } }
    // 出价
    const om = chunk.match(/(\d+)\s*Angebote/i);
    const bids = om ? +om[1] : null;
    // 时间
    const wm = chunk.match(/(vor \d+ (?:Minuten?|Stunden?|Tagen?|Wochen?))/i);
    const when = wm ? wm[1] : '';
    // 标题
    let title = '';
    for (const l of u) { if (l.length > 20 && l.length < 200 && !/^\u20ac/.test(l) && !/Angebote/i.test(l)) { title = l; break; } }
    seen.add(url);
    all.push({ url, title: title.slice(0,180), budget, bids, when, src: f });
  }
}
fs.writeFileSync(out, JSON.stringify(all, null, 1), 'utf8');
const wb = all.filter(a=>a.budget).length, wbid = all.filter(a=>a.bids!==null).length, wt = all.filter(a=>a.when).length;
console.log('TOTAL='+all.length+' budget='+wb+' bids='+wbid+' time='+wt);