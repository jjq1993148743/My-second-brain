import fs from 'node:fs';
import path from 'node:path';
const dirs = process.argv.slice(2);
const all = []; const seen = new Set();

for (const dir of dirs) {
  let files = [];
  try { files = fs.readdirSync(dir).filter(f=>f.endsWith('.html')); } catch(e) { continue; }
  for (const f of files) {
    const html = fs.readFileSync(path.join(dir,f),'utf8');
    const parts = html.split('class="project-card');
    for (let k = 1; k < parts.length; k++) {
      const b = parts[k].slice(0, 6000);
      const text = b.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ')
        .replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&')
        .replace(/&auml;/g,'ae').replace(/&ouml;/g,'oe').replace(/&uuml;/g,'ue').replace(/&szlig;/g,'ss')
        .replace(/&quot;/g,'"').replace(/&#39;/g,"'");
      const lines = text.split('\n').map(s=>s.trim()).filter(s=>s.length>0);
      const u = []; for (const l of lines) if (u[u.length-1] !== l) u.push(l);

      const company = u[1] || '';
      const title = u[2] || '';
      if (!title || title.length < 8) continue;

      // 日期 (dd.mm.yyyy)
      let posted = '';
      for (const l of u) { const m = l.match(/^\d{2}\.\d{2}\.\d{4}$/); if (m) { posted = l; break; } }
      // 地点
      let loc = '';
      for (let i = 0; i < u.length-1; i++) { if (u[i].endsWith(',') && /Deutschland|sterreich|Schweiz/.test(u[i+1])) { loc = u[i].replace(/,$/,''); break; } }
      // 远程比例
      let remote = '';
      for (const l of u) { if (/^100%$/.test(l)) { remote='100%'; break; } if (/^\d{1,3}%$/.test(l)) { remote=l; break; } }
      // 合同类型
      let contract = '';
      for (const l of u) { if (/^(Freiberuflich|Festanstellung|Werkvertrag|Arbeitnehmerberlassung)$/i.test(l)) { contract=l; break; } }
      // 开始时间
      let start = '';
      for (const l of u) { if (/^(ab sofort|ab \d)/i.test(l)) { start=l; break; } }

      const key = company + '|' + title;
      if (seen.has(key)) continue;
      seen.add(key);
      all.push({ company, title: title.slice(0,140), loc, remote, contract, start, posted, src: f });
    }
  }
}

fs.writeFileSync('_fcmap_projects.json', JSON.stringify(all,null,1),'utf8');
console.log('TOTAL=' + all.length);
console.log('withDate=' + all.filter(a=>a.posted).length + ' withLoc=' + all.filter(a=>a.loc).length + ' withRemote=' + all.filter(a=>a.remote).length);
for (const a of all.slice(0,8)) console.log('  [' + a.posted + '] ' + a.company + ' | ' + a.title.slice(0,45) + ' | ' + a.remote);