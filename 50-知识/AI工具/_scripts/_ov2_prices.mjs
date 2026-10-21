import fs from 'node:fs';
const clean = h => String(h||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ');
const base='D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/_ov2_raw/';
const files=['forum_thegradcafe_com_search_q_22personal_20statement_22_20editing_20service_quick_1.html','forum_thegradcafe_com_search_q_tutor_20paid_quick_1.html','boredofstudies_org_.html','www_unicum_de_.html','www_studis_online_de_.html','www_e_fellows_net_.html'];
for(const f of files){
  if(!fs.existsSync(base+f)) { console.log('MISS '+f); continue; }
  const t=clean(fs.readFileSync(base+f,'utf8'));
  console.log('\n===== '+f+' len='+t.length);
  // find currency / price snippets
  const re=/[^.]{0,160}(?:\$\s?\d|\d+\s?(?:Euro|EUR|€|£)|per hour|\/hr|an hour|Stunde)[^.]{0,160}/gi;
  let m, n=0;
  while((m=re.exec(t)) && n<18){ console.log('  * '+m[0].trim()); n++; }
  if(n===0) console.log('  (无价格匹配)');
}