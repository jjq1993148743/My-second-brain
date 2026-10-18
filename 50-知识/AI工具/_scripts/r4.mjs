
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
      await new Promise(x=>setTimeout(x,1200));
    }
    resolve({error:'all tries failed'});
  });
}
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));

// comment search: revenue disclosures in comments of MRR threads
const CQ = [
  'MRR of', 'my MRR is', 'at $ MRR', 'make $ per month', 'my SaaS makes',
  'my product makes', 'currently at $ MRR', 'I make $ a month',
  'making $ a month', 'hit $ MRR', 'reached $ MRR', 'my tool makes',
  'my app makes', 'ARR of', 'monthly revenue of $', 'revenue is $',
];
const out = [];
const seen = new Set();
for (const q of CQ) {
  for (let page=0; page<2; page++) {
    const u = 'https://hn.algolia.com/api/v1/search?query=' + encodeURIComponent('"'+q+'"') + '&tags=comment&hitsPerPage=50&page=' + page;
    const r = await get(u);
    if (r.error) { console.log('FAIL', q, page, r.error); break; }
    let j; try { j = JSON.parse(r.body.toString('utf8')); } catch(e){ break; }
    if (!j.hits || !j.hits.length) break;
    for (const h of j.hits) {
      if (seen.has(h.objectID)) continue;
      seen.add(h.objectID);
      const t = h.comment_text || '';
      // must contain a plausible revenue statement
      const m = t.match(/(?:\$\s?[\d,]+(?:\.\d+)?\s?(?:k|K|m|M)?\s?(?:\/mo|per month|a month|monthly|MRR|ARR|month)?)/);
      if (!m) continue;
      out.push({
        id: h.objectID,
        storyId: h.story_id,
        storyTitle: h.story_title || '',
        storyUrl: h.story_url || '',
        author: h.author || '',
        createdAt: h.created_at,
        snippet: t.replace(/<[^>]+>/g,' ').replace(/&#x27;/g,"'").replace(/&quot;/g,'"').replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim().slice(0, 500),
        commentUrl: 'https://news.ycombinator.com/item?id=' + h.objectID,
        query: q,
      });
    }
    await sleep(900);
    if (j.hits.length < 50) break;
  }
  console.log('done', q, 'collected', out.length);
}
fs.writeFileSync('_hn_comments_raw.json', JSON.stringify(out, null, 1), 'utf8');
console.log('TOTAL COMMENTS', out.length);
