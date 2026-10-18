
import fs from 'node:fs';
const BS = String.fromCharCode(92);
function unesc(s){return s.split(BS+'u0026').join('&').split(BS+'"').join('"').split(BS+'n').join('\n').split(BS+'/').join('/');}
const h = unesc(fs.readFileSync('src_trustmrr.com_.html','utf8'));
console.log('len', h.length);
const slugs = [...new Set([...h.matchAll(/href="(\/startup\/[a-z0-9-]{2,60})"/g)].map(m=>m[1]))];
console.log('startup slugs:', slugs.length);
console.log(slugs.slice(0,50).join('\n'));
// look for MRR values
const mrrs = [...new Set([...h.matchAll(/"mrr":\s*([0-9.]+)/g)].map(m=>m[1]))];
console.log('mrr values found:', mrrs.length, mrrs.slice(0,20));
const names = [...new Set([...h.matchAll(/"name":"([^"]{2,60})"/g)].map(m=>m[1]))];
console.log('names:', names.length, names.slice(0,25));
const sites = [...new Set([...h.matchAll(/"website":"(https?:\/\/[^"]{5,80})"/g)].map(m=>m[1]))];
console.log('websites:', sites.length, sites.slice(0,25));
