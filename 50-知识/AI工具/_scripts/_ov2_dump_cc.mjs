import fs from 'node:fs';
import path from 'node:path';
const dir = 'D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/_ov2_cc/topics';
const clean = h => String(h||'').replace(/<br\s*\/?>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
for (const f of fs.readdirSync(dir).filter(f=>f.endsWith('.json'))) {
  const j = JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));
  console.log('\n##### TOPIC '+j.id+' :: '+j.title+'  ('+j.posts_count+' posts)');
  console.log('URL: https://talk.collegeconfidential.com/t/'+j.slug+'/'+j.id);
  for (const p of j.post_stream.posts) {
    console.log('--- #'+p.post_number+' u/'+p.username+' '+p.created_at.slice(0,10)+'');
    console.log(clean(p.cooked));
  }
}