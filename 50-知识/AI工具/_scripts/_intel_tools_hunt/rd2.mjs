
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
        req.setTimeout(30000,()=>{req.destroy(); res({error:'timeout'});});
      });
      if (!r.error) return resolve(r);
      await new Promise(x=>setTimeout(x,1800));
    }
    resolve({error:'all tries failed'});
  });
}
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));
// Test selftext search
const tests = ['MRR', 'my SaaS', 'revenue'];
for (const t of tests) {
  const u = 'https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=microsaas&selftext=' + encodeURIComponent(t) + '&limit=5&sort=desc';
  const r = await get(u);
  if (r.error) { console.log('FAIL', t, r.error); continue; }
  let j; try { j = JSON.parse(r.body.toString('utf8')); } catch(e){ console.log('parse fail'); continue; }
  const d = j.data||[];
  console.log('selftext="'+t+'" ->', d.length);
  if (d.length) console.log('   e.g.', (d[0].title||'').slice(0,90), '|', ((d[0].selftext||'').match(new RegExp('.{0,60}'+t+'.{0,80}','i'))||[])[0]?.slice(0,140));
  await sleep(1000);
}
