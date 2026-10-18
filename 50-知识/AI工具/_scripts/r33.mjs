
import fs from 'node:fs';
const BS = String.fromCharCode(92);
function unescapeStr(s) {
  return s.split(BS+'u0026').join('&').split(BS+'"').join('"').split(BS+'n').join('\n').split(BS+'/').join('/').split(BS+'u003c').join('<').split(BS+'u003e').join('>');
}
// find all top-level objects in the JSON arrays: anchor on {"id":<digits>,"created_at":"
function extract(file) {
  const h = unescapeStr(fs.readFileSync(file,'utf8'));
  const out = [];
  const anchor = /\{"id":\d+,"created_at":"/g;
  let m;
  while ((m = anchor.exec(h))) {
    // balanced scan
    let depth = 0, end = -1, inStr = false;
    for (let i = m.index; i < h.length; i++) {
      const c = h[i];
      if (inStr) { if (c === '"') { if (h[i-1] === BS) continue; inStr = false; } continue; }
      if (c === '"') { inStr = true; continue; }
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) { end = i+1; break; } }
    }
    if (end < 0) { anchor.lastIndex = m.index + 5; continue; }
    const raw = h.slice(m.index, end);
    let o = null;
    try { o = JSON.parse(raw); } catch(e) {
      // try trimming trailing junk
      try { o = JSON.parse(raw.replace(/,\s*$/, '') + ''); } catch(e2) { o = null; }
    }
    if (o && o.codename) {
      out.push({
        id: o.id, productId: o.product_id, codename: o.codename, slug: o.slug,
        url: o.url, status: o.status,
        description: (o.description||'').slice(0,500),
        makerName: o.maker_name, makerSocial: o.maker_social_handle,
        startDate: o.start_date, batchNum: o.batch_num,
        votes: o.votes_all_time || o.votes,
        market: o.market, productType: o.product_type, offerType: o.offer_type, stage: o.stage,
        problemLabel: o.problem_label,
        keywords: o.all_kws || [],
        launchUrl: 'https://microlaunch.net/deals/' + (o.slug || ''),
        feedbackSample: (o.feedback_arr||[]).slice(0,2).map(f=>f.feedback).filter(Boolean),
      });
    }
    anchor.lastIndex = end;
  }
  return out;
}
const all = []; const seen = new Set();
for (const f of ['ml_index.html','ml_browse.html','ml_deals.html']) {
  const items = extract(f);
  let added=0;
  for (const it of items) { const k = it.slug || it.codename; if (!seen.has(k)) { seen.add(k); all.push(it); added++; } }
  console.log(f, 'parsed', items.length, 'new', added);
}
fs.writeFileSync('_microlaunch.json', JSON.stringify(all, null, 1), 'utf8');
console.log('TOTAL', all.length);
console.log(all.slice(0,12).map(x=>[x.codename,x.market,x.offerType,x.url].join(' | ')).join('\n'));
