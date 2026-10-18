
const fs = await import('node:fs');
const src = 'D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/';
const files = ['ml_index.html','ml_browse.html','ml_deals.html'].map(f=>fs.readFileSync(src+f,'utf8'));
console.log(files.map(f=>f.length).join(','));
// test simple unescape + regex
const h = files[1];
const unesc = h.split(String.fromCharCode(92)+'u0026').join('&').split(String.fromCharCode(92)+'"').join('"');
console.log('unesc len', unesc.length);
const cnt = (unesc.match(/"codename":"/g)||[]).length;
console.log('codename count', cnt);
