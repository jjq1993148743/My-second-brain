
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
const clean = (t) => String(t||'').replace(/<[^>]+>/g,' ').replace(/&#x27;/g,"'").replace(/&#x2F;/g,'/').replace(/&quot;/g,'"').replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();

// threads likely full of self-reported MRR
const THREADS = ['49181766','47736555','44935238','43049081','41060000','21382023','1907255','25434753'];
const MONEY_RE = /(?:\$\s?[\d,]+(?:\.\d+)?\s?(?:k|K|m|M)?\s?(?:\/mo|per month|a month|monthly|MRR|ARR|\/month| in revenue|in profit)?)|£\s?[\d,]+|€\s?[\d,]+/;
const found = [];
for (const id of THREADS) {
  const r = await get('https://hn.algolia.com/api/v1/items/' + id);
  if (r.error) { console.log('FAIL', id, r.error); continue; }
  let j; try { j = JSON.parse(r.body.toString('utf8')); } catch(e){ console.log('PARSE', id); continue; }
  console.log('THREAD', id, (j.title||'').slice(0,60), 'children:', (j.children||[]).length);
  const walk = (nodes, depth) => {
    for (const n of (nodes||[])) {
      const t = clean(n.text);
      if (t.length > 30) {
        const m = t.match(MONEY_RE);
        if (m && /MRR|ARR|revenue|month|profit|\/mo|customers|sales|made|earn|charge|income/i.test(t)) {
          found.push({ threadId: id, threadTitle: j.title, depth, author: n.author, createdAt: n.created_at,
            id: n.id, commentUrl: 'https://news.ycombinator.com/item?id='+n.id,
            matched: m[0], text: t.slice(0, 600) });
        }
      }
      if (depth < 2 && n.children) walk(n.children, depth+1);
    }
  };
  walk(j.children, 1);
  await sleep(900);
}
fs.writeFileSync('_hn_thread_comments.json', JSON.stringify(found, null, 1), 'utf8');
console.log('TOTAL FOUND', found.length);
