import fs from 'node:fs';
for (const f of ['sidehustle_tutor.json','forhire_tutor.json']) {
  const p = 'D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/_ov2_reddit/'+f;
  const arr = JSON.parse(fs.readFileSync(p,'utf8'));
  console.log('\n########## '+f+'  n='+arr.length);
  for (const x of arr) {
    const st = String(x.selftext||'').replace(/\s+/g,' ').slice(0,900);
    console.log('--- '+new Date(x.created_utc*1000).toISOString().slice(0,10)+' | '+x.title+' | score='+x.score+' comments='+x.num_comments);
    console.log('    https://reddit.com'+x.permalink);
    console.log('    '+st);
  }
}