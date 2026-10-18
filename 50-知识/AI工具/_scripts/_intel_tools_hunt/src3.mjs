
import fs from 'node:fs';
const BS = String.fromCharCode(92);
function unesc(s){return s.split(BS+'u0026').join('&').split(BS+'"').join('"').split(BS+'n').join('\n').split(BS+'/').join('/');}
const h = unesc(fs.readFileSync('src_trustmrr.com.html','utf8'));
console.log('len', h.length);
for (const pat of ['MRR','revenue','"startup"','/startup/','mrr']) {
  console.log(JSON.stringify(pat), '->', (h.match(new RegExp(pat,'g'))||[]).length);
}
const slugs = [...new Set([...h.matchAll(/href="(\/startup\/[a-z0-9-]{2,60})"/g)].map(m=>m[1]))];
console.log('startup slugs:', slugs.length);
console.log(slugs.slice(0,40).join('\n'));
