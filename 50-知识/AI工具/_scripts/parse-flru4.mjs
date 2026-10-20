import fs from 'node:fs';
import path from 'node:path';
const dirs=['_raw_flru_vak','_raw_flruc','_raw_flru'];
const all=[]; const seen=new Set();

for(const dir of dirs){
  let files=[];
  try{ files=fs.readdirSync(dir).filter(f=>f.endsWith('.html')); }catch(e){ continue; }
  for(const f of files){
    const html=fs.readFileSync(path.join(dir,f),'utf8');
    const parts=html.split('class="b-post__grid"');
    for(let k=1;k<parts.length;k++){
      const chunk=parts[k].slice(0,12000);
      // ID
      const im=chunk.match(/\/projects\/(\d+)|data-id="(\d+)"|id="(\d+)"/);
      const id=im?(im[1]||im[2]||im[3]):'';
      // 标题
      const tm=chunk.match(/<a[^>]*class="[^"]*b-post__link[^"]*"[^>]*>([^<]{4,140})</);
      const title=tm?tm[1].trim():(chunk.match(/<h2[^>]*>\s*<a[^>]*>([^<]{4,140})</)||[])[1]||'';
      if(!title) continue;
      // 出价数：N ответ
      const om=chunk.match(/(\d+)\s*ответ/);
      const offers=om?+om[1]:null;
      // 预算
      const bm=chunk.match(/(\d[\d\s]{2,})\s*(?:\u20bd|руб)/) || chunk.match(/по договоренности/) || chunk.match(/(?:до|от)\s*(\d[\d\s]{2,})/);
      const budget=bm?bm[0].replace(/\s+/g,' ').slice(0,30):'';
      // 类型
      const kind=/Вакансия/.test(chunk)?'Вакансия':/Конкурс/.test(chunk)?'Конкурс':'Заказ';
      // 时间
      const wm=chunk.match(/(\d+)\s*(минут|час|день|дня|дней)[а-я]*\s*назад/);
      const when=wm?wm[0]:'';
      const key=id||title;
      if(seen.has(key)) continue; seen.add(key);
      all.push({id,title:title.slice(0,140),budget,offers,kind,when,src:f});
    }
  }
}
fs.writeFileSync('_flru_final2.json',JSON.stringify(all,null,1),'utf8');
console.log('TOTAL='+all.length);
console.log('withOffers='+all.filter(a=>a.offers!==null).length);
console.log('withBudget='+all.filter(a=>a.budget).length);
const offs=all.filter(a=>a.offers!==null).map(a=>a.offers).sort((x,y)=>x-y);
console.log('offersMedian='+(offs.length?offs[Math.floor(offs.length/2)]:'NA'));
for(const a of all.slice(0,6)) console.log('  '+a.offers+' ответ | '+a.budget+' | '+a.title.slice(0,45));