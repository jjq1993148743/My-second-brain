
import fs from 'node:fs';
const c = JSON.parse(fs.readFileSync('_hn_comments_raw.json','utf8'));
console.log('comments:', c.length);
for (const x of c.slice(0,20)) {
  console.log('---', x.author, x.createdAt.slice(0,10), '| story:', (x.storyTitle||'').slice(0,60));
  console.log('   ', x.snippet.slice(0,300));
}
