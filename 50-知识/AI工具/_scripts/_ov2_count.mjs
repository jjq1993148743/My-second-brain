import fs from 'node:fs';
const arr = JSON.parse(fs.readFileSync('D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/_ov2_reddit/forhire_tutor.json','utf8'));
const fh = arr.filter(x=>/^\[?for hire\]?/i.test(x.title));
const hi = arr.filter(x=>/^\[?hiring\]?/i.test(x.title));
const rm = arr.filter(x=>/^\[removed\]/.test(String(x.selftext||'')));
console.log('total='+arr.length+' forhire='+fh.length+' hiring='+hi.length+' removed='+rm.length);
const prices = [];
for (const x of arr) { const m = String(x.title).match(/\$(\d+)(?:\s*-\s*\$?(\d+))?\s*\/?\s*(?:hr|hour|h)?/i); if (m) prices.push([m[1],m[2]||'',x.title.slice(0,80)]); }
console.log('with price in title: '+prices.length);
prices.forEach(p=>console.log('  $'+p[0]+(p[1]?'-'+p[1]:'')+'  | '+p[2]));