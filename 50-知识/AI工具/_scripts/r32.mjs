
import fs from 'node:fs';
const BS = String.fromCharCode(92);
function unescapeStr(s) {
  return s.split(BS+'u0026').join('&').split(BS+'"').join('"').split(BS+'n').join('\n').split(BS+'/').join('/');
}
function extract(file) {
  const h = unescapeStr(fs.readFileSync(file,'utf8'));
  const out = [];
  const anchor = /"codename":"/g;
  let m;
  while ((m = anchor.exec(h))) {
    const start = m.index + m[0].length;
    const q = h.indexOf('"', start);
    const codename = h.slice(start, q);
    // find enclosing object boundaries by scanning backward for '{"id":' with depth tracking
    // Simpler: take window around
    const win = h.slice(Math.max(0, m.index-4000), m.index+4000);
    const grab = (key) => {
      const mm = win.match(new RegExp('"' + key + '":"([^"]{0,300})"'));
      return mm ? mm[1] : (win.match(new RegExp('"' + key + '":([0-9.]+)'))||[])[1] || null;
    };
    const grabArr = (key) => {
      const mm = win.match(new RegExp('"' + key + '":\\[([^\\]]{0,400})\\]'));
      return mm ? mm[1].split(',').map(x=>x.replace(/"/g,'').trim()).filter(Boolean) : [];
    };
    const grabBool = (key) => /'"'.replace('','')/.test('') && (win.match(new RegExp('"'+key+'":(true|false)'))||[])[1] === 'true';
    out.push({
      codename,
      slug: grab('slug'),
      url: grab('url'),
      description: grab('description') || '',
      makerName: grab('maker_name'),
      makerSocial: grab('maker_social_handle'),
      startDate: grab('start_date'),
      batchNum: grab('batch_num'),
      votes: grab('votes_all_time') || grab('votes'),
      market: grab('market'),
      productType: grab('product_type'),
      offerType: grab('offer_type'),
      stage: grab('stage'),
      problemLabel: grab('problem_label'),
      keywords: grabArr('all_kws'),
      launchUrl: 'https://microlaunch.net/deals/' + (grab('slug') || ''),
    });
  }
  return out;
}
const all = [];
const seen = new Set();
for (const f of ['ml_index.html','ml_browse.html','ml_deals.html']) {
  const items = extract(f);
  let added=0;
  for (const it of items) { const k = it.slug || it.codename; if (!seen.has(k)) { seen.add(k); all.push(it); added++; } }
  console.log(f, 'parsed', items.length, 'new', added);
}
fs.writeFileSync('_microlaunch.json', JSON.stringify(all, null, 1), 'utf8');
console.log('TOTAL', all.length);
const withUrl = all.filter(x=>x.url && /^https?:/.test(x.url));
console.log('with website url', withUrl.length);
console.log(withUrl.slice(0,15).map(x=>x.codename+' | '+x.market+' | '+x.offerType+' | '+x.url).join('\n'));
