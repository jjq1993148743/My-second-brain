
import http from 'node:http';
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
        req.setTimeout(20000,()=>{req.destroy(); res({error:'timeout'});});
      });
      if (!r.error) return resolve(r);
      await new Promise(x=>setTimeout(x,1500));
    }
    resolve({error:'all tries failed'});
  });
}
const r = await get('https://hn.algolia.com/api/v1/search?query=%22MRR%22&tags=story&hitsPerPage=20&numericFilters=created_at_i>1690000000');
if (r.error) { console.log('ERR', r.error); process.exit(0); }
console.log('status', r.status, 'len', r.body.length);
const j = JSON.parse(r.body.toString('utf8'));
console.log('nbHits', j.nbHits, 'hits', (j.hits||[]).length);
for (const h of (j.hits||[]).slice(0,12)) {
  console.log('-', h.objectID, '|', (h.title||'').slice(0,90), '|', h.points, 'pts |', h.num_comments, 'c |', h.created_at, '|', h.url||'');
}
