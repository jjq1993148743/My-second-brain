
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
const money = JSON.parse(fs.readFileSync('_hn_money.json','utf8'));
// take top 45 by points, fetch full item (incl. text for text-posts)
const picks = money.slice(0, 45);
const items = [];
for (const p of picks) {
  const r = await get('https://hn.algolia.com/api/v1/items/' + p.objectID);
  if (r.error) { console.log('FAIL', p.objectID, r.error); continue; }
  let j; try { j = JSON.parse(r.body.toString('utf8')); } catch(e){ continue; }
  items.push({
    id: j.id, title: j.title, url: j.url || '', hnUrl: 'https://news.ycombinator.com/item?id='+j.id,
    points: j.points, author: j.author, createdAt: j.created_at,
    text: (j.text||'').replace(/<[^>]+>/g,' ').replace(/&#x27;/g,"'").replace(/&#x2F;/g,'/').replace(/&quot;/g,'"').replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim(),
    childrenCount: (j.children||[]).length,
  });
  console.log('OK', j.id, (j.title||'').slice(0,70));
  await sleep(700);
}
fs.writeFileSync('_hn_items.json', JSON.stringify(items, null, 1), 'utf8');
console.log('SAVED', items.length);
