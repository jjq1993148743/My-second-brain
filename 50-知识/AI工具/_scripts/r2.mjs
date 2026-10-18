
import http from 'node:http';
import fs from 'node:fs';
const PROXY = { host: '127.0.0.1', port: 7897 };
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36';
function get(url, accept='application/json', tries=4) {
  return new Promise(async (resolve) => {
    for (let i=0;i<tries;i++) {
      const r = await new Promise((res)=>{
        const pu = new URL(url);
        const req = http.get({ host: PROXY.host, port: PROXY.port, path: url, agent: false,
          headers: { Host: pu.host, 'User-Agent': UA, Accept: accept, Connection: 'close' } },
          (resp)=>{ const c=[]; resp.on('data',d=>c.push(d)); resp.on('end',()=>res({status:resp.statusCode, body:Buffer.concat(c)})); });
        req.on('error',(e)=>res({error:e.message}));
        req.setTimeout(25000,()=>{req.destroy(); res({error:'timeout'});});
      });
      if (!r.error) return resolve(r);
      await new Promise(x=>setTimeout(x,1500));
    }
    resolve({error:'all tries failed'});
  });
}
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));

// Queries targeting revenue-disclosing stories
const QUERIES = [
  { q: 'Show HN MRR', tags: 'story' },
  { q: 'Show HN revenue', tags: 'story' },
  { q: 'Show HN $ month', tags: 'story' },
  { q: 'Show HN side project revenue', tags: 'story' },
  { q: 'Show HN ARR', tags: 'story' },
  { q: 'Show HN paying customers', tags: 'story' },
  { q: 'Ask HN MRR', tags: 'story' },
  { q: 'boring tool business', tags: 'story' },
  { q: 'unsexy SaaS revenue', tags: 'story' },
  { q: 'micro SaaS revenue', tags: 'story' },
  { q: 'quit my job side project income', tags: 'story' },
  { q: 'first dollar online', tags: 'story' },
];
const all = [];
const seen = new Set();
for (const Q of QUERIES) {
  for (let page=0; page<3; page++) {
    const u = 'https://hn.algolia.com/api/v1/search?query=' + encodeURIComponent(Q.q) + '&tags=' + Q.tags + '&hitsPerPage=50&page=' + page;
    const r = await get(u);
    if (r.error) { console.log('FAIL', Q.q, page, r.error); break; }
    let j; try { j = JSON.parse(r.body.toString('utf8')); } catch(e){ console.log('PARSE FAIL', Q.q); break; }
    if (!j.hits || !j.hits.length) break;
    for (const h of j.hits) {
      if (seen.has(h.objectID)) continue;
      seen.add(h.objectID);
      all.push({
        objectID: h.objectID,
        title: h.title || '',
        url: h.url || '',
        hnUrl: 'https://news.ycombinator.com/item?id=' + h.objectID,
        points: h.points || 0,
        numComments: h.num_comments || 0,
        createdAt: h.created_at,
        author: h.author || '',
        query: Q.q,
      });
    }
    console.log('OK', Q.q, 'p'+page, 'total collected', all.length);
    await sleep(1000);
    if (j.hits.length < 50) break;
  }
}
fs.writeFileSync('_hn_raw.json', JSON.stringify(all, null, 1), 'utf8');
console.log('TOTAL', all.length);
