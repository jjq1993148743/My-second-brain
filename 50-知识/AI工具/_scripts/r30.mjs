
import fs from 'node:fs';
function extract(file) {
  const h = fs.readFileSync(file,'utf8');
  const unesc = h.replace(/\\u0026/g,'&').replace(/\\"/g,'"').replace(/\\n/g,'
');
  // product objects begin with {"id":NNNN,"created_at":"...
  const re = /\{"id":\d+,"created_at":"[^"]+","product_id":\d+,"version":"[^"]*","url":"[^"]*","status":"[^"]*"/g;
  const out = [];
  let m;
  while ((m = re.exec(unesc))) {
    // find balanced braces from m.index
    let depth = 0, end = -1;
    for (let i = m.index; i < unesc.length; i++) {
      const c = unesc[i];
      if (c === '"') { // skip string
        i++;
        while (i < unesc.length && unesc[i] !== '"') { if (unesc[i] === '\\') i++; i++; }
        continue;
      }
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) { end = i+1; break; } }
    }
    if (end < 0) continue;
    const raw = unesc.slice(m.index, end);
    try {
      const o = JSON.parse(raw);
      out.push({
        id: o.id, productId: o.product_id, url: o.url, status: o.status,
        description: (o.description||'').slice(0,400),
        makerName: o.maker_name, makerSocial: o.maker_social_handle,
        batchNum: o.batch_num, startDate: o.start_date, isPremium: o.is_premium,
        votes: o.votes, votesAllTime: o.votes_all_time, votesWeek: o.votes_week,
        codename: o.codename, slug: o.slug, problemLabel: o.problem_label,
        market: o.market, productType: o.product_type, offerType: o.offer_type, stage: o.stage,
        keywords: o.all_kws||[], nicheKeywords: o.niche_kws||[], launchUrl: 'https://microlaunch.net/deals/' + (o.slug||''),
        feedbackSample: (o.feedback_arr||[]).slice(0,3).map(f=>f.feedback),
        isRoastSample: (o.feedback_arr||[]).slice(0,3).map(f=>!!f.is_roast),
      });
      re.lastIndex = end;
    } catch(e) { re.lastIndex = m.index + 10; }
  }
  return out;
}
const all = [];
const seen = new Set();
for (const f of ['ml_index.html','ml_browse.html','ml_deals.html']) {
  const items = extract(f);
  let added=0;
  for (const it of items) if (!seen.has(it.id)) { seen.add(it.id); all.push(it); added++; }
  console.log(f, 'parsed', items.length, 'new', added);
}
fs.writeFileSync('_microlaunch.json', JSON.stringify(all, null, 1), 'utf8');
console.log('TOTAL microlaunch products', all.length);
console.log('sample:', all.slice(0,10).map(x=>x.codename+' | '+x.url+' | '+x.offerType+' | '+x.stage).join('\n'));
