import fs from 'node:fs';
const clean = h => String(h||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ');
const p='D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/_ov2_raw_tsr.html';
const raw = fs.readFileSync(p,'utf8');
console.log('len='+raw.length);
const t = clean(raw);
console.log(t.slice(0,4000));