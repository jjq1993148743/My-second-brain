import fs from 'node:fs';
import path from 'node:path';
const dir='D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/_ov2_raw';
const clean = h => String(h||'')
  .replace(/<script[\s\S]*?<\/script>/gi,' ')
  .replace(/<style[\s\S]*?<\/style>/gi,' ')
  .replace(/<[^>]+>/g,' ')
  .replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"')
  .replace(/\s+/g,' ');
for (const f of fs.readdirSync(dir).filter(x=>x.endsWith('.html'))) {
  const t = clean(fs.readFileSync(path.join(dir,f),'utf8'));
  console.log('\n##### '+f+'  textlen='+t.length);
  console.log(t.slice(0, 1200));
}