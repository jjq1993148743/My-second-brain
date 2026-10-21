import fs from 'node:fs';
const clean = h => String(h||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ');
const files = ['forum_thegradcafe_com_search_q_22personal_20statement_22_20editing_20service_quick_1.html','forum_thegradcafe_com_search_q_tutor_20paid_quick_1.html'];
for (const f of files) {
  const p='D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/_ov2_raw/'+f;
  if(!fs.existsSync(p)){ console.log('MISS '+f); continue; }
  const t = clean(fs.readFileSync(p,'utf8'));
  const i = t.indexOf('Found');
  console.log('\n##### '+f);
  console.log(t.slice(i>0?i:0, (i>0?i:0)+4000));
}