
import fs from 'node:fs';
const BS = String.fromCharCode(92);
function unesc(s){return s.split(BS+'u0026').join('&').split(BS+'"').join('"').split(BS+'n').join('\n').split(BS+'/').join('/');}
const h = unesc(fs.readFileSync('src_trustmrr.com_.html','utf8'));
// find numeric patterns around startup cards
const i = h.indexOf('/startup/showcaseku');
console.log(h.slice(i-1200, i+2500).replace(/\n/g,' '));
