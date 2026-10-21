import fs from 'node:fs';
let html = fs.readFileSync('_b_bili_fuye.html','utf8');
html = html.replace(/<script[\s\S]*?<\/script>/g,' ').replace(/<style[\s\S]*?<\/style>/g,' ');
let txt = html.replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&');
let lines = txt.split('\n').map(s=>s.trim()).filter(Boolean);
const rows=[];
for(let i=0;i<lines.length;i++){
  if(/^[0-9.]+万?$/.test(lines[i]) && /^[0-9]+$/.test(lines[i+1]||'') && /^\d{1,2}:\d{2}(:\d{2})?$/.test(lines[i+2]||'')){
    let j=i+3, buf=[];
    while(j<lines.length && buf.length<16){
      if(/^[0-9.]+万?$/.test(lines[j]) && /^[0-9]+$/.test(lines[j+1]||'') && /^\d{1,2}:\d{2}(:\d{2})?$/.test(lines[j+2]||'')) break;
      if(['反馈成功','稍后再看','撤销'].includes(lines[j])||lines[j].includes('平台将做')){j++;continue;}
      buf.push(lines[j]); j++;
    }
    const dIdx = buf.findIndex(x=>x.startsWith('· '));
    const author = dIdx>0 ? buf[dIdx-1] : (buf[buf.length-1]||'');
    const date = dIdx>=0 ? buf[dIdx] : '';
    const title = buf.slice(0, dIdx>0? dIdx-1 : buf.length).join('');
    rows.push({v:lines[i], dm:lines[i+1], dur:lines[i+2], title, up:author, date});
  }
}
rows.sort((a,b)=>parseV(b.v)-parseV(a.v));
function parseV(s){ if(s.endsWith('万')) return parseFloat(s)*10000; return parseFloat(s)||0; }
console.log(JSON.stringify(rows,null,1));
console.error('total='+rows.length+' uniqUP='+new Set(rows.map(r=>r.up)).size);