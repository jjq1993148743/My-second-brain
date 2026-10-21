import fs from 'node:fs';
let html = fs.readFileSync(process.argv[2],'utf8');
html = html.replace(/<script[\s\S]*?<\/script>/g,' ').replace(/<style[\s\S]*?<\/style>/g,' ');
let txt = html.replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&');
const lines = txt.split('\n').map(s=>s.trim()).filter(Boolean);
// sequence: views, danmaku, duration, title, author, ·, date
const out=[];
for(let i=0;i<lines.length;i++){
  if(/^[0-9.]+万?$/.test(lines[i]) && /^[0-9]+$/.test(lines[i+1]||'') && /^\d{1,2}:\d{2}(:\d{2})?$/.test(lines[i+2]||'')){
    out.push({views:lines[i], danmaku:lines[i+1], dur:lines[i+2], title:lines[i+3], author:lines[i+4], date:(lines[i+6]||'')+' '+(lines[i+7]||'')});
  }
}
console.log(JSON.stringify(out.slice(0,30),null,1));
console.error('n='+out.length);
