import fs from 'node:fs';
import path from 'node:path';
const dir = process.argv[2] || '_raw_larajobs';
const out = process.argv[3] || '_larajobs_projects.json';
let files = [];
try { files = fs.readdirSync(dir).filter(f=>f.endsWith('.html')); } catch(e){}
const all = []; const seen = new Set();

for (const f of files) {
  const html = fs.readFileSync(path.join(dir,f),'utf8');
  const parts = html.split('class="job-link');
  for (let k = 1; k < parts.length; k++) {
    const chunk = parts[k].slice(0, 5000);
    const um = chunk.match(/href="(\/job\/\d+)"/);
    if (!um) continue;
    const url = um[1];
    if (seen.has(url)) continue; seen.add(url);

    const cm = chunk.match(/truncate"[^>]*>([^<]{2,80})<\/p>/);
    const company = cm ? cm[1].trim() : '';
    const tm = chunk.match(/text-lg font-bold[^>]*>([^<]{3,120})<\/p>/);
    const title = tm ? tm[1].trim() : '';
    const jm = chunk.match(/Full Time|Part Time|Contract|Freelance/i);
    const jobType = jm ? jm[0] : '';
    const bm = chunk.match(/[-\u2013]\s*([\u00a3$\u20ac]\s?[0-9][0-9,.]*(?:\s*-\s*[\u00a3$\u20ac]?\s?[0-9][0-9,.]*)?(?:\s*[kK])?)/);
    const salary = bm ? bm[1] : '';

    all.push({ url, company, title: title.slice(0,140), jobType, salary });
  }
}
fs.writeFileSync(out, JSON.stringify(all,null,1),'utf8');
console.log('TOTAL=' + all.length);
console.log('withTitle=' + all.filter(a=>a.title).length + ' withSalary=' + all.filter(a=>a.salary).length);
for (const a of all.slice(0,10)) console.log('  [' + a.salary + '] ' + a.company + ' | ' + a.title.slice(0,45));