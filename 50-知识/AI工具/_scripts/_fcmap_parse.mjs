import fs from 'node:fs';
const html = fs.readFileSync('_fcmap.html','utf8');

// 按 project-card 切块
const parts = html.split('class="project-card');
console.log('blocks=' + (parts.length-1));

const items = [];
for (let k = 1; k < parts.length; k++) {
  const b = parts[k].slice(0, 5000);
  const text = b.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ')
    .replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&auml;/g,'ae').replace(/&ouml;/g,'oe').replace(/&uuml;/g,'ue').replace(/&szlig;/g,'ss').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
  const lines = text.split('\n').map(s=>s.trim()).filter(s=>s.length>1);
  const u = []; for (const l of lines) if (u[u.length-1] !== l) u.push(l);
  items.push(u.slice(0, 20));
}

console.log('SAMPLE BLOCK:');
if (items[0]) items[0].forEach((l,i)=>console.log('  '+i+': '+l.slice(0,80)));