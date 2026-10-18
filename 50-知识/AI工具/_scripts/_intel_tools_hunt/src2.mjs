
import http from 'node:http';
import fs from 'node:fs';
const PROXY = { host: '127.0.0.1', port: 7897 };
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36';
function get(url, accept='*/*', tries=3) {
  return new Promise(async (resolve) => {
    for (let i=0;i<tries;i++) {
      const r = await new Promise((res)=>{
        const pu = new URL(url);
        const req = http.get({ host: PROXY.host, port: PROXY.port, path: url, agent: false,
          headers: { Host: pu.host, 'User-Agent': UA, Accept: accept, Connection: 'close' } },
          (resp)=>{ const c=[]; resp.on('data',d=>c.push(d)); resp.on('end',()=>res({status:resp.statusCode, body:Buffer.concat(c)})); });
        req.on('error',(e)=>res({error:e.message}));
        req.setTimeout(35000,()=>{req.destroy(); res({error:'timeout'});});
      });
      if (!r.error) return resolve(r);
      await new Promise(x=>setTimeout(x,1800));
    }
    resolve({error:'all tries failed'});
  });
}
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
// New sources discovered from real pages:
//  trustmrr.com  -> seen in reddit post r/SaaS/comments/1uulws9 (https://trustmrr.com/startup/socialkit)
//  viralhunt.io  -> linked from microlaunch.net/browse
//  submitator.com-> linked from viralhunt.io
// Also check known-URL launch/directories found on microlaunch index: /trends /fame /hq /blog /contributors /partners
const CANDIDATES = [
  'https://trustmrr.com/',
  'https://microlaunch.net/trends',
  'https://microlaunch.net/fame',
  'https://microlaunch.net/hq',
  'https://microlaunch.net/contributors',
];
for (const u of CANDIDATES) {
  const r = await get(u);
  if (r.error) { console.log('FAIL', u, r.error); continue; }
  const h = r.body.toString('utf8');
  const name = u.replace(/https?:\/\//,'').replace(/[\/]/g,'_');
  fs.writeFileSync('src_'+name+'.html', h, 'utf8');
  console.log('===', u, r.status, h.length);
  const ext = [...new Set([...h.matchAll(/href="https?:\/\/([a-z0-9.-]+\.[a-z]{2,})[^"]*"/gi)].map(m=>m[1]))].filter(d=>!d.match(/(facebook|twitter\.com|x\.com|instagram|youtube|linkedin|tiktok|googleapis|gstatic|cloudflare|jquery|bootstrap|fontawesome|w3\.org|schema\.org|google-analytics|googletagmanager|doubleclick|unpkg|jsdelivr|gravatar|paypal|wordpress\.org|githubusercontent|twimg|mzstatic|gstatic|t\.co|medium\.com|substack\.com|disqus|addthis|sharethis|patreon|microlaunch)/i));
  console.log('  EXT:', ext.slice(0,20).join(', '));
  await sleep(1100);
}
