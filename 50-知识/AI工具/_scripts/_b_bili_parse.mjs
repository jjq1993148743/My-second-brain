import fs from 'node:fs';
let html = fs.readFileSync(process.argv[2],'utf8');
html = html.replace(/<script[\s\S]*?<\/script>/g,' ').replace(/<style[\s\S]*?<\/style>/g,' ');
let txt = html.replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"');
let lines = txt.split('\n').map(s=>s.trim()).filter(Boolean);
const out=[];
for(let i=0;i<lines.length;i++){
  if(/^[0-9.]+万?$/.test(lines[i]) && /^[0-9]+$/.test(lines[i+1]||'') && /^\d{1,2}:\d{2}(:\d{2})?$/.test(lines[i+2]||'')){
    // collect title+author+date until next stats block
    let j=i+3, buf=[];
    while(j<lines.length && buf.length<14){
      if(/^[0-9.]+万?$/.test(lines[j]) && /^[0-9]+$/.test(lines[j+1]||'') && /^\d{1,2}:\d{2}(:\d{2})?$/.test(lines[j+2]||'')) break;
      if(lines[j]==='反馈成功'||lines[j]==='稍后再看'||lines[j]==='撤销'||lines[j].indexOf('平台将做')>=0) { j++; continue; }
      buf.push(lines[j]); j++;
    }
    out.push({views:lines[i], danmaku:lines[i+1], dur:lines[i+2], parts:buf});
  }
}
console.log(JSON.stringify(out,null,0));
console.error('n='+out.length);
